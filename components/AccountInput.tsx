import { Input } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useController, useFormContext } from "react-hook-form";
import { TxFormType } from "../lib/schema";

export default function AccountInput() {
  const { control, resetField } = useFormContext<TxFormType>();
  const router = useRouter();

  const {
    field: { value, onChange },
  } = useController({
    name: "account",
    control,
  });

  useEffect(() => {
    onChange(router.query.account);
  }, [router.query.account, onChange]);

  return (
    <Input
      flex={1}
      value={value}
      onChange={(e) => {
        onChange(e.target.value);
        resetField("typeArgs", { defaultValue: [] });
        resetField("args", { defaultValue: [] });
        resetField("module", { defaultValue: "" });
        resetField("func", { defaultValue: "" });
      }}
    />
  );
}
