import { Box, FormLabel } from "@chakra-ui/react";
import ArgumentInput from "./ArgumentInput";

export default function TypeArgsInput({ params }: { params: string[] }) {
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
          <ArgumentInput arg={arg} index={i} />
        </Box>
      ))}
    </>
  );
}
