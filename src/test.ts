import { AutocompleteData, NS } from '@ns';

export function autocomplete(data: AutocompleteData) {
  return [...data.servers];
}

export async function main(ns: NS): Promise<void> {
  ns.tail();
  ns.resizeTail(385, 340);

  ns.print(ns.bladeburner.getCurrentAction());
}
