import { Box, FormLabel, Textarea } from "@chakra-ui/react";
import { useFormContext } from "react-hook-form";
import { TxFormType } from "../lib/schema";

export default function TypeArgsInput({ nTypeArgs }: { nTypeArgs: number }) {
  const { register } = useFormContext<TxFormType>();
  return (
    <>
      {[...Array(nTypeArgs).keys()].map((i) => (
        <Box my={2} key={i.toString()}>
          <FormLabel size="sm">T{i}</FormLabel>
          <Textarea {...register(`typeArgs.${i}`)} />
        </Box>
      ))}
    </>
  );
}
