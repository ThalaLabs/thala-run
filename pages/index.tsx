import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Stack,
  Text,
  Textarea,
  Input,
  Spinner,
  List,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import { AptosClient, Types } from "aptos";
import { useRouter } from "next/router";
import { PetraWalletName } from "petra-plugin-wallet-adapter";
import { useForm, SubmitHandler } from "react-hook-form";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import useSWR from "swr";

interface AptosModule {
  abi: {
    address: string;
    name: string;
    exposed_functions: AptosFunction[];
  };
}

interface IFormInput {
  typeArgs: string;
  args: string;
}

interface AptosFunction {
  name: string;
  is_entry: boolean;
  generic_type_params: { constraints: string[] }[];
  params: string[];
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());
const aptosClient = new AptosClient("https://fullnode.testnet.aptoslabs.com");

export default function Home() {
  const router = useRouter();
  const account = (router.query["account"] || "") as string;

  const accountEmpty = account.length === 0;
  const accountValid = account.length === 66;

  const { data, error } = useSWR<AptosModule[]>(
    accountValid
      ? `https://testnet.aptoslabs.com/v1/accounts/${account}/modules`
      : null,
    fetcher
  );
  const isLoading = !error && !data;

  return (
    <Box as="section" bg="bg-surface">
      <Container py="24">
        <Stack spacing="5">
          <Stack spacing="5" align="center">
            <Heading size="md">
              MoveTx: Think Etherscan Write Contract, but for Move
            </Heading>
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
          </Stack>
          {accountEmpty ? (
            <></>
          ) : !accountValid ? (
            <Text color="red">not a valid account</Text>
          ) : isLoading ? (
            <Spinner />
          ) : error !== undefined ? (
            <Text color="red">{error.message}</Text>
          ) : (
            <WriteContract modules={data!} />
          )}
        </Stack>
      </Container>
    </Box>
  );
}

function WriteContract({ modules }: { modules: AptosModule[] }) {
  modules.sort((a, b) => a.abi.name.localeCompare(b.abi.name));
  return (
    <List spacing="5">
      {modules.map((module) => (
        <Module key={module.abi.name} module={module} />
      ))}
    </List>
  );
}

function Module({ module }: { module: AptosModule }) {
  const entryFuncs = module.abi.exposed_functions.filter(
    (func) => func.is_entry
  );
  if (entryFuncs.length === 0) {
    return <></>
  }
  return (
    <Stack spacing="5">
      <HStack>
        <Text backgroundColor={"gray.200"} paddingX={1}>
          module
        </Text>
        <Text as="b">{module.abi.name}</Text>
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
                  module={`${module.abi.address}::${module.abi.name}`}
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

function CallTxForm({ module, func }: { module: string; func: AptosFunction }) {
  const { connect, connected, signAndSubmitTransaction } = useWallet();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<IFormInput>();

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    const typeArgs = data.typeArgs.length === 0 ? [] : data.typeArgs.split(",");
    const args = data.args.length === 0 ? [] : data.args.split(",");
    await onSignAndSubmitTransaction(typeArgs, args);
  };

  async function onSignAndSubmitTransaction(typeArgs: string[], args: any[]) {
    const payload: Types.TransactionPayload = {
      type: "entry_function_payload",
      function: `${module}::${func.name}`,
      type_arguments: typeArgs,
      arguments: args,
    };
    try {
      const response = await signAndSubmitTransaction(payload);
      // if you want to wait for transaction
      await aptosClient.waitForTransaction(response?.hash || "");
      console.log(response?.hash);
    } catch (error: any) {
      console.log("error", error);
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
          <Button
            mt="4"
            variant="outline"
            onClick={() => connect(PetraWalletName)}
          >
            Connect Petra Wallet
          </Button>
        )}
      </FormControl>
    </form>
  );
}

function functionSignature(func: AptosFunction): string {
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
