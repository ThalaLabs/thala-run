import { Text, Box, FormLabel, HStack, Input, Textarea, Divider } from "@chakra-ui/react";
import { useFormContext } from "react-hook-form";
import { TxFormType } from "../lib/schema";
import { EditableName } from "./EditableName";

export default function TypeArgsInput({ params }: { params: string[] }) {
  const { register } = useFormContext<TxFormType>();

  let args = params;
  if (args[0] === "&signer") {
    args = args.slice(1);
  }
  return (
    <>
      {args.map((arg, i) => (
        <Box my={2} key={i.toString()}>
          <HStack alignItems={"center"} gap={2} mb={1}>
            <Text color={"gray.400"} fontSize={"sm"}>arg{i}: {arg}</Text>
            <Divider orientation="vertical" height={"3"} />
            <EditableName fieldPath={`argsComment.${i}`} />
          </HStack>
          {arg === "address" ? (
            <Textarea {...register(`args.${i}`)} />
          ) : (
            <Input {...register(`args.${i}`)} />
          )}
        </Box>
      ))}
    </>
  );
}
