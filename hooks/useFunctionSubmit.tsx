import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { MSafeWallet } from "@msafe/aptos-wallet";
import { Link, useToast } from "@chakra-ui/react";
import { useState } from "react";
import { SubmitHandler, useFormContext } from "react-hook-form";
import { NetworkType, TxFormType } from "../lib/schema";
import { getAptosClient } from "../lib/utils";
import NextLink from "next/link";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import useSWR from "swr";
import {
  MoveModuleBytecode,
  Hex,
  Ed25519PublicKey,
  HexInput,
  InputEntryFunctionData,
} from "@aptos-labs/ts-sdk";
import { encodeInputArgsForViewRequest } from "../lib/viewArgsEncoder";

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
    ([accountAddress, network, moduleName]: [string, NetworkType, string]) =>
      getAptosClient(network).getAccountModule({ accountAddress, moduleName })
  );

  const moveModule = data?.abi;
  const moveFunc = moveModule?.exposed_functions.find((f) => f.name === func);

  const _onSubmit: SubmitHandler<TxFormType> = async (data) => {
    if (!moveFunc) return;
    if (moveFunc.is_entry) {
      await onSignAndSubmitTransaction(
        network as NetworkType,
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
            await getAptosClient(network as NetworkType).view({
              payload: {
                function: `${account}::${module}::${func}`,
                typeArguments: data.typeArgs,
                functionArguments: data.args.map((arg, i) => encodeInputArgsForViewRequest(moveFunc.params[i], arg)),
              },
              options: ledgerVersion !== undefined ? { ledgerVersion } : {},
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
      const client = getAptosClient(network as NetworkType);

      const isMSafeWallet = MSafeWallet.inMSafeWallet();

      if (isMSafeWallet) {
        const multisigAddress = walletAccount.address;

        // TODO: investigate if there's a way to get the browser wallet account connected to the msafe UI
        // That account would be an owner on this multisig account
        // If there isn't a way propose a way for MSafeWallet to expose this
        const ownerAccount = walletAccount;

        // Build transaction using owner as sender, but include multisig data
        const transaction = await client.transaction.build.simple({
          sender: ownerAccount.address,
          data: {
            function: `${account}::${module}::${func}`,
            typeArguments: data.typeArgs,
            functionArguments: data.args,
            // Include multisig address to indicate this is a multisig transaction
            multisigAddress: multisigAddress
          },
        });

        const ownerPublicKey = ownerAccount.publicKey

        const [userTransactionResponse] =
          await client.transaction.simulate.simple({
            signerPublicKey: new Ed25519PublicKey(ownerPublicKey as HexInput),
            transaction,
          });

        setIsSimulation(true);
        setExecutionResult(JSON.stringify(userTransactionResponse));
      } else {
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
      }
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
    network: NetworkType,
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
