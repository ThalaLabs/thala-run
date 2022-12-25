import { List } from "@chakra-ui/react";
import { Types } from "aptos";
import { Module } from "./Module";

export function ModuleList({
  network,
  modules,
}: {
  network: string;
  modules: Types.MoveModuleBytecode[];
}) {
  modules.sort((a, b) => a.abi!.name.localeCompare(b.abi!.name));
  return (
    <List spacing="5">
      {modules.map((module) => (
        <Module key={module.abi!.name} network={network} module={module} />
      ))}
    </List>
  );
}
