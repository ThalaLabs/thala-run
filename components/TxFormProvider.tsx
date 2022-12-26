import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";
import { useEffect } from "react";
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
  const { watch } = form;

  const router = useRouter();

  useEffect(() => {
    const subscription = watch(async (value) => {
      await router.push(
        {
          pathname: "/",
          query: value as TxFormType,
        },
        undefined,
        { shallow: true }
      );
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  return <FormProvider {...form}>{children}</FormProvider>;
}
