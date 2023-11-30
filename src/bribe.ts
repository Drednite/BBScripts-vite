import { AutocompleteData, NS, ScriptArg } from "@ns";
import { factions } from "./helpers";

export function autocomplete(data: AutocompleteData, args: ScriptArg[]) {
  return [...factions.keys()];
}

export async function main(ns: NS): Promise<void> {
  const faction = factions.get(ns.args[0].toString());
  let target = ns.args[1];
  if(typeof faction != "string"){
    ns.tprint("Invalid faction name.");
    ns.exit();
  }
  if(typeof target != "number"){
    target = target.toString();
    target = target.replace("k", "*10**3");
    target = target.replace("m", "*10**6");
    target = target.replace("b", "*10**9");
    target = target.replace("t", "*10**12");
    target = parseInt(eval(target), 10);
  }

  // ns.tprint(target);
  target -= ns.singularity.getFactionRep(faction);
  const cost = target*1000000000;
  ns.corporation.bribe(faction, cost);
}
