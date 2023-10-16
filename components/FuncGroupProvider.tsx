import { useRouter } from "next/router";
import { createContext, useEffect, useState } from "react";
import { TxFormType } from "../lib/schema";

export type FuncGroupItem = {
    id: string;
} & TxFormType;

export const FuncGroupContext = createContext<{
    funcGroup: FuncGroupItem[],
    setFuncGroup: (funcGroup: FuncGroupItem[]) => void,
    scrollToTop: () => void,
    setScrollToTop: (func: () => void) => void,
} | undefined>({
    funcGroup: [],
    setFuncGroup: () => { },
    scrollToTop: () => { },
    setScrollToTop: () => { },
});

export const FuncGroupProvider = ({ children }: {
    children: React.ReactNode
}) => {
    const [funcGroup, setFuncGroup] = useState<FuncGroupItem[]>([]);
    const [scrollToTop, setScrollToTop] = useState(() => () => { });
    const id = useRouter().query["id"] as string;

    // sync data from url
    useEffect(() => {
        if (!id) return;

        const func = async () => {
            const res = await fetch("/api/get-link?id=" + id);
            setFuncGroup(await res.json());
        }

        func();
    }, [id]);

    return <FuncGroupContext.Provider value={{
        funcGroup,
        setFuncGroup,
        scrollToTop,
        setScrollToTop
    }}>
        {children}
    </FuncGroupContext.Provider>
}