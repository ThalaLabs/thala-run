import { ExternalLinkIcon } from "@chakra-ui/icons";
import { Flex, Heading, HStack, Link } from "@chakra-ui/react";

export default function HeaderBar() {
  return (
    <Flex
      as="header"
      width="100%"
      alignItems="center"
      justifyContent="space-between"
      padding="8px 16px"
      borderBottom="1px solid #E2E8F0"
      bg="white"
      zIndex={10}
      position="relative"
    >
      <Heading size="lg">thala.run</Heading>
      <HStack spacing="20px">
        <Link href="https://github.com/ThalaLabs/thala-run" isExternal>
          GitHub <ExternalLinkIcon mx="2px" />
        </Link>
      </HStack>
    </Flex>
  );
} 