import { Box, Flex, Stack } from "@chakra-ui/react";
import { useContext, useEffect, useRef } from "react";
import AccountInput from "./AccountInput";
import Explorer from "./Explorer";
import { FuncGroupContext } from "./FuncGroupProvider";
import GetModules from "./GetModules";
import { RunCard } from "./RunCard";
import SelectNetwork from "./SelectNetwork";
import TxFormProvider from "./TxFormProvider";
import { ConnectWallet } from "./ConnectWallet";

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
        <GetModules />
      </Box>
      <Flex flex={1} direction="column">
        <Flex padding={"20px"} gap="20px">
          <SelectNetwork />
          <AccountInput />
          <ConnectWallet />
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
      </Flex>
      {/* <DevTool control={control} /> */}
    </Flex >
  );
}
