import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { TxFormSchema, TxFormType } from "../lib/schema";

export default function TxFormProvider({
  defaultValues,
  children,
}: {
  defaultValues: TxFormType;
  children: React.ReactNode;
}) {
  const form = useForm<TxFormType>({
    mode: "all",
    resolver: zodResolver(TxFormSchema),
    defaultValues,
  });

  return <FormProvider {...form}>{children}</FormProvider>;
}
