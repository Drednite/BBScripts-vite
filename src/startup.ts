import { NS } from '@ns';

/** @param {NS} ns */
export async function main(ns: NS) {
  const mults = ns.getBitNodeMultipliers();
  ns.tprint(ns.read('notes.txt'));
  // eslint-disable-next-line prettier/prettier
  const startList: (string | string[])[] = [
    ['crawler.js', '--daemon', '--share', '-o']
  ];
  if (mults.ScriptHackMoneyGain > 0 && Date.now() - ns.getResetInfo().lastAugReset < 1.8e6) {
    startList.push('whip.js');
  }
  const augments = ns.singularity.getOwnedAugmentations();
  const worker = ['worker.js', '--graft'];
  const sleeve = ['dev/sleeve.js'];
  if (mults.GangSoftcap > 0) {
    worker.push('-g');
  } else {
    sleeve.push('--disable-gang-homicide-priority');
  }
  if (mults.CompanyWorkMoney > 0) {
    worker.push('-e');
  }
  if (ns.stock.hasWSEAccount()) {
    startList.push('dev/stonks.js');
    startList.push('stockReporter.js');
    worker.push('-s');
  }
  if (mults.BladeburnerRank > 0) {
    if (ns.bladeburner.inBladeburner()) {
      startList.push('bladeburner.js');
      if (augments.includes("The Blade's Simulacrum")) {
        startList.push(worker);
      }
    } else {
      worker.push('-b');
      startList.push(worker);
    }
  } else {
    sleeve.push('--disable-bladeburner');
    startList.push(worker);
  }

  if (mults.HacknetNodeMoney > 0) {
    let hacknet: string | string[] = ['hacknet.js', '--ccCheat'];
    if (Date.now() - ns.getResetInfo().lastAugReset > 1.8e6 && ns.hacknet.numNodes() > 0) {
      hacknet = 'ccCheat.js';
    }
    startList.push(hacknet);
  } else {
    startList.push('scheduler.js');
  }

  if (mults.CorporationDivisions > 0) {
    startList.push('corp.js');
  }

  if (ns.gang.inGang()) {
    startList.push('Shogal.js');
  }

  if (ns.sleeve.getNumSleeves() > 0) {
    startList.push(sleeve);
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
