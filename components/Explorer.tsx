import { ExternalLinkIcon } from "@chakra-ui/icons";
import { Button, Flex, Link } from "@chakra-ui/react";
import { useFormContext } from "react-hook-form";
import { TxFormType } from "../lib/schema";

export default function Explorer() {
  const { watch } = useFormContext<TxFormType>();
  const { network, account } = watch();

  return (
    <Flex justifyContent="center" alignItems="center">
      <Link
        variant="outline"
        href={`https://explorer.aptoslabs.com/account/${account}?network=${network}`}
        isExternal
      >
        <ExternalLinkIcon mx="2px" />
      </Link>
    </Flex>
  );
}
