import { Input, InputGroup, InputRightElement } from "@chakra-ui/react";
import { useController, useFormContext } from "react-hook-form";
import { TxFormType } from "../lib/schema";
import Explorer from "./Explorer";

export default function AccountInput() {
  const { control, resetField } = useFormContext<TxFormType>();

  const {
    field: { value, onChange },
  } = useController({
    name: "account",
    control,
  });

  return (
    <InputGroup flex={1}>
      <Input
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          resetField("typeArgs", { defaultValue: [] });
          resetField("args", { defaultValue: [] });
          resetField("module", { defaultValue: "" });
          resetField("func", { defaultValue: "" });
        }}
      />
      <InputRightElement>
        <Explorer />
      </InputRightElement>
    </InputGroup>
  );
}
