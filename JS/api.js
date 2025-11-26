
async function FetchCoinData(CoinName){
    try{
        const url=`https://api.coingecko.com/api/v3/simple/price?ids=${CoinName}&vs_currencies=usd`;
        const info = await fetch(url);
        const data = await info.json();
        console.log(data[CoinName].usd);
        return data[CoinName].usd;
    } catch(error){
        alert(`API fetch was unsuccessful! Error ${error}`);
        return false;
    }
}



//function to get last seven days data for the coin. The data we get from API have prices and metadata. Prices have elements containing dates and closing prices as a array pair.
async function Fetch7DayData(Coin) {
    try{
        let Dates=[];
        let Prices=[];
        const url=`https://api.coingecko.com/api/v3/coins/${Coin.Name}/market_chart?vs_currency=usd&days=7&interval=daily`;
        const info = await fetch(url);
        const data = await info.json();
        data.prices.forEach(p=>{
            Dates.push(new Date(p[0]).toLocaleDateString());
            Prices.push(Number(p[1]));
        })
        Coin['Dates'] = Dates;
        Coin['Prices'] = Prices;
        PortfolioStorage.persistPortfolio(CoinPrices);
    } catch(error){
        alert(`Couldn't fetch last 7 days data for  ${Coin.Name}`);
        return false;
    }
}
