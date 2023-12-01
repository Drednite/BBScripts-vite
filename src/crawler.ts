import { AutocompleteData, NS, ProcessInfo, ScriptArg } from '@ns';
import { getAllServers } from './helpers';

const argsSchema: [string, string | number | boolean | string[]][] = [
  ['waitTime', 10000],
  ['shouldHack', false],
  ['share', false],
  ['hacker', 'masterHack.js'],
  ['daemon', false],
  ['o', false],
  ['h', false],
];

const hackScripts: string[] = ['masterHack.js', 'hackStarter.js'];

export function autocomplete(data: AutocompleteData, args: ScriptArg[]) {
  data.flags(argsSchema);
  const lastFlag = args.length > 1 ? args[args.length - 2].toString() : null;
  if (lastFlag != null && ['--hacker'].includes(lastFlag)) return hackScripts;
  return [];
}

/** @param {NS} ns */
export async function main(ns: NS) {
  const flags = ns.flags(argsSchema);
  let serverList: string[] = await getAllServers(ns);
  const waitTime: number = typeof flags.waitTime == 'number' ? flags.waitTime : 10000;
  const shouldHack = !flags.shouldHack;
  const hacker = flags.hacker.toString();
  const emptyServers = [],
    powerlessServers = [];
  let keys = 0;
  // var owned = ns.getPurchasedServers();
  const mark = 'mark.txt';
  if (flags.daemon) {
    ns.atExit(() => {
      ns.closeTail();
      // ns.exec("deployShares.js", "home", 1, "all");
      ns.exec('daemon.js', 'home');
    });
  }
  const purchased = ns.getPurchasedServers();
  serverList = serverList.filter((server) => {
    return !(purchased.includes(server) || server.includes('hacknet-server'));
  });
  ns.tail();
  ns.moveTail(250, 0);

  // serverList = serverList.filter((server) => !owned.includes(server));
  serverList.sort((a, b) => {
    return ns.getServerMaxRam(a) - ns.getServerMaxRam(b);
  });
  serverList.sort((a, b) => ns.getServerRequiredHackingLevel(a) - ns.getServerRequiredHackingLevel(b));
  serverList.sort((a, b) => ns.getServerNumPortsRequired(a) - ns.getServerNumPortsRequired(b));
  // serverList.sort((a, b) => owned.includes(a) - owned.includes(b));
  // // ns.tprint(serverList);

  function checkKeys(ns: NS): number {
    let keys = 0;
    if (ns.fileExists('BruteSSH.exe')) keys++;
    if (ns.fileExists('FTPCrack.exe')) keys++;
    if (ns.fileExists('relaySMTP.exe')) keys++;
    if (ns.fileExists('HTTPWorm.exe')) keys++;
    if (ns.fileExists('SQLInject.exe')) keys++;
    return keys;
  }

  if (flags.share) {
    ns.scp('share.js', 'n00dles');
    ns.exec('share.js', 'n00dles');
  }

  for (let i = 0; i < serverList.length; i++) {
    keys = checkKeys(ns);
    if (!ns.fileExists(mark)) {
      ns.write(mark, 'Marked by ' + ns.getScriptName());
    }
    const node = serverList[i];
    const level = ns.getServerRequiredHackingLevel(node);
    ns.rm(mark, node);
    if (ns.isRunning(hacker, 'home', node) || ns.getServerUsedRam(node) > 0) {
      ns.scp(mark, node);
      continue;
    }
    if (ns.getServerNumPortsRequired(node) > keys) {
      ns.print('WARN Not enough keys for ' + node);
      continue;
    }
    while (!ns.hasRootAccess(node)) {
      if (ns.exec('nuke.js', 'home', 1, node)) {
        await ns.sleep(waitTime * 0.05);
      } else {
        ns.print('Waiting to nuke ' + node);
        await ns.sleep(waitTime);
      }
    }
    if (!shouldHack) {
      continue;
    }
    // while(ns.getHackingLevel() < level){
    //   ns.printf("Waiting to reach %s's level %d", node, level);
    //   await ns.sleep(waitTime);
    // }
    if (ns.getServerMaxRam(node) > 4 && node != 'home') {
      if (ns.getServerMaxMoney(node) > 0) {
        if (ns.getHackingLevel() < level * 2) {
          if (flags.share) {
            ns.scp('shareAll.js', node);
            ns.exec('shareAll.js', node);
          }
          continue;
        } else
          try {
            while (!ns.exec(hacker, 'home', 1, node)) await ns.sleep(waitTime);
            ns.scp(mark, node);
          } catch {
            ns.tprint('WARN Could not run ' + hacker + ' [' + node + '] on home');
            ns.exit();
          }
      } else {
        emptyServers.push(node);
      }
    } else if (ns.getServerMaxMoney(node) > 0) {
      if (ns.ps('home').some(isHosting, node) && ns.getHackingLevel() > level * 2) powerlessServers.push(node);
    }
  }
  if (flags.o) {
    emptyServers.push(...ns.getPurchasedServers());
  }
  if (flags.h) {
    for (let i = 0; i < ns.hacknet.numNodes(); i++) {
      emptyServers.push('hacknet-server-' + i);
    }
  }
  emptyServers.sort((a, b) => ns.getServerMaxRam(a) - ns.getServerMaxRam(b));
  while (emptyServers.length > 0 && powerlessServers.length > 0) {
    const host = emptyServers.shift();
    const target = powerlessServers.shift();
    if (target && host) {
      while (!ns.exec(hacker, 'home', 1, target, host)) await ns.sleep(waitTime);
      ns.scp(mark, target);
    }
  }
  ns.tprint('INFO Crawler has finished.');
  if (emptyServers.length > 0) {
    ns.clearPort(16);
    emptyServers.forEach((serv) => ns.writePort(16, serv));
    ns.print('--- Unused empty servers: ' + emptyServers);
  }
  if (powerlessServers.length > 0) {
    ns.print('--- Unused powerless servers: ' + powerlessServers);
  }
}

/**
 *
 * @param this - name of server to check the arg for
 * @param element - the ProcessInfo being checked
 * @param index - index in the array
 * @param array - the array itself
 * @returns true if the process is an instance of masterHack.js which includes this in the args, false otherwise
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function isHosting(this: string, element: ProcessInfo, index: number, array: ProcessInfo[]) {
  return element.filename == 'masterHack.js' && element.args.includes(this);
}
