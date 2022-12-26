import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import {
  Box,
  useToast,
  FormControl,
  FormLabel,
  Textarea,
  Input,
  Button,
  Link,
  Heading,
} from "@chakra-ui/react";
import { Types } from "aptos";
import { SubmitHandler } from "react-hook-form";
import { functionSignature, getAptosClient } from "../lib/utils";
import { ConnectWallet } from "./ConnectWallet";
import NextLink from "next/link";
import { TxFormType } from "../lib/schema";
import useSWR from "swr";
import { useFormContext } from "react-hook-form";
import TypeArgsInput from "./TypeArgsInput";
import ArgsInput from "./ArgsInput";

export function Run() {
  const { connected, signAndSubmitTransaction } = useWallet();

  const {
    watch,
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useFormContext<TxFormType>();
  const { account, network, module, func } = watch();

  const toast = useToast();

  const { data, error } = useSWR<Types.MoveModuleBytecode>(
    [account, network, module],
    ([account, network, module]) =>
      getAptosClient(network).getAccountModule(account, module)
  );

  const moveModule = data?.abi;
  const moveFunc = moveModule?.exposed_functions.find((f) => f.name === func);

  const onSubmit: SubmitHandler<TxFormType> = async (data) => {
    await onSignAndSubmitTransaction(
      network,
      module,
      func,
      data.typeArgs,
      data.args
    );
  };

  async function onSignAndSubmitTransaction(
    network: string,
    module: string,
    func: string,
    typeArgs: string[],
    args: any[]
  ) {
    const payload: Types.TransactionPayload = {
      type: "entry_function_payload",
      function: `${module}::${func}`,
      type_arguments: typeArgs,
      arguments: args,
    };
    try {
      const { hash } = await signAndSubmitTransaction(payload);
      await getAptosClient(network).waitForTransaction(hash);
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
  if (!moveFunc) return <Box>👈 Pick a function to run</Box>;

  // TODO: checkout https://chakra-ui.com/getting-started/with-hook-form to add errors handling
  return (
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
          <Button
            mt="2"
            variant="outline"
            isLoading={isSubmitting}
            type="submit"
          >
            Run
          </Button>
        ) : (
          <ConnectWallet />
        )}
      </FormControl>
    </form>
  );
}
