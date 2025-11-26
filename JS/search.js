const header = document.querySelector('.searchHeader');
if (header) {
    const search = document.createElement('input');
    search.className = "coinSearch";
    search.placeholder = "Search holdings";
    search.type = "text";
    header.appendChild(search);

    search.addEventListener("input", () => {
        const term = search.value.trim().toLowerCase();
        if (!term) {
            render();
            return;
        }
        const filtered = CoinPrices.filter((obj) => obj.Name.toLowerCase().includes(term));
        render(filtered, { skipCompareUpdate: true, statsSource: CoinPrices });
    });
}
