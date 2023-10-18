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

  const [query, setQuery] = useState<string>("");

  modules.sort((a, b) => a.name.localeCompare(b.name));

  let moduleFuncs = modules.flatMap((module) =>
    module.exposed_functions
      .map((func) => {
        return { module, func };
      })
  );

  if (query.length > 0) {
    moduleFuncs = moduleFuncs.filter(({ module, func }) => {
      return (
        module.name.toLowerCase().includes(query.toLowerCase()) ||
        func.name.toLowerCase().includes(query.toLowerCase())
      );
    });
  }

  const group = groupBy(moduleFuncs, (moduleFunc) => moduleFunc.module.name);

  const context = useContext(FuncGroupContext);

  return (
    <>
      <HStack mb={2}>
        <BiFilterAlt />
        <Select placeholder='All'>
          <option value='view'>View</option>
          <option value='entry'>Entry</option>
        </Select>
      </HStack>

      <HStack>
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
            {moduleFuncs.map(({ module, func }) => (
              <ListItem
                key={func.name}
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
                <Highlight query={[query]} styles={{ bg: "yellow.300" }}>
                  {`${func.is_entry ? "[W]" : "[R]"} ${func.name}`}
                </Highlight>
              </ListItem>
            ))}
          </Box>
        ))}
      </List>
    </>
  );
}
