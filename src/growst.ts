import { NS } from '@ns';

/** @param {NS} ns **/
export async function main(ns: NS) {
  const waitTime = typeof ns.args[1] == 'number' ? ns.args[1] : 0;
  await ns.grow(ns.args[0].toString(), { additionalMsec: waitTime, stock: true });
}
