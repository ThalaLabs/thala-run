import { ExternalLinkIcon } from "@chakra-ui/icons";
import { Box, Flex, Heading, HStack, Link, SimpleGrid, Stack } from "@chakra-ui/react";
import { useContext } from "react";
import AccountInput from "./AccountInput";
import Examples from "./Examples";
import Explorer from "./Explorer";
import { FuncGroupContext } from "./FuncGroupProvider";
import GetModules from "./GetModules";
import { RunCard } from "./RunCard";
import SelectNetwork from "./SelectNetwork";
import ToggleWallet from "./ToggleWallet";
import TxFormProvider from "./TxFormProvider";

export default function TxAdvanceForm() {
  const context = useContext(FuncGroupContext);
  console.log(context?.funcGroup);
  return (
    <Flex h="100vh">
      <Box w="320px" borderRight="1px" borderColor="gray.200" padding="20px">
        <Heading size="lg">thala.run</Heading>
        <Examples />
        <GetModules />
      </Box>
      <Flex flex={1} direction="column">
        <Flex padding={"20px"} gap="20px">
          <SelectNetwork />
          <AccountInput />
          <Explorer />
          <ToggleWallet />
        </Flex>
        <Stack minHeight="calc(100vh - 180px)" p={8} gap={10} overflowY="auto">
          {context?.funcGroup.length ? context?.funcGroup.map((func) =>
            <TxFormProvider
              key={func.id}
              defaultValues={{
                ...func,
              }}>
              <RunCard
                id={func.id}
              />
            </TxFormProvider>
          ) :
            <Box>👈 Pick a function to run, or 👆 Try a new account</Box>}
        </Stack>
        <HStack spacing="20px" padding="20px" justifyContent={"center"}>
          <Link href="https://github.com/ThalaLabs/thala-run" isExternal>
            GitHub <ExternalLinkIcon mx="2px" />
          </Link>
          <Box>|</Box>
          <Link href="https://thala.fi" isExternal>
            Built by Thala Labs <ExternalLinkIcon mx="2px" />
          </Link>
        </HStack>
      </Flex>
      {/* <DevTool control={control} /> */}
    </Flex >
  );
}
