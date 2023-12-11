import { AutocompleteData, NS } from '@ns';
import { upgradeHashCapacity } from './helpers';

export function autocomplete(data: AutocompleteData) {
  return [...data.servers];
}

export async function main(ns: NS): Promise<void> {
  const target = ns.args[0].toString();
  const net = ns.hacknet;
  ns.disableLog('ALL');
  ns.enableLog('hacknet.spendHashes');
  ns.tail();
  const pid = ns.getRunningScript()?.pid;
  ns.writePort(1, pid ? pid : ns.getScriptName());
  ns.moveTail(250, 0);
  ns.resizeTail(515, 300);

  while (ns.getServerMinSecurityLevel(target) > 1 || ns.getServerMaxMoney(target) < 10 ** 13) {
    if (ns.getServerMinSecurityLevel(target) > 1) {
      await upgradeHashCapacity(ns, net.hashCost('Reduce Minimum Security'));
      ns.print('Reducing ' + target + ' security...');
      while (!net.spendHashes('Reduce Minimum Security', target)) {
        await ns.sleep(1000);
      }
      ns.printf('Target security reduced to %d', ns.getServerMinSecurityLevel(target));
    }
    if (ns.getServerMaxMoney(target) < 10 ** 13) {
      await upgradeHashCapacity(ns, net.hashCost('Increase Maximum Money'));
      ns.print('Increasing ' + target + ' capacity...');
      while (!net.spendHashes('Increase Maximum Money', target)) {
        await ns.sleep(1000);
      }
      ns.print('Target capacity increased to ' + ns.formatNumber(ns.getServerMaxMoney(target)));
    }
    await ns.sleep(1000);
  }
}
