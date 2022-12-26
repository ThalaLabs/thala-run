import { ExternalLinkIcon } from "@chakra-ui/icons";
import { Box, Flex, Heading, HStack, Link, SimpleGrid } from "@chakra-ui/react";
import { DevTool } from "@hookform/devtools";
import { useFormContext } from "react-hook-form";
import { TxFormType } from "../lib/schema";
import AccountInput from "./AccountInput";
import Examples from "./Examples";
import Functions from "./Functions";
import { Run } from "./Run";
import SelectNetwork from "./SelectNetwork";

export default function TxForm() {
  const { control } = useFormContext<TxFormType>();
  return (
    <Flex h="100vh">
      <Box w="320px" borderRight="1px" borderColor="gray.200" padding="20px">
        <Heading size="lg">thala.run</Heading>
        <Examples />
        <Functions />
      </Box>
      <Flex flex={1} direction="column">
        <Flex padding={"20px"}>
          <SelectNetwork />
          <Box w="20px"></Box>
          <AccountInput />
        </Flex>
        <SimpleGrid columns={2} spacing={10} flex={1} padding="20px">
          <Run />
          {/* TODO: render smth else */}
          <Box></Box>
        </SimpleGrid>
        <HStack spacing="20px" padding="20px" justifyContent={"center"}>
          <Link href="https://github.com/0xbe1/movetx" isExternal>
            GitHub <ExternalLinkIcon mx="2px" />
          </Link>
          <Box>|</Box>
          <Link href="https://thala.fi" isExternal>
            Built by Thala Labs <ExternalLinkIcon mx="2px" />
          </Link>
        </HStack>
      </Flex>
      <DevTool control={control} />
    </Flex>
  );
}
