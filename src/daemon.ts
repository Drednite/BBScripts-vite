import { NS, ScriptArg } from '@ns';
import { getAllServers } from './helpers';

let powerlessServers: string[] = [];

/** @param {NS} ns */
export async function main(ns: NS) {
  ns.tail();
  ns.disableLog('ALL');
  const serverList = await getAllServers(ns);
  powerlessServers = [];
  ns.moveTail(250, 0);
  ns.resizeTail(515, 300);
  const host = ns.getHostname();
  const mark = 'mark.txt';
  let leaveSub: ScriptArg = true;
  ns.atExit(() => {
    ns.closeTail();
  });
  if (ns.args.length == 1) {
    leaveSub = ns.args[0];
  }
  serverList.sort((a, b) => ns.getServerRequiredHackingLevel(a) - ns.getServerRequiredHackingLevel(b));
  serverList.sort((a, b) => ns.getServerNumPortsRequired(a) - ns.getServerNumPortsRequired(b));
  const powerlessPort = ns.getPortHandle(16);
  while (!powerlessPort.empty()) {
    powerlessServers.push(powerlessPort.read().toString());
  }

  const targetList = ['n00dles'];
  ns.print('Target list: \n>>> n00dles');
  for (let i = 0; i < serverList.length; i++) {
    if (ns.getServerMaxMoney(serverList[i]) > ns.getServerMaxMoney(targetList[targetList.length - 1])) {
      ns.print('>>> ' + serverList[i]);
      targetList.push(serverList[i]);
    }
  }
  ns.printf(">>%'=49s", '<<');
  for (let i = 0; i < targetList.length - 1 && ns.getServerMaxRam(host) - ns.getServerUsedRam(host) > 8; i++) {
    while (!powerlessPort.empty()) {
      powerlessServers.push(powerlessPort.read().toString());
    }

    const node = targetList[i];
    ns.run('nuke.js', 1, node);
    await attack(ns, node, targetList[i + 1]);
    if (leaveSub && !ns.fileExists(mark, node)) {
      if (ns.getServerMaxRam(node) > 4 && !ns.isRunning('masterHack.js', host, node)) {
        ns.killall(node, true);
        await ns.sleep(60);
        ns.run('masterHack.js', 1, node);
        await ns.sleep(60);
      } else if (powerlessServers.length > 0) {
        const host = powerlessServers.shift();
        if (host) ns.run('masterHack.js', 1, node, host);
      }
    }
    if (targetList.length - i < powerlessServers.length) {
      const host = powerlessServers.shift();
      if (host) ns.run('masterHack.js', 1, node, host);
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const target = targetList.pop()!;
  const next = 'END';
  while (!ns.run('serverHasher.js', { preventDuplicates: true, temporary: true }, target)) {
    await ns.sleep(1000);
  }
  await attack(ns, target, next);
  ns.tprint('SUCCESS daemon has reached ' + target);
  ns.setTitle(ns.sprintf("<( {|})> => %'#16s => fin", target));
}

/**
 * @param {NS} ns
 * @param {string} target - server to be attacked
 * @param {string} next - next server ("END" when target is last)
 */
export async function attack(ns: NS, target: string, next: string): Promise<true> {
  ns.print('↓↓↓\n>>> Attacking ' + target);
  powerlessServers.sort((a, b) => ns.getServerMaxRam(a) - ns.getServerMaxRam(b));
  const maxMoney = ns.getServerMaxMoney(target);
  let nextLevel;
  if (next === 'END') nextLevel = Number.MAX_SAFE_INTEGER;
  else nextLevel = ns.getServerRequiredHackingLevel(next) * 4;
  const delayTime =
    Math.min(ns.getWeakenTime(target) / powerlessServers.length, ns.getWeakenTime(target) - ns.getGrowTime(target)) +
    200;
  const tasks = [];
  if (nextLevel < ns.getHackingLevel() && ns.getServerMoneyAvailable(target) > 0.9 * maxMoney) {
    return ns.sleep(60);
  }
  ns.setTitle(ns.sprintf("<( {|})> => %'#16s => %'#4d", target, nextLevel));
  if (powerlessServers.length > 0) {
    for (let i = 0; i < powerlessServers.length; i++) {
      ns.scriptKill('share.js', powerlessServers[i]);
      ns.scriptKill('autoHack.js', powerlessServers[i]);
      if (ns.getServerMaxRam(powerlessServers[i]) - ns.getServerUsedRam(powerlessServers[i]) > 4) {
        tasks.push(ns.run('masterHack.js', { temporary: true }, target, powerlessServers[i]));
        await ns.sleep(delayTime);
      }
    }
  }
  tasks.push(ns.run('masterHack.js', { temporary: true }, target, 'home'));
  if (next === 'END') return ns.sleep(60);
  while (nextLevel > ns.getHackingLevel() || ns.getServerMoneyAvailable(target) < 0.9 * maxMoney) {
    await ns.sleep(1000);
  }
  tasks.forEach((task) => {
    ns.kill(task);
  });
  while (
    ns.scriptRunning('weaken.js', 'home') ||
    ns.scriptRunning('grow.js', 'home') ||
    ns.scriptRunning('hack.js', 'home')
  ) {
    await ns.sleep(1000);
  }
  powerlessServers.forEach((slave) => ns.scriptKill('autoHack.js', slave));
  return ns.sleep(60);
}

export function autocomplete() {
  return ['false', 'true'];
}
