import { Flex, Link, Spacer, Text } from "@chakra-ui/react";
import NextLink from "next/link";

export default function Examples() {
  return (
    <Flex my={3}>
      <Text>Examples:</Text>
      <Spacer />
      <Link as={NextLink} target="_blank" href="/?account=0x1&network=mainnet">
        0x1
      </Link>
      <Spacer />
      <Link as={NextLink} target="_blank" href="/?account=0x3&network=mainnet">
        0x3
      </Link>
      <Spacer />
      <Link
        as={NextLink}
        target="_blank"
        href="/?account=0x867ed1f6bf916171b1de3ee92849b8978b7d1b9e0a8cc982a3d19d535dfd9c0c&network=mainnet"
      >
        Aptos Names
      </Link>
    </Flex>
  );
}
