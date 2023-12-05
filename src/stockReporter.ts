import { AutocompleteData, NS } from '@ns';
import { Color, colorPicker } from './helpers';

const argsSchema: [string, string | number | boolean | string[]][] = [['width', 36]];

export function autocomplete(data: AutocompleteData) {
  data.flags(argsSchema);
  return [];
}

/** @param {NS} ns */
export async function main(ns: NS) {
  const flags = ns.flags(argsSchema);
  const st = ns.stock;
  const dataFile = 'data/stocks.txt';
  const stocks: Stock[] = [];
  class Stock {
    name: string;
    highestPrice: number;
    lowestPrice: number;
    currentPrice: number;
    currentPosition: [number, number, number, number];

    constructor(sym: string, curr?: number, high?: number, low?: number, pos?: [number, number, number, number]) {
      this.name = sym;
      this.currentPrice = curr ? curr : st.getPrice(sym);
      this.highestPrice = high ? high : this.currentPrice;
      this.lowestPrice = low ? low : this.currentPrice;
      this.currentPosition = pos ? pos : st.getPosition(sym);
      if (this.currentPosition[0] && this.currentPosition[1] < this.lowestPrice) {
        this.lowestPrice = this.currentPosition[1];
      }
      if (this.currentPosition[2] && this.currentPosition[3] > this.highestPrice) {
        this.highestPrice = this.currentPosition[3];
      }
    }

    Update() {
      this.currentPrice = st.getPrice(this.name);
      if (this.currentPrice > this.highestPrice) this.highestPrice = this.currentPrice;
      if (this.currentPrice < this.lowestPrice) this.lowestPrice = this.currentPrice;
      this.currentPosition = st.getPosition(this.name);
    }
  }
  ns.atExit(() => {
    let data = JSON.stringify(stocks[0]);
    for (let i = 1; i < stocks.length; i++) {
      data += ',\n' + JSON.stringify(stocks[i]);
    }
    ns.write(dataFile, data, 'w');
  });
  if (ns.fileExists(dataFile)) {
    try {
      const data = ns.read(dataFile).split(',\n');
      for (const ent of data) {
        const stock = JSON.parse(ent);
        stocks.push(
          new Stock(stock.name, stock.currentPrice, stock.highestPrice, stock.lowestPrice, stock.currentPosition),
        );
      }
    } catch {
      ns.tprint('ERROR: Invalid data file ' + dataFile);
    }
  }
  for (const sym of st.getSymbols()) {
    if (!stocks.some((stock) => stock.name == sym)) {
      stocks.push(new Stock(sym));
    }
  }
  let rowSize = 90;
  if (typeof flags.width == 'number') {
    rowSize = Math.max(flags.width, 34);
  }
  const columnSize = stocks.length + 1;
  const width = rowSize * (482.03 / 50) + 4;
  const height = columnSize * 24 + 62;
  await st.nextUpdate();
  ns.tail();
  while (true) {
    ns.resizeTail(width, height);
    ns.clearLog();
    ns.printf("┌%'─6s─┬─Lowest%'─" + (rowSize - 18) + 's┐', 'Stock', 'Highest');
    for (const stock of stocks) {
      stock.Update();
      const perc = (stock.currentPrice - stock.lowestPrice) / (stock.highestPrice - stock.lowestPrice);
      const position =
        (Math.max(stock.currentPosition[1], stock.currentPosition[3]) - stock.lowestPrice) /
        (stock.highestPrice - stock.lowestPrice);
      const bar = makeBar(rowSize - 30, perc, position);
      ns.printf(
        '│ %5s │ %8s %s %8s│',
        stock.name,
        '$' + ns.formatNumber(stock.lowestPrice, 2),
        bar,
        '$' + ns.formatNumber(stock.highestPrice, 2),
      );
    }
    ns.printf("└%'─7s┴%'─-" + (rowSize - 11) + 's┘', '', '');

    await st.nextUpdate();
  }
}

function makeBar(size: number, percent: number, position?: number) {
  let bar = '[';
  if (!position) {
    position = 0;
  }
  let pos = 0;
  for (let i = 1; i < size - 1; i++) {
    if (position > i / size) {
      pos = i;
    }
    if (percent < i / size) {
      bar += '░';
    } else {
      bar += '▓';
    }
  }
  bar += ']';
  if (position > 0) {
    bar = bar.slice(0, pos) + colorPicker(bar.charAt(pos), Color.cyan) + bar.slice(pos + 1);
  }
  return bar;
}
