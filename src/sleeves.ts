import { CrimeStats, NS, SleevePerson } from '@ns';

/** @param {NS} ns */
export async function main(ns: NS) {
  ns.tail();
  ns.disableLog('ALL');
  ns.clearLog();
  const sl = ns.sleeve;
  const bb = ns.bladeburner;
  const sin = ns.singularity;
  const crimes = ns.enums.CrimeType;
  const numSleeves = sl.getNumSleeves();
  ns.resizeTail(315, 45 + 95 * numSleeves);
  const waitTime = 1000;
  const horBar = "##%'=30s";
  // const maxBBSleeves = 2;
  // const minAssCount = 20;

  function successRate(sleeve: SleevePerson, crime: CrimeStats) {
    let chance =
      crime.hacking_success_weight * sleeve.skills.hacking +
      crime.strength_success_weight * sleeve.skills.strength +
      crime.defense_success_weight * sleeve.skills.defense +
      crime.dexterity_success_weight * sleeve.skills.dexterity +
      crime.agility_success_weight * sleeve.skills.agility +
      crime.charisma_success_weight * sleeve.skills.charisma +
      0.025 * sleeve.skills.intelligence;
    chance /= 975;
    chance /= crime.difficulty;
    chance *= sleeve.mults.crime_success;
    chance *= 1 + Math.pow(sleeve.skills.intelligence, 0.8) / 600;

    return Math.min(chance, 1);
  }

  const homicide: CrimeStats = sin.getCrimeStats(crimes.homicide);
  for (let i = 0; i < numSleeves; i++) {
    sl.setToIdle(i);
  }

  while (true) {
    // let bbSleeves = 0;
    let lowestShock = 100;
    for (let i = 0; i < numSleeves; i++) {
      const sleeve = sl.getSleeve(i);
      if (sleeve.shock < lowestShock) {
        lowestShock = sleeve.shock;
      }
    }
    for (let i = 0; i < numSleeves; i++) {
      const sleeve = sl.getSleeve(i);
      let currTask = sl.getTask(i);
      if (sleeve.shock > lowestShock) {
        if (currTask?.type != 'RECOVERY') {
          sl.setToShockRecovery(i);
          ns.print('Set sleeve ' + i + ' to Recovery');
        } else {
          ns.printf(horBar, '');
        }
      } else if (sleeve.sync < 100) {
        if (currTask?.type != 'SYNCHRO') {
          ns.print('Set Sleeve ' + i + ' to Synchronize');
          sl.setToSynchronize(i);
        } else {
          ns.printf(horBar, '');
        }
      } else if (bb.inBladeburner()) {
        ns.print('todo: BB Actions');
        // if (bbSleeves < maxBBSleeves && bb.getActionCountRemaining('Operation', 'Assassination') < minAssCount) {
        //   if (currTask?.type == 'BLADEBURNER') {
        //     bbSleeves++;
        //   } else {
        //     const newTask = sl.setToBladeburnerAction(i, '');
        //   }
        // }
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore: heart.break hidden function
      } else if (ns.heart.break() > -54000) {
        if (currTask?.type == 'CRIME') {
          if (successRate(sleeve, homicide) >= 0.6) {
            // If they should be doing homicide
            if (currTask.crimeType == crimes.homicide) {
              // and they already are, continue
              ns.printf(horBar, '');
              continue;
            } else {
              // and they aren't, start
              sl.setToCommitCrime(i, crimes.homicide);
              ns.print('Set Sleeve ' + i + ' to homicide');
            }
          } else {
            ns.printf(horBar, '');
          }
        } else {
          sl.setToCommitCrime(i, crimes.mug);
          ns.print('Set Sleeve ' + i + ' to mug');
        }
      } else {
        if (currTask != null) {
          ns.print('Set Sleeve ' + i + ' to Idle');
          sl.setToIdle(i);
        } else {
          ns.printf(horBar, '');
        }
      }
      currTask = sl.getTask(i);
      ns.printf('|| Sleeve: %2d | Task: %s', i, currTask == null ? 'Idle' : currTask?.type);
      if (currTask?.type == 'CRIME') {
        ns.printf(
          '|| %10s | Chance: %3.2g%%',
          currTask.crimeType,
          ns.formulas.work.crimeSuccessChance(sleeve, currTask.crimeType) * 100,
        );
      } else {
        ns.printf('|| Shock: %3d | Sync: %3d', sleeve.shock, sleeve.sync);
      }
      ns.printf(horBar, '');
    }
    await ns.sleep(waitTime);
    ns.clearLog();
  }
}
