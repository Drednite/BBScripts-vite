import { AutocompleteData, NS } from '@ns';
import { upgradeHashCapacity } from './helpers';

export function autocomplete(data: AutocompleteData) {
  return [...data.servers];
}

export async function main(ns: NS): Promise<void> {
  const target = ns.args[0].toString();
  const net = ns.hacknet;

  while (true) {
    if (
      ns.getServerMinSecurityLevel(target) > 1 &&
      net.hashCost('Reduce Minimum Security') < net.hashCost('Increase Maximum Money')
    ) {
      await upgradeHashCapacity(ns, net.hashCost('Reduce Minimum Security'));
      while (!net.spendHashes('Reduce Minimum Security', target)) {
        await ns.sleep(1000);
      }
    } else if (ns.getServerMaxMoney(target) < 10 ** 13) {
      await upgradeHashCapacity(ns, net.hashCost('Increase Maximum Money'));
      while (!net.spendHashes('Increase Maximum Money', target)) {
        await ns.sleep(1000);
      }
    }
  }
}
