import {
  Box,
  Container,
  Heading,
  Stack,
  Text,
  Input,
  Spinner,
  List,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import useSWR from "swr";

interface AptosModule {
  abi: {
    name: string;
    exposed_functions: AptosFunction[];
  };
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
  const account = router.query["account"] as string;
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
            <Heading size="md">Call Move Txns</Heading>
            <Text maxW="2xl" textAlign="center" fontSize="xl">
              Start by pasting an account address!
            </Text>
            <Input
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
          {isLoading ? (
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
  return (
    <List spacing="5">
      {modules.map((module) => (
        <Module key={module.abi.name} module={module} />
      ))}
    </List>
  );
}

function Module({ module }: { module: AptosModule }) {
  return (
    <Stack spacing="5">
      <Heading size="md">{module.abi.name}</Heading>
      <List spacing="3">
        {module.abi.exposed_functions
          .filter((func) => func.is_entry)
          .map((func) => (
            <Text key={func.name}>{functionSignature(func)}</Text>
          ))}
      </List>
    </Stack>
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
