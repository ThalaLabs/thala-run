import {
  Input,
  List,
  ListItem,
  Heading,
  Highlight,
  Box,
} from "@chakra-ui/react";
import { Types } from "aptos";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { useController } from "react-hook-form";
import { TxFormType } from "../lib/schema";
import { groupBy } from "lodash";

export function ModuleList({ modules }: { modules: Types.MoveModule[] }) {
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
      .filter((func) => func.is_entry)
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

  return (
    <>
      <Input
        type="search"
        placeholder="search..."
        onChange={(e) => setQuery(e.target.value)}
        my={2}
      />
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
                  onChangeModule(module.name);
                  onChangeFunc(func.name);
                  // reset type args and args
                  [...Array(func.generic_type_params.length)].forEach(
                    (_, i) => {
                      resetField(`typeArgs.${i}`);
                    }
                  );
                  [...Array(func.params.length)].forEach((_, i) => {
                    resetField(`args.${i}`);
                  });
                }}
              >
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
