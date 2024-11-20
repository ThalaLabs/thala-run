import { NetworkType, TxFormType } from "../lib/schema";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import TxFormProvider from "../components/TxFormProvider";
import { parseArrayParam } from "../lib/utils";
import TxAdvanceForm from "../components/TxAdvanceForm";
import { FuncGroupProvider } from "../components/FuncGroupProvider";
import { GenerateLinkButton } from "../components/GenerateLinkButton";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { MSafeWallet } from "@msafe/aptos-wallet";
import { MSafeWalletName } from "@msafe/aptos-wallet-adapter";

export default function Home() {
    const router = useRouter();

    const [defaultValues, setDefaultValues] = useState<TxFormType>();

    useEffect(() => {
        if (router.isReady) {
            const defaultValues: TxFormType = {
                network: (router.query["network"] || "mainnet") as NetworkType,
                account: (router.query["account"] || "0x1") as string,
                module: (router.query["module"] || "") as string,
                func: (router.query["func"] || "") as string,
                typeArgs: parseArrayParam(router.query, "typeArgs"),
                args: parseArrayParam(router.query, "args"),
                funcComment: "",
                typeArgsComment: [],
                argsComment: [],
            };
            setDefaultValues(defaultValues);
        }
    }, [router.isReady, router.query]);

    const { connect, connected } = useWallet();

    useEffect(() => {
        if (!connected && MSafeWallet.inMSafeWallet()) {
            connect(MSafeWalletName);
        }
    }, [connected, connect]);

    if (!defaultValues) {
        return;
    }

    return (
        <TxFormProvider defaultValues={defaultValues}>
            <FuncGroupProvider>
                <GenerateLinkButton />
                <TxAdvanceForm />
            </FuncGroupProvider>
        </TxFormProvider>
    );
}
