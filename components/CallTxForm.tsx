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
} from "@chakra-ui/react";
import { Types } from "aptos";
import { useForm, SubmitHandler } from "react-hook-form";
import { getAptosClient } from "../lib/utils";
import { ConnectWallet } from "./ConnectWallet";
import NextLink from "next/link";

interface IFormInput {
  typeArgs: string[];
  args: any[];
}

export function CallTxForm({
  network,
  module,
  func,
}: {
  network: string;
  module: string;
  func: Types.MoveFunction;
}) {
  const { connected, signAndSubmitTransaction } = useWallet();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<IFormInput>({
    defaultValues: {
      typeArgs: [],
      args: [],
    },
  });

  const toast = useToast();

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    await onSignAndSubmitTransaction(network, data.typeArgs, data.args);
  };

  async function onSignAndSubmitTransaction(
    network: string,
    typeArgs: string[],
    args: any[]
  ) {
    const payload: Types.TransactionPayload = {
      type: "entry_function_payload",
      function: `${module}::${func.name}`,
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

  // TODO: checkout https://chakra-ui.com/getting-started/with-hook-form to add errors handling
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormControl>
        {func.generic_type_params.length > 0 &&
          func.generic_type_params.map((_, i) => (
            <Box my={2} key={i.toString()}>
              <FormLabel size="sm">T{i}</FormLabel>
              <Textarea {...register(`typeArgs.${i}`)} />
            </Box>
          ))}
        {func.params.length > 0 &&
          !(func.params.length === 1 && func.params[0] === "&signer") &&
          func.params
            .filter((param, i) => i !== 0 && param !== "&signer")
            .map((param, i) => (
              <Box my={2} key={i.toString()}>
                <FormLabel>
                  arg{i}({param})
                </FormLabel>
                <Input {...register(`args.${i}`)} />
              </Box>
            ))}
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
