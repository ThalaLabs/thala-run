import { NetworkType, TxFormType } from "../lib/schema";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import TxForm from "../components/TxForm";
import TxFormProvider from "../components/TxFormProvider";

export default function Home() {
  const router = useRouter();

  const [defaultValues, setDefaultValues] = useState<TxFormType>();

  useEffect(() => {
    // console.log("root useEffect", router.isReady)
    if (router.isReady) {
      const defaultValues = {
        network: (router.query["network"] || "mainnet") as NetworkType,
        account: (router.query["account"] || "") as string,
        module: (router.query["module"] || "") as string,
        func: (router.query["func"] || "") as string,
        typeArgs: (router.query["typeArgs"] || []) as string[],
        args: (router.query["args"] || []) as string[],
      };
      setDefaultValues(defaultValues);
    }
  }, [router.isReady]);

  if (!defaultValues) {
    return;
  }

  return (
    <TxFormProvider defaultValues={defaultValues}>
      <TxForm />
    </TxFormProvider>
  );
}
