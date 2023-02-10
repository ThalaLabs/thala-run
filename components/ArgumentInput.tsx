import { CloseIcon } from "@chakra-ui/icons";
import { Box, Button, IconButton, Input, Textarea } from "@chakra-ui/react";
import { ChangeEvent, useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { TxFormType } from "../lib/schema";

interface IArgumentInputProps {
  arg: string;
  index: number;
}

export default function ArgumentInput({ arg, index }: IArgumentInputProps) {
  const { register, getValues, setValue } = useFormContext<TxFormType>();
  const value = getValues().args[index];
  const [items, setItems] = useState<Array<string>>(value?.split(",") || []);
  const [newItem, setNewItem] = useState("");

  useEffect(() => {
    const args = getValues().args;
    let newArgs = args.map((argument, idx) => {
      if (index === idx) {
        return items.join(",");
      }
      return argument;
    });
    if (args.length < index + 1) {
      newArgs = new Array(index + 1).fill(0).map((item, i) => {
        if (i < args.length) {
          return args[i];
        }
        if (i === index) {
          return items.join(",");
        }
        return "";
      });
    }
    setValue("args", newArgs);
  }, [items, index]);

  const handleChangeNewItem = (e: ChangeEvent<HTMLInputElement>) => {
    setNewItem(e.target.value);
  };

  const handleChangeItem = (e: ChangeEvent<HTMLInputElement>, i: number) => {
    setItems(
      items.map((item, idx) => {
        if (idx === i) {
          return e.target.value;
        }
        return item;
      })
    );
  };

  const handleAddItem = () => {
    setItems([...items, newItem]);
    setNewItem("");
  };

  const handleRemoveItem = (i: number) => {
    setItems(items.filter((item, idx) => idx !== i));
  };

  if (arg === "address") {
    return <Textarea {...register(`args.${index}`)} />;
  }
  if (arg.includes("vector")) {
    return (
      <Box>
        {items.map((item: string, i: number) => (
          <Box key={`item-${i}`} display={"flex"} alignItems={"center"} mb={2}>
            <Input
              key={`item-${i}`}
              value={item}
              mr={2}
              onChange={(e) => handleChangeItem(e, i)}
            />
            <IconButton
              aria-label="remove-argument"
              size="xs"
              icon={<CloseIcon />}
              variant={"outline"}
              onClick={() => handleRemoveItem(i)}
            />
          </Box>
        ))}
        <Box display={"flex"}>
          <Input value={newItem} onChange={handleChangeNewItem} />
          <Button ml={2} onClick={handleAddItem}>
            Add
          </Button>
        </Box>
      </Box>
    );
  }
  return <Input {...register(`args.${index}`)} />;
}
