import { AutocompleteData, NS, ScriptArg } from "@ns";
import { getAllServers } from "./helpers"

const argsSchema: [string, string | number | boolean | string[]][] = [
  ['help', false],
  ['target', "null"],
  ['hacker', 'masterHack.js'],
  ['home', false],
  ['owned', false]
];
const hackScripts = [
  "masterHack.js",
  "hackStarter.js"
];
export function autocomplete(data: AutocompleteData, args: ScriptArg[]) {
  data.flags(argsSchema);
  const lastFlag = args.length > 1 ? args[args.length - 2].toString() : "";
  if (["--target"].includes(lastFlag))
  return data.servers;
  if (["--hacker"].includes(lastFlag))
  return hackScripts;
  return [];
}
/** @param {NS} ns */
export async function main(ns: NS) {
  const flags = ns.flags(argsSchema);
  if (flags.help) {
    let message = "INFO: starts masterHacks to utilize the RAM of all empty servers to attack one target\n"
    + "run " + ns.getScriptName() + " {--target server} {--hacker script} {--home} {--help} \n"
    + "--target: server to attack -- defaults to server with highest max money whose hacking level is less than half of player's current \n"
    + "--hacker: script to use -- defaults to masterHack.js \n"
    + "--home: include home on list of servers to hack from \n"
    + "--owned: include owned servers on list of servers to hack from \n"
    + "--help: prints this message";
    ns.tprint(message);
    ns.exit();
  }
  var serverList = await getAllServers(ns);
  var hacker = flags.hacker.toString();
  var hackerRam = ns.getScriptRam(hacker, "home");
  var target = flags.target.toString();
  const owned = flags.owned;
  if (target === "null") {
    let maxMoney = 0;
    serverList.forEach((serv) => {
      let money = ns.getServerMaxMoney(serv);
      if (ns.hasRootAccess(serv)) {
        if (money > maxMoney && ns.getServerRequiredHackingLevel(serv) < Math.max(ns.getHackingLevel()/4, 1)) {
          target = serv;
          maxMoney = money;
        }
      }
    });
  }
  if (target === "null") {
    target = "foodnstuff";
  }
  
  if(!owned){
    serverList = serverList.filter((server) => {
      return !ns.getPurchasedServers().includes(server);
    })
  }

  serverList = serverList.filter((server, index, array) => { return ns.hasRootAccess(server) && server != "home" && ns.getServerMaxRam(server) >= hackerRam; });
  serverList.sort((a, b) => { return ns.getServerMaxRam(b) - ns.getServerMaxRam(a); });
  //between this filter an the next, this should prevent double-booking
  serverList = serverList.filter((server) => { return ns.getServerUsedRam(server) == 0; });
  await ns.sleep(1000);
  // var numHackers = Math.min(Math.floor((ns.getServerMaxRam("home") - ns.getServerUsedRam("home")) / hackerRam), serverList.length);
  var i = 0;
  while ((ns.getServerMaxRam("home") - ns.getServerUsedRam("home")) > hackerRam && i < serverList.length) {
    ns.run(hacker, 1, target, serverList[i++]);
    await ns.sleep(500);
  }
  
  if (flags.home && (ns.getServerMaxRam("home") - ns.getServerUsedRam("home")) > hackerRam + 20) {
    ns.run(hacker, 1, target, "home");
  }
}