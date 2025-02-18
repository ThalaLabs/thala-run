import {
  Aptos,
  AptosConfig,
  MoveFunction,
  Network as AptosNetwork,
} from "@aptos-labs/ts-sdk";
import { ParsedUrlQuery } from "querystring";
import { NetworkType } from "./schema";

const CUSTOM_NETWORKS = {
  devnet: "https://fullnode.devnet.aptoslabs.com/v1",
  testnet: "https://fullnode.testnet.aptoslabs.com/v1",
  mainnet: "https://fullnode.mainnet.aptoslabs.com/v1",
  "movement mainnet": "https://mainnet.movementnetwork.xyz/v1",
  "movement porto": "https://aptos.testnet.porto.movementlabs.xyz/v1",
  "movement bardock": "https://aptos.testnet.bardock.movementlabs.xyz/v1",
};

export function getAptosClient(network: NetworkType): Aptos {
  if (network in CUSTOM_NETWORKS) {
    const aptosConfig = new AptosConfig({
      network: AptosNetwork.CUSTOM,
      fullnode: CUSTOM_NETWORKS[network],
    });
    const aptos = new Aptos(aptosConfig);

    return aptos;
  }
  throw new Error(`Unsupported network: ${network}`);
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
