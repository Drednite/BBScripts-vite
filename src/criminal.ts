import { NS } from "@ns";

/** @param {NS} ns */
export async function main(ns: NS) {
  const sin = ns.singularity;
  var focus = !sin.getOwnedAugmentations().includes("Neuroreceptor Management Implant");
  ns.tail();
  ns.atExit(() => {
    ns.closeTail();
  })
  sin.commitCrime("Mug", focus);
  while (sin.getCrimeChance("Homicide") < .6) {
    await ns.sleep(10000);
  }
  sin.commitCrime("Homicide", focus);
  // @ts-ignore: heart.break hidden function
  var karma = ns.heart.break();
  while (karma > -54000) {
    ns.setTitle(ns.sprintf("Karma: %d", karma));
    await ns.sleep(10000);
    // @ts-ignore: heart.break hidden function
    karma = ns.heart.break();
  }
  sin.commitCrime("Heist", focus);
}