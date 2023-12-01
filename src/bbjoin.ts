import { NS } from '@ns';
import { getCombatStats } from './helpers';

export async function main(ns: NS): Promise<void> {
  const bb = ns.bladeburner;
  const sin = ns.singularity;
  const host = ns.getHostname();
  const focus = !sin.getOwnedAugmentations().includes('Neuroreceptor Management Implant');
  while (!bb.inBladeburner()) {
    let waitTime = 1000;
    if (getCombatStats(ns).every((value) => value < 100)) {
      if (sin.getCrimeChance('Homicide') < 0.6) {
        waitTime = sin.commitCrime('Mug', focus);
      } else {
        waitTime = sin.commitCrime('Homicide', focus);
      }
    } else {
      bb.joinBladeburnerDivision();
    }
    await ns.sleep(waitTime);
  }

  ns.print('Starting bladeburner.js...');
  while (
    ns.getServerMaxRam(host) - ns.getServerUsedRam(host) + ns.getScriptRam('bbjoin.js') <
    ns.getScriptRam('bladeburner.js')
  ) {
    await ns.sleep(1000);
  }
  sin.stopAction();
  ns.spawn('bladeburner.js', { threads: 1, spawnDelay: 10 });
}
