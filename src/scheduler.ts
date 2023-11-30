import { NS } from "@ns";

/** @param {NS} ns */
export async function main(ns: NS) {
  while (true) {
      ns.disableLog("ALL");
      while (!ns.run("contractor.js")) {
          ns.disableLog("sleep");
          await ns.sleep(10000);
      }
      ns.enableLog("sleep");
      await ns.sleep(600000);
  }
}