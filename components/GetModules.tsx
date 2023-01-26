import { Center, SkeletonText } from "@chakra-ui/react";
import { Types } from "aptos";
import { useFormContext } from "react-hook-form";
import useSWR from "swr";
import { TxFormType } from "../lib/schema";
import { getAptosClient } from "../lib/utils";
import { Modules } from "./Modules";

export default function GetModules() {
  const {
    watch,
    formState: { errors },
  } = useFormContext<TxFormType>();
  const { account, network } = watch();
  const accountError = errors?.account;

  const { data, error, isLoading } = useSWR<Types.MoveModuleBytecode[]>(
    accountError === undefined ? [account, network] : null,
    ([account, network]: string[2]) =>
      getAptosClient(network).getAccountModules(account)
  );

  const modules = data
    ?.filter((module) => module.abi !== undefined)
    .map((module) => module.abi!);

  if (!account) {
    return (
      <Center h="100px" color="green.600">
        Please input account
      </Center>
    );
  }
  if (accountError) {
    return (
      <Center h="100px" color="red.500">
        Invalid account
      </Center>
    );
  }
  if (isLoading) {
    return (
      <SkeletonText mt="4" noOfLines={10} spacing="4" skeletonHeight="10" />
    );
  }
  if (error) {
    return (
      <Center h="100px" color="red.500">
        {error?.errorCode?.replaceAll("_", " ")}
      </Center>
    );
  }
  if (modules?.length === 0) {
    return (
      <Center h="100px" color="red.500">
        Modules not found
      </Center>
    );
  }
  return <Modules modules={modules ?? []} />;
}
