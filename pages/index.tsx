import {
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
  Spinner,
  Link,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { Types } from "aptos";
import { useRouter } from "next/router";
import NextLink from "next/link";
import useSWR from "swr";
import { ModuleList } from "../components/ModuleList";
import { FULLNODES, getAptosClient } from "../lib/utils";

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
              href="/?account=0x867ed1f6bf916171b1de3ee92849b8978b7d1b9e0a8cc982a3d19d535dfd9c0c&network=mainnet"
            >
              Aptos Names (mainnet)
            </Link>
            <Spacer />
            <Link
              as={NextLink}
              href="/?account=0x7e783b349d3e89cf5931af376ebeadbfab855b3fa239b7ada8f5a92fbea6b387&network=mainnet"
            >
              Pyth Oracle (mainnet)
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
            <ModuleList network={network} modules={data!} />
          )}
        </Stack>
      </Container>
    </Box>
  );
}
