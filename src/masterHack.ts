import { AutocompleteData, NS } from '@ns';
import { HOMERAMRES } from './helpers';

/** @param {NS} ns **/
export async function main(ns: NS) {
  // Parameters
  // param 1: Server you want to hack
  // param 2: OPTIONAL - Server you want to start the hack from, i.e. any public servers, purchased servers or 'home'
  //
  // EXAMPLE 1: run masterHack.js joesguns
  // This will start hacking 'joesguns' using the RAM of 'joesguns'
  //
  // EXAMPLE 2: run masterHack.js joesguns s1
  // This will start hacking 'joesguns' using the RAM of my purchased server 's1'
  //
  // This 'masterHack.js' process will stay active on whatever server you execute it from.
  // I usually start it from 'home', then I can track all my earnings in one place.
  // Keep in mind, when using 'home' as second parameter the script might use all available RAM
  // and you might become unable to execute any other scripts on 'home' until you kill the process.
  let target = ns.getServer(ns.args[0].toString());
  let serverToHackFrom = target; // For single argument calls - server will hack itself
  const hackScript = 'hack.js';
  const growScript = 'grow.js';
  const weakenScript = 'weaken.js';
  const growScriptRAM = ns.getScriptRam(growScript);
  let serverMaxMoney = target.moneyMax ? target.moneyMax : 0;
  let serverMaxRAM;
  let moneyThresh = serverMaxMoney * 0.9; // 0.90 to maintain near 100% server money.  You can use 0.75 when starting out/using low thread counts
  let securityThresh = (target.minDifficulty ? target.minDifficulty : 0) + 5;
  let currentServerMoney, currentServerSecurity;
  let useThreadsHack, useThreadsWeaken1, useThreadsWeaken2, useThreadsGrow, possibleThreads;
  let maxHackFactor = 0.01;
  const growWeakenRatio = 0.9; // How many threads are used for growing vs. weaking (90:10).
  let maxGrowThreads;
  let sleepTime, sleepTimeHack, sleepTimeGrow, sleepTimeWeaken;
  const sleepDelay = 100; // Sleep delay should range between 20ms and 200ms as per the documentation. I'll keep the default at 200, adjust as needed.
  let i, batches, batchSize;
  // ns.atExit((ns) => {
  //   ns.tprint(ns.getScriptName() + ns.args[0] + ns.args[1] + " ended");
  //   ns.tail();
  // });
  // If second argument is provided, hack will run from this server instead
  if (ns.args[1]) {
    serverToHackFrom = ns.getServer(ns.args[1].toString());
  }
  serverMaxRAM = serverToHackFrom.maxRam;
  if (serverToHackFrom.hostname == 'home') {
    serverMaxRAM -= Math.min(HOMERAMRES, serverMaxRAM * 0.1);
  }
  // Use max of 4 batches up to 4 TB server size. Min batchSize is 256 GB.
  if (serverMaxRAM < 4096) {
    batchSize = Math.max(serverMaxRAM / 4, 256);
  } else {
    batchSize = 512;
  }
  // Gain root access. Make sure you have the nuke.js script on 'home'
  while (!target.hasAdminRights) {
    ns.exec('nuke.js', 'home', 1, target.hostname);
    await ns.sleep(sleepDelay);
    target = ns.getServer(target.hostname);
  }
  while (!serverToHackFrom.hasAdminRights) {
    ns.exec('nuke.js', 'home', 1, serverToHackFrom.hostname);
    await ns.sleep(sleepDelay);
    serverToHackFrom = ns.getServer(serverToHackFrom.hostname);
  }
  // Copy the work scripts, if not already on server
  if (!ns.fileExists(hackScript, serverToHackFrom.hostname)) {
    ns.scp(hackScript, serverToHackFrom.hostname, 'home');
  }
  if (!ns.fileExists(growScript, serverToHackFrom.hostname)) {
    ns.scp(growScript, serverToHackFrom.hostname, 'home');
  }
  if (!ns.fileExists(weakenScript, serverToHackFrom.hostname)) {
    ns.scp(weakenScript, serverToHackFrom.hostname, 'home');
  }
  // To prevent the script from crashing/terminating after closing and restarting the game.
  // while (ns.scriptRunning(weakenScript, serverToHackFrom.hostname)
  //   || ns.scriptRunning(growScript, serverToHackFrom.hostname)
  //   || ns.scriptRunning(hackScript, serverToHackFrom.hostname)) {
  //   await ns.sleep(sleepDelay);
  // }
  ns.disableLog('ALL');
  ns.enableLog('sleep');
  ns.print('Staring main loop');
  // Main loop - will terminate if no RAM available
  let timout = 0;
  while (timout < 5) {
    // To prevent the script from crashing/terminating after closing and restarting the game.
    while (
      ns.scriptRunning(weakenScript, serverToHackFrom.hostname) ||
      ns.scriptRunning(growScript, serverToHackFrom.hostname) ||
      ns.scriptRunning(hackScript, serverToHackFrom.hostname)
    ) {
      await ns.sleep(sleepDelay);
    }
    target = ns.getServer(target.hostname);
    serverToHackFrom = ns.getServer(serverToHackFrom.hostname);
    serverMaxRAM = serverToHackFrom.maxRam;
    if (serverToHackFrom.hostname == 'home') {
      serverMaxRAM -= Math.min(HOMERAMRES, serverMaxRAM * 0.1);
    }
    if (3 < (possibleThreads = Math.floor((serverMaxRAM - serverToHackFrom.ramUsed) / growScriptRAM))) {
      ns.print('\n--== Attacking ' + target.hostname + ' ==--\n');
      currentServerMoney = target.moneyAvailable ? target.moneyAvailable : 0;
      serverMaxMoney = target.moneyMax ? target.moneyMax : 0;
      moneyThresh = serverMaxMoney * 0.9;
      ns.printf('Money: $%s / $%s\n', ns.formatNumber(currentServerMoney), ns.formatNumber(serverMaxMoney));
      currentServerSecurity = target.hackDifficulty ? target.hackDifficulty : 0;
      securityThresh = (target.minDifficulty ? target.minDifficulty : 0) + 5;
      ns.printf('Security: %2.2f / %2.2f\n', currentServerSecurity, securityThresh);
      sleepTimeHack = ns.getHackTime(target.hostname);
      sleepTimeGrow = ns.getGrowTime(target.hostname);
      sleepTimeWeaken = ns.getWeakenTime(target.hostname);
      // ns.print("maxGrowThreads: " + maxGrowThreads);
      try {
        // The first to cases are for new servers with high SECURITY LEVELS and to quickly grow the server to above the threshold
        if (currentServerSecurity > securityThresh) {
          maxGrowThreads = Math.ceil(
            ns.growthAnalyze(
              target.hostname,
              Math.max(moneyThresh / currentServerMoney, 1.01),
              serverToHackFrom.cpuCores,
            ),
          );
          useThreadsGrow = Math.min(Math.ceil(possibleThreads * 0.2), maxGrowThreads);
          useThreadsWeaken1 = possibleThreads - useThreadsGrow;
          ns.exec(
            growScript,
            serverToHackFrom.hostname,
            { threads: useThreadsGrow, temporary: true },
            target.hostname,
            0,
          );
          ns.exec(
            weakenScript,
            serverToHackFrom.hostname,
            { threads: useThreadsWeaken1, temporary: true },
            target.hostname,
            0,
          );
          timout = 0;
          await ns.sleep(sleepTimeWeaken + sleepDelay); // wait for the weaken command to finish
        } else if (currentServerMoney < moneyThresh) {
          if (currentServerMoney > 0) {
            maxGrowThreads = Math.ceil(
              ns.growthAnalyze(
                target.hostname,
                Math.max(moneyThresh / currentServerMoney, 1.01),
                serverToHackFrom.cpuCores,
              ),
            );
          } else maxGrowThreads = possibleThreads;
          useThreadsGrow = Math.min(Math.floor(possibleThreads * growWeakenRatio), maxGrowThreads);
          useThreadsWeaken1 = possibleThreads - useThreadsGrow;
          ns.exec(
            growScript,
            serverToHackFrom.hostname,
            { threads: useThreadsGrow, temporary: true },
            target.hostname,
            0,
          );
          ns.exec(
            weakenScript,
            serverToHackFrom.hostname,
            { threads: useThreadsWeaken1, temporary: true },
            target.hostname,
            0,
          );
          timout = 0;
          await ns.sleep(sleepTimeWeaken + sleepDelay); // wait for the weaken command to finish
        } else {
          // Define max amount that can be restored with one grow and therefore will be used to define hack threads.
          // The max grow threads are considering the weaken threads needed to weaken hack security and the weaken threads needed to weaken grow security.
          // I didn't bother optimizing the 'growWeakenRatio' further, as 90% is good enough already. It will be just a few more hack threads, if any at all - even with large RAM sizes.
          batches = Math.max(Math.floor(sleepTimeHack / (3 * sleepDelay)), 1); // This way at least 1 batch will run
          batches = Math.min(batches, Math.ceil(serverMaxRAM / batchSize)); // Use just as many batches as batchSize allows
          possibleThreads = Math.floor(possibleThreads / batches);
          while (
            maxHackFactor < 0.999 &&
            Math.floor(
              (possibleThreads -
                (useThreadsHack = Math.floor(
                  ns.hackAnalyzeThreads(target.hostname, currentServerMoney * maxHackFactor),
                )) -
                Math.ceil(useThreadsHack / 25)) *
                growWeakenRatio,
            ) >
              Math.ceil(
                ns.growthAnalyze(
                  target.hostname,
                  serverMaxMoney / (serverMaxMoney * (1 - maxHackFactor)),
                  serverToHackFrom.cpuCores,
                ),
              )
          ) {
            maxHackFactor += 0.001; // increase by 0.1% with each iteration
          }
          maxHackFactor -= 0.001; // Since it's more than 'possibleThreads' can handle now, we need to dial it back once.
          useThreadsHack = Math.max(
            Math.floor(ns.hackAnalyzeThreads(target.hostname, currentServerMoney * maxHackFactor)),
            1,
          ); // Forgot this in the first version.
          useThreadsWeaken1 = Math.ceil(useThreadsHack / 25); // You can weaken the security of 25 hack threads with 1 weaken thread
          useThreadsGrow = Math.floor((possibleThreads - useThreadsWeaken1 - useThreadsHack) * growWeakenRatio);
          useThreadsWeaken2 = possibleThreads - useThreadsHack - useThreadsGrow - useThreadsWeaken1;
          if (useThreadsHack < 1 || useThreadsWeaken1 < 1 || useThreadsGrow < 1 || useThreadsWeaken2 < 1) {
            maxHackFactor = 0.01;
            throw new Error('Negative threads error');
          }
          for (i = 0; i < batches; i++) {
            ns.exec(
              weakenScript,
              serverToHackFrom.hostname,
              { threads: useThreadsWeaken1, temporary: true },
              target.hostname,
              0,
              0 + 2 * i,
            );
            sleepTime = 2 * sleepDelay;
            ns.exec(
              weakenScript,
              serverToHackFrom.hostname,
              { threads: useThreadsWeaken2, temporary: true },
              target.hostname,
              sleepTime,
              1 + 2 * i,
            ); // Second weaken script runs after the first
            sleepTime = Math.max(sleepTimeWeaken - sleepTimeGrow + sleepDelay, 0);
            ns.exec(
              growScript,
              serverToHackFrom.hostname,
              { threads: useThreadsGrow, temporary: true },
              target.hostname,
              sleepTime,
              i,
            ); // Grow script ends before second weaken script
            sleepTime = Math.max(sleepTimeWeaken - sleepTimeHack - sleepDelay, 0);
            ns.exec(
              hackScript,
              serverToHackFrom.hostname,
              { threads: useThreadsHack, temporary: true },
              target.hostname,
              sleepTime,
              i,
            ); // Hack script ends before first weaken script
            await ns.sleep(3 * sleepDelay);
          }
          timout = 0;
          await ns.sleep(sleepTimeWeaken + sleepDelay);
          maxHackFactor = 0.01;
        }
      } catch (e) {
        timout++;
        ns.print('ERROR: ' + e);
        await ns.sleep(5000 * timout);
      }
    } else {
      timout++;
      ns.print("Not enough RAM available on '" + serverToHackFrom.hostname + "'. Timeouts: " + timout);
      await ns.sleep(5000 * timout);
    }
  }
  ns.print("Script was terminated. Not enough RAM available on '" + serverToHackFrom.hostname + "'.");
  while (!ns.exec('hackStarter.js', 'home', 1, target.hostname, serverToHackFrom.hostname)) {
    await ns.sleep(1000);
  }
  ns.exit();
}
export function autocomplete(data: AutocompleteData) {
  return [...data.servers]; // This script autocompletes the list of servers.
}
