import { Network } from "@aptos-labs/ts-sdk";
import { z } from "zod";

export const NetworkEnum = z.enum([
  Network.DEVNET,
  Network.TESTNET,
  Network.MAINNET,
  "movement porto",
  "movement mainnet",
  "movement bardock",
]);

export const TxFormSchema = z.object({
  network: NetworkEnum,
  account: z.string().regex(/(0[xX])?[0-9a-fA-F]{1,64}/),
  module: z.string(),
  func: z.string(),
  typeArgs: z.string().array(),
  args: z.any().array(),
  funcComment: z.string(),
  typeArgsComment: z.string().array(),
  argsComment: z.string().array(),
});

export type NetworkType = z.infer<typeof NetworkEnum>;

export type TxFormType = z.infer<typeof TxFormSchema>;
