import { NS } from '@ns';

/** @param {NS} ns */
export async function main(ns: NS) {
  const sin = ns.singularity;
  const focus = !sin.getOwnedAugmentations().includes('Neuroreceptor Management Implant');
  ns.tail();
  const pid = ns.getRunningScript()?.pid;
  ns.writePort(1, pid ? pid : ns.getScriptName());
  sin.commitCrime('Mug', focus);
  while (sin.getCrimeChance('Homicide') < 0.6) {
    await ns.sleep(10000);
  }
  sin.commitCrime('Homicide', focus);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore: heart.break hidden function
  let karma = ns.heart.break();
  while (karma > -54000) {
    ns.setTitle(ns.sprintf('Karma: %d', karma));
    await ns.sleep(10000);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore: heart.break hidden function
    karma = ns.heart.break();
  }
  sin.commitCrime('Heist', focus);
}
