import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Link, useToast } from "@chakra-ui/react";
import { useState } from "react";
import { SubmitHandler, useFormContext } from "react-hook-form";
import { TxFormType } from "../lib/schema";
import { getAptosClient } from "../lib/utils";
import NextLink from "next/link";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import useSWR from "swr";
import {
  MoveModuleBytecode,
  Network,
  Hex,
  Ed25519PublicKey,
  HexInput,
} from "@aptos-labs/ts-sdk";

export const useFunctionSubmit = () => {
  const [executionResult, setExecutionResult] = useState<string>();
  const { signAndSubmitTransaction, account: walletAccount } = useWallet();
  const [isSimulation, setIsSimulation] = useState(false);
  const [ledgerVersion, setLedgerVersion] = useState<number | undefined>(
    undefined
  );
  const toast = useToast();

  const {
    watch,
    handleSubmit,
    formState: { isSubmitting },
  } = useFormContext<TxFormType>();
  const { account, network, module, func } = watch();

  const { data } = useSWR<MoveModuleBytecode>(
    [account, network, module],
    ([accountAddress, network, moduleName]: [string, Network, string]) =>
      getAptosClient(network).getAccountModule({ accountAddress, moduleName })
  );

  const moveModule = data?.abi;
  const moveFunc = moveModule?.exposed_functions.find((f) => f.name === func);

  const _onSubmit: SubmitHandler<TxFormType> = async (data) => {
    if (!moveFunc) return;

    if (moveFunc.is_entry) {
      await onSignAndSubmitTransaction(
        network,
        account,
        module,
        func,
        data.typeArgs,
        data.args
      );
    } else {
      try {
        setExecutionResult(
          JSON.stringify(
            await getAptosClient(network).view({
              payload: {
                function: `${account}::${module}::${func}`,
                typeArguments: data.typeArgs,
                functionArguments: data.args,
              },
              options: {
                ledgerVersion,
              },
            })
          )
        );
      } catch (error: any) {
        setExecutionResult(undefined);
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
    setIsSimulation(false);
  };

  const _onSimulateSubmit: SubmitHandler<TxFormType> = async (data) => {
    if (!moveFunc || !walletAccount) return;

    try {
      const client = getAptosClient(network);

      const transaction = await client.transaction.build.simple({
        sender: walletAccount.address,
        data: {
          function: `${account}::${module}::${func}`,
          typeArguments: data.typeArgs,
          functionArguments: data.args,
        },
      });

      const [userTransactionResponse] =
        await client.transaction.simulate.simple({
          signerPublicKey: new Ed25519PublicKey(
            walletAccount.publicKey as HexInput
          ),
          transaction,
        });
      setIsSimulation(true);
      setExecutionResult(JSON.stringify(userTransactionResponse));
    } catch (error: any) {
      setExecutionResult(undefined);
      console.log("error", error);
      toast({
        title: "An error occurred.",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
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

    const payload = {
      type: "entry_function_payload",
      function: `${account0x}::${module}::${func}`,
      type_arguments: typeArgs,
      arguments: handleArrayArgs,
    };
    try {
      const { hash } = await signAndSubmitTransaction(payload);
      await getAptosClient(network).waitForTransaction({
        transactionHash: hash,
      });

      const href = `https://aptscan.ai/transactions/${hash}?network=${network}`;
      setExecutionResult(hash);

      toast({
        title: "Transaction submitted.",
        description: (
          <Link as={NextLink} href={href} isExternal>
            View on explorer <ExternalLinkIcon mx="2px" />
          </Link>
        ),
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error: any) {
      setExecutionResult(undefined);
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

  const onSubmit = handleSubmit(_onSubmit);
  const onSimualteSubmit = handleSubmit(_onSimulateSubmit);

  return {
    watch,
    executionResult,
    moveFunc,
    onSubmit,
    onSimualteSubmit,
    isSubmitting,
    isSimulation,
    ledgerVersion,
    setLedgerVersion,
    isView: !(moveFunc && moveFunc.is_entry),
  };
};
