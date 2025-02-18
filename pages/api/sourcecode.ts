import { NextApiRequest, NextApiResponse } from "next";
import { getAptosClient } from "../../lib/utils";
import { gunzipSync } from "zlib";
import { Hex } from "@aptos-labs/ts-sdk";
import { NetworkType } from "../../lib/schema";

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
  const network = req.query["network"] as NetworkType;
  const account = req.query["account"] as string;
  const module_ = req.query["module"] as string;

  await getSourceCode(network, account, module_).then((code) =>
    res.status(200).send(code)
  );
}

// TODO: error handling
async function getSourceCode(
  network: NetworkType,
  account: string,
  module_: string
) {
  const codeHex = await getAptosClient(network)
    .getAccountResource({
      accountAddress: account,
      resourceType: "0x1::code::PackageRegistry",
    })
    .then((resource) => {
      const packages = (resource.data as any).packages as PackageMetadata[];
      const modules = packages.flatMap((p) => p.modules);
      const mod = modules.find((m) => m.name === module_)!;
      return mod.source;
    });

  const codeBytes = Hex.fromHexString(codeHex).toUint8Array();
  const codeString = gunzipSync(codeBytes).toString();
  return codeString;
}
