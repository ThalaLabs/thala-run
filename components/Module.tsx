import {
  Box,
  Stack,
  HStack,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionIcon,
  AccordionPanel,
  Text,
} from "@chakra-ui/react";
import { Types } from "aptos";
import { functionSignature } from "../lib/utils";
import { CallTxForm } from "./CallTxForm";

export function Module({
  network,
  module,
}: {
  network: string;
  module: Types.MoveModuleBytecode;
}) {
  const entryFuncs = module.abi!.exposed_functions.filter(
    (func) => func.is_entry
  );
  if (entryFuncs.length === 0) {
    return <></>;
  }
  return (
    <Stack spacing="5">
      <HStack>
        <Text backgroundColor={"gray.200"} paddingX={1}>
          module
        </Text>
        <Text as="b">{module.abi!.name}</Text>
      </HStack>
      {entryFuncs.length === 0 ? (
        <Text>no entry function</Text>
      ) : (
        <Accordion allowToggle>
          {entryFuncs.map((func) => (
            <AccordionItem key={func.name}>
              <h2>
                <AccordionButton _expanded={{ bg: "gray.100" }}>
                  <Box flex="1" textAlign="left">
                    {functionSignature(func)}
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                <CallTxForm
                  network={network}
                  module={`${module.abi!.address}::${module.abi!.name}`}
                  func={func}
                />
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </Stack>
  );
}
