
document.querySelector('.add-coins').addEventListener('click', ()=>{
    document.querySelector('.input-coin').innerHTML="";
    InputCreator();

})


function DeleteCoin(id) {
    CoinPrices = PortfolioStorage.deleteCoin(id);
}


async function RefreshCoin(id) {
    const refreshCooldown = 120000;
    const coinIndex = CoinPrices.findIndex((object) => object.Id === Number(id));
    if (coinIndex === -1) {
        alert("Coin not found");
        return false;
    }

    const Coindetails = CoinPrices[coinIndex];
    if (Date.now() - Coindetails.Id < refreshCooldown) {
        alert("⏱️ Please wait 2 minutes before refreshing this coin again!");
        return false;
    }

    try {
        const newValue = await FetchCoinData(Coindetails.Name);
        if (!newValue) {
            return false;
        }
        Coindetails.Id = Date.now();
        Coindetails.CurrentPrice = Number(newValue);
        await Fetch7DayData(Coindetails);
        CoinPrices = PortfolioStorage.persistPortfolio(CoinPrices);
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}



document.querySelector('.holdings').addEventListener('click', async(e)=>{
    const btn=e.target;
    if (btn.matches('.delete-button')) {
        const id = btn.getAttribute("id-value");
        DeleteCoin(id);
        render();
    }
    if (btn.matches('.refresh-button')) {
        const refid = btn.getAttribute("id-value");
        await RefreshCoin(refid);
        render();
    }

});


document.querySelector('.download-buttons').addEventListener('click',(e)=>{
    const button =  e.target;
    if(button.matches('.json')){
        downloadJSON(CoinPrices);
    }
    if(button.matches('.csv')){
        downloadCSV(CoinPrices);
    }
})