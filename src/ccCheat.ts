import { NS } from '@ns';
import { upgradeHashCapacity } from './helpers';

export async function main(ns: NS): Promise<void> {
  ns.tail();
  const pid = ns.getRunningScript()?.pid;
  ns.writePort(1, pid ? pid : ns.getScriptName());
  ns.resizeTail(295, 300);
  ns.moveTail(1310, 0);
  ns.disableLog('ALL');
  const delayTime = 1000;
  const ccToBuy = Number.EPSILON;
  while (!ns.scriptRunning('contractor.js', ns.getHostname())) {
    ns.run('contractor.js', 1, true);
    await ns.sleep(delayTime);
  }
  while (true) {
    if (ns.hacknet.hashCost('Generate Coding Contract') * ccToBuy > ns.hacknet.hashCapacity()) {
      await upgradeHashCapacity(ns, ns.hacknet.hashCost('Generate Coding Contract') * ccToBuy);
    }
    ns.print('Generating Coding Contract...');
    while (!ns.hacknet.spendHashes('Generate Coding Contract', undefined, ccToBuy)) {
      await ns.sleep(delayTime);
    }

    if (ns.isRunning('corp.js', 'home')) {
      ns.hacknet.spendHashes('Exchange for Corporation Research');
      ns.hacknet.spendHashes('Sell for Corporation Funds');
    }
    if (ns.bladeburner.inBladeburner()) {
      ns.hacknet.spendHashes('Exchange for Bladeburner Rank');
      ns.hacknet.spendHashes('Exchange for Bladeburner SP');
    }
    await ns.sleep(delayTime);
  }
}
