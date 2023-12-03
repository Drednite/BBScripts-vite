import { NS, SleevePerson } from '@ns';

enum taskTypes {
  BLADEBURNER = 'BLADEBURNER',
  CLASS = 'CLASS',
  CRIME = 'CRIME',
  FACTION = 'FACTION',
  INFILTRATE = 'INFILTRATE',
  RECOVERY = 'RECOVERY',
  SUPPORT = 'SUPPORT',
  SYNCHRO = 'SYNCHRO',
}

/** @param {NS} ns */
export async function main(ns: NS) {
  const sl = ns.sleeve;
  const sleeves: [SleevePerson, string][] = [];
  const numSleeves = sl.getNumSleeves();
  for (let i = 0; i < numSleeves; i++) {
    sleeves.push([sl.getSleeve(i), '']);
  }

  async function decideTask(index: number) {
    const subj = sl.getSleeve(index);
    sleeves[index][0] = subj;
    if (subj.sync < 100) {
      sleeves[index][1] = taskTypes.SYNCHRO;
    }
  }
}
