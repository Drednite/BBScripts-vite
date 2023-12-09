/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { AutocompleteData, NS, Server } from '@ns';
import {
  LocationName,
  FactionWorkType,
  JobName,
  CompanyName,
  CityName,
  UniversityClassType,
  UniversityServers,
  getSkill,
  installBackdoor,
  getKeys,
  stockComp,
} from './helpers';

const argsSchema: [string, string | number | boolean | string[]][] = [
  ['g', false],
  ['b', false],
  ['e', false],
  ['s', false],
  ['graft', false],
];

const strength = 'strength';
const defense = 'defense';
const dexterity = 'dexterity';
const agility = 'agility';

export function autocomplete(data: AutocompleteData) {
  data.flags(argsSchema);
  return [];
}

const universityCities = new Map<LocationName, CityName>([
  [LocationName.AevumSummitUniversity, CityName.Aevum],
  [LocationName.Sector12RothmanUniversity, CityName.Sector12],
  [LocationName.VolhavenZBInstituteOfTechnology, CityName.Volhaven],
]);

const gymCities = new Map<LocationName, CityName>([
  [LocationName.AevumSnapFitnessGym, CityName.Aevum],
  [LocationName.Sector12PowerhouseGym, CityName.Sector12],
  [LocationName.VolhavenMilleniumFitnessGym, CityName.Volhaven],
]);

const hackerFactions = ['CyberSec', 'NiteSec', 'The Black Hand', 'BitRunners'];

const factionServers = new Map([
  ['CyberSec', 'CSEC'],
  ['NiteSec', 'avmnite-02h'],
  ['The Black Hand', 'I.I.I.I'],
  ['BitRunners', 'run4theh111z'],
  ['Fulcrum Secret Technologies', 'fulcrumassets'],
  [CompanyName.ECorp, 'ecorp'],
  [CompanyName.MegaCorp, 'megacorp'],
  [CompanyName.KuaiGongInternational, 'kuai-gong'],
  [CompanyName.FourSigma, '4sigma'],
  [CompanyName.NWO, 'nwo'],
  [CompanyName.BladeIndustries, 'blade'],
  [CompanyName.OmniTekIncorporated, 'omnitek'],
  [CompanyName.BachmanAndAssociates, 'b-and-a'],
  [CompanyName.ClarkeIncorporated, 'clarkinc'],
  [CompanyName.FulcrumTechnologies, 'fulcrumtech'],
]);

const megacorps = [
  CompanyName.ECorp,
  CompanyName.MegaCorp,
  CompanyName.KuaiGongInternational,
  CompanyName.FourSigma,
  CompanyName.NWO,
  CompanyName.BladeIndustries,
  CompanyName.OmniTekIncorporated,
  CompanyName.BachmanAndAssociates,
  CompanyName.ClarkeIncorporated,
  CompanyName.FulcrumTechnologies,
];
const positions = [
  JobName.software0,
  JobName.software1,
  JobName.software2,
  JobName.software3,
  JobName.software4,
  JobName.software5,
  JobName.software6,
  JobName.software7,
];

let focus = true;
let stocks = false;
const waitTime = 1000;
const esc = new KeyboardEvent('keypress', { key: 'Escape' });

export async function main(ns: NS): Promise<void> {
  const flags = ns.flags(argsSchema);
  await ns.sleep(waitTime);
  ns.disableLog('ALL');
  const sin = ns.singularity;
  stocks = flags.s != false;
  focus = !sin.getOwnedAugmentations().includes('Neuroreceptor Management Implant');
  ns.tail();
  ns.resizeTail(545, 300);
  ns.moveTail(765, 0);
  ns.atExit(() => {
    ns.closeTail();
  });
  while (sin.getCurrentWork() && sin.getCurrentWork().type == 'GRAFTING') {
    ns.setTitle('Worker: Finishing up graft...');
    await ns.sleep(waitTime);
  }

  if (!sin.getOwnedAugmentations(true).includes('Neuroreceptor Management Implant')) {
    await progStudent(ns, 50);
    ns.print('Working to get Neuroreceptor Management Implant...');
    ns.setTitle('Working @ Tian Di Hui');
    if (!ns.getPlayer().factions.includes('Tian Di Hui')) {
      while (!sin.travelToCity('Chongqing')) {
        await ns.sleep(waitTime);
      }
      while (!sin.checkFactionInvitations().includes('Tian Di Hui')) {
        await ns.sleep(waitTime);
      }
      sin.joinFaction('Tian Di Hui');
    }
    sin.workForFaction('Tian Di Hui', 'hacking');
    const reqRep = sin.getAugmentationRepReq('Neuroreceptor Management Implant');
    while (sin.getFactionRep('Tian Di Hui') < reqRep) {
      ns.setTitle(
        'Working @ Tian Di Hui [' +
          ns.formatNumber(sin.getFactionRep('Tian Di Hui')) +
          '/' +
          ns.formatNumber(reqRep, 0) +
          ']',
      );
      await ns.sleep(waitTime);
    }
  }
  if (manageInvites(ns, 'Netburners')) await progStudent(ns, 80);

  if (flags.g && !ns.gang.inGang()) {
    await karmaKiller(ns);
    let player = ns.getPlayer();
    while (!player.factions.includes('Slum Snakes')) {
      ns.print('Joining Slum Snakes...');
      sin.joinFaction('Slum Snakes');
      await ns.sleep(waitTime);
      player = ns.getPlayer();
    }
    ns.print('Starting gang...');

    while (!ns.gang.createGang('Slum Snakes')) {
      await ns.sleep(waitTime);
    }
    ns.print('Starting Shogal...');
    while (!ns.run('Shogal.js')) {
      await ns.sleep(waitTime);
    }
  }

  if (flags.b) {
    await bbRecruit(ns);
  }
  await hacker(ns);
  if (flags.e) await employee(ns);
  while (await endgame(ns)) {
    await ns.sleep(waitTime);
  }
  while (stocks) {
    await stockWorker(ns);
    await grafting(ns, true, false);
  }
}

/**
 * Work for each megacorp until enough you have enough rep to gain access to their faction, then work for each faction until all of
 * their augments can be bought
 * @param {NS} ns
 */
async function employee(ns: NS) {
  const sin = ns.singularity;
  const player = ns.getPlayer();
  ns.setTitle('Employee');
  ns.print('Starting employee cycle...');

  for (let i = 0; i < megacorps.length; i++) {
    let faction: string = megacorps[i];
    let server: Server;
    let check: boolean;
    if (faction == CompanyName.FulcrumTechnologies) {
      // If the current megacorp is Fulcrum Technologies, the corp name is different than the faction name, and they have two servers
      faction = 'Fulcrum Secret Technologies';
      server = ns.getServer(factionServers.get(faction)!);
      check = manageInvites(ns, faction) && !player.factions.includes(faction);
      if (check && !server.backdoorInstalled) {
        ns.print('Building hacking to backdoor fulcrumtech');
        await progStudent(ns, server.requiredHackingSkill);
        while (!ns.scriptRunning('backdoor.js', 'home') && !server.backdoorInstalled) {
          ns.run('backdoor.js', 1, server.hostname);
          await ns.sleep(waitTime);
          server = ns.getServer(server.hostname);
        }
      }
    }

    check = manageInvites(ns, faction) && !player.factions.includes(faction); // check if the faction has any augments to be bought, or if we already qualify for the faction
    for (let x = 0; check && x < positions.length; x++) {
      // keep going until check returns false, or positions tun out
      let player = ns.getPlayer();
      server = ns.getServer(factionServers.get(megacorps[i])!);
      if (!server.backdoorInstalled && player.skills.hacking > server.requiredHackingSkill!) {
        // if the corp's server can be backdoored, do it now since it will affect promotion requirements
        ns.print('Running backdoor.js...');
        while (!ns.scriptRunning('backdoor.js', 'home') && !server.backdoorInstalled) {
          ns.run('backdoor.js', 1, server.hostname);
          await ns.sleep(waitTime);
          server = ns.getServer(server.hostname);
        }
      }
      const position = sin.getCompanyPositionInfo(megacorps[i], positions[x]);
      const reqHack = position.requiredSkills.hacking;
      const reqCha = position.requiredSkills.charisma;
      const reqRep = position.requiredReputation;

      if (player.skills.charisma < reqCha) {
        // studying to meet the requirements for the next postition will always be better than working until rep has been built up
        await busStudent(ns, reqCha);
        player = ns.getPlayer();
      }
      if (player.skills.hacking < reqHack) {
        await progStudent(ns, reqHack);
        player = ns.getPlayer();
      }
      if (x > 0) {
        // obviously you can't work for a company yet if you haven't been hired yet
        sin.workForCompany(megacorps[i], focus);
        ns.print('Working at ' + megacorps[i] + ' as a ' + positions[x - 1]);
        while (sin.getCompanyRep(megacorps[i]) < reqRep) {
          ns.setTitle(
            megacorps[i] + ': ' + ns.formatNumber(sin.getCompanyRep(megacorps[i])) + '/' + ns.formatNumber(reqRep),
          );
          await ns.sleep(waitTime);
        }
      }
      sin.applyToCompany(megacorps[i], 'Software');
      check = manageInvites(ns, faction) && !player.factions.includes(faction); // update check
    }
    sin.quitJob(megacorps[i]);
    const factAugs = availableAugments(ns, faction, false);
    let repReq = 0;
    factAugs.forEach((aug) => {
      const rep = sin.getAugmentationRepReq(aug);
      if (rep > repReq) {
        repReq = rep;
      }
    });
    await factionWork(ns, faction, repReq);
    ns.print('Working for ' + faction);
    while (sin.getFactionRep(faction) < repReq) {
      ns.setTitle(
        'Employee - ' +
          faction +
          '[' +
          ns.formatNumber(sin.getFactionRep(faction)) +
          '/' +
          ns.formatNumber(repReq) +
          ']',
      );
      manageInvites(ns);
      await ns.sleep(waitTime);
    }
  }
}

/**
 * Works to join Bladeburner Division
 * @param ns netscript namespace
 */
async function bbRecruit(ns: NS) {
  const bb = ns.bladeburner;
  if (!bb.inBladeburner()) {
    ns.print('Training to join Bladeburner Division');
    await workout(ns, strength, 100);
    await workout(ns, defense, 100);
    await workout(ns, dexterity, 100);
    await workout(ns, agility, 100);
    bb.joinBladeburnerDivision();
    // bb.joinBladeburnerFaction();
  }
}

/**
 * @description Take specified university course until the target hacking score is reached
 * @param {NS} ns
 * @param {number} [target = MAX_SAFE_INTEGER] - Target score to be reached (defaults to MAX_SAFE_INTEGER)
 * @param {LocationName} [school] - The school to study at.
 */
async function progStudent(ns: NS, target: number = Number.MAX_SAFE_INTEGER, school?: LocationName): Promise<void> {
  let player = ns.getPlayer();
  if (player.skills.hacking >= target) {
    return;
  }
  let title = '';
  if (school == undefined) {
    school = LocationName.Sector12RothmanUniversity;
    universityCities.forEach((city, uni) => {
      if (player.city == city) {
        school = uni;
      }
    });
  }

  let course: UniversityClassType | undefined = UniversityClassType.computerScience;
  let hackGain = 0;
  if (player.factions.some((fact) => ns.singularity.workForFaction(fact, 'hacking', focus))) {
    hackGain = ns.formulas.work.factionGains(player, 'hacking', 0).hackExp;
    course = undefined;
  }
  await ns.sleep(100);
  dispatchEvent(esc); // Not actually sure this is doing anything, might remove later to test.
  const income = (ns.getServerMoneyAvailable('home') / (Date.now() - ns.getResetInfo().lastAugReset)) * 10;
  if (income > 960 * 2) {
    if (ns.formulas.work.universityGains(player, UniversityClassType.algorithms, school).hackExp > hackGain)
      course = UniversityClassType.algorithms;
  } else if (income > 240 * 2) {
    if (ns.formulas.work.universityGains(player, UniversityClassType.networks, school).hackExp > hackGain)
      course = UniversityClassType.networks;
  } else if (income > 120 * 2) {
    if (ns.formulas.work.universityGains(player, UniversityClassType.dataStructures, school).hackExp > hackGain)
      course = UniversityClassType.dataStructures;
  }

  if (typeof course == 'string') {
    ns.print('Studying ' + course + ' at ' + school + ' until lvl ' + target);
    title = 'Student @ ' + school.split(' ')[0] + ' ';
    while (player.city != universityCities.get(school)) {
      ns.singularity.travelToCity(universityCities.get(school)!);
      await ns.sleep(100);
      player = ns.getPlayer();
    }
    ns.singularity.universityCourse(school, course, focus);
  } else {
    const currWork = ns.singularity.getCurrentWork();
    ns.print('Internship with ' + currWork.factionName);
    title = currWork.factionName + ' : ' + currWork.factionWorkType + ' ';
  }
  let server = ns.getServer(UniversityServers.get(school)!);
  while (player.skills.hacking < target) {
    await grafting(ns, true, false);
    if (ns.hacknet.hashCost('Improve Studying') <= 500) {
      ns.hacknet.spendHashes('Improve Studying');
    }
    if (!server.backdoorInstalled && player.skills.hacking > server.requiredHackingSkill!) {
      while (!ns.scriptRunning('backdoor.js', 'home') && !server.backdoorInstalled) {
        ns.run('backdoor.js', 1, server.hostname);
        await ns.sleep(waitTime);
        server = ns.getServer(server.hostname);
      }
    }
    ns.setTitle(title + player.skills.hacking + '/' + target);
    await ns.sleep(waitTime);
    player = ns.getPlayer();
  }
}

/**
 * Study at a university until the target charisma score is reached
 * @param {NS} ns
 * @param {number} [target = MAX_SAFE_INTEGER] - Target score to be reached (defaults to MAX_SAFE_INTEGER)
 * @param {LocationName} [school] - The school to study at.
 */
async function busStudent(ns: NS, target: number = Number.MAX_SAFE_INTEGER, school?: LocationName): Promise<void> {
  let player = ns.getPlayer();
  if (player.skills.charisma >= target) {
    return;
  }
  let course = UniversityClassType.management;
  if ((ns.getServerMoneyAvailable('home') / (Date.now() - ns.getResetInfo().lastAugReset)) * 10 > 960 * 2) {
    course = UniversityClassType.leadership;
  }

  if (school == undefined) {
    school = LocationName.Sector12RothmanUniversity;
    universityCities.forEach((city, uni) => {
      if (player.city == city) {
        school = uni;
      }
    });
  }
  while (player.city != universityCities.get(school)) {
    ns.singularity.travelToCity(universityCities.get(school)!);
    await ns.sleep(100);
  }

  ns.print('Studying ' + course + ' at ' + school);
  ns.singularity.universityCourse(school, course, focus);
  let server = ns.getServer(UniversityServers.get(school)!);
  while (player.skills.charisma < target) {
    if (ns.hacknet.hashCost('Improve Studying') <= 500) {
      ns.hacknet.spendHashes('Improve Studying');
    }
    if (
      !server.backdoorInstalled &&
      player.skills.hacking > server.requiredHackingSkill! &&
      !ns.scriptRunning('backdoor.js', 'home')
    ) {
      while (!ns.scriptRunning('backdoor.js', 'home') && !server.backdoorInstalled) {
        ns.run('backdoor.js', 1, server.hostname);
        await ns.sleep(waitTime);
        server = ns.getServer(server.hostname);
      }
      server = ns.getServer(server.hostname);
    }
    ns.setTitle('Student @ ' + school.split(' ')[0] + ' ' + player.skills.charisma + '/' + target);
    manageInvites(ns);
    await ns.sleep(waitTime);
    player = ns.getPlayer();
  }
}

/**
 * Workout specified stat until it reaches the target score.
 * @param ns
 * @param stat - which stat to work out for
 * @param target - the target score you would like this stat to reach
 * @param gym - (optional) specify which gym to workout at
 */
async function workout(ns: NS, stat: string, target: number, gym?: LocationName) {
  if (getSkill(ns, stat) >= target) {
    return;
  }
  const sin = ns.singularity;
  let player = ns.getPlayer();
  gym = LocationName.Sector12PowerhouseGym;
  gymCities.forEach((city, location) => {
    if (player.city == city) {
      gym = location;
    }
  });
  if (player.city != gymCities.get(gym)) {
    sin.travelToCity(gymCities.get(gym)!);
  }
  sin.gymWorkout(gym, stat, focus);
  ns.print('working out at ' + gym + ' until ' + stat + ' is ' + target);
  switch (stat) {
    case 'strength':
      while (player.skills.strength < target) {
        if (await grafting(ns, false, true)) sin.gymWorkout(gym, stat, focus);
        await ns.sleep(waitTime);
        player = ns.getPlayer();
      }
      break;
    case 'defense':
      while (player.skills.defense < target) {
        if (await grafting(ns, false, true)) sin.gymWorkout(gym, stat, focus);
        await ns.sleep(waitTime);
        player = ns.getPlayer();
      }
      break;
    case 'dexterity':
      while (player.skills.dexterity < target) {
        if (await grafting(ns, false, true)) sin.gymWorkout(gym, stat, focus);
        await ns.sleep(waitTime);
        player = ns.getPlayer();
      }
      break;
    case 'agility':
      while (player.skills.agility < target) {
        if (await grafting(ns, false, true)) sin.gymWorkout(gym, stat, focus);
        await ns.sleep(waitTime);
        player = ns.getPlayer();
      }
      break;
    default:
      break;
  }
}

/**
 * Commit violent crimes, prioritising karma loss
 * @param ns
 */
async function karmaKiller(ns: NS) {
  const sin = ns.singularity;
  ns.print('Starting karma killer cycle...');
  ns.setTitle('Criminal - Mug');
  let crimeTime = sin.commitCrime('Mug', focus);
  ns.print('Mugging...');
  while (sin.getCrimeChance('Homicide') < 0.6) {
    manageInvites(ns);
    await ns.sleep(crimeTime);
  }
  crimeTime = sin.commitCrime('Homicide', focus);
  ns.print('Committing Homicide...');
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore: heart.break hidden function
  let karma = ns.heart.break();
  while (karma > -54000) {
    //  || sin.getCrimeChance("Heist") < 1
    manageInvites(ns);
    ns.setTitle(ns.sprintf('Criminal - Homicide K: %d', karma));
    await ns.sleep(crimeTime);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore: heart.break hidden function
    karma = ns.heart.break();
  }
  // sin.commitCrime("Heist", focus);
}

/**
 * Work for each hacker faction until enough reputation with each has been earned to buy all available augments
 * @param {NS} ns
 */
async function hacker(ns: NS) {
  ns.print('Starting hacker cycle...');
  ns.setTitle('Hacker');
  const sin = ns.singularity;

  for (let i = 0; i < hackerFactions.length; i++) {
    const faction = hackerFactions[i];
    const factAugs = availableAugments(ns, faction);
    if (factAugs.length > 0) {
      ns.print(faction + ' augs remaining : ' + factAugs.length);
      let maxRep = 0;
      let server = ns.getServer(factionServers.get(faction));
      let keys = getKeys(ns);
      while ((server.numOpenPortsRequired ? server.numOpenPortsRequired : 0) > keys[0]) {
        if (sin.purchaseTor() && sin.getDarkwebProgramCost(keys[1][0]) < ns.getServerMoneyAvailable('home')) {
          sin.purchaseProgram(keys[1][0]);
          await ns.sleep(waitTime);
        } else if (sin.getCurrentWork().type == 'CREATE_PROGRAM') {
          await ns.sleep(waitTime * 10);
        } else if (!sin.createProgram(keys[1][0], focus)) {
          await progStudent(ns, ns.getHackingLevel() + 10);
        } else {
          ns.setTitle('Hacker: Creating ' + keys[1][0]);
          await ns.sleep(waitTime * 10);
        }
        keys = getKeys(ns);
      }
      if (!server.backdoorInstalled) {
        while (!ns.hasRootAccess(server.hostname)) {
          ns.run('nuke.js', 1, server.hostname);
          await ns.sleep(waitTime);
        }
        if (ns.getHackingLevel() < server.requiredHackingSkill!) {
          await progStudent(ns, server.requiredHackingSkill);
        }
        while (!server.backdoorInstalled) {
          await installBackdoor(ns, server.hostname);
          server = ns.getServer(server.hostname);
        }
        await ns.sleep(waitTime * 0.1);
      }
      factAugs.forEach((aug) => {
        maxRep = Math.max(maxRep, sin.getAugmentationRepReq(aug));
      });
      while (!(await factionWork(ns, faction, maxRep))) {
        manageInvites(ns);
        await ns.sleep(waitTime);
      }
      ns.print('Working for ' + faction);
      while (sin.getFactionRep(faction) < maxRep) {
        ns.setTitle(
          'Hacker - ' +
            faction +
            '[' +
            ns.formatNumber(sin.getFactionRep(faction)) +
            '/' +
            ns.formatNumber(maxRep) +
            ']',
        );
        manageInvites(ns);
        await ns.sleep(waitTime);
      }
    }
  }
}

/**
 * Works to qualify for an endgame faction the player doesn't already qualify for.
 * @param {NS} ns
 */
async function endgame(ns: NS) {
  const sin = ns.singularity;
  ns.print('Starting endgame cycle...');
  ns.setTitle('Endgame');

  manageInvites(ns);

  let player = ns.getPlayer();
  let covDifference = Number.MAX_SAFE_INTEGER;
  let daedDifference = Number.MAX_SAFE_INTEGER;
  let illDifference = Number.MAX_SAFE_INTEGER;
  const augments = sin.getOwnedAugmentations(true);
  const covAugs = availableAugments(ns, 'The Covenant');
  if (covAugs.length > 0 && !player.factions.includes('The Covenant')) {
    covDifference =
      Math.max(850 - player.skills.hacking, 0) +
      Math.max(
        850 - Math.min(player.skills.strength, player.skills.agility, player.skills.defense, player.skills.dexterity),
        0,
      );
  }
  const daedAugs = availableAugments(ns, 'Daedalus');
  if (daedAugs.length > 0 && !player.factions.includes('Daedalus')) {
    daedDifference = Math.min(
      Math.max(2500 - player.skills.hacking, 0),
      Math.max(
        1500 - Math.min(player.skills.strength, player.skills.agility, player.skills.defense, player.skills.dexterity),
        0,
      ),
    );
  }
  const illAugs = availableAugments(ns, 'Illuminati');
  if (illAugs.length > 0 && !player.factions.includes('Illuminati')) {
    illDifference =
      Math.max(1500 - player.skills.hacking, 0) +
      Math.max(
        1200 - Math.min(player.skills.strength, player.skills.agility, player.skills.defense, player.skills.dexterity),
        0,
      );
  }
  const minDifference = Math.min(covDifference, daedDifference, illDifference);

  manageInvites(ns);
  if (minDifference == Number.MAX_SAFE_INTEGER) {
    ns.print('Endgame factions finished');
    return false;
  }
  if (minDifference == covDifference) {
    if (augments.length < 20) {
      ns.print('WARN: Not enough augments to join The Covenant');
      return false;
    }

    ns.setTitle('Endgame - The Covenant');
    await workout(ns, 'strength', 850);
    await workout(ns, 'defense', 850);
    await workout(ns, 'dexterity', 850);
    await workout(ns, 'agility', 850);
    await progStudent(ns, 850);
    while (ns.getServerMoneyAvailable('home') < 75e9) {
      ns.setTitle(
        ns.sprintf(
          'Endgame - The Covenant: $%s/%s',
          ns.formatNumber(ns.getServerMoneyAvailable('home')),
          ns.formatNumber(75e9),
        ),
      );
      if (stocks) {
        await stockWorker(ns);
      } else {
        await ns.sleep(waitTime);
      }
    }
    manageInvites(ns);
    await ns.sleep(waitTime);
    player = ns.getPlayer();

    let reqRep = 0;
    covAugs.forEach((aug) => {
      if (sin.getAugmentationRepReq(aug) > reqRep) {
        reqRep = sin.getAugmentationRepReq(aug);
      }
    });
    await factionWork(ns, 'The Covenant', reqRep);
    ns.print('Working for ' + 'The Covenant');
    while (sin.getFactionRep('The Covenant') < reqRep) {
      ns.setTitle(
        'Endgame - ' +
          'The Covenant' +
          '[' +
          ns.formatNumber(sin.getFactionRep('The Covenant')) +
          '/' +
          ns.formatNumber(reqRep) +
          ']',
      );
      manageInvites(ns);
      await ns.sleep(waitTime);
    }
  } else if (minDifference == illDifference) {
    if (augments.length < 30) {
      ns.print('WARN: Not enough augments to join the Illuminati');
      return false;
    }

    ns.setTitle('Endgame - Illuminati');
    await workout(ns, 'strength', 1200);
    await workout(ns, 'defense', 1200);
    await workout(ns, 'dexterity', 1200);
    await workout(ns, 'agility', 1200);
    await progStudent(ns, 1500);
    while (ns.getServerMoneyAvailable('home') < 150e9) {
      ns.setTitle(
        ns.sprintf(
          'Endgame - Illuminati: $%s/%s',
          ns.formatNumber(ns.getServerMoneyAvailable('home')),
          ns.formatNumber(150e9),
        ),
      );
      if (stocks) {
        await stockWorker(ns);
      } else {
        await ns.sleep(waitTime);
      }
    }
    manageInvites(ns);
    await ns.sleep(waitTime);
    player = ns.getPlayer();

    let reqRep = 0;
    illAugs.forEach((aug) => {
      if (sin.getAugmentationRepReq(aug) > reqRep) {
        reqRep = sin.getAugmentationRepReq(aug);
      }
    });
    await factionWork(ns, 'Illuminati', reqRep);
    ns.print('Working for ' + 'Illuminati');
    while (sin.getFactionRep('Illuminati') < reqRep) {
      ns.setTitle(
        'Endgame - ' +
          'Illuminati' +
          '[' +
          ns.formatNumber(sin.getFactionRep('Illuminati')) +
          '/' +
          ns.formatNumber(reqRep) +
          ']',
      );
      manageInvites(ns);
      await ns.sleep(waitTime);
    }
  } else {
    if (augments.length < ns.getBitNodeMultipliers().DaedalusAugsRequirement) {
      ns.print('WARN: Not enough augments to join the Daedalus');
      return false;
    }

    ns.setTitle('Endgame - Daedalus');
    if (
      Math.max(2500 - player.skills.hacking, 0) <
      Math.max(
        1500 - Math.min(player.skills.strength, player.skills.agility, player.skills.defense, player.skills.dexterity),
        0,
      )
    ) {
      await progStudent(ns, 2500);
      manageInvites(ns);
    } else {
      await workout(ns, 'strength', 1500);
      await workout(ns, 'defense', 1500);
      await workout(ns, 'dexterity', 1500);
      await workout(ns, 'agility', 1500);
      while (ns.getServerMoneyAvailable('home') < 100e9) {
        ns.setTitle(
          ns.sprintf(
            'Endgame - Daedalus: %s/%s',
            ns.formatNumber(ns.getServerMoneyAvailable('home')),
            ns.formatNumber(100e9),
          ),
        );
        if (stocks) {
          await stockWorker(ns);
        } else {
          await ns.sleep(waitTime);
        }
      }
      manageInvites(ns);
    }
    await ns.sleep(waitTime);
    player = ns.getPlayer();

    let reqRep = 0;
    daedAugs.forEach((aug) => {
      if (sin.getAugmentationRepReq(aug) > reqRep) {
        reqRep = sin.getAugmentationRepReq(aug);
      }
    });
    await factionWork(ns, 'Daedalus', reqRep);
    ns.print('Working for ' + 'Daedalus');
    while (sin.getFactionRep('Daedalus') < reqRep) {
      ns.setTitle(
        'Endgame - ' +
          'Daedalus' +
          '[' +
          ns.formatNumber(sin.getFactionRep('Daedalus')) +
          '/' +
          ns.formatNumber(reqRep) +
          ']',
      );
      manageInvites(ns);
      await ns.sleep(waitTime);
    }
  }
  return true;
}

/**
 * Checks all available faction invites and accepts invites from any factions that still have augments to be bought.
 * @param ns
 * @param {string} [target] - (optional) if specified, checks to see if there are still augments to be bought from them
 * @returns true if there are augments to be bought from the target, false otherwise
 */
function manageInvites(ns: NS, target?: string): boolean {
  const invites = ns.singularity.checkFactionInvitations();
  let out = false;

  invites.forEach((fact) => {
    if (availableAugments(ns, fact).length > 0) {
      ns.singularity.joinFaction(fact);
    }
  });
  if (target) {
    if (availableAugments(ns, target).length > 0) {
      out = true;
    }
  }
  return out;
}

/**
 * Does work with highest reputation gain for faction.
 * @param ns
 * @param faction - Faction to work for.
 * @param repTarget - (optional) sleep until reaching target reputation.
 * @returns true if work is started, false otherwise.
 */
async function factionWork(ns: NS, faction: string, repTarget = 0) {
  const sin = ns.singularity;
  const player = ns.getPlayer();
  if (!player.factions.includes(faction)) {
    return false;
  }
  if (repTarget > 0 && sin.getFactionRep(faction) > repTarget) {
    return true;
  }
  const factWork: FactionWorkType[] = [FactionWorkType.hacking, FactionWorkType.field, FactionWorkType.security];

  let bestWork: FactionWorkType = FactionWorkType.hacking;
  let bestRep = 0;
  for (let i = 0; i < factWork.length; i++) {
    const element = factWork[i];
    const repGain = ns.formulas.work.factionGains(ns.getPlayer(), element, sin.getFactionFavor(faction)).reputation;
    if (sin.workForFaction(faction, element, focus) && repGain > bestRep) {
      bestWork = element;
      bestRep = repGain;
    }
  }

  sin.workForFaction(faction, bestWork, focus);
  while (sin.getFactionRep(faction) < repTarget) {
    ns.setTitle(
      ns.sprintf(
        'Faction Work: %s %s [%s/%s]',
        faction,
        bestWork,
        ns.formatNumber(sin.getFactionRep(faction)),
        ns.formatNumber(repTarget),
      ),
    );
    await ns.sleep(waitTime);
  }
  return true;
}

/**
 * Checks a faction's augments and returns an array containing all of the augments the player doesn't already have.
 * @param ns netscript namespace
 * @param faction faction to check for augments
 * @param prereqs exclude augments which the player doesn't have the prereqs for
 * @returns array containing the names of available augments
 */
export function availableAugments(ns: NS, faction: string, prereqs = true): string[] {
  const sin = ns.singularity;
  const owned = sin.getOwnedAugmentations(true);
  const factAugs = sin.getAugmentationsFromFaction(faction);
  let result = factAugs.filter((aug) => !owned.includes(aug));
  if (prereqs) {
    result = result.filter((aug) => {
      const prereq = sin.getAugmentationPrereq(aug);
      for (const req of prereq) {
        if (!owned.includes(req)) {
          return false;
        }
      }
      return true;
    });
  }
  return result;
}

/**
 * If it can be afforded, travel to New Tokyo and graft an augment
 * @param ns netscript namespace
 * @param hacking graft hacking augments
 * @param combat graft combat augments
 * @returns true if graft was successfully started and waited for, false otherwise
 */
async function grafting(ns: NS, hacking = true, combat = false) {
  const flags = ns.flags(argsSchema);
  if (!flags.graft) {
    return false;
  }
  const sin = ns.singularity;
  const gr = ns.grafting;
  const owned = sin.getOwnedAugmentations(true);
  const grafts = gr.getGraftableAugmentations().filter((aug) => {
    const prereq = sin.getAugmentationPrereq(aug);
    for (const req of prereq) {
      if (!owned.includes(req)) {
        return false;
      }
    }
    return true;
  });
  const toInstall: string[] = [];
  if (hacking) {
    toInstall.push(
      ...grafts.filter((aug) => {
        const stats = sin.getAugmentationStats(aug);
        return (
          stats.hacking > 1 ||
          stats.hacking_chance > 1 ||
          stats.hacking_exp > 1 ||
          stats.hacking_grow > 1 ||
          stats.hacking_money > 1 ||
          stats.hacking_speed > 1
        );
      }),
    );
  }
  if (combat) {
    toInstall.push(
      ...grafts.filter((aug) => {
        const stats = sin.getAugmentationStats(aug);
        return (
          stats.agility > 1 ||
          stats.agility_exp > 1 ||
          stats.defense > 1 ||
          stats.defense_exp > 1 ||
          stats.dexterity > 1 ||
          stats.dexterity_exp > 1 ||
          stats.strength > 1 ||
          stats.strength_exp > 1
        );
      }),
    );
  }
  if (toInstall.length == 0) {
    toInstall.push(...grafts);
  } else if (grafts.includes('nickofolas Congruity Implant')) toInstall.push('nickofolas Congruity Implant');
  toInstall.sort((a, b) => gr.getAugmentationGraftPrice(b) - gr.getAugmentationGraftPrice(a));
  for (const aug of toInstall) {
    if (gr.getAugmentationGraftPrice(aug) < ns.getServerMoneyAvailable('home')) {
      sin.travelToCity('New Tokyo');
      ns.print('WARN: Grafting ' + aug);
      gr.graftAugmentation(aug, focus);
      await ns.sleep(gr.getAugmentationGraftTime(aug));
      return true;
    }
  }
}

async function stockWorker(ns: NS, keep?: boolean) {
  const sin = ns.singularity;
  const st = ns.stock;
  do {
    sin.stopAction();
    const stakes: [string, number][] = [];
    for (const sym of st.getSymbols()) {
      const pos = st.getPosition(sym);
      if (pos[0] * pos[1] > 0) {
        stakes.push([sym, pos[0] * pos[1]]);
      }
    }
    if (stakes.length > 0) {
      stakes.sort((a, b) => b[1] - a[1]);
      let currPos = 0;
      let sym = '';
      let company;
      let found = false;
      for (let i = 0; i < stakes.length && !found; i++) {
        company = stockComp.get(stakes[i][0]);
        if (company) {
          try {
            sin.applyToCompany(company, 'Software');
            if (sin.workForCompany(company, focus)) {
              sym = stakes[i][0];
              currPos = st.getPosition(sym)[0];
              found = true;
            }
          } catch {
            company = undefined;
          }
        }
      }
      if (found) {
        ns.print('Working for ' + company + ' to improve stock');
        while (company && st.getPosition(sym)[0] == currPos) {
          ns.setTitle('Stock Work: ' + company + ' : ' + ns.formatPercent(st.getForecast(sym)));
          await ns.sleep(waitTime);
          sin.applyToCompany(company, 'Software');
        }
        sin.stopAction();
      } else {
        await st.nextUpdate();
      }
    }
    await st.nextUpdate();
  } while (keep);
}
