import { ExternalLinkIcon } from "@chakra-ui/icons";
import { Link } from "@chakra-ui/react";
import { useFormContext } from "react-hook-form";
import { TxFormType } from "../lib/schema";

export default function Explorer() {
  const { watch } = useFormContext<TxFormType>();
  const { network, account } = watch();

  return (
    <Link
      href={`https://explorer.aptoslabs.com/account/${account}?network=${network}#modules`}
      isExternal
      display="flex"
      alignItems="center"
      height="100%"
      pr={2}
    >
      <ExternalLinkIcon />
    </Link>
  );
}
