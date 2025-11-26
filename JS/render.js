function calculateTotals(source = []) {
    return source.reduce(
        (totals, coin) => {
            const quantity = Number(coin.Quantity) || 0;
            const current = Number(coin.CurrentPrice) || 0;
            const cost = Number(coin.Cost) || 0;
            const profit = (current - cost) * quantity;
            totals.totalValue += current * quantity;
            totals.totalProfit += profit;
            return totals;
        },
        { totalValue: 0, totalProfit: 0 }
    );
}

function render(coinPrices = CoinPrices, options = {}) {
    const { skipCompareUpdate = false, statsSource = CoinPrices } = options;
    const normalizedCoins = Array.isArray(coinPrices) ? coinPrices : [];
    const sortedCoins = sortArray(normalizedCoins);
    const totalcoins = document.querySelector(".coinlist");
    totalcoins.textContent = `My Holdings (${CoinPrices.length} Coins)`;

    const ResultGrid = document.querySelector(".holdings");
    ResultGrid.innerHTML = "";
    document.querySelector(".charts").innerHTML = "";

    sortedCoins.forEach((Coin) => {
        const quantityNum = Number(Coin.Quantity) || 0;
        const currentNum = Number(Coin.CurrentPrice) || 0;
        const costNum = Number(Coin.Cost) || 0;
        const profitORloss = (currentNum - costNum) * quantityNum;
        const baseCost = costNum * quantityNum;
        const profitPercent = baseCost === 0 ? 0 : (profitORloss / baseCost) * 100;

        const container = document.createElement("div");
        container.className = "CoinContainer";
        if (profitORloss < 0) {
            container.classList.add("is-loss");
        }

        const coinname = document.createElement("h3");
        const Cname = Coin.Name.charAt(0).toUpperCase() + Coin.Name.slice(1);
        coinname.textContent = `${Cname}`;

        const coinamount = document.createElement("p");
        coinamount.textContent = `Amount  :  ${Coin.Quantity}`;

        const buyprice = document.createElement("p");
        buyprice.textContent = `Buy Price  :  $${costNum.toFixed(2)}`;

        const currentprice = document.createElement("p");
        currentprice.textContent = `Current Price  :  $${currentNum.toFixed(2)}`;

        const ProfitOrLoss = document.createElement("p");
        ProfitOrLoss.textContent = `P&L  :  $${profitORloss.toFixed(2)} (${profitPercent.toFixed(2)} %)`;

        const btn = document.createElement("div");
        btn.className = "buttons";

        const refreshbtn = document.createElement("button");
        refreshbtn.textContent = "Refresh";
        refreshbtn.className = "refresh-button";
        refreshbtn.setAttribute("id-value", Coin.Id);
        btn.appendChild(refreshbtn);

        const deletebtn = document.createElement("button");
        deletebtn.textContent = "Delete";
        deletebtn.className = "delete-button";
        deletebtn.setAttribute("id-value", Coin.Id);
        btn.appendChild(deletebtn);

        container.appendChild(coinname);
        container.appendChild(coinamount);
        container.appendChild(buyprice);
        container.appendChild(currentprice);
        container.appendChild(ProfitOrLoss);
        container.appendChild(btn);

        ResultGrid.appendChild(container);

        const CoinChart = document.createElement("canvas");
        CoinChart.className = "chart";
        CoinChart.id = Coin.Id;
        document.querySelector(".charts").appendChild(CoinChart);
        RenderChart(Coin);
    });

    const totals = calculateTotals(statsSource);
    summary(totals.totalValue, totals.totalProfit);

    if (!skipCompareUpdate && statsSource === CoinPrices) {
        const date1 = new Date();
        storeForCompare(date1.toLocaleDateString(), totals.totalValue.toFixed(2), totals.totalProfit.toFixed(2));
    }
}

render();

function InputCreator() {
    const InputField = document.querySelector(".input-coin");
    const name = document.createElement("div");
    const quantity = document.createElement("div");
    const cost = document.createElement("div");
    const button = document.createElement("button");

    button.className = "add";
    button.textContent = "ADD";

    const namefield = document.createElement("p");
    namefield.textContent = "Coin Name : ";
    const quantityfield = document.createElement("p");
    quantityfield.textContent = "Quantity : ";
    const costfield = document.createElement("p");
    costfield.textContent = "You Bought the Coins for : ";

    name.appendChild(namefield);
    quantity.appendChild(quantityfield);
    cost.appendChild(costfield);

    const CoinName = document.createElement("input");
    CoinName.className = "coin-name";
    CoinName.type = "text";
    CoinName.placeholder = "Enter the coin ID (e.g. bitcoin)";

    name.appendChild(CoinName);

    const CoinQuantity = document.createElement("input");
    CoinQuantity.className = "coin-quantity";
    CoinQuantity.type = "Number";
    CoinQuantity.placeholder = "Quantity";

    quantity.appendChild(CoinQuantity);

    const BuyPrice = document.createElement("input");
    BuyPrice.className = "coin-cost";
    BuyPrice.type = "Number";
    BuyPrice.placeholder = "You bought the coin for";

    cost.appendChild(BuyPrice);

    const suggestion = document.createElement("p");
    suggestion.className = "suggestion";
    suggestion.textContent = "Try entering bitcoin, ethereum, solana";

    InputField.appendChild(suggestion);
    InputField.appendChild(name);
    InputField.appendChild(quantity);
    InputField.appendChild(cost);
    InputField.appendChild(button);
    GetUserData();
}

function GetUserData() {
    if (document.querySelector(".add")) {
        const Done = document.querySelector(".add");
        Done.addEventListener("click", async () => {
            const CoinNameGet = document.querySelector(".coin-name").value.trim();
            const CoinquantityGet = document.querySelector(".coin-quantity").value;
            const CoinCostGet = document.querySelector(".coin-cost").value;

            if (!CoinNameGet || !CoinCostGet || !CoinquantityGet) {
                alert("Please fill all the input fields!!");
                return false;
            }
            if (!/^[A-Za-z]+$/.test(CoinNameGet)) {
                alert("Please enter valid coin name!!");
                return false;
            }

            const duplicate = CoinPrices.find(
                (object) => object.Name.toLowerCase() === CoinNameGet.toLowerCase()
            );
            if (duplicate) {
                alert("You already have this coin in your portfolio!! Try another coin");
                EmptyInputField();
                return false;
            }

            const CoinCurrentPrice = await FetchCoinData(CoinNameGet);
            if (!CoinCurrentPrice) {
                return false;
            }
            StoreData(CoinNameGet, CoinquantityGet, CoinCostGet, Number(CoinCurrentPrice));
            const thisCoin = CoinPrices.find(
                (object) => object.Name.toLowerCase() === CoinNameGet.toLowerCase()
            );
            await Fetch7DayData(thisCoin);
            render();
            EmptyInputField();
        });
    }
}

function EmptyInputField() {
    document.querySelector(".coin-name").value = "";
    document.querySelector(".coin-quantity").value = "";
    document.querySelector(".coin-cost").value = "";
}

function summary(TotalValue, TotalProfitOrLoss) {
    const summarytotal = document.querySelector(".totalvalue");
    summarytotal.textContent = `Total Portfolio Value : $${TotalValue.toFixed(2)}`;

    const summaryprofit = document.querySelector(".totalprofit");
    if (TotalProfitOrLoss >= 0) {
        summaryprofit.textContent = `Total Profit : + $${TotalProfitOrLoss.toFixed(2)} 🟢`;
    } else {
        summaryprofit.textContent = `Total Loss : - $${Math.abs(TotalProfitOrLoss).toFixed(2)} 🔴`;
    }

    const yesterdaySummary = document.querySelector(".yesterday");
    const compareSummary = document.querySelector(".compare");
    yesterdaySummary.innerHTML = "";
    compareSummary.innerHTML = "";

    if (comparePortfolio?.yesterday && comparePortfolio?.today) {
        const ytitle = document.createElement("p");
        ytitle.textContent = "Yesterday's Stats";

        const yesterdayValue = document.createElement("p");
        yesterdayValue.className = "yesterdayvalue";
        const yesterdayValueNumber = Number(comparePortfolio.yesterday.yesterdayvalue) || 0;
        yesterdayValue.textContent = `Yesterday's Portfolio Value : $${yesterdayValueNumber.toFixed(2)}`;

        const yesterdayprofit = document.createElement("p");
        yesterdayprofit.className = "yesterdayprofit";
        const yesterdayProfitNumber = Number(comparePortfolio.yesterday.yesterdayprofit) || 0;
        if (yesterdayProfitNumber >= 0) {
            yesterdayprofit.textContent = `Yesterday's Profit Value : + $${yesterdayProfitNumber.toFixed(2)} 🟢`;
        } else {
            yesterdayprofit.textContent = `Yesterday's Loss Value : - $${Math.abs(yesterdayProfitNumber).toFixed(2)} 🔴`;
        }

        yesterdaySummary.appendChild(ytitle);
        yesterdaySummary.appendChild(yesterdayValue);
        yesterdaySummary.appendChild(yesterdayprofit);

        const ctitle = document.createElement("p");
        ctitle.textContent = "Comparison";

        const netValue = document.createElement("p");
        netValue.className = "netvalue";
        const todayValueNumber = Number(comparePortfolio.today.todayvalue) || 0;
        const valueDiff = todayValueNumber - yesterdayValueNumber;
        if (valueDiff >= 0) {
            netValue.textContent = `Total Value Increased : + $${valueDiff.toFixed(2)}`;
        } else {
            netValue.textContent = `Total Value Decreased : - $${Math.abs(valueDiff).toFixed(2)}`;
        }

        const netprofit = document.createElement("p");
        netprofit.className = "netprofit";
        const todayProfitNumber = Number(comparePortfolio.today.todayprofit) || 0;
        const profitDiff = todayProfitNumber - yesterdayProfitNumber;
        const percentDelta =
            yesterdayProfitNumber === 0 ? null : ((profitDiff / Math.abs(yesterdayProfitNumber)) * 100).toFixed(2);
        if (percentDelta) {
            if (profitDiff >= 0) {
                netprofit.textContent = `Total Profit Increased : + $${profitDiff.toFixed(2)} (${percentDelta} %) 🟢`;
            } else {
                netprofit.textContent = `Total Profit Decreased : - $${Math.abs(profitDiff).toFixed(2)} (${percentDelta} %) 🔴`;
            }
        } else {
            netprofit.textContent = `Total Profit Change : ${profitDiff >= 0 ? "+" : "-"} $${Math.abs(
                profitDiff
            ).toFixed(2)} (percent change requires a non-zero baseline)`;
        }

        compareSummary.appendChild(ctitle);
        compareSummary.appendChild(netValue);
        compareSummary.appendChild(netprofit);
    } else {
        const yHint = document.createElement("p");
        yHint.textContent = "Snapshots appear once the portfolio has history across multiple days.";
        yesterdaySummary.appendChild(yHint);

        const cHint = document.createElement("p");
        cHint.textContent = "Comparison stats show after a daily refresh pattern is recorded.";
        compareSummary.appendChild(cHint);
    }
}

function sortArray(array) {
    if (!Array.isArray(array)) {
        return [];
    }
    return [...array].sort((a, b) => (Number(b.CurrentPrice) || 0) - (Number(a.CurrentPrice) || 0));
}

