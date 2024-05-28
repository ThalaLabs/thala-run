import { Aptos, AptosConfig, MoveFunction, Network } from "@aptos-labs/ts-sdk";
import { ParsedUrlQuery } from "querystring";

export const FULLNODES: { [network: string]: string } = {
  devnet: "https://fullnode.devnet.aptoslabs.com",
  testnet: "https://fullnode.testnet.aptoslabs.com",
  mainnet: "https://fullnode.mainnet.aptoslabs.com",
};

export function getAptosClient(network: Network): Aptos {
  const aptosConfig = new AptosConfig({ network });
  const aptos = new Aptos(aptosConfig);

  return aptos;
}

export function functionSignature(func: MoveFunction): string {
  return `${func.name}${typeArgPlaceholders(
    func.generic_type_params.length
  )}(${func.params.join(", ")})`;
}

export function parseArrayParam(
  query: ParsedUrlQuery,
  param: string
): string[] {
  if (query[param] === undefined) {
    return [];
  }
  if (Array.isArray(query[param])) {
    return query[param] as string[];
  }
  return [query[param] as string];
}

function typeArgPlaceholders(n: number): string {
  if (n === 0) {
    return "";
  }
  return "<" + Array.from({ length: n }, (_, i) => "T" + i).join(", ") + ">";
}
