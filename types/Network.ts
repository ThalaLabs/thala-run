import { Network as AptosNetwork } from "@aptos-labs/ts-sdk";

export type Network = AptosNetwork &
  "movement porto" &
  "movement mainnet" &
  "movement bardock";
