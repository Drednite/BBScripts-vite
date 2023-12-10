import { NS } from '@ns';
import { getCombatStats, CityName, colorPicker, Color } from './helpers';

export async function main(ns: NS): Promise<void> {
  const bb = ns.bladeburner;
  const sin = ns.singularity;
  const popThreshold = 1e9;
  const chaosThreshold = 50;
  let simulacrum = sin.getOwnedAugmentations().includes("The Blade's Simulacrum");
  let currentBO = 0;

  ns.disableLog('ALL');
  ns.tail();
  ns.resizeTail(385, 340);
  ns.moveTail(765, 35);

  const contracts = ['Retirement', 'Bounty Hunter', 'Tracking'];

  const operations = [
    'Assassination',
    'Stealth Retirement Operation',
    'Raid',
    'Sting Operation',
    // "Undercover Operation",
    // "Investigation",
  ];

  const blackOps = bb.getBlackOpNames().sort((a, b) => bb.getBlackOpRank(a) - bb.getBlackOpRank(b));
  blackOps.push('Destroy_World_Demon');

  // const shortNames = new Map([
  //   ['Retirement', 'Reti'],
  //   ['Bounty Hunter', 'BoHu'],
  //   ['Tracking', 'Trac'],
  //   ['Investigation', 'Inve'],
  //   ['Sting Operation', 'StOp'],
  //   ['Raid', 'Raid'],
  //   ['Stealth Retirement Operation', 'SROp'],
  //   ['Assassination', 'Assa'],
  //   ['Undercover Operation', 'UnOp'],
  // ]);

  const cities = [
    CityName.Aevum,
    CityName.Chongqing,
    CityName.Ishima,
    CityName.NewTokyo,
    CityName.Sector12,
    CityName.Volhaven,
  ];

  if (!simulacrum) {
    sin.stopAction();
  }

  if (!ns.getPlayer().factions.includes('Bladeburners')) {
    bb.joinBladeburnerFaction();
  }

  /**
   *
   * @returns [city, name, lowChance, highChance] the best Contract available including its location and estimated chance
   */
  function bestContract(): [CityName, string, number, number] {
    let best: [CityName, string, number, number] = [bb.getCity(), '', 0, 0];
    for (const act of contracts) {
      if (bb.getActionCountRemaining('contract', act) < 1) {
        continue;
      }
      for (const city of cities) {
        bb.switchCity(city);
        const chance = bb.getActionEstimatedSuccessChance('contract', act);

        if (chance[1] >= best[3]) {
          if (chance[1] == best[3] && chance[0] <= best[2]) {
            continue;
          }
          best = [city, act, chance[0], chance[1]];
        }
      }
      if (best[3] == 1) {
        return best;
      }
    }
    return best;
  }

  /**
   *
   * @returns [city, name, lowChance, highChance] the best Operation available including its location and estimated chance
   */
  function bestOperation(): [CityName, string, number, number] {
    let best: [CityName, string, number, number] = [bb.getCity(), 'Incite Violence', 0, 0];
    for (const act of operations) {
      if (bb.getActionCountRemaining('operation', act) < 1) {
        continue;
      }

      for (const city of cities) {
        bb.switchCity(city);
        if (act == 'Stealth Retirement Operation' && bb.getCityChaos(city) < chaosThreshold) {
          continue;
        }
        const chance = bb.getActionEstimatedSuccessChance('operation', act);

        if (chance[1] >= best[3]) {
          if (chance[1] == best[3] && chance[0] <= best[2]) {
            continue;
          }
          best = [city, act, chance[0], chance[1]];
        }
      }
      if (best[3] == 1) {
        // ns.print(...best);
        return best;
      }
    }
    // ns.print(...best);
    return best;
  }

  /**
   *
   * @returns [city, name, lowChance, highChance] the best BlackOp available including its location and estimated chance
   */
  function bestBlackOp(): [CityName, string, number, number] {
    while (currentBO < blackOps.length && bb.getActionCountRemaining('blackop', blackOps[currentBO]) == 0) {
      currentBO++;
    }
    if (currentBO == blackOps.length - 1) {
      const message = colorPicker('Last Black Operation complete!', Color.green);
      ns.printf('| %42s |', message);
      ns.tprint(message);
      currentBO++;
      return [bb.getCity(), 'Destroy_World_Demon', 0, 0];
    } else if (currentBO > blackOps.length - 1) {
      return [bb.getCity(), 'Destroy_World_Demon', 0, 0];
    }
    const opName = blackOps[currentBO];
    let best: [CityName, string, number, number] = [bb.getCity(), opName, 0, 0];
    for (const city of cities) {
      bb.switchCity(city);
      const chance = bb.getActionEstimatedSuccessChance('blackop', opName);
      // ns.printf("%s: %d/%d", city, chance[0]*100, chance[1]*100); // debug
      if (chance[1] >= best[3]) {
        if (chance[1] == best[3] && chance[0] <= best[2]) {
          continue;
        }
        // ns.print(city + " is best") // debug
        best = [city, opName, chance[0], chance[1]];
      }
    }
    cities.sort((a, b) => {
      if (best[0] == a) return -1;
      else if (best[0] == b) return 1;
      else return 0;
    });
    return best;
  }

  /**
   *
   * @returns [type, action] the best analysis action for the current city
   */
  function bestAnalysis(): [string, string] {
    const [current, max] = bb.getStamina();
    if (current * 2 < max) {
      // are you just tired?
      return ['general', 'Training'];
    }
    if (
      bb.getActionEstimatedSuccessChance('operation', 'Undercover Operation')[0] > 0.99 &&
      bb.getActionCountRemaining('operation', 'Undercover Operation') > 0
    ) {
      return ['operation', 'Undercover Operation'];
    } else if (
      bb.getActionEstimatedSuccessChance('operation', 'Investigation')[0] > 0.99 &&
      bb.getActionCountRemaining('operation', 'Investigation') > 0
    ) {
      return ['operation', 'Investigation'];
    } else if (
      bb.getActionEstimatedSuccessChance('contract', 'Tracking')[0] > 0.99 &&
      bb.getActionCountRemaining('contract', 'Tracking') > 0
    ) {
      return ['contract', 'Tracking'];
    } else {
      return ['general', 'Field Analysis'];
    }
  }

  /**
   *
   * @returns [type, action] best chaos reducting action available for current city
   */
  function diplomacy(): [string, string] {
    const city = bb.getCity();
    if (
      bb.getActionEstimatedSuccessChance('operation', 'Assassination')[0] > 0.99 &&
      bb.getActionCountRemaining('operation', 'Assassination') > 0
    ) {
      return ['operation', 'Assassination'];
    } else if (
      bb.getActionCountRemaining('operation', 'Stealth Retirement Operation') > 0 &&
      bb.getCityEstimatedPopulation(city) > popThreshold &&
      bb.getActionEstimatedSuccessChance('operation', 'Stealth Retirement Operation')[0] > 0.99
    ) {
      return ['operation', 'Stealth Retirement Operation'];
    } else {
      return ['general', 'Diplomacy'];
    }
  }

  /**
   *
   * @param time
   * @returns
   */
  // function adjTime(time: number){
  //   const bonusTime = bb.getBonusTime()
  //   if(overflow > 0 && time - overflow >= 1000){
  //     time -= overflow;
  //     overflow = 0;
  //   }
  //   else if(overflow > 0){
  //     overflow -= time;
  //     time = 1000;
  //   }

  //   if(bonusTime > time){
  //     overflow += Math.ceil(time/5000)*5000 - time

  //     time = Math.max(1000, Math.ceil(time/5000)*1000);
  //   }
  //   // ns.print("Overflow: " + ns.tFormat(overflow));
  //   // ns.print("Task time: " + ns.tFormat(time));
  //   return time;
  // }

  /**
   * Buy the bladeburner upgrades
   */
  function upgrades() {
    let points = bb.getSkillPoints();
    let cont = true;
    const [current, max] = bb.getStamina();

    while (cont) {
      cont = false;
      if (current * 1.5 < max) {
        if (bb.getSkillUpgradeCost("Cyber's Edge") < points) {
          points -= bb.getSkillUpgradeCost("Cyber's Edge");
          cont = bb.upgradeSkill("Cyber's Edge");
        }
      } else if (bb.getSkillLevel('Overclock') < 90 && bb.getSkillUpgradeCost('Overclock') < points) {
        // if struggling with stamina,
        points -= bb.getSkillUpgradeCost('Overclock'); // don't speed up rate of consumption
        cont = bb.upgradeSkill('Overclock');
      }

      if (
        bb.getSkillLevel("Blade's Intuition") * 4 < bb.getSkillLevel('Digital Observer') * 3 &&
        bb.getSkillUpgradeCost("Blade's Intuition") < points
      ) {
        points -= bb.getSkillUpgradeCost("Blade's Intuition");
        cont = bb.upgradeSkill("Blade's Intuition");
      } else if (bb.getSkillUpgradeCost('Digital Observer') < points) {
        points -= bb.getSkillUpgradeCost('Digital Observer');
        cont = bb.upgradeSkill('Digital Observer');
      } else if (bb.getSkillUpgradeCost('Short-Circuit') < points && currentBO < 18) {
        points -= bb.getSkillUpgradeCost('Short-Circuit');
        cont = bb.upgradeSkill('Short-Circuit');
      } else if (
        bb.getSkillLevel('Short-Circuit') >= bb.getSkillLevel('Cloak') &&
        bb.getSkillUpgradeCost('Cloak') < points
      ) {
        points -= bb.getSkillUpgradeCost('Cloak');
        cont = bb.upgradeSkill('Cloak');
      } else if (bb.getSkillUpgradeCost('Reaper') < points) {
        points -= bb.getSkillUpgradeCost('Reaper');
        cont = bb.upgradeSkill('Reaper');
      }
    }
  }

  /**
   * Waits until current task is complete, reporting progress in the title
   * @returns - true if task completed successfully, false otherwise
   */
  async function actWaiter() {
    const currentTask = bb.getCurrentAction();
    if (currentTask.type == 'Idle') {
      return false;
    }
    const curSuccess = bb.getActionSuccesses(currentTask.type, currentTask.name);
    let curCount = bb.getActionCountRemaining(currentTask.type, currentTask.name);
    const finishTime = bb.getActionTime(currentTask.type, currentTask.name);
    // ns.print(currentTask.type)

    while (currentTask.type != 'General') {
      if (bb.getActionSuccesses(currentTask.type, currentTask.name) > curSuccess) {
        return true;
      } else if (
        bb.getActionCountRemaining(currentTask.type, currentTask.name) < curCount &&
        bb.getActionEstimatedSuccessChance(currentTask.type, currentTask.name)[0] < 1 // If success is guaranteed, it was just a sleeve that failed
      ) {
        return false;
      } else if (bb.getActionCountRemaining(currentTask.type, currentTask.name) < 1 && currentTask.type == 'BlackOp') {
        return true;
      } else {
        curCount = bb.getActionCountRemaining(currentTask.type, currentTask.name);
        ns.setTitle(ns.sprintf('[%d/%d] %s', bb.getActionCurrentTime() / 1000, finishTime / 1000, currentTask.name));
        await bb.nextUpdate(); // 1000 - .script exec time (ms)
      }
    }
    if (currentTask.type == 'General') {
      ns.setTitle(currentTask.name);
      let waitTime = finishTime - bb.getActionCurrentTime();
      if (bb.getBonusTime() > 5000) {
        waitTime = Math.ceil(waitTime / 5000) * 1000;
      }
      waitTime = Math.max(waitTime, 1000);
      // ns.print(ns.tFormat(waitTime));
      await ns.sleep(waitTime);
      return true;
    }
    return false;
  }

  // if already busy,
  // if(bb.getActionCurrentTime() > 0){
  //   const curr = bb.getCurrentAction()
  //   ns.print("Finishing up " + curr.name);
  //   const waitTime = adjTime(bb.getActionTime(curr.type, curr.name) - bb.getActionCurrentTime());
  //   await ns.sleep(waitTime);
  //   ns.clearLog();
  // }
  await actWaiter();
  ns.clearLog();
  ns.printf("+%'=37s+", '');

  // main loop
  while (true) {
    if (!simulacrum && (ns.getResetInfo().currentNode == 10 || ns.getResetInfo().ownedSF.has(10))) {
      let price = Number.MAX_SAFE_INTEGER;
      if (!sin.getOwnedAugmentations(true).includes("The Blade's Simulacrum")) {
        try {
          price = ns.grafting.getAugmentationGraftPrice("The Blade's Simulacrum") + 200000;
        } catch {
          price = Number.MAX_SAFE_INTEGER;
        }
      }
      if (ns.getServerMoneyAvailable('home') > price) {
        bb.stopBladeburnerAction();
        sin.travelToCity('New Tokyo');
        ns.grafting.graftAugmentation(
          "The Blade's Simulacrum",
          !sin.getOwnedAugmentations().includes('Neuroreceptor Management Implant'),
        );
        await ns.sleep(ns.grafting.getAugmentationGraftTime("The Blade's Simulacrum"));
        simulacrum = true;
      }
    }
    ns.resizeTail(385, 340);
    cities.sort((a, b) => bb.getCityEstimatedPopulation(b) - bb.getCityEstimatedPopulation(a));
    /** [0: city, 1: name, 2: lowChance, 3: highChance] */
    const blackop = bestBlackOp();
    /** [0: city, 1: name, 2: lowChance, 3: highChance] */
    let operation: [CityName, string, number, number];
    /** [0: city, 1: name, 2: lowChance, 3: highChance] */
    let contract: [CityName, string, number, number];
    let rank: number;
    if (blackop[1] == 'Destroy_World_Demon') {
      rank = Number.MAX_SAFE_INTEGER;
    } else {
      rank = bb.getBlackOpRank(blackop[1]);
    }
    // let waitTime = 1000;
    const [current, max] = bb.getStamina();
    if (current * 2 < max) {
      const city = blackop[0];
      const action: [string, string] = ['general', 'Training'];
      bb.switchCity(city);
      ns.printf('|City: %-9s || %18s|', city, ns.sprintf('Stam: %4d/%4d', current, max));
      ns.printf('|Best BlOp: %-17s %3d/%3d%%|', blackop[0], blackop[2] * 100, blackop[3] * 100);
      bb.startAction(...action);
      // waitTime = bb.getActionTime(...action);
    } else if (bb.getRank() > rank && blackop[3] == 1) {
      ns.printf('|City: %-9s || BlOp || %3d - %3d%%|', blackop[0], blackop[2] * 100, blackop[3] * 100);
      ns.printf('|Next BlOp: %-26s|', blackOps[currentBO + 1]);
      bb.switchCity(blackop[0]);
      if (blackop[2] < 0.99) {
        const analysis = bestAnalysis();
        bb.startAction(...analysis);
        // waitTime = bb.getActionTime(...analysis);
      } else {
        bb.startAction('blackop', blackop[1]);
        // waitTime = bb.getActionTime("blackop", blackop[1]) + 500; // had some issues with interupting actions at the last second
      }
    } else if ((operation = bestOperation())[3] == 1) {
      ns.printf('|City: %-9s || Oper || %3d - %3d%%|', operation[0], operation[2] * 100, operation[3] * 100);
      ns.printf('|Best BlOp: %-17s %3d/%3d%%|', blackop[0], blackop[2] * 100, blackop[3] * 100);
      bb.switchCity(operation[0]);
      if (operation[2] < 0.95) {
        const analysis = bestAnalysis();
        bb.startAction(...analysis);
        // waitTime = bb.getActionTime(...analysis);
      } else {
        bb.startAction('operation', operation[1]);
        // waitTime = bb.getActionTime("operation", operation[1]);
      }
    } else if ((contract = bestContract())[3] == 1) {
      ns.printf('|City: %-9s || Cont || %3d - %3d%%|', contract[0], contract[2] * 100, contract[3] * 100);
      ns.printf('|Best Op %-21s%3d/%3d%%|', operation[1] + ':', operation[2] * 100, operation[3] * 100);
      bb.switchCity(contract[0]);
      if (operation[1] == 'Incite Violence') {
        bb.startAction('general', 'Incite Violence');
        // waitTime = bb.getActionTime("general", "Incite Violence");
      } else if (contract[2] < 0.95) {
        const analysis = bestAnalysis();
        bb.startAction(...analysis);
        // waitTime = bb.getActionTime(...analysis);
      } else {
        bb.startAction('contract', contract[1]);
        // waitTime = bb.getActionTime("contract", contract[1]);
      }
    } else {
      const city = operation[0];
      let action: [string, string] = ['general', 'Training'];
      bb.switchCity(city);
      ns.printf('|Best Op %-21s%3d/%3d%%|', operation[1] + ':', operation[2] * 100, operation[3] * 100);

      if (blackop[2] == 1 && operation[1] == 'Incite Violence') {
        action = ['general', 'Incite Violence'];
      } else if (bb.getCityChaos(city) > chaosThreshold && getCombatStats(ns).every((val) => val >= 100)) {
        action = diplomacy();
      }
      // else if(blackop[3] - blackop[2] > .2){
      //   action = bestAnalysis();
      // }
      ns.printf('|City: %9s || %18s|', city, action[1]);
      bb.startAction(...action);
      // waitTime = bb.getActionTime(...action);
    }
    ns.printf('|[%2d] %-41s|', currentBO, colorPicker(blackop[1], Color.magenta));
    ns.printf('|Rank: %24s/%6s|', ns.formatNumber(bb.getRank()), ns.formatNumber(rank, 1));
    ns.printf('|Doing: %-30s|', bb.getCurrentAction().name);
    ns.printf("+%'=37s+", '');

    // waitTime = adjTime(waitTime);
    // await ns.sleep(waitTime);
    const succ = await actWaiter();
    if (succ) {
      ns.printf(colorPicker("|%'=-37s|", Color.green), '>>>Success');
    } else {
      ns.printf(colorPicker("|%'=-37s|", Color.red), '>>>Fail');
    }
    upgrades();
  }
}
