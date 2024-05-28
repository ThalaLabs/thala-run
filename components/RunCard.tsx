import { useWallet } from "@aptos-labs/wallet-adapter-react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ExternalLinkIcon,
  SmallCloseIcon,
} from "@chakra-ui/icons";
import {
  Box,
  FormControl,
  Button,
  Link,
  Heading,
  Spinner,
  HStack,
  Spacer,
  Text,
  Tag,
  Flex,
} from "@chakra-ui/react";
import { ConnectWallet } from "./ConnectWallet";
import TypeArgsInput from "./TypeArgsInput";
import ArgsInput from "./ArgsInput";
import { useContext, useEffect } from "react";
import { FuncGroupContext } from "./FuncGroupProvider";
import { walletAddressEllipsis } from "../functions/walletAddressEllipsis";
import { useFunctionSubmit } from "../hooks/useFunctionSubmit";
import { motion } from "framer-motion";

export function RunCard({ id }: { id: string }) {
  const { connected } = useWallet();
  const context = useContext(FuncGroupContext);
  const {
    watch,
    moveFunc,
    onSubmit,
    onSimualteSubmit,
    executionResult,
    isSubmitting,
  } = useFunctionSubmit();

  const { account, network, module, func, typeArgs, args } = watch();
  const values = watch();

  const serializedTypeArgs = JSON.stringify(typeArgs);
  const serializedArgs = JSON.stringify(args);
  useEffect(() => {
    if (!context) return;
    const idx = context.funcGroup.findIndex((x) => x.id === id);
    context.funcGroup[idx] = {
      id: id,
      ...values,
    };
    context?.setFuncGroup(context.funcGroup.slice());
  }, [serializedTypeArgs, serializedArgs, id]);
  if (!account) return <Box></Box>;
  if (!moveFunc) return <Spinner />;

  // TODO: checkout https://chakra-ui.com/getting-started/with-hook-form to add errors handling
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.3,
      }}
    >
      <Box
        backgroundColor={"gray.50"}
        p={8}
        h={"fit-content"}
        rounded="2xl"
        shadow={"md"}
      >
        <form>
          <FormControl>
            <HStack>
              <Heading size="sm">
                {walletAddressEllipsis(values.account)}::{values.module}::
                {moveFunc.name}
                <Tag
                  ml={2}
                  size="sm"
                  colorScheme={moveFunc.is_entry ? "green" : "blue"}
                >
                  {moveFunc.is_entry ? "entry" : "view"}
                </Tag>
              </Heading>
              <Link
                variant="outline"
                href={`https://aptscan.ai/accounts/${values.account}?viewMode=${
                  moveFunc.is_entry ? "write" : "read"
                }&module=${values.module}&functionName=${
                  moveFunc.name
                }&network=${network}#modules`}
                isExternal
                position="relative"
                top="-2px"
              >
                <ExternalLinkIcon mx="2px" />
              </Link>
              <Spacer />
              <Button
                onClick={() => {
                  if (!context) return;
                  const group = context.funcGroup.slice();
                  const idx = group.findIndex((x) => x.id === id);
                  if (idx + 1 >= group.length) return;

                  [group[idx], group[idx + 1]] = [group[idx + 1], group[idx]];
                  context.setFuncGroup(group);
                }}
              >
                <ArrowUpIcon />
              </Button>
              <Button
                onClick={() => {
                  if (!context) return;
                  const group = context.funcGroup.slice();
                  const idx = group.findIndex((x) => x.id === id);
                  if (idx - 1 < 0) return;

                  [group[idx], group[idx - 1]] = [group[idx - 1], group[idx]];
                  context.setFuncGroup(group);
                }}
              >
                <ArrowDownIcon />
              </Button>
              <Button
                onClick={() => {
                  if (!context) return;
                  const group = context.funcGroup.slice();
                  const idx = group.findIndex((x) => x.id === id);
                  group.splice(idx, 1);
                  context.setFuncGroup(group);
                }}
              >
                <SmallCloseIcon />
              </Button>
            </HStack>
            {moveFunc.generic_type_params.length > 0 && (
              <TypeArgsInput nTypeArgs={moveFunc.generic_type_params.length} />
            )}
            {moveFunc.params.length > 0 &&
              !(
                moveFunc.params.length === 1 && moveFunc.params[0] === "&signer"
              ) && <ArgsInput params={moveFunc.params} />}
            {connected || !moveFunc.is_entry ? (
              <Flex sx={{ alignItems: "center", gap: 2 }}>
                <Button mt="2" isLoading={isSubmitting} onClick={onSubmit}>
                  Run
                </Button>
                {moveFunc.is_entry && (
                  <Button
                    mt="2"
                    isLoading={isSubmitting}
                    onClick={onSimualteSubmit}
                  >
                    Simulate
                  </Button>
                )}
              </Flex>
            ) : (
              <ConnectWallet mt="2" />
            )}

            {executionResult && (
              <Box mt={4}>
                {moveFunc.is_entry ? (
                  <Text>
                    Transaction:
                    <Link
                      isExternal
                      ml={2}
                      color="blue.600"
                      href={`https://aptscan.ai/transactions/${executionResult}?network=${network}`}
                    >
                      {executionResult}
                    </Link>
                  </Text>
                ) : (
                  <Text wordBreak={"break-word"}>
                    Result: {executionResult}
                  </Text>
                )}
              </Box>
            )}
          </FormControl>
        </form>
      </Box>
    </motion.div>
  );
}
