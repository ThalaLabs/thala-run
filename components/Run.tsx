import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import {
  Box,
  useToast,
  FormControl,
  Button,
  Link,
  Heading,
} from "@chakra-ui/react";
import { SubmitHandler } from "react-hook-form";
import { functionSignature, getAptosClient } from "../lib/utils";
import { ConnectWallet } from "./ConnectWallet";
import NextLink from "next/link";
import { TxFormType } from "../lib/schema";
import useSWR from "swr";
import { useFormContext } from "react-hook-form";
import TypeArgsInput from "./TypeArgsInput";
import ArgsInput from "./ArgsInput";
import { Hex, InputEntryFunctionData, MoveModuleBytecode } from "@aptos-labs/ts-sdk";
import { Network } from "../types/Network";

export function Run() {
  const { connected, signAndSubmitTransaction } = useWallet();

  const {
    watch,
    handleSubmit,
    formState: { isSubmitting },
  } = useFormContext<TxFormType>();
  const { account, network, module, func } = watch();

  const toast = useToast();

  const { data, error } = useSWR<MoveModuleBytecode>(
    [account, network, module],
    ([accountAddress, network, moduleName]: [string, Network, string]) =>
      getAptosClient(network).getAccountModule({ accountAddress, moduleName })
  );

  const moveModule = data?.abi;
  const moveFunc = moveModule?.exposed_functions.find((f) => f.name === func);

  const onSubmit: SubmitHandler<TxFormType> = async (data) => {
    await onSignAndSubmitTransaction(
      network as Network, 
      account,
      module,
      func,
      data.typeArgs,
      data.args
    );
  };

  async function onSignAndSubmitTransaction(
    network: Network,
    account: string,
    module: string,
    func: string,
    typeArgs: string[],
    args: any[]
  ) {
    if (!moveFunc) return;

    // handle params[0] === "&signer" case
    let params = moveFunc.params;
    if (params.length !== args.length) {
      params = params.slice(1);
    }

    const handleArrayArgs = params.map((param, i) => {
      const arg = args[i];

      // if arg matches /vector<*>/ but not /vector<u8>/, split by comma
      const isVector = param.match(/vector<(.*)>/);
      if (!isVector) return arg;

      const innerType = isVector[1];

      if (innerType === "u8") return Hex.fromHexString(arg).toUint8Array();

      return String(arg).split(",");
    });

    // transaction payload expects account to start with 0x
    const account0x = account.startsWith("0x") ? account : `0x${account}`;

    const payload: InputEntryFunctionData = {
      function: `${account0x}::${module}::${func}`,
      typeArguments: typeArgs,
      functionArguments: handleArrayArgs,
    };
    try {
      const { hash } = await signAndSubmitTransaction({ data: payload });
      await getAptosClient(network).waitForTransaction({
        transactionHash: hash,
      });
      toast({
        title: "Transaction submitted.",
        description: (
          <Link
            as={NextLink}
            href={`https://explorer.aptoslabs.com/txn/${hash}?network=${network}`}
            isExternal
          >
            View on explorer <ExternalLinkIcon mx="2px" />
          </Link>
        ),
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error: any) {
      console.log("error", error);
      toast({
        title: "An error occurred.",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  }

  if (!account) return <Box></Box>;
  if (!moveFunc)
    return <Box>👈 Pick a function to run, or 👆 Try a new account</Box>;

  // TODO: checkout https://chakra-ui.com/getting-started/with-hook-form to add errors handling
  return (
    <Box overflow={"auto"} maxHeight="calc(100vh - 180px)">
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormControl>
          <Heading size="md">{functionSignature(moveFunc)}</Heading>
          {moveFunc.generic_type_params.length > 0 && (
            <TypeArgsInput nTypeArgs={moveFunc.generic_type_params.length} />
          )}
          {moveFunc.params.length > 0 &&
            !(
              moveFunc.params.length === 1 && moveFunc.params[0] === "&signer"
            ) && <ArgsInput params={moveFunc.params} />}
          {connected ? (
            <Button mt="2" isLoading={isSubmitting} type="submit">
              Run
            </Button>
          ) : (
            <ConnectWallet mt="2" />
          )}
        </FormControl>
      </form>
    </Box>
  );
}
