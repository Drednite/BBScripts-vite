import { NS } from '@ns';

/** @param {NS} ns */
export async function main(ns: NS) {
  // eslint-disable-next-line prettier/prettier
  const startList: (string | string[])[] = [
    ['crawler.js', '--daemon', '--share', '-o']
  ];
  if (Date.now() - ns.getResetInfo().lastAugReset < 1.8e6) {
    startList.push('whip.js');
  }
  const augments = ns.singularity.getOwnedAugmentations();
  if (ns.bladeburner.inBladeburner()) {
    startList.push('bladeburner.js');
    if (augments.includes("The Blade's Simulacrum")) {
      startList.push(['worker.js', '-g']);
    }
  } else {
    startList.push(['worker.js', '-g', '-b']);
  }

  if (ns.hacknet.maxNumNodes() > 0) {
    let hacknet: string | string[] = ['hacknet.js', '--ccCheat'];
    if (Date.now() - ns.getResetInfo().lastAugReset > 1.8e6 && ns.hacknet.numNodes() > 0) {
      hacknet = 'ccCheat.js';
    }
    startList.push(hacknet);
  } else {
    startList.push('scheduler.js');
  }

  if (ns.corporation.hasCorporation()) {
    startList.push('corp.js');
  }

  if (ns.gang.inGang()) {
    startList.push('Shogal.js');
  }

  if (ns.stock.hasTIXAPIAccess() && ns.stock.has4SDataTIXAPI()) {
    startList.push('stockTrader5.js');
  }

  if (ns.sleeve.getNumSleeves() > 0) {
    startList.push('sleeves.js');
  }

  startList.forEach((call) => {
    if (typeof call == 'string') {
      ns.run(call);
    } else {
      const script = call[0];
      const args = call.slice(1);
      ns.run(script, 1, ...args);
    }
  });
}
