import { Input } from "@chakra-ui/react";
import { useController, useFormContext } from "react-hook-form";
import { TxFormType } from "../lib/schema";

export default function AccountInput() {
  const { control, resetField } = useFormContext<TxFormType>();
  const {
    field: { value, onChange },
  } = useController({
    name: "account",
    control,
  });
  return (
    <Input
      flex={1}
      value={value}
      onChange={(e) => {
        onChange(e.target.value);
        resetField("typeArgs", {defaultValue: []});
        resetField("args", {defaultValue: []});
        resetField("module", {defaultValue: ""});
        resetField("func", {defaultValue: ""});
      }}
    />
  );
}
