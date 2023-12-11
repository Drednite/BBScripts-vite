import { AutocompleteData, NS } from '@ns';

const argsSchema: [string, string | number | boolean | string[]][] = [
  ['k', false],
  ['nextUpg', 6],
  ['name', 'serf'],
  // ["costMult", 10],
  ['waitTime', 1000],
];
export function autocomplete(data: AutocompleteData) {
  data.flags(argsSchema);
  return [];
}

const MAXHOMERAM = 1073741824;
const MAXHOMECORES = 8;
let keep = false;

/** @param {NS} ns */
export async function main(ns: NS) {
  const flags = ns.flags(argsSchema);
  if (flags.k) {
    keep = true;
  } else {
    keep = false;
  }
  ns.tail();
  ns.disableLog('ALL');
  const waitTime = typeof flags.waitTime == 'number' ? flags.waitTime : 1000;
  const owned = ns.getPurchasedServers();
  let nextUpg = typeof flags.nextUpg == 'number' ? flags.nextUpg : 6;
  const name = flags.name.toString();
  let costMult = ns.getPurchasedServerLimit();
  let upgradeCost;
  ns.moveTail(0, 0);
  ns.resizeTail(250, 300);
  ns.atExit(() => {
    ns.closeTail();
  });
  ns.print('Getting Dark Web access...');
  while (!ns.singularity.purchaseTor()) {
    await ns.sleep(waitTime);
  }
  ns.print('...BruteSSH.exe');
  while (!ns.fileExists('BruteSSH.exe', 'home')) {
    if (!ns.singularity.purchaseProgram('BruteSSH.exe')) {
      await upgradeHome(ns, ns.singularity.getDarkwebProgramCost('BruteSSH.exe'));
      await ns.sleep(waitTime);
    }
  }
  ns.print('...FTPCrack.exe');
  while (!ns.fileExists('FTPCrack.exe', 'home')) {
    if (!ns.singularity.purchaseProgram('FTPCrack.exe')) {
      await upgradeHome(ns, ns.singularity.getDarkwebProgramCost('FTPCrack.exe'));
      await ns.sleep(waitTime);
    }
  }
  ns.print('...relaySMTP.exe');
  while (!ns.fileExists('relaySMTP.exe', 'home')) {
    if (!ns.singularity.purchaseProgram('relaySMTP.exe')) {
      await upgradeHome(ns, ns.singularity.getDarkwebProgramCost('relaySMTP.exe'));
      await ns.sleep(waitTime);
    }
  }
  ns.print('...HTTPWorm.exe');
  while (!ns.fileExists('HTTPWorm.exe', 'home')) {
    if (!ns.singularity.purchaseProgram('HTTPWorm.exe')) {
      await upgradeHome(ns, ns.singularity.getDarkwebProgramCost('HTTPWorm.exe'));
      await ns.sleep(waitTime);
    }
  }
  ns.print('...SQLInject.exe');
  while (!ns.fileExists('SQLInject.exe', 'home')) {
    if (!ns.singularity.purchaseProgram('SQLInject.exe')) {
      await upgradeHome(ns, ns.singularity.getDarkwebProgramCost('SQLInject.exe'));
      await ns.sleep(waitTime);
    }
  }
  ns.clearLog();
  while (owned.length < ns.getPurchasedServerLimit()) {
    const cost = ns.getPurchasedServerCost(2 ** nextUpg);
    if (cost * (costMult * 0.5) > ns.getServerMoneyAvailable('home')) {
      ns.print('Waiting to buy new ' + name + ' for $' + ns.formatNumber(cost));
      await ns.sleep(waitTime);
    } else {
      const newServ = ns.purchaseServer(name, 2 ** nextUpg);
      ns.print('Purchasing ' + newServ);
      owned.push(newServ);
      ns.writePort(16, newServ);
    }
  }
  while (2 ** nextUpg < ns.getPurchasedServerMaxRam() && owned.length > 0) {
    nextUpg++;
    ns.print('Cycle restarted, new goal: 2^' + nextUpg);
    ns.setTitle(ns.getScriptName() + ' x' + nextUpg);
    for (let i = 0; i < owned.length; i++) {
      upgradeCost = ns.getPurchasedServerCost(2 ** nextUpg) - ns.getPurchasedServerCost(ns.getServerMaxRam(owned[i]));
      ns.print('Cost to upgrade ' + owned[i] + ': ' + ns.formatNumber(upgradeCost));
      if (upgradeCost > 1) {
        await upgradeHome(ns, upgradeCost * costMult);
        // await upgradeHacknet(ns, upgradeCost);
        while (upgradeCost * costMult > ns.getServerMoneyAvailable('home')) {
          if (!keep && Date.now() - ns.getResetInfo().lastAugReset > 1.8e6) {
            if (ns.stock.has4SDataTIXAPI()) {
              while (!ns.run('dev/stonks.js')) {
                await ns.sleep(1000);
              }
              while (!ns.run('stockReporter.js')) {
                await ns.sleep(1000);
              }
            }
            ns.exit();
          }
          await ns.sleep(waitTime);
        }
        if (ns.upgradePurchasedServer(owned[i], 2 ** nextUpg)) {
          ns.print('Upgraded ' + owned[i]);
        } else {
          ns.print('ERROR: Upgrade for ' + owned[i] + 'failed!');
        }
      }
    }
    await ns.sleep(waitTime);
  }
  costMult = Math.max(ns.hacknet.maxNumNodes(), 1);
  while (ns.getServerMaxRam('home') < MAXHOMERAM) {
    upgradeCost = Math.min(ns.singularity.getUpgradeHomeRamCost(), ns.singularity.getUpgradeHomeCoresCost());
    await upgradeHome(ns, upgradeCost);
    await upgradeHacknet(ns, upgradeCost);
  }
}

/**
 * @param {NS} ns
 * @param {number} cost cost to be compared against
 */
export async function upgradeHome(ns: NS, cost: number): Promise<void> {
  if (!keep && Date.now() - ns.getResetInfo().lastAugReset > 1.8e6) {
    if (ns.stock.has4SDataTIXAPI()) {
      while (!ns.run('dev/stonks.js')) {
        await ns.sleep(1000);
      }
      while (!ns.run('stockReporter.js')) {
        await ns.sleep(1000);
      }
    }
    ns.exit();
  }
  const home = ns.getServer('home');
  if (cost >= ns.singularity.getUpgradeHomeRamCost() && home.maxRam < MAXHOMERAM) {
    ns.print('Upgrading home RAM for ' + ns.formatNumber(ns.singularity.getUpgradeHomeRamCost()));
    while (!ns.singularity.upgradeHomeRam()) {
      await ns.sleep(1000);
    }
  }
  if (cost >= ns.singularity.getUpgradeHomeCoresCost() && home.cpuCores < MAXHOMECORES) {
    ns.print('Upgrading home cores for ' + ns.formatNumber(ns.singularity.getUpgradeHomeCoresCost()));
    while (!ns.singularity.upgradeHomeCores()) {
      await ns.sleep(1000);
    }
  }
}

/**
 * @param {NS} ns
 * @param {number} cost cost to be compared against
 */
export async function upgradeHacknet(ns: NS, cost: number): Promise<void> {
  const net = ns.hacknet;
  const numNodes = net.numNodes();
  if (ns.scriptRunning('hacknet.js', 'home')) {
    return;
  }
  for (let i = 0; i < numNodes; i++) {
    if (net.getRamUpgradeCost(i) < cost * numNodes) {
      ns.print('Upgrading hacknet-server-' + i + ' RAM for ' + ns.formatNumber(net.getRamUpgradeCost(i)));
      while (ns.getServerMoneyAvailable('home') < cost) {
        await ns.sleep(1000);
      }
      net.upgradeRam(i);
    }
    if (net.getCoreUpgradeCost(i) < cost * numNodes) {
      ns.print('Upgrading hacknet-server-' + i + ' Cores for ' + ns.formatNumber(net.getCoreUpgradeCost(i)));
      while (ns.getServerMoneyAvailable('home') < cost) {
        await ns.sleep(1000);
      }
      net.upgradeCore(i);
    }
  }
}
