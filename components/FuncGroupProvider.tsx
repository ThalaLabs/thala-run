import { useRouter } from "next/router";
import { createContext, useEffect, useState } from "react";
import { TxFormType } from "../lib/schema";

export type FuncGroupItem = {
    id: string;
} & TxFormType;

export const FuncGroupContext = createContext<{
    funcGroup: FuncGroupItem[],
    setFuncGroup: (funcGroup: FuncGroupItem[]) => void
} | undefined>({
    funcGroup: [],
    setFuncGroup: () => { }
});

export const FuncGroupProvider = ({ children }: {
    children: React.ReactNode
}) => {
    const [funcGroup, setFuncGroup] = useState<FuncGroupItem[]>([]);
    const id = useRouter().query["id"] as string;

    // sync data from url
    useEffect(() => {
        if (!id) return;
        
        const func = async () => {
            const res = await fetch("/api/get-link?id=" + id);    
            setFuncGroup(await res.json());
        }

        func();
    }, []);

    return <FuncGroupContext.Provider value={{
        funcGroup,
        setFuncGroup
    }}>
        {children}
    </FuncGroupContext.Provider>
}