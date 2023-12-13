import { AutocompleteData, NS } from '@ns';
import { Stonk } from './dev/stonks';

export function autocomplete(data: AutocompleteData) {
  return [...data.servers];
}

export async function main(ns: NS): Promise<void> {
  ns.tail();

  ns.print(ns.singularity.getCurrentWork());
  // const stonks: Stonk[] = [];
  // for (const sym of ns.stock.getSymbols()) {
  //   stonks.push(new Stonk(ns, sym));
  // }

  // function form1(stonk: Stonk): number {
  //   const shots = stonk.snapshots;

  //   let ups = 0;
  //   for (let i = 0; i < shots.length - 1; i++) {
  //     if (shots[i] < shots[i + 1]) {
  //       ups++;
  //     }
  //   }
  //   return ups / (shots.length - 1);
  // }

  // function form2(stonk: Stonk) {
  //   return 1.5 - stonk.snapshots[stonk.snapshots.length - 1] / stonk.snapshots[0];
  // }

  // while (true) {
  //   ns.printf('+-------+-------+-------+-------+');
  //   ns.printf('| %5s | %5s | %5s | %5s |', 'stock', 'form0', 'form1', 'form2');
  //   ns.printf('+-------+-------+-------+-------+');
  //   for (const stonk of stonks) {
  //     stonk.Update();
  //     if (stonk.snapshots.length > 5) {
  //       const form0 = stonk.calcForecast ? stonk.calcForecast : 0;
  //       ns.printf(
  //         '| %5s | %5s | %5s | %5s |',
  //         stonk.sym,
  //         ns.formatPercent(form0, 0),
  //         ns.formatPercent(form1(stonk), 0),
  //         ns.formatPercent(form2(stonk), 0),
  //       );
  //     } else {
  //       ns.printf('| %5s | %5s | %5s | %5s |', stonk.sym, stonk.snapshots.length, '15', '');
  //     }
  //   }
  //   ns.printf('+-------+-------+-------+-------+');
  //   await ns.stock.nextUpdate();
  //   ns.clearLog();
  // }
}
