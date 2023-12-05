import { AutocompleteData, NS } from '@ns';

export function autocomplete(data: AutocompleteData) {
  return [...data.servers];
}

export async function main(ns: NS): Promise<void> {
  ns.tail();
  const row = '│   ECP │  $41.10k [▓▓▓▓▓]  $46.49k│';
  ns.print(row.length);
  ns.print(row);
}
