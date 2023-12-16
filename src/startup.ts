import { NS } from '@ns';

/** @param {NS} ns */
export async function main(ns: NS) {
  const mults = ns.getBitNodeMultipliers();
  ns.tprint(ns.read('notes.txt'));
  // eslint-disable-next-line prettier/prettier
  const startList: (string | (string | number)[])[] = [
    ['crawler.js', '--daemon', '--share', '-o']
  ];
  const augments = ns.singularity.getOwnedAugmentations();
  const worker = ['worker.js'];
  const sleeve: (string | number)[] = ['dev/sleeve.js'];
  const whip = ['whip.js'];
  if (mults.ScriptHackMoneyGain > 0 && Date.now() - ns.getResetInfo().lastAugReset < 1.8e6) {
    startList.push(whip);
  } else if (mults.ScriptHackMoney > 0) {
    whip.push('-k');
    if (ns.getServerMaxRam('home') < 1024) {
      whip.push('-h');
    }
    startList.push(whip);
    if (ns.stock.hasWSEAccount() && ns.stock.hasTIXAPIAccess()) {
      startList.push('stonks.js');
      startList.push('stockReporter.js');
      worker.push('-s');
      if (mults.CompanyWorkMoney == 0 && mults.ScriptHackMoneyGain == 0 && mults.BladeburnerRank == 0) {
        worker.push('--stockEx');
      }
    }
  } else if (ns.stock.hasWSEAccount() && ns.stock.hasTIXAPIAccess()) {
    startList.push('stonks.js');
    startList.push('stockReporter.js');
    worker.push('-s');
    if (mults.CompanyWorkMoney == 0 && mults.ScriptHackMoneyGain == 0 && mults.BladeburnerRank == 0) {
      worker.push('--stockEx');
    }
  }
  if (augments.includes('nickofolas Congruity Implant')) {
    worker.push('--graft');
  }
  if (mults.GangSoftcap > 0) {
    worker.push('-g');
  } else {
    sleeve.push('--disable-gang-homicide-priority');
  }
  if (mults.CompanyWorkMoney > 0) {
    worker.push('-e');
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

  if (mults.CrimeMoney == 0) {
    sleeve.push('--aug-budget', 0.01);
  }
  if (mults.HacknetNodeMoney > 0) {
    let hacknet: string | string[] = ['hacknet.js'];
    if (mults.CodingContractMoney > 0) {
      if (Date.now() - ns.getResetInfo().lastAugReset > 1.8e6 && ns.hacknet.numNodes() > 0) {
        hacknet = 'ccCheat.js';
      } else {
        hacknet.push('--ccCheat');
      }
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
      ns.run(script.toString(), 1, ...args);
    }
  });
}
