import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { ArrowDownIcon, ArrowUpIcon, ExternalLinkIcon, SmallCloseIcon } from "@chakra-ui/icons";
import {
  Box,
  useToast,
  FormControl,
  Button,
  Link,
  Heading,
  Spinner,
  HStack,
  Spacer,
} from "@chakra-ui/react";
import { HexString, Types } from "aptos";
import { SubmitHandler } from "react-hook-form";
import { getAptosClient } from "../lib/utils";
import { ConnectWallet } from "./ConnectWallet";
import NextLink from "next/link";
import { TxFormType } from "../lib/schema";
import useSWR from "swr";
import { useFormContext } from "react-hook-form";
import TypeArgsInput from "./TypeArgsInput";
import ArgsInput from "./ArgsInput";
import { useContext, useEffect } from "react";
import { FuncGroupContext } from "./FuncGroupProvider";
import { walletAddressEllipsis } from "../functions/walletAddressEllipsis";

export function RunCard({ id }: { id: string }) {
  const { connected, signAndSubmitTransaction } = useWallet();
  const context = useContext(FuncGroupContext);

  const {
    watch,
    handleSubmit,
    formState: { isSubmitting },
  } = useFormContext<TxFormType>();
  const { account, network, module, func, typeArgs, args } = watch();
  const values = watch();

  const serializedTypeArgs = JSON.stringify(typeArgs);
  const serializedArgs = JSON.stringify(args);
  useEffect(() => {
    if (!context) return;
    const idx = context.funcGroup.findIndex((x) => x.id === id);
    context.funcGroup[idx] = {
      id: id,
      ...values
    }
    context?.setFuncGroup(context.funcGroup.slice());
  },
    [serializedTypeArgs, serializedArgs, context, id, values]);

  const toast = useToast();

  const { data, error } = useSWR<Types.MoveModuleBytecode>(
    [account, network, module],
    ([account, network, module]: string[3]) =>
      getAptosClient(network).getAccountModule(account, module)
  );

  const moveModule = data?.abi;
  const moveFunc = moveModule?.exposed_functions.find((f) => f.name === func);

  const onSubmit: SubmitHandler<TxFormType> = async (data) => {
    await onSignAndSubmitTransaction(
      network,
      account,
      module,
      func,
      data.typeArgs,
      data.args
    );
  };

  async function onSignAndSubmitTransaction(
    network: string,
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
      if (innerType === "u8") return new HexString(String(arg)).toUint8Array();

      return String(arg).split(",");
    });

    // transaction payload expects account to start with 0x
    const account0x = account.startsWith("0x") ? account : `0x${account}`;

    const payload: Types.TransactionPayload_EntryFunctionPayload = {
      type: "entry_function_payload",
      function: `${account0x}::${module}::${func}`,
      type_arguments: typeArgs,
      arguments: handleArrayArgs,
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
  if (!moveFunc)
    return <Spinner />;

  // TODO: checkout https://chakra-ui.com/getting-started/with-hook-form to add errors handling
  return (
    <Box backgroundColor={"gray.50"} p={8} h={"fit-content"} rounded="2xl" shadow={"md"}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormControl>
          <HStack>
            <Heading size="sm">{walletAddressEllipsis(values.account)}::{values.module}::{moveFunc.name}</Heading>
            <Spacer />
            <Button onClick={
              () => {
                if (!context) return;
                const group = context.funcGroup.slice()
                const idx = group.findIndex((x) => x.id === id);
                if (idx + 1 >= group.length) return;

                [group[idx], group[idx + 1]] = [group[idx + 1], group[idx]]
                context.setFuncGroup(group);
              }
            }><ArrowUpIcon />
            </Button>
            <Button onClick={
              () => {
                if (!context) return;
                const group = context.funcGroup.slice()
                const idx = group.findIndex((x) => x.id === id);
                if (idx - 1 < 0) return;

                [group[idx], group[idx - 1]] = [group[idx - 1], group[idx]]
                context.setFuncGroup(group);
              }
            }><ArrowDownIcon />
            </Button>
            <Button onClick={
              () => {
                if (!context) return;
                const group = context.funcGroup.slice()
                const idx = group.findIndex((x) => x.id === id);
                group.splice(idx, 1);
                context.setFuncGroup(group);
              }
            }><SmallCloseIcon />
            </Button>
          </HStack>
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
    </Box >
  );
}
