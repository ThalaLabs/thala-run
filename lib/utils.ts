import { AptosClient, Types } from "aptos";

export const FULLNODES: { [network: string]: string } = {
  devnet: "https://fullnode.devnet.aptoslabs.com",
  testnet: "https://fullnode.testnet.aptoslabs.com",
  mainnet: "https://fullnode.mainnet.aptoslabs.com",
};

export function getAptosClient(network: string): AptosClient {
  return new AptosClient(FULLNODES[network]);
}

export function functionSignature(func: Types.MoveFunction): string {
  return `${func.name}${typeArgPlaceholders(
    func.generic_type_params.length
  )}(${func.params.join(", ")})`;
}

function typeArgPlaceholders(n: number): string {
  if (n === 0) {
    return "";
  }
  return "<" + Array.from({ length: n }, (_, i) => "T" + i).join(", ") + ">";
}
