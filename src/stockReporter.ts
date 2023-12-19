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
  ns.disableLog('ALL');
  while (!st.purchaseWseAccount()) {
    ns.print('Purchasing WSE Account...');
    await ns.sleep(1000);
    ns.clearLog();
  }
  while (!st.purchaseTixApi()) {
    ns.print('Purchasing TIX API Access...');
    await ns.sleep(1000);
    ns.clearLog();
  }
  let has4S = st.has4SDataTIXAPI();

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
      this.currentPosition = st.getPosition(this.name);
      if (this.currentPrice < (this.highestPrice + this.lowestPrice) / 2)
        this.highestPrice -= 0.001 * (this.highestPrice - this.lowestPrice);
      else this.lowestPrice += 0.001 * (this.highestPrice - this.lowestPrice);
      if (this.currentPrice > this.highestPrice) this.highestPrice = this.currentPrice + 1;
      const paid = Math.max(this.currentPosition[1], this.currentPosition[3]);
      if (paid > 0 && paid > this.highestPrice) this.highestPrice = paid + 1;
      if (this.currentPrice < this.lowestPrice) this.lowestPrice = this.currentPrice - 1;
      if (paid > 0 && paid < this.lowestPrice) this.lowestPrice = paid - 1;
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
  stocks.sort((a, b) => (a.name > b.name ? 1 : -1));
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

  // MAIN LOOP //
  while (true) {
    ns.resizeTail(width, height);
    ns.clearLog();
    ns.printf("┌%'─10s┐", '');
    ns.print(legend);
    ns.printf("└%'─10s┘", '');
    ns.printf("┌%'─6s─┬─%'─-" + (rowSize - 12) + 's┐', 'Stock', 'Price');
    for (const stock of stocks) {
      let tend = '│';
      if (has4S) {
        const forecast = st.getForecast(stock.name);
        if (forecast <= 0.25) tend = colorPicker('⟱', Color.magenta);
        else if (forecast <= 0.3) tend = colorPicker('⤋', Color.magenta);
        else if (forecast <= 0.35) tend = colorPicker('⇓', Color.magenta);
        else if (forecast <= 0.4) tend = colorPicker('↓', Color.magenta);
        else if (forecast <= 0.45) tend = colorPicker('↓', Color.white);
        else if (forecast <= 0.55) tend = colorPicker('↕', Color.white);
        else if (forecast <= 0.6) tend = colorPicker('↑', Color.white);
        else if (forecast <= 0.65) tend = colorPicker('↑', Color.green);
        else if (forecast <= 0.7) tend = colorPicker('⇑', Color.green);
        else if (forecast <= 0.75) tend = colorPicker('⤊', Color.green);
        else tend = colorPicker('⟰', Color.green);
      } else if (st.purchase4SMarketDataTixApi()) {
        ns.print('SUCCESS: 4S TIX API purchased');
        has4S = true;
      }
      stock.Update();
      const perc = (stock.currentPrice - stock.lowestPrice) / (stock.highestPrice - stock.lowestPrice);
      const position =
        (Math.max(stock.currentPosition[1], stock.currentPosition[3]) - stock.lowestPrice) /
        (stock.highestPrice - stock.lowestPrice);
      const bar = makeBar(rowSize - 23, perc, position, stock.currentPosition[3] > 0);
      ns.printf('│ %5s | %8s %s%s', stock.name, '$' + ns.formatNumber(stock.currentPrice, 2), '[' + bar + ']', tend);
    }
    ns.printf("└%'─7s┴%'─-" + (rowSize - 11) + 's┘', '', '');

    await st.nextUpdate();
  }
}

function makeBar(size: number, percent: number, position: number, short?: boolean) {
  let bar = '';
  // if (position < 0) {
  //   position = -1;
  // }
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
  if (position >= 0) {
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
