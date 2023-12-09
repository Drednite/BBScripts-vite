import { AutocompleteData, NS, ScriptArg } from '@ns';
import { factions, parseFormattedNumber } from './helpers';

export function autocomplete(data: AutocompleteData, args: ScriptArg[]) {
  if (args.length <= 1) {
    return [...factions.values(), 'help'];
  }
  return [];
}

/** @param {NS} ns */
export async function main(ns: NS) {
  const sin = ns.singularity;
  const frm = ns.formulas;
  if (typeof ns.args[0] != 'string' || ns.args[1] == null || ns.args[0] == 'help') {
    ns.tprint(
      'If available, donates amount required to reach specified reputation' +
        '\n ex: run ' +
        ns.getScriptName() +
        ' "Slum Snakes" 100k',
    );
    ns.exit();
  }

  const fact = ns.args[0];
  let rep = 0;
  if (typeof ns.args[1] == 'number') {
    rep = ns.args[1] - sin.getFactionRep(fact);
  } else if (typeof ns.args[1] == 'string') {
    rep = parseFormattedNumber(ns.args[1]) - sin.getFactionRep(fact);
  } else {
    ns.tprint(
      'If available, donates amount required to reach specified reputation' +
        '\n ex: run ' +
        ns.getScriptName() +
        ' "Slum Snakes" 100k',
    );
    ns.exit();
  }
  if (rep < 1) {
    ns.exit();
  }
  ns.tail();
  let donation = 10000;
  while (frm.reputation.repFromDonation(donation, ns.getPlayer()) < rep) {
    donation *= 10;
    ns.print(ns.formatNumber(donation));
    await ns.sleep(50);
  }
  donation /= 10;
  while (frm.reputation.repFromDonation(donation, ns.getPlayer()) < rep) {
    donation *= 1.1;
    ns.print(ns.formatNumber(donation));
    await ns.sleep(50);
  }
  donation /= 1.1;
  while (frm.reputation.repFromDonation(donation, ns.getPlayer()) < rep) {
    donation *= 1.01;
    ns.print(ns.formatNumber(donation));
    await ns.sleep(50);
  }
  sin.donateToFaction(fact, donation);
}
