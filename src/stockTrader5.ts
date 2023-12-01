import { NS } from '@ns';

/**
 *  @author zacstarfire (modified by Drednite)
 *  @param {NS} ns
 *
 */
export async function main(ns: NS) {
  // Logging
  ns.disableLog('ALL');
  ns.tail();

  // Globals
  const scriptTimer = 2000; // Time script waits
  const moneyKeep = 1000000000; // Failsafe Money
  //const moneyKeep = 1000000;
  const stockBuyOver_Long = 0.6; // Buy stocks when forecast is over this %
  const stockBuyUnder_Short = 0.4; // Buy shorts when forecast is under this %
  const stockVolatility = 0.05; // Stocks must be under this volatility
  const minSharePercent = 5;
  const maxSharePercent = 1.0;
  const sellThreshold_Long = 0.55; // Sell Long when chance of increasing is under this
  const sellThreshold_Short = 0.4; // Sell Short when chance of increasing is under this
  const shortUnlock = false; // Set true when short stocks are available to player

  const runScript = true; // For debug purposes
  //   const toastDuration = 15000; // Toast message duration

  //   const extraFormats = [1e15, 1e18, 1e21, 1e24, 1e27, 1e30];
  //   const extraNotations = ['q', 'Q', 's', 'S', 'o', 'n'];
  //   const decimalPlaces = 3;

  //   // Functions
  //   // Use nFormat for values it can work with
  //   function format(number: number) {
  //     if (Math.abs(number) < 1e-6) {
  //       number = 0;
  //     }

  //     const answer = ns.nFormat(number, '$0.000a');

  //     if (answer === 'NaN') {
  //       return `${number}`;
  //     }

  //     return answer;
  //   }

  // numeral.js doesn't properly format numbers that are too big or too small
  // So, we will supply our own function for values over 't'
  //   function formatReallyBigNumber(number: number) {
  //     if (number === Infinity) return '∞';

  //     // Format numbers q+ properly
  //     for (let i = 0; i < extraFormats.length; i++) {
  //       if (extraFormats[i] < number && number <= extraFormats[i] * 1000) {
  //         return format(number / extraFormats[i], '0.' + '0'.repeat(decimalPlaces)) + extraNotations[i];
  //       }
  //     }

  //     // Use nFormat for numbers it can format
  //     if (Math.abs(number) < 1000) {
  //       return format(number, '0.' + '0'.repeat(decimalPlaces));
  //     }

  //     const str = format(number, '0.' + '0'.repeat(decimalPlaces) + 'a');

  //     if (str === 'NaN') return format(number, '0.' + ' '.repeat(decimalPlaces) + 'e+0');

  //     return str;
  //   }

  function buyPositions(stock: string) {
    const position = ns.stock.getPosition(stock);
    const maxShares = ns.stock.getMaxShares(stock) * maxSharePercent - position[0];
    const maxSharesShort = ns.stock.getMaxShares(stock) * maxSharePercent - position[2];
    const askPrice = ns.stock.getAskPrice(stock);
    const forecast = ns.stock.getForecast(stock);
    const volatilityPercent = ns.stock.getVolatility(stock);
    const playerMoney = ns.getPlayer().money;

    // Look for Long Stocks to buy
    if (forecast >= stockBuyOver_Long && volatilityPercent <= stockVolatility) {
      if (playerMoney - moneyKeep > ns.stock.getPurchaseCost(stock, minSharePercent, 'Long')) {
        const shares = Math.min((playerMoney - moneyKeep - 100000) / askPrice, maxShares);
        const boughtFor = ns.stock.buyStock(stock, shares);

        if (boughtFor > 0) {
          const message =
            'Bought ' + Math.round(shares) + ' Long shares of ' + stock + ' for $' + ns.formatNumber(boughtFor);

          //  ns.toast(message, 'success', toastDuration);
          ns.print(message);
        }
      }
    }

    // Look for Short Stocks to buy
    if (shortUnlock) {
      if (forecast <= stockBuyUnder_Short && volatilityPercent <= stockVolatility) {
        if (playerMoney - moneyKeep > ns.stock.getPurchaseCost(stock, minSharePercent, 'Short')) {
          const shares = Math.min((playerMoney - moneyKeep - 100000) / askPrice, maxSharesShort);
          const boughtFor = ns.stock.buyShort(stock, shares);

          if (boughtFor > 0) {
            const message =
              'Bought ' + Math.round(shares) + ' Short shares of ' + stock + ' for $' + ns.formatNumber(boughtFor);

            // ns.toast(message, 'success', toastDuration);
            ns.print(message);
          }
        }
      }
    }
  }

  function sellIfOutsideThreshdold(stock: string) {
    const position = ns.stock.getPosition(stock);
    const forecast = ns.stock.getForecast(stock);

    if (position[0] > 0) {
      const symbolRepeat = Math.floor(Math.abs(forecast * 10)) - 4;
      const plusOrMinus = true ? 50 + symbolRepeat : 50 - symbolRepeat;
      const forcastDisplay = (plusOrMinus ? '+' : '-').repeat(Math.abs(symbolRepeat));
      const profit = position[0] * (ns.stock.getBidPrice(stock) - position[1]) - 200000;

      // Output stock info & forecast
      ns.print(stock + ' 4S Forecast -> ' + (Math.round(forecast * 100) + '%   ' + forcastDisplay));
      ns.print('      Position -> $' + ns.formatNumber(position[0]));
      ns.print('      Profit -> $' + ns.formatNumber(profit));

      // Check if we need to sell Long stocks
      if (forecast < sellThreshold_Long) {
        const soldFor = ns.stock.sellStock(stock, position[0]);
        const message = 'Sold ' + position[0] + ' Long shares of ' + stock + ' for $' + ns.formatNumber(soldFor);

        // ns.toast(message, 'success', toastDuration);
        ns.print(message);
      }
    }

    if (shortUnlock) {
      if (position[2] > 0) {
        ns.print(stock + ' 4S Forecast -> ' + forecast.toFixed(2));

        // Check if we need to sell Short stocks
        if (forecast > sellThreshold_Short) {
          const soldFor = ns.stock.sellShort(stock, position[2]);
          const message = 'Sold ' + stock + ' Short shares of ' + stock + ' for $' + ns.formatNumber(soldFor);

          //ns.toast(message, 'success', toastDuration);
          ns.print(message);
        }
      }
    }
  }

  // Main Loop
  while (runScript) {
    // Get stocks in order of favorable forecast
    const orderedStocks = ns.stock.getSymbols().sort(function (a, b) {
      return Math.abs(0.5 - ns.stock.getForecast(b)) - Math.abs(0.5 - ns.stock.getForecast(a));
    });
    let currentWorth = 0;

    ns.print('--------------------------------');

    for (const stock of orderedStocks) {
      const position = ns.stock.getPosition(stock);

      if (position[0] > 0 || position[2] > 0) {
        // Check if we need to sell
        sellIfOutsideThreshdold(stock);
      }

      // Check if we should buy
      buyPositions(stock);

      // Track out current profit over time
      if (position[0] > 0 || position[2] > 0) {
        const longShares = position[0];
        const longPrice = position[1];
        const shortShares = position[2];
        const shortPrice = position[3];
        const bidPrice = ns.stock.getBidPrice(stock);

        // Calculate profit minus commision fees
        const profit = longShares * (bidPrice - longPrice) - 2 * 100000;
        const profitShort = shortShares * Math.abs(bidPrice - shortPrice) - 2 * 100000;

        // Calculate net worth
        currentWorth += profitShort + profit + longShares * longPrice + shortShares * shortPrice;
      }
    }

    // Output Script Status
    ns.print('--------------------------------');
    ns.print('Current Stock Worth: $' + ns.formatNumber(currentWorth));
    ns.print('Current Net Worth: $' + ns.formatNumber(currentWorth + ns.getPlayer().money));
    ns.print(new Date().toLocaleTimeString() + ' - Running ...');
    ns.print('--------------------------------');

    await ns.sleep(scriptTimer);

    // Clearing log makes the display more static
    // If you need the stock history, save it to a file
    ns.clearLog();
  }
}
