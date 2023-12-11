import { AutocompleteData, NS } from '@ns';
import { Color, colorPicker } from './helpers';

const argsSchema: [string, string | number | boolean | string[]][] = [['width', 35]];
const arrows = [
  colorPicker('⟱', Color.magenta),
  colorPicker('⤋', Color.magenta),
  colorPicker('⇓', Color.magenta),
  colorPicker('↓', Color.white),
  colorPicker('↕', Color.white),
  colorPicker('↑', Color.white),
  colorPicker('⇑', Color.green),
  colorPicker('⤊', Color.green),
  colorPicker('⟰', Color.green),
];

export function autocomplete(data: AutocompleteData) {
  data.flags(argsSchema);
  return [];
}

/** @param {NS} ns */
export async function main(ns: NS) {
  const flags = ns.flags(argsSchema);
  const st = ns.stock;
  if (!st.hasWSEAccount && !st.hasTIXAPIAccess) {
    ns.tprint('ERROR: Needs WSE Account and TIX API Access');
    ns.exit();
  }
  let has4S = false;
  if (st.has4SDataTIXAPI()) {
    has4S = true;
  }
  const dataFile = 'data/stocks.txt';
  const stocks: Stock[] = [];
  const legend =
    '|Long:   ' +
    colorPicker('▓░', Color.blue) +
    '|\n|Short:  ' +
    colorPicker('▓░', Color.magenta) +
    '|\n|Profit: ' +
    colorPicker('▓░', Color.green) +
    '|\n|Loss:   ' +
    colorPicker('▓░', Color.red) +
    '|';
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
  let rowSize = 34;
  if (typeof flags.width == 'number') {
    rowSize = Math.max(flags.width, 34);
  }
  const columnSize = stocks.length + 1;
  const width = rowSize * (482.03 / 50) + 4;
  const height = columnSize * 24 + 62;
  await st.nextUpdate();
  ns.tail();
  const pid = ns.getRunningScript()?.pid;
  ns.writePort(1, pid ? pid : ns.getScriptName());
  ns.moveTail(1605, 35);
  ns.setTitle(ns.getScriptName());
  while (true) {
    ns.resizeTail(width, height);
    ns.clearLog();
    ns.printf("┌%'─10s┐", '');
    ns.print(legend);
    ns.printf("└%'─10s┘", '');
    ns.printf("┌%'─6s─┬─Lowest%'─" + (rowSize - 18) + 's┐', 'Stock', 'Highest');
    for (const stock of stocks) {
      let tend = '│';
      if (has4S) {
        const forecast = st.getForecast(stock.name);
        if (forecast <= 0.3) tend = arrows[0];
        else if (forecast <= 0.35) tend = arrows[1];
        else if (forecast <= 0.4) tend = arrows[2];
        else if (forecast <= 0.45) tend = arrows[3];
        else if (forecast <= 0.55) tend = arrows[4];
        else if (forecast <= 0.6) tend = arrows[5];
        else if (forecast <= 0.65) tend = arrows[6];
        else if (forecast <= 0.7) tend = arrows[7];
        else tend = arrows[8];
      }
      stock.Update();
      const perc = (stock.currentPrice - stock.lowestPrice) / (stock.highestPrice - stock.lowestPrice);
      const position =
        (Math.max(stock.currentPosition[1], stock.currentPosition[3]) - stock.lowestPrice) /
        (stock.highestPrice - stock.lowestPrice);
      const bar = makeBar(rowSize - 32, perc, position, stock.currentPosition[3] > 0);
      ns.printf(
        '│ %5s | %8s %s %8s%s',
        stock.name,
        '$' + ns.formatNumber(stock.lowestPrice, 2),
        '[' + bar + ']',
        '$' + ns.formatNumber(stock.highestPrice, 2),
        tend,
      );
    }
    ns.printf("└%'─7s┴%'─-" + (rowSize - 11) + 's┘', '', '');

    await st.nextUpdate();
  }
}

function makeBar(size: number, percent: number, position?: number, short?: boolean) {
  let bar = '';
  if (!position) {
    position = -1;
  }
  let pos = 0;
  for (let i = 0; i < size; i++) {
    if (position >= (i / size + (i + 1) / size) / 2) {
      pos = i;
    }
    if (percent <= (i / size + (i + 1) / size) / 2) {
      bar += '░';
    } else {
      bar += '▓';
    }
  }
  if (position > 0) {
    if (short) {
      bar =
        bar.slice(0, pos).replaceAll('░', colorPicker('░', Color.green)) +
        colorPicker(bar.charAt(pos), Color.magenta) +
        bar.slice(pos + 1).replaceAll('▓', colorPicker('▓', Color.red));
    } else {
      bar =
        bar.slice(0, pos).replaceAll('░', colorPicker('░', Color.red)) +
        colorPicker(bar.charAt(pos), Color.blue) +
        bar.slice(pos + 1).replaceAll('▓', colorPicker('▓', Color.green));
    }
  }
  return bar;
}
