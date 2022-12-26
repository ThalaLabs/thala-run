import { Input } from "@chakra-ui/react";
import { useController, useFormContext } from "react-hook-form";
import { TxFormType } from "../lib/schema";

export default function AccountInput() {
  const { control, getValues, resetField } = useFormContext<TxFormType>();
  const {
    field: { value, onChange },
  } = useController({
    name: "account",
    control,
  });
  const [typeArgs, args] = getValues(["typeArgs", "args"]);
  return (
    <Input
      flex={1}
      value={value}
      onChange={(e) => {
        onChange(e.target.value);
        [...Array(typeArgs.length)].forEach((_, i) => {
          resetField(`typeArgs.${i}`);
        });
        [...Array(args.length)].forEach((_, i) => {
          resetField(`args.${i}`);
        });
        resetField("module");
        resetField("func");
      }}
    />
  );
}
