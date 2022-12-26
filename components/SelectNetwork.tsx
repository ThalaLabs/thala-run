import { Select } from "@chakra-ui/react";
import { useFormContext } from "react-hook-form";
import { NetworkEnum, TxFormType } from "../lib/schema";

export default function SelectNetwork() {
  const { register } = useFormContext<TxFormType>();
  return (
    <Select width={"120px"} {...register("network")} variant="filled">
      {NetworkEnum.options.map((network) => (
        <option key={network} value={network}>
          {network}
        </option>
      ))}
    </Select>
  );
}
