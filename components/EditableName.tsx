import { Text, Button, HStack, Input, InputProps, TextProps } from "@chakra-ui/react";
import { FieldName, FieldPath, useFormContext } from "react-hook-form";
import { TxFormType } from "../lib/schema";
import { FaEdit } from "react-icons/fa";
import { useState } from "react";
import { TiTick } from "react-icons/ti";

type Props = {
    fieldPath: FieldPath<TxFormType>
} & TextProps;

export const EditableName = ({ fieldPath, ...props }: Props) => {
    const { register, watch } = useFormContext<TxFormType>();
    const [editing, setEditing] = useState(false);
    const value = watch(fieldPath);
    return <HStack gap={1}>
        {
            editing ?
                <>
                    <Input
                        type="string"
                        size="sm"
                        width="fit-content"
                        minWidth="24"
                        placeholder="name"
                        {...register(fieldPath)} />
                    <Button size="xs" variant="ghost" onClick={() => setEditing(false)}>
                        <TiTick />
                    </Button>
                </>
                :
                <>
                    {!!value && <Text fontSize={"sm"} {...props}>{value}</Text>}
                    <Button size="xs" variant="ghost" onClick={() => setEditing(true)}>
                        <FaEdit />
                    </Button>
                </>

        }
    </HStack>
}