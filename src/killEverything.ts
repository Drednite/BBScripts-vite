import { AutocompleteData, NS } from '@ns';
import { getAllServers } from './helpers';

/** @param {NS} ns */
export async function main(ns: NS) {
  let serverList: string[] = await getAllServers(ns);
  const tailPort = ns.getPortHandle(1);
  while (!tailPort.empty) {
    const next = tailPort.read();
    if (typeof next == 'number') {
      ns.closeTail(next);
    } else if (typeof next == 'string') {
      ns.tprint('WARN: ' + next + ' failed when reporting its pid');
    }
  }
  for (let i = 0; i < ns.args.length; i++) {
    serverList = serverList.filter((server) => !server.includes(ns.args[i].toString()));
  }
  serverList.forEach((server) => {
    ns.killall(server, true);
  });
}

export function autocomplete(data: AutocompleteData) {
  return [...data.servers];
}
