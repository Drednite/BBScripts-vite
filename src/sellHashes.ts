import { NS } from '@ns';

export async function main(ns: NS): Promise<void> {
  ns.disableLog('ALL');
  ns.tail();
  ns.resizeTail(200, 100);
  while (true) {
    ns.hacknet.spendHashes('Sell for Money', undefined, ns.hacknet.numHashes() / 4);
    ns.print('Selling hashes...');
    await ns.sleep(1000);
    ns.clearLog();
  }
}
