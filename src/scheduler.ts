import { NS } from '@ns';

/** @param {NS} ns */
export async function main(ns: NS) {
  while (true) {
    ns.disableLog('ALL');
    const player = ns.getPlayer();
    if (Object.values(player.jobs).length || player.factions.length > 0) {
      ns.print('Looking for contracts for rep');
      while (!ns.run('contractor.js')) {
        ns.disableLog('sleep');
        await ns.sleep(1000);
      }
    }

    ns.print(new Date().toLocaleTimeString());
    await ns.sleep(600000);
  }
}
