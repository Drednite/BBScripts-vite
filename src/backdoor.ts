import { AutocompleteData, NS, ScriptArg } from "@ns";
import { installBackdoor } from "./helpers";

export function autocomplete(data: AutocompleteData, args: ScriptArg[]) {
  return [...data.servers]
}

export async function main(ns: NS): Promise<void> {
  await installBackdoor(ns, ns.args[0].toString());
}
