import { CorpIndustryName, NS } from '@ns';
import { CityName } from './helpers';

/** @param {NS} ns */
export async function main(ns: NS) {
  /*
   * Easy-Mode Bitburner Corporation Script for BN3 v1.0
   * Based off of the BN3 Quick-Start Guide by DarkTechnomancer.
   * Bitnode Corp Valuation modifiers are not taken into consideration.
   * Usage outside of BN1 or BN3 not guaranteed.
   * Script developed with a stage-by-stage approach to allow users to:
   * - understand the corporation development process from creation to printing money
   *  - see where your corporation is being stalled at (if modified or outside of BN1 or BN3)
   * Functions are designed to return true once their conditions are met or exceeded. This
   * ensures we can restart the script as many times as needed with no issues.
   * Comments added to many portions of the script to try to explain my thought process.
   *
   * Note: It can rarely get stuck waiting for the second investment. Not entirely sure what
   * causes it, may be related to the initial employee stat RNG. If it does, just buy a level
   * or two of some of the employee upgrades. Maybe fix it later.
   */
  ns.tail();
  const pid = ns.getRunningScript()?.pid;
  ns.writePort(1, pid ? pid : ns.getScriptName());
  ns.disableLog('ALL');
  ns.clearLog();
  ns.moveTail(1605, 0);
  const corp = _getCorp();
  const agri = 'agri';
  const chem = 'chem';
  const tobacco = 'weed'; //  tobacco is bad for you :)
  const investAmounts = {
    1: 31e10, //  310b
    2: 31e11, //  3.1t
    3: 12e12, //  12t
    4: 5e14, //  500t
  };
  let corpname = 'DredCorp';
  const bn = ns.getResetInfo().currentNode;
  let state = 0;
  let bestOffer = 0;
  const cityNames = CityName;
  // {
  //   Aevum: CityName.Aevum,
  //   Chongqing: CityName.Chongqing,
  //   Sector12: "Sector-12",
  //   NewTokyo: "New Tokyo",
  //   Ishima: "Ishima",
  //   Volhaven: "Volhaven"
  // }
  enum industryNames {
    WaterUtil = 'Water Utilities',
    SpringWater = 'Spring Water',
    Agriculture = 'Agriculture',
    Fishing = 'Fishing',
    Mining = 'Mining',
    Refining = 'Refinery',
    Restaurant = 'Restaurant',
    Tobacco = 'Tobacco',
    Chemical = 'Chemical',
    Pharmaceutical = 'Pharmaceutical',
    ComputerHardware = 'Computer Hardware',
    Robotics = 'Robotics',
    Software = 'Software',
    Healthcare = 'Healthcare',
    RealEstate = 'Real Estate',
  }
  const materialNames = {
    Water: 'Water',
    Ore: 'Ore',
    Minerals: 'Minerals',
    Food: 'Food',
    Plants: 'Plants',
    Metal: 'Metal',
    Hardware: 'Hardware',
    Chemicals: 'Chemicals',
    Drugs: 'Drugs',
    Robots: 'Robots',
    AiCores: 'AI Cores',
    RealEstate: 'Real Estate',
  };
  const jobNames = {
    Operations: 'Operations',
    Engineer: 'Engineer',
    Business: 'Business',
    Management: 'Management',
    RandD: 'Research & Development',
    Intern: 'Intern',
    Unassigned: 'Unassigned',
  };
  const researchNames = {
    Lab: 'Hi-Tech R&D Laboratory',
    AutoBrew: 'AutoBrew',
    AutoParty: 'AutoPartyManager',
    AutoDrug: 'Automatic Drug Administration',
    CPH4Inject: 'CPH4 Injections',
    Drones: 'Drones',
    DronesAssembly: 'Drones - Assembly',
    DronesTransport: 'Drones - Transport',
    GoJuice: 'Go-Juice',
    RecruitHR: 'HRBuddy-Recruitment',
    TrainingHR: 'HRBuddy-Training',
    MarketTa1: 'Market-TA.I',
    MarketTa2: 'Market-TA.II',
    Overclock: 'Overclock',
    SelfCorrectAssemblers: 'Self-Correcting Assemblers',
    Stimu: 'Sti.mu',
    Capacity1: 'uPgrade: Capacity.I',
    Capacity2: 'uPgrade: Capacity.II',
    Dashboard: 'uPgrade: Dashboard',
    Fulcrum: 'uPgrade: Fulcrum',
  };
  const upgradeNames = {
    SmartFactories: 'Smart Factories',
    SmartStorage: 'Smart Storage',
    DreamSense: 'DreamSense',
    WilsonAnalytics: 'Wilson Analytics',
    NuoptimalNootropicInjectorImplants: 'Nuoptimal Nootropic Injector Implants',
    SpeechProcessorImplants: 'Speech Processor Implants',
    NeuralAccelerators: 'Neural Accelerators',
    FocusWires: 'FocusWires',
    ABCSalesBots: 'ABC SalesBots',
    ProjectInsight: 'Project Insight',
  };
  const unlockNames = {
    Export: 'Export',
    SmartSupply: 'Smart Supply',
    MarketResearchDemand: 'Market Research - Demand',
    MarketDataCompetition: 'Market Data - Competition',
    VeChain: 'VeChain',
    ShadyAccounting: 'Shady Accounting',
    GovernmentPartnership: 'Government Partnership',
    WarehouseAPI: 'Warehouse API',
    OfficeAPI: 'Office API',
  };
  ///////////////////////////////////////////////////////////////////////////////////////////
  //  script startup. we run this before we enter the main while() loop
  if (!corp.hasCorporation()) {
    let created = false;
    while (created == false) {
      if (bn == 3) {
        created = corp.createCorporation(corpname, false);
      } else {
        if (ns.getPlayer().money > 15e10) {
          created = corp.createCorporation(corpname, true);
        } else {
          ns.print('Not enough funds to create a corp yet.');
          await ns.sleep(10000);
        }
      }
    }
    state = 1;
  } else {
    state = 1;
    //  update our corpname var in case the player already has a corp
    //  todo: check if the player already has divisions and update those names as well
    corpname = corp.getCorporation().name;
  }
  if (
    !corp.hasUnlock(unlockNames.SmartSupply) &&
    corp.getCorporation().funds > corp.getUnlockCost(unlockNames.SmartSupply)
  ) {
    corp.purchaseUnlock(unlockNames.SmartSupply);
  }
  ///////////////////////////////////////////////////////////////////////////////////////////
  while (true) {
    ns.setTitle(corp.getCorporation().name + ' State: ' + state);
    ns.resizeTail(300, 300); //resizeTail() is used to refresh the tail window faster than normal
    ns.clearLog();
    ns.print(corp.getCorporation().name + ' State: ' + state);
    tendToWorkers();
    setSellPrices();
    let juiced = 0;
    switch (state) {
      case 1: //  expand into our first division, agriculture
        if (expandNewDivision(industryNames.Agriculture, agri)) state++;
        break;
      case 2: //  expand the warehouses in each city
        if (expandWarehouse(agri, 5)) state++;
        break;
      case 3: //  buy our first advert and get the first levels of storage upgrade
        ns.print('First advertising...');
        if (corp.getHireAdVertCount(agri) == 0) corp.hireAdVert(agri);
        if (purchaseUpgrade(upgradeNames.SmartStorage, false, 3)) state++;
        break;
      case 4: //  expand our offices
        if (expandOffice(agri, 3, false)) state++;
        break;
      case 5: //  hire and distribute employees for a few initial research points
        //  We check against current number of employees to determine if we've already passed
        // this stage in the script (i.e if it has already been ran previously). This way we
        // don't accidently end up with unassigned employees.
        if (corp.getOffice(agri, cityNames.Aevum).numEmployees == 3) {
          assignJobs(agri, 0, 0, 0, 0, 0, false);
          if (assignJobs(agri, 1, 1, 0, 0, 1, false)) state++;
        } else state++;
        break;
      case 6: //  wait for employee stats
        for (const city of Object.values(cityNames)) {
          if (corp.getOffice(agri, city).avgEnergy > 98 && corp.getOffice(agri, city).avgMorale > 98) juiced++;
        }
        if (juiced == 6) state++;
        break;
      case 7: //  purchase our materials. brute forces it, no need to wait on corp states.
        if (purchaseMats(agri, { Hardware: 1060, 'AI Cores': 1234, 'Real Estate': 74392 })) state++;
        break;
      case 8: //  redistribute our employees for money gain
        if (corp.getOffice(agri, cityNames.Aevum).numEmployees == 3) {
          assignJobs(agri, 0, 0, 0, 0, 0, false);
          if (assignJobs(agri, 1, 1, 1, 0, 0, false)) state++;
        } else state++;
        break;
      case 9: //  wait for our first investment
        if (waitForInvestment(1)) state++;
        break;
      case 10: // expand warehouses again
        if (expandWarehouse(agri, 10)) state++;
        break;
      case 11: //  hire more employees
        if (expandOffice(agri, 15, false)) state++;
        break;
      case 12: //  assign them
        if (corp.getOffice(agri, cityNames.Aevum).numEmployees == 15) {
          assignJobs(agri, 0, 0, 0, 0, 0, false);
          if (assignJobs(agri, 5, 3, 5, 1, 1, false)) state++;
        } else state++;
        break;
      case 13: //  purchase more levels of smart storage and smart factories
        if (
          purchaseUpgrade(upgradeNames.SmartStorage, false, 10) &&
          purchaseUpgrade(upgradeNames.SmartFactories, false, 10)
        )
          state++;
        break;
      case 14: //  second round of agri mats
        if (purchaseMats(agri, { Hardware: 2800, Robots: 96, 'AI Cores': 2520, 'Real Estate': 146400 })) state++;
        break;
      case 15: //  buy 4 levels of the employee upgrades and wait for 2nd round investment
        bideTimeForInvestment();
        if (waitForInvestment(2)) state++;
        break;
      case 16: //  final agri warehouse upgrades
        if (expandWarehouse(agri, 25)) state++;
        break;
      case 17: //  more smart storage & factory upgrades
        if (
          purchaseUpgrade(upgradeNames.SmartStorage, false, 20) &&
          purchaseUpgrade(upgradeNames.SmartFactories, false, 20)
        )
          state++;
        break;
      case 18: //  fill our agri warehouses, 501 prod mult
        if (purchaseMats(agri, { Hardware: 9300, Robots: 726, 'AI Cores': 6270, 'Real Estate': 230400 })) state++;
        break;
      /*
       * Most stages beyond this point aren't included in the guide and are very likely unoptimized.
       * Poke around and post your results/improvements in the official Bitburner discord!
       */
      case 19: //  hire the rest of our agri employees
        if (expandOffice(agri, 30, false)) state++;
        break;
      case 20: //  assign them
        if (corp.getOffice(agri, cityNames.Aevum).numEmployees == 30) {
          assignJobs(agri, 0, 0, 0, 0, 0, false);
          if (assignJobs(agri, 10, 6, 10, 2, 2, false)) state++;
        } else state++;
        break;
      case 21: //  purchase exporting
        if (!corp.hasUnlock(unlockNames.Export)) {
          ns.print('Purchasing export upgrade...');
          try {
            corp.purchaseUnlock(unlockNames.Export);
          } catch {
            break;
          }
        }
        if (expandNewDivision(industryNames.Chemical, chem)) state++;
        break;
      case 22: //  expand into chem
        if (expandWarehouse(chem, 1)) state++;
        break;
      case 23: //  expand chem office
        if (expandOffice(chem, 40, false)) state++;
        break;
      case 24: //  hire chem employees
        if (corp.getOffice(chem, cityNames.Aevum).numEmployees == 40) {
          assignJobs(chem, 0, 0, 0, 0, 0, false);
          if (assignJobs(chem, 23, 15, 0, 1, 1, false)) state++;
        } else state++;
        break;
      case 25: //  expand into tobacco
        if (expandNewDivision(industryNames.Tobacco, tobacco)) state++;
        break;
      case 26: //  tobacco warehouses
        if (expandWarehouse(tobacco, 1)) state++;
        break;
      case 27: //  expand tobacco offices in our non-product cities
        if (expandOffice(tobacco, 40, false)) state++;
        break;
      case 29: //   expand tobacco offices in our product development city
        if (expandOffice(tobacco, 70, true)) state++;
        break;
      case 28: //  assign employees in research slave cities
        if (corp.getOffice(tobacco, cityNames.Aevum).numEmployees == 40) {
          assignJobs(tobacco, 0, 0, 0, 0, 0, false);
          if (assignJobs(tobacco, 1, 1, 1, 1, 36, false)) state++;
        } else state++;
        break;
      case 30: //  assign employees in product development city
        if (corp.getOffice(tobacco, cityNames.Sector12).numEmployees == 70) {
          assignJobs(tobacco, 0, 0, 0, 0, 0, true);
          if (assignJobs(tobacco, 20, 20, 10, 20, 0, true)) state++;
        } else state++;
        break;
      case 31: //  create our initial products and set up exports
        maintainProducts();
        exportMaterials(agri, materialNames.Plants, tobacco, '-IPROD');
        exportMaterials(agri, materialNames.Plants, chem, '-IPROD');
        exportMaterials(chem, materialNames.Chemicals, agri, '-IPROD');
        state++;
        break;
      case 32: //  more employee upgrades
        maintainProducts();
        if (purchaseUpgrade(upgradeNames.SmartStorage, false, 25)) {
          if (purchaseUpgrade(upgradeNames.SmartFactories, false, 25)) {
            if (purchaseUpgrade(upgradeNames.ABCSalesBots, false, 25)) {
              if (purchaseUpgrade(upgradeNames.FocusWires, false, 25)) {
                if (purchaseUpgrade(upgradeNames.NeuralAccelerators, false, 25)) {
                  if (purchaseUpgrade(upgradeNames.NuoptimalNootropicInjectorImplants, false, 25)) {
                    if (purchaseUpgrade(upgradeNames.SpeechProcessorImplants, false, 25)) {
                      state++;
                    }
                  }
                }
              }
            }
          }
        }
        break;
      case 33: //  3rd investment round
        ns.print('Securing investments...');
        maintainProducts();
        if (waitForInvestment(3)) state++;
        break;
      case 34: //  upgrade tobacco offices
        ns.print('Expanding ' + tobacco + ' offices...');
        maintainProducts();
        if (expandOffice(tobacco, 100, false)) state++;
        break;
      case 35: //  hire and redistribute workers
        ns.print('Hiring ' + tobacco + ' workers...');
        maintainProducts();
        if (corp.getOffice(tobacco, cityNames.Aevum).numEmployees == 100) {
          assignJobs(tobacco, 0, 0, 0, 0, 0, false);
          if (assignJobs(tobacco, 1, 1, 1, 1, 96, false)) {
            assignJobs(tobacco, 0, 0, 0, 0, 0, true);
            if (assignJobs(tobacco, 28, 28, 16, 28, 0, true)) {
              state++;
            }
          }
        } else state++;
        break;
      case 36: //  dump all our cash into Project Insight and wait for research points 1
        ns.print('Waiting for research...');
        maintainProducts();
        if (waitForResearch(tobacco, 1)) state++;
        break;
      case 37: //  dump all our remaining cash into employee upgrades
        ns.print('Purchasing upgrades...');
        ns.print('Waiting for research...');
        maintainProducts();
        maintainUpgrades();
        if (waitForResearch(tobacco, 2)) state++;
        break;
      case 38: //  we now have marketTA2, time for 4th investment
        ns.print('Securing investment...');
        maintainProducts();
        maintainUpgrades();
        if (waitForInvestment(4)) state++;
        break;
      case 39: //  go public and start leeching cash
        ns.print('Going public...');
        maintainProducts();
        maintainUpgrades();
        if (!corp.getCorporation().public) {
          corp.goPublic(0);
          corp.issueDividends(0.01); // apparently it's 0-1 here but 0-100 in the corp ui
          state++;
        } else state++;
        break;
      case 40: //  dump our cash into wilson and adverts
        ns.print('Purchasing advertising...');
        maintainProducts();
        maintainUpgrades();
        if (wilsonTime(tobacco)) state++;
        break;
      case 41: //  corp done, entering maintenance mode
        ns.print(ns.getScriptName() + ' finished, holding for maintenace mode...');
        maintainProducts();
        maintainUpgrades();
        break;
      default:
        ns.tprint('hit the default case in corp script, something went wrong.');
        return;
    }
    await ns.sleep(100);
  }
  ///////////////////////////////////////////////////////////////////////////////////////////
  /** makes typing stuff easier */
  function _getCorp() {
    //
    return ns.corporation;
  }
  /** keep our employees happy */
  function tendToWorkers() {
    if (corp.getCorporation().divisions.length == 0) return;
    for (const div of corp.getCorporation().divisions) {
      for (const city of corp.getDivision(div).cities) {
        if (corp.getOffice(div, city).avgEnergy <= 98) corp.buyTea(div, city);
        if (corp.getOffice(div, city).avgMorale <= 98) corp.throwParty(div, city, 1e6);
      }
    }
  }
  ///////////////////////////////////////////////////////////////////////////////////////////
  /** designed to accept expansion into any industry */
  function expandNewDivision(type: CorpIndustryName, name = '') {
    ns.print('Expanding into ' + type + '...');
    let created = false;
    let presence = 0;
    const divs = corp.getCorporation().divisions;
    if (!divs.includes(name)) {
      const cost = corp.getIndustryData(type).startingCost;
      if (corp.getCorporation().funds > cost) {
        corp.expandIndustry(type, name);
        created = true;
      } else return false;
    } else created = true;
    for (const city of Object.values(cityNames)) {
      if (!corp.getDivision(name).cities.includes(city)) {
        if (corp.getCorporation().funds > 4e9) {
          corp.expandCity(name, city);
          presence++;
        }
      } else presence++;
    }
    if (created && presence == 6) return true;
    return false;
  }
  ///////////////////////////////////////////////////////////////////////////////////////////
  function expandWarehouse(div = '', level = 1) {
    ns.printf('Expanding %s warehouses to level %d', div, level);
    let upgraded = 0;
    let warehouses = 0;
    for (const city of Object.values(cityNames)) {
      if (!corp.hasWarehouse(div, city)) {
        if (corp.getCorporation().funds > 5e9) {
          corp.purchaseWarehouse(div, city);
          warehouses++;
        } else continue;
      } else warehouses++;
      //  we make sure warehouses were purchased in each city
      const currentLevel = corp.getWarehouse(div, city).level;
      const levelsNeeded = level - currentLevel;
      if (levelsNeeded <= 0) {
        upgraded++;
        continue;
      }
      //  and keep count of how many still need to be upgraded
      const cost = corp.getUpgradeWarehouseCost(div, city, levelsNeeded);
      if (corp.getCorporation().funds > cost) {
        corp.upgradeWarehouse(div, city, levelsNeeded);
        upgraded++;
      }
      corp.setSmartSupply(div, city, true); // redundant smart supply check for safety
    } //  if we have all 6 warehouses and they're all at least at the level we want, return true
    if (upgraded == 6 && warehouses == 6) return true;
    return false;
  }
  ///////////////////////////////////////////////////////////////////////////////////////////
  /** I chose Sector12 as my product development city because it's first in the list in the
   *   division tabs. could be modified to any city or further modified to a global variable.
   *   Further improvements could use a formula to expand office size.
   */
  function expandOffice(div = '', size = 0, justS12 = false) {
    let finished = 0;
    for (const city of Object.values(cityNames)) {
      if (justS12 == true && city != cityNames.Sector12) continue;
      const needed = size - corp.getOffice(div, city).size;
      if (needed > 0) {
        const cost = corp.getOfficeSizeUpgradeCost(div, city, needed);
        if (corp.getCorporation().funds > cost) {
          corp.upgradeOfficeSize(div, city, needed);
        } else {
          continue;
        }
      }
      while (corp.getOffice(div, city).numEmployees < corp.getOffice(div, city).size) {
        corp.hireEmployee(div, city);
      }
      if (corp.getOffice(div, city).size >= size) {
        finished++;
      }
    }
    ns.printf('Expanding %s offices to %d', div, size);
    ns.printf('Finished: %d/%d', finished, justS12 ? 1 : 6);
    if (finished == 6 || (finished == 1 && justS12)) return true;
    return false;
  }
  ///////////////////////////////////////////////////////////////////////////////////////////
  /** we could change the function to auto assign 0's before reassigning but calling the
   *  function twice works too. Further improvements could use a formula to automatically
   *  assign the right amount of employees to each division.
   */
  function assignJobs(
    div = '',
    operations = 0,
    engineers = 0,
    business = 0,
    managers = 0,
    researchers = 0,
    justS12 = false,
  ) {
    let assigned = 0; //  used to ensure we've assigned all employees successfully
    ns.printf('Assigning %s employees:', div);
    ns.print('Operations:   ' + operations);
    ns.print('Engineers:    ' + engineers);
    ns.print('Business:     ' + business);
    ns.print('Managers:     ' + managers);
    ns.print('Researchers:  ' + researchers);
    for (const city of Object.values(cityNames)) {
      if (justS12 == true && city != cityNames.Sector12) continue;
      if (corp.setAutoJobAssignment(div, city, jobNames.Operations, operations)) assigned++;
      if (corp.setAutoJobAssignment(div, city, jobNames.Engineer, engineers)) assigned++;
      if (corp.setAutoJobAssignment(div, city, jobNames.Business, business)) assigned++;
      if (corp.setAutoJobAssignment(div, city, jobNames.Management, managers)) assigned++;
      if (corp.setAutoJobAssignment(div, city, jobNames.RandD, researchers)) assigned++;
    } //  6 cities * 5 jobs = 30, or just 5 if we're only assigning to our prod city
    ns.printf('Assigned: %d/%d', assigned, justS12 ? 5 : 30);
    if (assigned == 30 || (assigned == 5 && justS12)) return true;
    return false;
  }
  ///////////////////////////////////////////////////////////////////////////////////////////
  /** todo: swap the args for an object similar to buying materials?? */
  function purchaseUpgrade(name = '', single = false, toLevel = 1) {
    const curlevel = corp.getUpgradeLevel(name);
    ns.printf('%s | %d/%d', name, curlevel, toLevel);
    if (single) {
      if (corp.getCorporation().funds > corp.getUpgradeLevelCost(name)) {
        corp.levelUpgrade(name);
        return true;
      }
    } else if (curlevel < toLevel) {
      if (corp.getCorporation().funds > corp.getUpgradeLevelCost(name)) {
        corp.levelUpgrade(name);
      }
    }
    if (corp.getUpgradeLevel(name) >= toLevel) return true;
    return false;
  }
  ///////////////////////////////////////////////////////////////////////////////////////////
  /** designed to pass in the amount you want to end up with and will calculate how much
   *   it needs to buy. takes into consideration any amount you currently have.
   *   materials{} format: { "MaterialName": Amount}
   */
  function purchaseMats(div = '', materials = {}) {
    ns.printf('Purchasing mats for %s', div);
    let finished = 0;
    for (const city of Object.values(cityNames)) {
      for (const [mat, amt] of Object.entries(materials)) {
        if (typeof amt == 'number') {
          const n = corp.getMaterial(div, city, mat).stored;
          ns.printf('%-12s %d/%d', mat + ':', n, amt);
          if (n < amt) {
            corp.buyMaterial(div, city, mat, (amt - n) / 10);
          } else if (n >= amt) {
            corp.buyMaterial(div, city, mat, 0);
            finished++;
          }
        }
      }
    }
    if (finished == Object.entries(materials).length * 6) return true;
    return false;
  }
  ///////////////////////////////////////////////////////////////////////////////////////////
  function waitForInvestment(round: 1 | 2 | 3 | 4) {
    if (corp.getInvestmentOffer().round != round) return true;
    const offer = corp.getInvestmentOffer().funds;
    if (offer > bestOffer) bestOffer = offer;
    ns.print('Waiting for investment offer ' + round);
    const goal = investAmounts[round] * ns.getBitNodeMultipliers().CorporationValuation;
    ns.print(ns.formatNumber(offer + corp.getCorporation().funds) + '/' + ns.formatNumber(goal));
    if (offer + corp.getCorporation().funds >= goal) {
      corp.acceptInvestmentOffer();
      return true;
    }
    return false;
  }
  ///////////////////////////////////////////////////////////////////////////////////////////
  /** simple MAX/MP sell price if we don't have TA2. no fancy formulas here.
   *   designed to handle all of a player's material-producing divisions
   */
  function setSellPrices() {
    ns.print('Setting sell prices...');
    for (const div of corp.getCorporation().divisions) {
      if (corp.getDivision(div).makesProducts) continue;
      for (const city of Object.values(cityNames)) {
        if (!corp.hasWarehouse(div, city)) continue;
        const created = corp.getIndustryData(corp.getDivision(div).type).producedMaterials;
        if (created) {
          for (let i = 0; i < created.length; i++) {
            if (corp.hasResearched(div, researchNames.MarketTa2)) {
              corp.setMaterialMarketTA2(div, city, created[i], true);
            } else {
              corp.sellMaterial(div, city, created[i], 'MAX', 'MP');
            }
          }
        }
      }
    }
  }
  ///////////////////////////////////////////////////////////////////////////////////////////
  /** v1.1 - switched over to using the purchaseUpgrade func */
  function bideTimeForInvestment() {
    purchaseUpgrade(upgradeNames.DreamSense, false, 1);
    purchaseUpgrade(upgradeNames.ProjectInsight, false, 1);
    purchaseUpgrade(upgradeNames.ABCSalesBots, false, 5);
    purchaseUpgrade(upgradeNames.FocusWires, false, 5);
    purchaseUpgrade(upgradeNames.NeuralAccelerators, false, 5);
    purchaseUpgrade(upgradeNames.NuoptimalNootropicInjectorImplants, false, 5);
    purchaseUpgrade(upgradeNames.SpeechProcessorImplants, false, 5);
  }
  ///////////////////////////////////////////////////////////////////////////////////////////
  /** designed to handle all of a player's product-producing divisions
   *   no fancy price calculations, MAX/MP until we get TA2
   */
  function maintainProducts() {
    let maxProducts = 3;
    let lowestR = 0;
    let lowestN = '';
    let finished = 0;
    for (const div of corp.getCorporation().divisions) {
      if (!corp.getDivision(div).makesProducts) continue;
      //  capacity upgrade checks incase the player purchases them
      if (corp.hasResearched(div, researchNames.Capacity2)) {
        maxProducts = 5;
      } else if (corp.hasResearched(div, researchNames.Capacity1)) {
        maxProducts = 4;
      }
      const currentProducts = corp.getDivision(div).products;
      if (currentProducts.length < maxProducts) {
        if (corp.getCorporation().funds > 2e9) {
          //  no fancy naming scheme, just grab a timestamp and slap it on the label
          corp.makeProduct(div, cityNames.Sector12, performance.now().toFixed(0), 1e9, 1e9);
        }
      }
      for (const n of currentProducts) {
        //  loop our products to find the one with lowest rating
        const product = corp.getProduct(div, cityNames.Sector12, n);
        if (product.developmentProgress == 100) finished++;
        if (corp.hasResearched(div, researchNames.MarketTa2)) {
          corp.setProductMarketTA2(div, product.name, true);
        } else corp.sellProduct(div, cityNames.Sector12, product.name, 'MAX', 'MP', true);
        if (product.rating < lowestR || lowestR == 0) {
          lowestR = product.rating;
          lowestN = product.name;
        }
      }
      if (finished == maxProducts) {
        //  if all products are completed, delete the one with lowest rating to make room for a new one
        corp.discontinueProduct(div, lowestN);
      }
    }
  }
  ///////////////////////////////////////////////////////////////////////////////////////////
  function exportMaterials(fromDivision = '', materialName = '', toDivision = '', amount: string | number = 0) {
    ns.printf('Exporting %s from %s to %s', materialName, fromDivision, toDivision);
    for (const city of Object.values(cityNames)) {
      //  cancel all current exports so we don't end up with duplicates or errors
      corp.cancelExportMaterial(fromDivision, city, toDivision, city, materialName);
      //  reassign them after
      corp.exportMaterial(fromDivision, city, toDivision, city, materialName, amount);
    }
    return true;
  }
  ///////////////////////////////////////////////////////////////////////////////////////////
  function waitForResearch(div = '', stage = 0) {
    if (corp.getCorporation().funds > corp.getUpgradeLevelCost(upgradeNames.ProjectInsight)) {
      corp.levelUpgrade(upgradeNames.ProjectInsight);
    }
    switch (stage) {
      case 1:
        if (corp.hasResearched(div, researchNames.Lab)) return true;
        ns.print('Research: ' + corp.getDivision(div).researchPoints.toFixed(0) + ' / 10000');
        if (corp.getDivision(div).researchPoints > 10000 && !corp.hasResearched(div, researchNames.Lab)) {
          corp.research(div, researchNames.Lab);
          return true;
        }
        break;
      case 2:
        if (corp.hasResearched(div, researchNames.MarketTa2)) return true;
        ns.print('Research: ' + corp.getDivision(div).researchPoints.toFixed(0) + ' / 140000');
        if (corp.getDivision(div).researchPoints > 140000) {
          corp.research(div, researchNames.MarketTa1);
          corp.research(div, researchNames.MarketTa2);
          return true;
        }
        break;
      default:
        break;
    }
    return false;
  }
  ///////////////////////////////////////////////////////////////////////////////////////////
  function wilsonTime(div = '') {
    //  return if awareness or popularity are already capped
    if (corp.getDivision(div).awareness >= 1.798e307 || corp.getDivision(div).popularity >= 1.798e307) return true;
    if (corp.getCorporation().funds > corp.getUpgradeLevelCost(upgradeNames.WilsonAnalytics)) {
      corp.levelUpgrade(upgradeNames.WilsonAnalytics);
    }
    if (corp.getCorporation().funds > corp.getHireAdVertCost(div)) {
      corp.hireAdVert(div);
    }
    return false;
  }
  ///////////////////////////////////////////////////////////////////////////////////////////
  function maintainUpgrades() {
    for (const upgrade of Object.values(upgradeNames)) {
      //  skip these upgrades
      if (
        upgrade === upgradeNames.DreamSense ||
        upgrade === upgradeNames.WilsonAnalytics ||
        upgrade === upgradeNames.ProjectInsight
      ) {
        continue;
      }
      if (upgrade === upgradeNames.SmartStorage) {
        //  use a maximum of 0.01% of our cash on smart storage
        if (corp.getCorporation().funds * 0.01 > corp.getUpgradeLevelCost(upgrade)) {
          corp.levelUpgrade(upgrade);
        }
      } else if (corp.getCorporation().funds * 0.1 > corp.getUpgradeLevelCost(upgrade)) {
        //  use a maximum of 0.10% of our cash on employee upgrades
        corp.levelUpgrade(upgrade);
      }
    }
  }
}
