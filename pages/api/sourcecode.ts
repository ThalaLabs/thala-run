import { HexString } from "aptos";
import { NextApiRequest, NextApiResponse } from "next";
import { getAptosClient } from "../../lib/utils";
import pako from "pako";

type PackageMetadata = {
  name: string;
  modules: {
    name: string;
    source: string;
  }[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<string>
) {
  const network = req.query["network"] as string;
  const account = req.query["account"] as string;
  const module_ = req.query["module"] as string;

  await getSourceCode(network, account, module_).then((code) =>
    res.status(200).send(code)
  );
}

// TODO: error handling
async function getSourceCode(
  network: string,
  account: string,
  module_: string
) {
  const codeHex = await getAptosClient(network)
    .getAccountResource(account, "0x1::code::PackageRegistry")
    .then((resource) => {
      const packages = (resource.data as any).packages as PackageMetadata[];
      const modules = packages.flatMap((p) => p.modules);
      const mod = modules.find((m) => m.name === module_)!;
      return mod.source;
    });

  const codeBytes = new HexString(codeHex).toUint8Array();
  const codeString = pako.ungzip(codeBytes, { to: "string" });
  return codeString;
}
