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
import { useRouter } from "next/router";
import { PetraWalletName } from "petra-plugin-wallet-adapter";
import { useForm, SubmitHandler } from "react-hook-form";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import useSWR from "swr";

interface AptosModule {
  abi: {
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
              placeholder="account address"
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
                <CallTxForm func={func} />
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </Stack>
  );
}

function CallTxForm({ func }: { func: AptosFunction }) {
  const { connected } = useWallet();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<IFormInput>();
  const onSubmit: SubmitHandler<IFormInput> = (data) => console.log(data);
  // TODO: checkout https://chakra-ui.com/getting-started/with-hook-form to add errors handling
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormControl>
        <FormLabel size="sm">Type Args</FormLabel>
        <Input {...register("typeArgs")} />
        <FormLabel>Args</FormLabel>
        <Input {...register("args")} />
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
          <ConnectWalletButton />
        )}
      </FormControl>
    </form>
  );
}

function ConnectWalletButton() {
  const { connect } = useWallet();
  return (
    <Button mt="4" variant="outline" onClick={() => connect(PetraWalletName)}>
      Connect Wallet
    </Button>
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
