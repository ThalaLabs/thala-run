import { Box, FormLabel, Input, Textarea } from "@chakra-ui/react";
import { useFormContext } from "react-hook-form";
import { TxFormType } from "../lib/schema";

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
          <FormLabel>
            arg{i}: {arg}
          </FormLabel>
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
