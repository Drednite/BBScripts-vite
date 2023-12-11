import { AutocompleteData, NS } from '@ns';

export function autocomplete(data: AutocompleteData) {
  return [...data.servers];
}

export async function main(ns: NS): Promise<void> {
  ns.tail();
  const player = ns.getPlayer();
  ns.print(Object.values(player.jobs).length ? 'true' : 'false');
}
