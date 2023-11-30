import { NS } from "@ns";

/** @param {NS} ns **/
export async function main(ns: NS) {
  // await ns.sleep(ns.args[1]);
  const waitTime = (typeof ns.args[1] == "number")? ns.args[1]: 0;
  await ns.hack(ns.args[0].toString(), {additionalMsec: waitTime});
}