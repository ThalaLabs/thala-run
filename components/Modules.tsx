import {
  Input,
  List,
  ListItem,
  Heading,
  Highlight,
  Box,
  HStack,
  Select,
} from "@chakra-ui/react";
import { Types } from "aptos";
import { useContext, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useController } from "react-hook-form";
import { NetworkType, TxFormType } from "../lib/schema";
import { groupBy } from "lodash";
import { FuncGroupContext } from "./FuncGroupProvider";
import { v4 as uuid } from 'uuid';
import { SearchIcon } from "@chakra-ui/icons";
import { BiFilterAlt } from "react-icons/bi";

export function Modules({ modules, account, network }: {
  modules: Types.MoveModule[],
  account: string,
  network: NetworkType,
}) {
  const { control, resetField } = useFormContext<TxFormType>();
  const {
    field: { value: formFunc, onChange: onChangeFunc },
  } = useController({
    name: "func",
    control,
  });
  const {
    field: { value: formModule, onChange: onChangeModule },
  } = useController({
    name: "module",
    control,
  });

  const [filter, setFilter] = useState<string>("all");
  const [query, setQuery] = useState<string>("");

  modules.sort((a, b) => a.name.localeCompare(b.name));

  let moduleFuncs = modules.flatMap((module) =>
    module.exposed_functions
      .map((func) => {
        return { module, func };
      })
  );

  moduleFuncs = moduleFuncs
    .filter(({ func }) => {
      if (filter === "view") {
        return func.is_view;
      }
      else if (filter === "entry") {
        return func.is_entry;
      }
      return func.is_view || func.is_entry;
    })
    .filter(({ module, func }) => {
      return (
        module.name.toLowerCase().includes(query.toLowerCase()) ||
        func.name.toLowerCase().includes(query.toLowerCase())
      );
    });

  const group = groupBy(moduleFuncs, (moduleFunc) => moduleFunc.module.name);

  const context = useContext(FuncGroupContext);

  return (
    <>
      <HStack mb={2}>
        <BiFilterAlt />
        <Select placeholder='All' value={filter} onChange={(e) => { setFilter(e.target.value) }}>
          <option value='view'>View</option>
          <option value='entry'>Entry</option>
        </Select>
      </HStack>

      <HStack mb={2}>
        <SearchIcon />
        <Input
          type="search"
          placeholder="search..."
          onChange={(e) => setQuery(e.target.value)}
          my={2}
        />
      </HStack>

      <List overflow={"auto"} cursor="pointer" maxHeight="calc(100vh - 200px)">
        {Object.entries(group).map(([moduleName, moduleFuncs]) => (
          <Box key={moduleName}>
            <Heading size="sm" my={3}>
              <Highlight query={[query]} styles={{ bg: "yellow.300" }}>
                {moduleName}
              </Highlight>
            </Heading>
            {moduleFuncs.sort((a, b) => Number(a.func.is_entry) - Number(b.func.is_entry)).map(({ module, func }) => (
              <ListItem
                key={func.name}
                whiteSpace="nowrap"
                _hover={{ bgColor: "gray.100" }}
                bgColor={
                  formFunc === func.name && formModule === module.name
                    ? "gray.100"
                    : undefined
                }
                onClick={() => {
                  // advance mode
                  if (context) {
                    context.setFuncGroup([
                      ...context.funcGroup,
                      {
                        id: uuid(),
                        account: account,
                        network: network,
                        module: module.name,
                        func: func.name,
                        typeArgs: [],
                        args: [],
                      },
                    ]);
                    context.scrollToTop();
                  }
                  else {
                    onChangeModule(module.name);
                    onChangeFunc(func.name);
                    resetField("typeArgs", { defaultValue: [] });
                    resetField("args", { defaultValue: [] });
                  }
                }}
              >
                <Box
                  width={2}
                  height={2}
                  mr={2}
                  backgroundColor={func.is_entry ? "green.200" : "blue.200"}
                  display={"inline-block"}
                  rounded="full" />
                <Highlight query={[query]} styles={{ bg: "yellow.300" }}>
                  {func.name}
                </Highlight>
              </ListItem>
            ))}
          </Box>
        ))}
      </List>
    </>
  );
}
