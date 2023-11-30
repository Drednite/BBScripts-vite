import { AutocompleteData, NS, ScriptArg } from "@ns";
import { getAllServers } from "./helpers";

/** @param {NS} ns */
export async function main(ns: NS) {
  var serverList: string[] = await getAllServers(ns);
  for (let i = 0; i < ns.args.length; i++){
    serverList = serverList.filter((server) => !server.includes(ns.args[i].toString()));
  }
  serverList.forEach((server) => { 
    ns.killall(server, true); 
  });
}

export function autocomplete(data: AutocompleteData, args: ScriptArg) {
  return [...data.servers];
}