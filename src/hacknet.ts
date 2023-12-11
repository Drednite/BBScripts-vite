/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { AutocompleteData, NS } from '@ns';
import { upgradeHashCapacity } from './helpers';

const argsSchema: [string, string | number | boolean | string[]][] = [
  ['maxNodes', Number.MAX_SAFE_INTEGER],
  ['serfMode', false],
  ['ccCheat', false], //you can buy coding contracts with hashes for a fraction of the listed price. This exploit has been known about since 11/24/2022. Try not to use this too much
];

let ccToBuy: number;
let constantCont: boolean;
let deployed: boolean;

export function autocomplete(data: AutocompleteData) {
  data.flags(argsSchema);
  return [];
}

/** @param {NS} ns */
export async function main(ns: NS) {
  const flags = ns.flags(argsSchema);
  ns.disableLog('ALL');
  ns.tail();
  const pid = ns.getRunningScript()?.pid;
  ns.writePort(1, pid ? pid : ns.getScriptName());
  ns.resizeTail(295, 300);
  ns.moveTail(1310, 0);
  ccToBuy = flags.ccCheat ? Number.EPSILON : 1;
  constantCont = flags.ccCheat ? true : false;
  if (flags.ccCheat) {
    ns.atExit(async () => {
      ns.closeTail();
      ns.spawn('ccCheat.js', { spawnDelay: 10, preventDuplicates: true });
    });
  }
  deployed = ns.isRunning('contractor.js', 'home', true);
  const delayTime = 1000;
  const maxNodes = Math.min(
    typeof flags.maxNodes == 'number' ? flags.maxNodes : Number.MAX_SAFE_INTEGER,
    ns.hacknet.maxNumNodes(),
  );
  let thresholdMultiplier = ns.hacknet.numNodes(); //Bigger threshold, the less it spends

  while (ns.hacknet.numNodes() < 1) {
    ns.print('Purchasing first node...');
    ns.hacknet.purchaseNode();
    if (flags.serfMode) {
      ns.writePort(16, 'hacknet-server-0');
    }
    await ns.sleep(1000);
    ns.clearLog();
  }

  while (Date.now() - ns.getResetInfo().lastAugReset < 1.8e6) {
    const ownedNodes = ns.hacknet.numNodes();
    let minValue = ns.hacknet.getPurchaseNodeCost() / (calculateHashGainRate(1, 0, 1, 1) * 250000);
    if (ownedNodes > maxNodes - 1) {
      minValue = Number.MAX_SAFE_INTEGER;
      const lastNode = ns.hacknet.getNodeStats(maxNodes - 1);
      if (lastNode.level == 300 && lastNode.ram == 8192 && lastNode.cores == 128) {
        ns.tprint('INFO hacknet.js finished!');
        ns.exit();
      }
    }
    // ns.print(levelUpgradeProfit(1, 1, 1) / ns.hacknet.getPurchaseNodeCost())
    let nodeIndex = ownedNodes;
    let upgradeType = -1; //-1 -> purchase, 0 -> level, 1 -> ram, 2 -> core
    let nodeList = '';
    for (let i = 0; i < ownedNodes; i++) {
      const node = ns.hacknet.getNodeStats(i);
      nodeList +=
        '|n:' +
        ns.sprintf('%2d', i) +
        '|LV:' +
        ns.sprintf('%3d', node.level) +
        '|RAM:' +
        ns.sprintf('%5s', ns.formatRam(node.ram, 0)) +
        '|CR:' +
        ns.sprintf('%3d', node.cores) +
        '|\n';
      const upgrades = [
        ns.hacknet.getLevelUpgradeCost(i, 1) / levelUpgradeProfit(node.level, node.ramUsed!, node.ram, node.cores),
        ns.hacknet.getRamUpgradeCost(i, 1) / ramUpgradeProfit(node.level, node.ramUsed!, node.ram, node.cores),
        ns.hacknet.getCoreUpgradeCost(i, 1) / coreUpgradeProfit(node.level, node.ramUsed!, node.ram, node.cores),
      ];
      const value = Math.min(...upgrades);
      if (value < minValue) {
        minValue = value;
        nodeIndex = i;
        upgradeType = upgrades.indexOf(value);
      }
    }

    switch (upgradeType) {
      case -1:
        minValue = ns.hacknet.getPurchaseNodeCost();
        nodeList += 'Purchasing node ' + ns.hacknet.numNodes() + ':\n';
        await waitForMoney(ns, minValue, delayTime, thresholdMultiplier, nodeList);
        // eslint-disable-next-line no-case-declarations
        const node = ns.hacknet.purchaseNode();
        if (flags.serfMode && node > 0) {
          ns.writePort(16, 'hacknet-server-' + node);
        }
        thresholdMultiplier++;
        break;
      case 0:
        minValue = ns.hacknet.getLevelUpgradeCost(nodeIndex, 1);
        nodeList += 'Purchasing level for node ' + nodeIndex + ':\n';
        await waitForMoney(ns, minValue, delayTime, thresholdMultiplier, nodeList);
        ns.hacknet.upgradeLevel(nodeIndex, 1);
        break;
      case 1:
        minValue = ns.hacknet.getRamUpgradeCost(nodeIndex, 1);
        nodeList += 'Purchasing RAM for node ' + nodeIndex + ':\n';
        await waitForMoney(ns, minValue, delayTime, thresholdMultiplier, nodeList);
        ns.hacknet.upgradeRam(nodeIndex, 1);
        break;
      case 2:
        minValue = ns.hacknet.getCoreUpgradeCost(nodeIndex, 1);
        nodeList += 'Purchasing cores for node ' + nodeIndex + ':\n';
        await waitForMoney(ns, minValue, delayTime, thresholdMultiplier, nodeList);
        ns.hacknet.upgradeCore(nodeIndex, 1);
        break;
    }
    await ns.sleep(1);
  }
}
/**
 * @param {NS} ns
 * @param targetMoney - the threshold to be reached before continuing
 * @param delayTime - the duration it will wait when told to sleep
 * @param thresholdMultiplier - a multiplier on the threshold to be reached
 * @param nodeList - table passed as a string which lists node information
 */
async function waitForMoney(
  ns: NS,
  targetMoney: number,
  delayTime: number,
  thresholdMultiplier: number,
  nodeList: string,
) {
  while (ns.getServerMoneyAvailable('home') < targetMoney * thresholdMultiplier) {
    // (ns.getMoneySources().sinceInstall.hacknet + ns.getMoneySources().sinceInstall.hacknet_expenses)  /
    ns.clearLog();
    const moneySources = ns.getMoneySources().sinceInstall;
    ns.printf(
      nodeList + '|Income: %20s|\n|Expenses: %18s|\n|Profit: %20s|\n|Target: %20s|',
      ns.formatNumber(moneySources.hacknet + moneySources.codingcontract),
      ns.formatNumber(moneySources.hacknet_expenses),
      ns.formatNumber(moneySources.hacknet + moneySources.codingcontract + moneySources.hacknet_expenses),
      ns.formatNumber(targetMoney * thresholdMultiplier),
    );
    await ns.sleep(delayTime);
    let hashIncome = 0;
    for (let i = 0; i < ns.hacknet.numNodes(); i++) {
      const node = ns.hacknet.getNodeStats(i);
      hashIncome += calculateHashGainRate(node.level, node.ramUsed, node.ram, node.cores);
    }
    if (
      !constantCont &&
      ns.hacknet.hashCapacity() * 250000 > targetMoney * thresholdMultiplier - ns.getServerMoneyAvailable('home')
    ) {
      if (ns.hacknet.numHashes() * 250000 > targetMoney * thresholdMultiplier - ns.getServerMoneyAvailable('home')) {
        ns.hacknet.spendHashes('Sell for Money', undefined, ns.hacknet.numHashes() / 4);
      }
    }

    if ((75e6 * 4.2) / (ns.hacknet.hashCost('Generate Coding Contract') * ccToBuy) > hashIncome * 250000) {
      if (ns.hacknet.hashCost('Generate Coding Contract') * ccToBuy > ns.hacknet.hashCapacity()) {
        await upgradeHashCapacity(ns, ns.hacknet.hashCost('Generate Coding Contract') * ccToBuy);
      }
      ns.print('Generating Coding Contract...');
      while (!ns.hacknet.spendHashes('Generate Coding Contract', undefined, ccToBuy)) {
        await ns.sleep(delayTime * 0.5);
      }
      if (constantCont) {
        if (!deployed) {
          ns.print('Deploying constant contractor...');
          while (!ns.run('contractor.js', 1, true)) {
            await ns.sleep(delayTime * 0.5);
          }
          deployed = true;
        }
      } else {
        ns.print('Deploying contractor...');
        while (!ns.run('contractor.js')) {
          await ns.sleep(delayTime * 0.5);
        }
      }
    }
    if (ns.isRunning('corp.js', 'home')) {
      ns.hacknet.spendHashes('Exchange for Corporation Research');
      ns.hacknet.spendHashes('Sell for Corporation Funds');
    }
    if (ns.bladeburner.inBladeburner()) {
      if (ns.hacknet.hashCapacity() < ns.hacknet.hashCost('Exchange for Bladeburner SP')) {
        await upgradeHashCapacity(ns, ns.hacknet.hashCost('Exchange for Bladeburner SP'));
      }
      ns.hacknet.spendHashes('Exchange for Bladeburner Rank');
      ns.hacknet.spendHashes('Exchange for Bladeburner SP');
    }
  }
}
export function levelUpgradeProfit(
  currentLevel: number,
  usedRam: number,
  currentRam: number,
  currentLevelCore: number,
) {
  return (
    (calculateHashGainRate(currentLevel + 1, usedRam, currentRam, currentLevelCore) -
      calculateHashGainRate(currentLevel, 0, currentRam, currentLevelCore)) *
    250000
  );
}
export function ramUpgradeProfit(currentLevel: number, usedRam: number, currentRam: number, currentLevelCore: number) {
  return (
    (calculateHashGainRate(currentLevel, usedRam, currentRam * 2, currentLevelCore) -
      calculateHashGainRate(currentLevel, 0, currentRam, currentLevelCore)) *
    250000
  );
}
export function coreUpgradeProfit(currentLevel: number, usedRam: number, currentRam: number, currentLevelCore: number) {
  return (
    (calculateHashGainRate(currentLevel, usedRam, currentRam, currentLevelCore + 1) -
      calculateHashGainRate(currentLevel, 0, currentRam, currentLevelCore)) *
    250000
  );
}

export function calculateHashGainRate(level: number, ramUsed = 0, maxRam: number, cores: number): number {
  const baseGain = 0.001 * level;
  const ramMultiplier = Math.pow(1.07, Math.log2(maxRam));
  const coreMultiplier = 1 + (cores - 1) / 5;
  const ramRatio = 1 - ramUsed / maxRam;

  return baseGain * ramMultiplier * coreMultiplier * ramRatio;
}
