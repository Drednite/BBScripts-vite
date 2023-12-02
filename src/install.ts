import { NS } from '@ns';

export async function main(ns: NS): Promise<void> {
  ns.clearLog();
  const sin = ns.singularity;

  const factions = ns.getPlayer().factions;

  const availableAugments: string[] = [];
  const ownedAugments = sin.getOwnedAugmentations(true);

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
  availableAugments.sort((a, b) => sin.getAugmentationBasePrice(b) - sin.getAugmentationBasePrice(a));

  // ns.tail();
  // availableAugments.forEach((aug) => {
  //   ns.print(aug + ": " + ns.formatNumber(sin.getAugmentationBasePrice(aug)));
  // })
  // if (ns.isRunning('stockTrader5.js')) {
  ns.kill('stockTrader5.js');
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
  // }

  ns.hacknet.spendHashes('Sell for Money', undefined, ns.hacknet.numHashes() / 4);
  for (const aug of availableAugments) {
    const augFacts = sin.getAugmentationFactions(aug).filter((value) => factions.includes(value));
    if (ns.gang.inGang()) {
      if (sin.getAugmentationsFromFaction(ns.gang.getGangInformation().faction).includes(aug)) {
        augFacts.push(ns.gang.getGangInformation().faction);
      }
    }

    const augFact = augFacts.sort((a, b) => sin.getFactionRep(b) - sin.getFactionRep(a))[0];
    sin.purchaseAugmentation(augFact, aug);
  }

  factions.sort((a, b) => sin.getFactionRep(b) - sin.getFactionRep(a));
  const maxFact = factions.find((fact) => sin.getAugmentationsFromFaction(fact).includes('NeuroFlux Governor'));
  while (maxFact != null && ns.getServerMoneyAvailable('home') > sin.getAugmentationPrice('NeuroFlux Governor')) {
    sin.purchaseAugmentation(maxFact, 'NeuroFlux Governor');
    await ns.sleep(100);
  }
  const install = await ns.prompt('Install?', { type: 'boolean' });
  if (install) sin.installAugmentations('startup.js');
}
