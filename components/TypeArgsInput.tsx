import { Box, FormLabel, HStack, Input, Textarea, Text, Divider } from "@chakra-ui/react";
import { useFormContext } from "react-hook-form";
import { TxFormType } from "../lib/schema";
import { EditableName } from "./EditableName";

export default function TypeArgsInput({ nTypeArgs }: { nTypeArgs: number }) {
  const { register, watch } = useFormContext<TxFormType>();
  return (
    <>
      {[...Array(nTypeArgs).keys()].map((i) => (
        <Box my={2} key={i.toString()}>
          <HStack alignItems={"center"} gap={2} mb={1}>
            <Text color={"gray.400"} fontSize={"sm"}>T{i}</Text>
            <Divider orientation="vertical" height={"3"} />
            <EditableName fieldPath={`typeArgsComment.${i}`} />
          </HStack>
          <Textarea {...register(`typeArgs.${i}`)} />
        </Box>
      ))}
    </>
  );
}
