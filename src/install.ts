import { AutocompleteData, NS } from '@ns';

const argsSchema: [string, string | number | boolean | string[]][] = [
  ['h', false],
  ['prompt', false],
  ['donate', false],
];

export function autocomplete(data: AutocompleteData) {
  data.flags(argsSchema);
  return [];
}

export async function main(ns: NS): Promise<void> {
  ns.clearLog();
  const flags = ns.flags(argsSchema);
  const sin = ns.singularity;
  let install: string | boolean = true;

  const factions = ns.getPlayer().factions;

  let availableAugments: string[] = [];
  const ownedAugments = sin.getOwnedAugmentations(true);
  const hacker = flags.h;

  for (const fact of factions) {
    const factAugs = sin.getAugmentationsFromFaction(fact).filter((req) => !ownedAugments.includes(req));
    for (const aug of factAugs) {
      const prereqs = sin.getAugmentationPrereq(aug).filter((req) => !ownedAugments.includes(req));
      if (prereqs.length > 0) {
        continue;
      } else if (!availableAugments.includes(aug)) {
        availableAugments.push(aug);
      }
    }
  }
  if (hacker) {
    availableAugments = availableAugments.filter((aug) => {
      const stats = sin.getAugmentationStats(aug);
      return (
        stats.hacking ||
        stats.hacking_chance ||
        stats.hacking_exp ||
        stats.hacking_grow ||
        stats.hacking_money ||
        stats.hacking_speed
      );
    });
  }
  availableAugments.sort((a, b) => sin.getAugmentationBasePrice(b) - sin.getAugmentationBasePrice(a));

  ns.kill('dev/stonks.js');
  const book = ns.stock.getSymbols();
  for (const symb in book) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [long, longPrice, short, shortPrice] = ns.stock.getPosition(book[symb]);
    if (long > 0) {
      const soldFor = ns.stock.sellStock(book[symb], long);
      const message = 'Sold ' + long + ' Long shares of ' + book[symb] + ' for $' + ns.formatNumber(soldFor);

      ns.toast(message, 'success');
    }
    if (short > 0) {
      const soldFor = ns.stock.sellShort(book[symb], short);
      const message = 'Sold ' + short + ' Short shares of ' + book[symb] + ' for $' + ns.formatNumber(soldFor);

      ns.toast(message, 'success');
    }
  }

  ns.hacknet.spendHashes('Sell for Money', undefined, ns.hacknet.numHashes() / 4);
  for (const aug of availableAugments) {
    const augFacts = sin.getAugmentationFactions(aug).filter((value) => factions.includes(value));
    if (ns.gang.inGang()) {
      if (sin.getAugmentationsFromFaction(ns.gang.getGangInformation().faction).includes(aug)) {
        augFacts.push(ns.gang.getGangInformation().faction);
      }
    }

    const augFact = augFacts.sort((a, b) => sin.getFactionRep(b) - sin.getFactionRep(a))[0];
    if (flags.donate && sin.donateToFaction(augFact, 0)) {
      let donation = 1000;
      const repNeeded = sin.getAugmentationRepReq(aug) - sin.getFactionRep(augFact);
      while (ns.formulas.reputation.repFromDonation((donation += 1e4), ns.getPlayer()) < repNeeded) {
        /* empty */
      }
      if (donation + sin.getAugmentationPrice(aug) < ns.getServerMoneyAvailable('home')) {
        sin.donateToFaction(augFact, donation);
      }
    }
    sin.purchaseAugmentation(augFact, aug);
  }

  factions.sort((a, b) => sin.getFactionRep(b) - sin.getFactionRep(a));
  const maxFact = factions.find((fact) => sin.getAugmentationsFromFaction(fact).includes('NeuroFlux Governor'));
  while (maxFact != null && ns.getServerMoneyAvailable('home') > sin.getAugmentationPrice('NeuroFlux Governor')) {
    sin.purchaseAugmentation(maxFact, 'NeuroFlux Governor');
    await ns.sleep(100);
  }
  if (flags.prompt) install = await ns.prompt('Install?', { type: 'boolean' });
  if (install) sin.installAugmentations('startup.js');
}
