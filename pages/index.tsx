import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  Spacer,
  Stack,
  Text,
  Textarea,
  Input,
  Spinner,
  Link,
  List,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  useToast,
  useDisclosure,
} from "@chakra-ui/react";
import { ChevronDownIcon, ExternalLinkIcon } from "@chakra-ui/icons";
import { AptosClient, Types } from "aptos";
import { useRouter } from "next/router";
import NextLink from "next/link";
import { useForm, SubmitHandler } from "react-hook-form";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import useSWR from "swr";

interface IFormInput {
  typeArgs: string;
  args: string;
}

const FULLNODES: { [network: string]: string } = {
  devnet: "https://fullnode.devnet.aptoslabs.com",
  testnet: "https://fullnode.testnet.aptoslabs.com",
  mainnet: "https://fullnode.mainnet.aptoslabs.com",
};

export default function Home() {
  const router = useRouter();
  const account = (router.query["account"] || "") as string;
  const network = (router.query["network"] || "mainnet") as string;

  const accountEmpty = account.length === 0;
  const accountValid = account.length === 66;

  const { data, error } = useSWR<Types.MoveModuleBytecode[]>(
    accountValid ? [account, network] : null,
    (account, network) => getAptosClient(network).getAccountModules(account)
  );

  const isLoading = !error && !data;

  return (
    <Box as="section" bg="bg-surface">
      <Container as="nav" py="5">
        <HStack spacing="10" justify="space-between">
          <Heading size="md">MoveTx: the missing txn runner of Aptos</Heading>
          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
              {network}
            </MenuButton>
            <MenuList>
              {Object.keys(FULLNODES).map((network) => (
                <MenuItem
                  key={network}
                  onClick={async () => {
                    await router.replace({
                      query: { ...router.query, network },
                    });
                  }}
                >
                  {network}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
        </HStack>
      </Container>
      <Container py="5">
        <Stack spacing="5">
          <Flex w="full">
            <Text>Try examples 👉</Text>
            <Spacer />
            <Link
              as={NextLink}
              href="/?account=0x96c2a8e775207b8f8ee8d3a6e4a68f70fcaaddcdcaa1f3511ef38e18d4492a8d&network=testnet"
            >
              Move Dollar (testnet)
            </Link>
            <Spacer />
            <Link
              as={NextLink}
              href="/?account=0x190d44266241744264b964a37b8f09863167a12d3e70cda39376cfb4e3561e12&network=mainnet"
            >
              Liquidswap (mainnet)
            </Link>
          </Flex>
          <Textarea
            placeholder="0x... account address"
            value={account}
            onChange={async (e) => {
              const account = e.target.value;
              await router.replace({
                query: { ...router.query, account },
              });
            }}
          />
          {accountEmpty ? (
            <></>
          ) : !accountValid ? (
            <Text color="red">not a valid account</Text>
          ) : isLoading ? (
            <Spinner />
          ) : error !== undefined ? (
            <Text color="red">{error.message}</Text>
          ) : (
            <WriteContract network={network} modules={data!} />
          )}
        </Stack>
      </Container>
    </Box>
  );
}

function WriteContract({
  network,
  modules,
}: {
  network: string;
  modules: Types.MoveModuleBytecode[];
}) {
  modules.sort((a, b) => a.abi!.name.localeCompare(b.abi!.name));
  return (
    <List spacing="5">
      {modules.map((module) => (
        <Module key={module.abi!.name} network={network} module={module} />
      ))}
    </List>
  );
}

function Module({
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

function CallTxForm({
  network,
  module,
  func,
}: {
  network: string;
  module: string;
  func: Types.MoveFunction;
}) {
  const { connected, signAndSubmitTransaction } = useWallet();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<IFormInput>();
  const toast = useToast();

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    const typeArgs = data.typeArgs.length === 0 ? [] : data.typeArgs.split(",");
    const args = data.args.length === 0 ? [] : data.args.split(",");
    await onSignAndSubmitTransaction(network, typeArgs, args);
  };

  async function onSignAndSubmitTransaction(
    network: string,
    typeArgs: string[],
    args: any[]
  ) {
    const payload: Types.TransactionPayload = {
      type: "entry_function_payload",
      function: `${module}::${func.name}`,
      type_arguments: typeArgs,
      arguments: args,
    };
    try {
      const { hash } = await signAndSubmitTransaction(payload);
      await getAptosClient(network).waitForTransaction(hash);
      toast({
        title: "Transaction submitted.",
        description: (
          <Link
            as={NextLink}
            href={`https://explorer.aptoslabs.com/txn/${hash}?network=${network}`}
            isExternal
          >
            View on explorer <ExternalLinkIcon mx="2px" />
          </Link>
        ),
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error: any) {
      console.log("error", error);
      toast({
        title: "An error occurred.",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  }

  // TODO: checkout https://chakra-ui.com/getting-started/with-hook-form to add errors handling
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormControl>
        {func.generic_type_params.length > 0 && (
          <>
            <FormLabel size="sm">type args</FormLabel>
            <Input
              placeholder="comma separated type args"
              {...register("typeArgs")}
            />
          </>
        )}
        {func.params.length > 0 &&
          !(func.params.length === 1 && func.params[0] !== "&signer") && (
            <>
              <FormLabel>args</FormLabel>
              <Input placeholder="comma separated args" {...register("args")} />
            </>
          )}
        {connected ? (
          <Button
            mt="4"
            variant="outline"
            isLoading={isSubmitting}
            type="submit"
          >
            Run
          </Button>
        ) : (
          <ConnectWalletModal />
        )}
      </FormControl>
    </form>
  );
}

function ConnectWalletModal() {
  const { connect, wallets } = useWallet();
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <>
      <Button onClick={onOpen} mt="4" variant="outline">
        Connect Wallet
      </Button>
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Connect Wallet</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack>
              {wallets.map((wallet) => (
                <Button
                  key={wallet.name}
                  onClick={() => connect(wallet.name)}
                  disabled={wallet.readyState !== "Installed"}
                >
                  {wallet.name}
                </Button>
              ))}
            </Stack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}

function getAptosClient(network: string): AptosClient {
  return new AptosClient(FULLNODES[network]);
}

function functionSignature(func: Types.MoveFunction): string {
  return `${func.name}${typeArgPlaceholders(
    func.generic_type_params.length
  )}(${func.params.join(", ")})`;
}

function typeArgPlaceholders(n: number): string {
  if (n === 0) {
    return "";
  }
  return "<" + Array.from({ length: n }, (_, i) => "T" + i).join(", ") + ">";
}
