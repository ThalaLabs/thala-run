import { ExternalLinkIcon } from "@chakra-ui/icons";
import { Box, Flex, Heading, HStack, Link, Stack } from "@chakra-ui/react";
import { useContext, useEffect, useRef } from "react";
import AccountInput from "./AccountInput";
import Explorer from "./Explorer";
import { FuncGroupContext } from "./FuncGroupProvider";
import GetModules from "./GetModules";
import { RunCard } from "./RunCard";
import SelectNetwork from "./SelectNetwork";
import ToggleWallet from "./ToggleWallet";
import TxFormProvider from "./TxFormProvider";

export default function TxAdvanceForm() {
  const context = useContext(FuncGroupContext);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    context?.setScrollToTop(() => () =>
      ref.current?.scrollTo({ top: 0, behavior: 'smooth' })
    );
    
    // context?.setScrollToTop is enough here, use context as dependency will cause infinite loop 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context?.setScrollToTop, ref.current]);

  return (
    <Flex h="100vh">
      <Box w="320px" borderRight="1px" borderColor="gray.200" padding="20px">
        <Heading size="lg">thala.run</Heading>
        <GetModules />
      </Box>
      <Flex flex={1} direction="column">
        <Flex padding={"20px"} gap="20px">
          <SelectNetwork />
          <AccountInput />
          <Explorer />
          <ToggleWallet />
        </Flex>
        <Stack ref={ref} minHeight="calc(100vh - 180px)" p={8} gap={10} overflowY="auto">
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
          ).reverse() :
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
