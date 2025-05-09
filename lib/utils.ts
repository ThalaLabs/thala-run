import {
  Aptos,
  AptosConfig,
  MoveFunction,
  Network as AptosNetwork,
  Network,
} from "@aptos-labs/ts-sdk";
import { ParsedUrlQuery } from "querystring";
import { NetworkType } from "./schema";

const DEFAULT_RPC: Record<NetworkType, string> = {
  "aptos mainnet": "https://fullnode.mainnet.aptoslabs.com/v1",
  "aptos testnet": "https://fullnode.testnet.aptoslabs.com/v1",
  "aptos devnet": "https://fullnode.devnet.aptoslabs.com/v1",
  "movement mainnet": "https://mainnet.movementnetwork.xyz/v1",
  "movement bardock": "https://testnet.bardock.movementnetwork.xyz/v1",
};

export function getAptosClient(network: NetworkType): Aptos {
  let aptosNetwork: Network;
  switch (network) {
    case "aptos mainnet":
      aptosNetwork = AptosNetwork.MAINNET;
      break;
    case "aptos testnet":
      aptosNetwork = AptosNetwork.TESTNET;
      break;
    case "aptos devnet":
      aptosNetwork = AptosNetwork.DEVNET;
      break;
    default:
      aptosNetwork = Network.MAINNET;
      break;
  }
  const aptosConfig = new AptosConfig({
    network: aptosNetwork,
    fullnode: DEFAULT_RPC[network],
  });
  return new Aptos(aptosConfig);
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
