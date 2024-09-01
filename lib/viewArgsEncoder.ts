import { Hex } from "@aptos-labs/ts-sdk";

export function encodeInputArgsForViewRequest(type: string, value: string) {
  if (type.includes("vector")) {
    if (type === "vector<u8>") {
      return value.trim().startsWith("0x")
        ? Hex.fromHexString(value).toUint8Array()
        : encodeVectorForViewRequest(type, value);
    }

    // when it's a vector, we support both hex and javascript array format
    return value.trim().startsWith("0x")
      ? value.trim()
      : encodeVectorForViewRequest(type, value);
  } else if (type === "bool") {
    if (value !== "true" && value !== "false")
      throw new Error(`Invalid bool value: ${value}`);

    return value === "true" ? true : false;
  } else if (["u8", "u16", "u32"].includes(type)) {
    return ensureNumber(value);
  } else if (type.startsWith("0x1::option::Option")) {
    return value;
  } else return value;
}

function encodeVectorForViewRequest(type: string, value: string) {
  const rawVector = deserializeVector(value);
  const regex = /vector<([^]+)>/;
  const match = type.match(regex);
  if (match) {
    if (["u8", "u16", "u32"].includes(match[1])) {
      return rawVector.map((v) => ensureNumber(v.trim()));
    } else if (["u64", "u128", "u256"].includes(match[1])) {
      // For bigint, not need to convert, only validation
      rawVector.forEach((v) => ensureBigInt(v.trim()));
      return rawVector;
    } else if (match[1] === "bool") {
      return rawVector.map((v) => ensureBoolean(v.trim()));
    } else {
      // 1. Address type no need to convert
      // 2. Other complex types like Struct is not support yet. We just pass what user input.
      return rawVector;
    }
  } else {
    throw new Error(`Unsupported type: ${type}`);
  }
}

export function deserializeVector(vectorString: string): string[] {
  let result = vectorString.trim();
  if (result[0] === "[" && result[result.length - 1] === "]") {
    result = result.slice(1, -1);
  }
  // There's a tradeoff here between empty string, and empty array.  We're going with empty array.
  if (result.length == 0) {
    return [];
  }
  return result.split(",");
}

function ensureNumber(val: number | string): number {
  assertType(val, ["number", "string"]);
  if (typeof val === "number") {
    return val;
  }

  const res = Number.parseInt(val, 10);
  if (Number.isNaN(res)) {
    throw new Error("Invalid number string.");
  }

  return res;
}

export function ensureBigInt(val: number | bigint | string): bigint {
  assertType(val, ["number", "bigint", "string"]);
  return BigInt(val);
}

function assertType(val: any, types: string[] | string, message?: string) {
  if (!types?.includes(typeof val)) {
    throw new Error(
      message ||
        `Invalid arg: ${val} type should be ${
          types instanceof Array ? types.join(" or ") : types
        }`
    );
  }
}

export function ensureBoolean(val: boolean | string): boolean {
  assertType(val, ["boolean", "string"]);
  if (typeof val === "boolean") {
    return val;
  }

  if (val === "true") {
    return true;
  }
  if (val === "false") {
    return false;
  }

  throw new Error("Invalid boolean string.");
}
