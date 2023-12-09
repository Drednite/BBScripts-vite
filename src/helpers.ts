import { NS } from '@ns';

export async function main(ns: NS): Promise<void> {
  ns.tprint('This is just a collection of helper functions to be imported into other scripts.');
}

export const HOMERAMRES = 32;

/**
 *  @param {NS} ns
 *  @returns {Promise<string[]>} list of all servers
 *  @remarks RAM cost: 0.2 GB
 */
export async function getAllServers(ns: NS): Promise<string[]> {
  const nodes = new Set<string>();
  function dfs(node: string) {
    nodes.add(node);
    for (const neighbor of ns.scan(node)) {
      if (!nodes.has(neighbor)) {
        dfs(neighbor);
      }
    }
  }
  dfs('home');
  return [...nodes];
}

/**
 * Returns an array containing the number of keys owned and a subarray of keys still needing to be bought/made
 * @param ns netscript namespace
 * @returns [number, string[]]
 */
export function getKeys(ns: NS): [number, string[]] {
  const keys: [number, string[]] = [0, []];
  if (ns.fileExists('BruteSSH.exe')) keys[0]++;
  else keys[1].push('BruteSSH.exe');
  if (ns.fileExists('FTPCrack.exe')) keys[0]++;
  else keys[1].push('FTPCrack.exe');
  if (ns.fileExists('relaySMTP.exe')) keys[0]++;
  else keys[1].push('relaySMTP.exe');
  if (ns.fileExists('HTTPWorm.exe')) keys[0]++;
  else keys[1].push('HTTPWorm.exe');
  if (ns.fileExists('SQLInject.exe')) keys[0]++;
  else keys[1].push('SQLInject.exe');
  return keys;
}

export const factions = new Map<string, string>([
  ['CyberSec', 'CyberSec'],
  ['TianDiHui', 'Tian Di Hui'],
  ['Netburners', 'Netburners'],
  ['ShadowsofAnarchy', 'Shadows of Anarchy'],
  ['Sector12', 'Sector-12'],
  ['Chongqing', 'Chongqing'],
  ['NewTokyo', 'New Tokyo'],
  ['Ishima', 'Ishima'],
  ['Aevum', 'Aevum'],
  ['Volhaven', 'Volhaven'],
  ['NiteSec', 'NiteSec'],
  ['TheBlackHand', 'The Black Hand'],
  ['BitRunners', 'BitRunners'],
  ['ECorp', 'ECorp'],
  ['MegaCorp', 'MegaCorp'],
  ['KuaiGongInternational', 'KuaiGong International'],
  ['FourSigma', 'Four Sigma'],
  ['NWO', 'NWO'],
  ['BladeIndustries', 'Blade Industries'],
  ['OmniTekIncorporated', 'OmniTek Incorporated'],
  ['Bachman&Associates', 'Bachman & Associates'],
  ['ClarkeIncorporated', 'Clarke Incorporated'],
  ['FulcrumSecretTechnologies', 'Fulcrum Secret Technologies'],
  ['SlumSnakes', 'Slum Snakes'],
  ['Tetrads', 'Tetrads'],
  ['Silhouette', 'Silhouette'],
  ['SpeakersfortheDead', 'Speakers for the Dead'],
  ['TheDarkArmy', 'The Dark Army'],
  ['TheSyndicate', 'The Syndicate'],
  ['TheCovenant', 'The Covenant'],
  ['Daedalus', 'Daedalus'],
  ['Illuminati', 'Illuminati'],
]);

/** Names of all cities
 * @public */
export enum CityName {
  Aevum = 'Aevum',
  Chongqing = 'Chongqing',
  Sector12 = 'Sector-12',
  NewTokyo = 'New Tokyo',
  Ishima = 'Ishima',
  Volhaven = 'Volhaven',
}

/** Names of all companies
 * @public */
export enum CompanyName {
  ECorp = 'ECorp',
  MegaCorp = 'MegaCorp',
  BachmanAndAssociates = 'Bachman & Associates',
  BladeIndustries = 'Blade Industries',
  NWO = 'NWO',
  ClarkeIncorporated = 'Clarke Incorporated',
  OmniTekIncorporated = 'OmniTek Incorporated',
  FourSigma = 'Four Sigma',
  KuaiGongInternational = 'KuaiGong International',
  FulcrumTechnologies = 'Fulcrum Technologies',
  StormTechnologies = 'Storm Technologies',
  DefComm = 'DefComm',
  HeliosLabs = 'Helios Labs',
  VitaLife = 'VitaLife',
  IcarusMicrosystems = 'Icarus Microsystems',
  UniversalEnergy = 'Universal Energy',
  GalacticCybersystems = 'Galactic Cybersystems',
  AeroCorp = 'AeroCorp',
  OmniaCybersystems = 'Omnia Cybersystems',
  SolarisSpaceSystems = 'Solaris Space Systems',
  DeltaOne = 'DeltaOne',
  GlobalPharmaceuticals = 'Global Pharmaceuticals',
  NovaMedical = 'Nova Medical',
  CIA = 'Central Intelligence Agency',
  NSA = 'National Security Agency',
  WatchdogSecurity = 'Watchdog Security',
  LexoCorp = 'LexoCorp',
  RhoConstruction = 'Rho Construction',
  AlphaEnterprises = 'Alpha Enterprises',
  Police = 'Aevum Police Headquarters',
  SysCoreSecurities = 'SysCore Securities',
  CompuTek = 'CompuTek',
  NetLinkTechnologies = 'NetLink Technologies',
  CarmichaelSecurity = 'Carmichael Security',
  FoodNStuff = 'FoodNStuff',
  JoesGuns = "Joe's Guns",
  OmegaSoftware = 'Omega Software',
  NoodleBar = 'Noodle Bar',
}

export const orgStock = new Map<string, string>([
  [CompanyName.ECorp, 'ECP'],
  [CompanyName.MegaCorp, 'MGCP'],
  [CompanyName.BladeIndustries, 'BLD'],
  [CompanyName.ClarkeIncorporated, 'CLRK'],
  [CompanyName.OmniTekIncorporated, 'OMTK'],
  [CompanyName.FourSigma, 'FSIG'],
  [CompanyName.KuaiGongInternational, 'KGI'],
  [CompanyName.FulcrumTechnologies, 'FLCM'],
  [CompanyName.StormTechnologies, 'STM'],
  [CompanyName.DefComm, 'DCOMM'],
  [CompanyName.HeliosLabs, 'HLS'],
  [CompanyName.VitaLife, 'VITA'],
  [CompanyName.IcarusMicrosystems, 'ICRS'],
  [CompanyName.UniversalEnergy, 'UNV'],
  [CompanyName.AeroCorp, 'AERO'],
  [CompanyName.OmniaCybersystems, 'OMN'],
  [CompanyName.SolarisSpaceSystems, 'SLRS'],
  [CompanyName.GlobalPharmaceuticals, 'GPH'],
  [CompanyName.NovaMedical, 'NVMD'],
  [CompanyName.WatchdogSecurity, 'WDS'],
  [CompanyName.LexoCorp, 'LXO'],
  [CompanyName.RhoConstruction, 'RHOC'],
  [CompanyName.AlphaEnterprises, 'APHE'],
  [CompanyName.SysCoreSecurities, 'SYSC'],
  [CompanyName.CompuTek, 'CTK'],
  [CompanyName.NetLinkTechnologies, 'NTLK'],
  [CompanyName.OmegaSoftware, 'OMGA'],
  [CompanyName.FoodNStuff, 'FNS'],
  ['Sigma Cosmetics', 'SGC'],
  [CompanyName.JoesGuns, 'JGN'],
  ['Catalyst Ventures', 'CTYS'],
  ['Microdyne Technologies', 'MDYN'],
  ['Titan Laboratories', 'TITN'],
]);

export const stockComp = new Map<string, CompanyName>([
  ['ECP', CompanyName.ECorp],
  ['MGCP', CompanyName.MegaCorp],
  ['BLD', CompanyName.BladeIndustries],
  ['CLRK', CompanyName.ClarkeIncorporated],
  ['OMTK', CompanyName.OmniTekIncorporated],
  ['FSIG', CompanyName.FourSigma],
  ['KGI', CompanyName.KuaiGongInternational],
  ['FLCM', CompanyName.FulcrumTechnologies],
  ['STM', CompanyName.StormTechnologies],
  ['DCOMM', CompanyName.DefComm],
  ['HLS', CompanyName.HeliosLabs],
  ['VITA', CompanyName.VitaLife],
  ['ICRS', CompanyName.IcarusMicrosystems],
  ['UNV', CompanyName.UniversalEnergy],
  ['AERO', CompanyName.AeroCorp],
  ['OMN', CompanyName.OmniaCybersystems],
  ['SLRS', CompanyName.SolarisSpaceSystems],
  ['GPH', CompanyName.GlobalPharmaceuticals],
  ['NVMD', CompanyName.NovaMedical],
  ['WDS', CompanyName.WatchdogSecurity],
  ['LXO', CompanyName.LexoCorp],
  ['RHOC', CompanyName.RhoConstruction],
  ['APHE', CompanyName.AlphaEnterprises],
  ['SYSC', CompanyName.SysCoreSecurities],
  ['CTK', CompanyName.CompuTek],
  ['NTLK', CompanyName.NetLinkTechnologies],
  ['OMGA', CompanyName.OmegaSoftware],
  ['FNS', CompanyName.FoodNStuff],
  ['JGN', CompanyName.JoesGuns],
]);

/** @public */
export enum JobName {
  software0 = 'Software Engineering Intern',
  software1 = 'Junior Software Engineer',
  software2 = 'Senior Software Engineer',
  software3 = 'Lead Software Developer',
  software4 = 'Head of Software',
  software5 = 'Head of Engineering',
  software6 = 'Vice President of Technology',
  software7 = 'Chief Technology Officer',
  IT0 = 'IT Intern',
  IT1 = 'IT Analyst',
  IT2 = 'IT Manager',
  IT3 = 'Systems Administrator',
  securityEng = 'Security Engineer',
  networkEng0 = 'Network Engineer',
  networkEng1 = 'Network Administrator',
  business0 = 'Business Intern',
  business1 = 'Business Analyst',
  business2 = 'Business Manager',
  business3 = 'Operations Manager',
  business4 = 'Chief Financial Officer',
  business5 = 'Chief Executive Officer',
  security0 = 'Security Guard',
  security1 = 'Security Officer',
  security2 = 'Security Supervisor',
  security3 = 'Head of Security',
  agent0 = 'Field Agent',
  agent1 = 'Secret Agent',
  agent2 = 'Special Operative',
  waiter = 'Waiter',
  employee = 'Employee',
  softwareConsult0 = 'Software Consultant',
  softwareConsult1 = 'Senior Software Consultant',
  businessConsult0 = 'Business Consultant',
  businessConsult1 = 'Senior Business Consultant',
  waiterPT = 'Part-time Waiter',
  employeePT = 'Part-time Employee',
}

/** Names of all locations
 * @public */
export enum LocationName {
  AevumAeroCorp = 'AeroCorp',
  AevumBachmanAndAssociates = 'Bachman & Associates',
  AevumClarkeIncorporated = 'Clarke Incorporated',
  AevumCrushFitnessGym = 'Crush Fitness Gym',
  AevumECorp = 'ECorp',
  AevumFulcrumTechnologies = 'Fulcrum Technologies',
  AevumGalacticCybersystems = 'Galactic Cybersystems',
  AevumNetLinkTechnologies = 'NetLink Technologies',
  AevumPolice = 'Aevum Police Headquarters',
  AevumRhoConstruction = 'Rho Construction',
  AevumSnapFitnessGym = 'Snap Fitness Gym',
  AevumSummitUniversity = 'Summit University',
  AevumWatchdogSecurity = 'Watchdog Security',
  AevumCasino = 'Iker Molina Casino',

  ChongqingKuaiGongInternational = 'KuaiGong International',
  ChongqingSolarisSpaceSystems = 'Solaris Space Systems',
  ChongqingChurchOfTheMachineGod = 'Church of the Machine God',

  Sector12AlphaEnterprises = 'Alpha Enterprises',
  Sector12BladeIndustries = 'Blade Industries',
  Sector12CIA = 'Central Intelligence Agency',
  Sector12CarmichaelSecurity = 'Carmichael Security',
  Sector12CityHall = 'Sector-12 City Hall',
  Sector12DeltaOne = 'DeltaOne',
  Sector12FoodNStuff = 'FoodNStuff',
  Sector12FourSigma = 'Four Sigma',
  Sector12IcarusMicrosystems = 'Icarus Microsystems',
  Sector12IronGym = 'Iron Gym',
  Sector12JoesGuns = "Joe's Guns",
  Sector12MegaCorp = 'MegaCorp',
  Sector12NSA = 'National Security Agency',
  Sector12PowerhouseGym = 'Powerhouse Gym',
  Sector12RothmanUniversity = 'Rothman University',
  Sector12UniversalEnergy = 'Universal Energy',

  NewTokyoDefComm = 'DefComm',
  NewTokyoGlobalPharmaceuticals = 'Global Pharmaceuticals',
  NewTokyoNoodleBar = 'Noodle Bar',
  NewTokyoVitaLife = 'VitaLife',
  NewTokyoArcade = 'Arcade',

  IshimaNovaMedical = 'Nova Medical',
  IshimaOmegaSoftware = 'Omega Software',
  IshimaStormTechnologies = 'Storm Technologies',
  IshimaGlitch = '0x6C1',

  VolhavenCompuTek = 'CompuTek',
  VolhavenHeliosLabs = 'Helios Labs',
  VolhavenLexoCorp = 'LexoCorp',
  VolhavenMilleniumFitnessGym = 'Millenium Fitness Gym',
  VolhavenNWO = 'NWO',
  VolhavenOmniTekIncorporated = 'OmniTek Incorporated',
  VolhavenOmniaCybersystems = 'Omnia Cybersystems',
  VolhavenSysCoreSecurities = 'SysCore Securities',
  VolhavenZBInstituteOfTechnology = 'ZB Institute of Technology',

  Hospital = 'Hospital',
  Slums = 'The Slums',
  TravelAgency = 'Travel Agency',
  WorldStockExchange = 'World Stock Exchange',

  Void = 'The Void',
}

/** @public */
export enum UniversityClassType {
  computerScience = 'Computer Science',
  dataStructures = 'Data Structures',
  networks = 'Networks',
  algorithms = 'Algorithms',
  management = 'Management',
  leadership = 'Leadership',
}

/** @public */
export enum FactionWorkType {
  hacking = 'hacking',
  field = 'field',
  security = 'security',
}

/**
 * @returns {string[]} list of factions
 * @remarks RAM cost: 0 GB
 */
export function getFactions(): string[] {
  const factions: string[] = [
    'CyberSec',
    'Tian Di Hui',
    'Netburners',
    'Shadows of Anarchy',
    'Sector-12',
    'Chongqing',
    'New Tokyo',
    'Ishima',
    'Aevum',
    'Volhaven',
    'NiteSec',
    'The Black Hand',
    'BitRunners',
    'ECorp',
    'MegaCorp',
    'KuaiGong International',
    'Four Sigma',
    'NWO',
    'Blade Industries',
    'OmniTek Incorporated',
    'Bachman & Associates',
    'Clarke Incorporated',
    'Fulcrum Secret Technologies',
    'Slum Snakes',
    'Tetrads',
    'Silhouette',
    'Speakers for the Dead',
    'The Dark Army',
    'The Syndicate',
    'The Covenant',
    'Daedalus',
    'Illuminati',
  ];
  return factions;
}

export async function installBackdoor(ns: NS, target: string) {
  const sin = ns.singularity;
  const route = await findServer(ns, target);
  let server = ns.getServer(target);
  while (!server.hasAdminRights) {
    sin.connect('home');
    while (!ns.run('nuke.js', 1, target)) {
      await ns.sleep(100);
    }
    await ns.sleep(100);
    server = ns.getServer(target);
  }
  if (server.backdoorInstalled) {
    return;
  }
  for (let i = 0; i < route.length; i++) {
    sin.connect(route[i]);
  }
  ns.tprint('Installing backdoor on ' + target + '...');
  ns.print('Installing backdoor on ' + target + '...');
  await sin.installBackdoor();
  sin.connect('home');
}

function recursiveScan(ns: NS, parent: string, server: string, target: string, route: string[]) {
  const children = ns.scan(server);
  for (const child of children) {
    if (parent == child) {
      continue;
    }
    if (child == target) {
      route.unshift(child);
      route.unshift(server);
      return true;
    }

    if (recursiveScan(ns, server, child, target, route)) {
      route.unshift(server);
      return true;
    }
  }
  return false;
}

export const UniversityServers = new Map<LocationName, string>([
  [LocationName.Sector12RothmanUniversity, 'rothman-uni'],
  [LocationName.AevumSummitUniversity, 'summit-uni'],
  [LocationName.VolhavenZBInstituteOfTechnology, 'zb-institute'],
]);

export async function findServer(ns: NS, server: string) {
  const route: string[] = [];

  recursiveScan(ns, '', 'home', server, route);
  // for (const i in route) {
  //     await ns.sleep(500);
  //     const extra = i > 0 ? "└ " : "";
  //     ns.tprint(`${" ".repeat(i)}${extra}${route[i]}`);
  // }
  return route;
}

/**
 * Parses a number passed as a string formatted with a suffix and returns the literal number
 * @param input string containing number formatted with a suffix
 * @returns literal number
 */
export function parseFormattedNumber(input: string): number {
  input = input.replace('k', '*10**3');
  input = input.replace('m', '*10**6');
  input = input.replace('b', '*10**9');
  input = input.replace('t', '*10**12');
  return parseInt(eval(input), 10);
}

export async function upgradeHashCapacity(ns: NS, cost: number) {
  const net = ns.hacknet;
  while (cost > net.hashCapacity()) {
    let targetCache = 0;
    let bestValue = 0;
    const numNodes = net.numNodes();
    for (let i = 0; i < numNodes; i++) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const upValue = (32 * 2 ** net.getNodeStats(i).cache!) / net.getCacheUpgradeCost(i);
      if (upValue > bestValue) {
        targetCache = i;
        bestValue = upValue;
      }
    }
    if (net.getNodeStats(targetCache).cache == 15 && net.numNodes() < net.maxNumNodes()) {
      ns.print('Purchasing new node...');
      while (net.getPurchaseNodeCost() > ns.getServerMoneyAvailable('home')) {
        await ns.sleep(1000);
      }
      net.purchaseNode();
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    } else if (net.getNodeStats(targetCache).cache! < 15) {
      ns.print('Upgrading hash cache ' + targetCache);
      while (net.getCacheUpgradeCost(targetCache) > ns.getServerMoneyAvailable('home')) {
        await ns.sleep(1000);
      }
      net.upgradeCache(targetCache);
    }
  }
  return true;
}

/**
 *
 * @remarks RAM cost: 0.5 GB
 * @param ns
 * @param skill - The player skill to be returned
 */
export function getSkill(ns: NS, skill: string): number {
  const player = ns.getPlayer();
  switch (skill) {
    case 'hacking':
      return player.skills.hacking;
    case 'strength':
      return player.skills.strength;
    case 'defense':
      return player.skills.defense;
    case 'dexterity':
      return player.skills.dexterity;
    case 'agility':
      return player.skills.agility;
    case 'charisma':
      return player.skills.charisma;
    default:
      ns.print('ERROR: ' + skill + ' is not a skill');
      return -1;
  }
}

export function getCombatStats(ns: NS) {
  const player = ns.getPlayer();
  return [player.skills.strength, player.skills.defense, player.skills.dexterity, player.skills.agility];
}

export enum Color {
  black = 'black',
  red = 'red',
  green = 'green',
  yellow = 'yellow',
  blue = 'blue',
  magenta = 'magenta',
  cyan = 'cyan',
  white = 'white',
}

/**
 * function to allow for arbitrary colors in print and tprint statements.
 * @param x text of the message to be colored
 * @param color desired text color
 */
export function colorPicker(x: string, color: Color): string {
  // x = what you want colored
  let y;
  switch (color) {
    case 'black':
      y = `\u001b[30m${x}\u001b[0m`;
      break;
    case 'red':
      y = `\u001b[31m${x}\u001b[0m`;
      break;
    case 'green':
      y = `\u001b[32m${x}\u001b[0m`;
      break;
    case 'yellow':
      y = `\u001b[33m${x}\u001b[0m`;
      break;
    case 'blue':
      y = `\u001b[34m${x}\u001b[0m`;
      break;
    case 'magenta':
      y = `\u001b[35m${x}\u001b[0m`;
      break;
    case 'cyan':
      y = `\u001b[36m${x}\u001b[0m`;
      break;
    case 'white':
      y = `\u001b[37m${x}\u001b[0m`;
      break;
    default:
      y = `\u001b[38;5;${color}m${x}\u001b[0m`;
  }
  return y;
}

export function calculateStaminaGainPerSecond(ns: NS): number {
  const StaminaGainPerSecond = 0.0085;
  const MaxStaminaToGainFactor = 70000;
  const bb = ns.bladeburner;
  const player = ns.getPlayer();
  const effAgi = bb.getSkillLevel('Reaper') * 2 + bb.getSkillLevel('EvasiveSystem') * 4;
  const effAgility = player.skills.agility * effAgi;
  const maxStaminaBonus = bb.getStamina()[1] / MaxStaminaToGainFactor;
  const gain = (StaminaGainPerSecond + maxStaminaBonus) * Math.pow(effAgility, 0.17);
  return gain * (player.mults.bladeburner_max_stamina * player.mults.bladeburner_stamina_gain);
}

// // There is currently no way to get the contract success chance for sleeves, this is my current progress of reverse
// // engineering my own from the source code
// class bbAction {
//   constructor(
//     _name: string,
//     _type: string,
//     _baseDifficulty: number,
//     _difficultyFactor: number,
//     _isStealth?: boolean,
//     _isKill?: boolean,
//   ) {
//     this.name = _name;
//     this.type = _type;
//     this.baseDifficulty = _baseDifficulty;
//     this.difficultyFac = _difficultyFactor;
//     this.isStealth = _isStealth;
//     this.isKill = _isKill;
//   }

//   name = '';
//   type = '';
//   baseDifficulty = 100;
//   difficultyFac = 1.01;
//   isStealth? = false;
//   isKill? = false;
// }

// const bbActions: Record<string, bbAction> = {
//   Tracking: {
//     name: 'Tracking',
//     type: 'Contract',
//     baseDifficulty: 125,
//     difficultyFac: 1.02,
//     isStealth: true,
//   },
//   ['Bounty Hunter']: {
//     name: 'Bounty Hunter',
//     type: 'Contract',
//     baseDifficulty: 250,
//     difficultyFac: 1.04,
//     isKill: true,
//   },
//   Retirement: {
//     name: 'Retirement',
//     type: 'Contract',
//     baseDifficulty: 200,
//     difficultyFac: 1.03,
//     isKill: true,
//   },
//   Investigation: {
//     name: 'Investigation',
//     type: 'Operation',
//     baseDifficulty: 400,
//     difficultyFac: 1.03,
//     isStealth: true,
//   },
// };

// export function bbSuccessChance(ns: NS, person: Person, actionName: string) {
//   if (!ns.bladeburner.inBladeburner) {
//     return 0;
//   }
//   if (bbActions[actionName] == null) {
//     ns.print('ERROR: ' + actionName + ' not found');
//     return 0;
//   }

//   const action = bbActions[actionName];
//   const difficulty =
//     action.baseDifficulty *
//     Math.pow(action.difficultyFac, ns.bladeburner.getActionCurrentLevel(action.type, action.name));
//   let competence = 0;
//   for (const stat of Object.keys(person.skills))
// }
