import { AutocompleteData, NS, ScriptArg } from "@ns";
import { getAllServers } from "./helpers";

/** @param {NS} ns */
export async function main(ns: NS) {
  const flags = ns.flags(argsSchema);

  let servers = await getAllServers(ns);

  if(!flags.p){
    const purchased = ns.getPurchasedServers();
    servers = servers.filter((serv) => !purchased.includes(serv));
  }
  if(!flags.h){
    servers = servers.filter((serv) => !serv.includes("hacknet-server"));
  }

  if(ns.getServerUsedRam("n00dles") == 0){
    ns.scp("share.js", "n00dles", "home");
    ns.exec("share.js", "n00dles");
  }
  servers = servers.filter((serv) => serv != "n00dles");
  servers.forEach((serv) => {
    ns.scriptKill("share.js", serv);
    if(ns.getServerUsedRam(serv) == 0){
      ns.scp("shareAll.js", serv, "home");
      ns.exec("shareAll.js", serv);
    }
  })
}

const argsSchema: [string, string | number | boolean | string[]][] = [
  ["p", false],
  ["h", false]
]

export function autocomplete(data: AutocompleteData, args: ScriptArg[]) {
  data.flags(argsSchema);
  return [];
}