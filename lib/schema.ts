import { z } from "zod";

export const NetworkEnum = z.enum(["devnet", "testnet", "mainnet"]);

export const TxFormSchema = z.object({
  network: NetworkEnum,
  account: z.union([
    z.string().regex(/(0[xX])?[0-9a-fA-F]{64}/),
    z.literal("0x1"),
    z.literal("0X1"),
    z.literal("0x3"),
    z.literal("0X3"),
  ]),
  module: z.string(),
  func: z.string(),
  typeArgs: z.string().array(),
  args: z.any().array(),
});

export type NetworkType = z.infer<typeof NetworkEnum>;

export type TxFormType = z.infer<typeof TxFormSchema>;
