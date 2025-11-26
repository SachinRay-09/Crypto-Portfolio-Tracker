const STORAGE_KEYS = {
    portfolio: "crypto-portfolio-data",
    compare: "crypto-portfolio-compare"
};

function safeParseJSON(value, fallback) {
    if (!value) {
        return fallback;
    }
    try {
        return JSON.parse(value);
    } catch (error) {
        console.warn("Failed to parse stored value", error);
        return fallback;
    }
}

function migrateLegacyStorage() {
    const legacyPortfolio = safeParseJSON(localStorage.getItem("DATA"), null);
    if (legacyPortfolio && Array.isArray(legacyPortfolio) && !localStorage.getItem(STORAGE_KEYS.portfolio)) {
        localStorage.setItem(STORAGE_KEYS.portfolio, JSON.stringify(legacyPortfolio));
        localStorage.removeItem("DATA");
    }

    const legacyCompare = safeParseJSON(localStorage.getItem("compare"), null);
    if (legacyCompare && !localStorage.getItem(STORAGE_KEYS.compare)) {
        localStorage.setItem(STORAGE_KEYS.compare, JSON.stringify(legacyCompare));
        localStorage.removeItem("compare");
    }
}

migrateLegacyStorage();

function normalizeCoin(raw) {
    const name = raw.Name ? String(raw.Name).trim() : "";
    return {
        Id: Number(raw.Id) || Date.now(),
        Name: name,
        Quantity: Number(raw.Quantity) || 0,
        Cost: Number(raw.Cost) || 0,
        CurrentPrice: Number(raw.CurrentPrice) || 0,
        Dates: Array.isArray(raw.Dates) ? raw.Dates.map(String) : [],
        Prices: Array.isArray(raw.Prices) ? raw.Prices.map(Number) : []
    };
}

const PortfolioStorage = (() => {
    function getPortfolio() {
        const stored = safeParseJSON(localStorage.getItem(STORAGE_KEYS.portfolio), []);
        if (!Array.isArray(stored)) {
            return [];
        }
        return stored.map(normalizeCoin);
    }

    function persistPortfolio(list) {
        localStorage.setItem(STORAGE_KEYS.portfolio, JSON.stringify(list));
        return list;
    }

    function addCoin(payload) {
        const coins = getPortfolio();
        const normalized = normalizeCoin(payload);
        if (!normalized.Name) {
            return coins;
        }
        const exists = coins.some(coin => coin.Name.toLowerCase() === normalized.Name.toLowerCase());
        if (exists) {
            return coins;
        }
        const next = [...coins, normalized];
        return persistPortfolio(next);
    }

    function deleteCoin(id) {
        const coins = getPortfolio();
        const next = coins.filter(coin => coin.Id !== Number(id));
        if (next.length === coins.length) {
            return coins;
        }
        return persistPortfolio(next);
    }

    function getCompareData() {
        const stored = safeParseJSON(localStorage.getItem(STORAGE_KEYS.compare), {});
        return {
            yesterday: stored.yesterday || null,
            today: stored.today || null
        };
    }

    function setCompareData(payload) {
        const sanitized = {
            yesterday: payload?.yesterday || null,
            today: payload?.today || null
        };
        localStorage.setItem(STORAGE_KEYS.compare, JSON.stringify(sanitized));
        return sanitized;
    }

    return {
        getPortfolio,
        persistPortfolio,
        addCoin,
        deleteCoin,
        getCompareData,
        setCompareData
    };
})();

let CoinPrices = PortfolioStorage.getPortfolio();
let comparePortfolio = PortfolioStorage.getCompareData();

function StoreData(coin_name, coin_quantity, coin_cost, coin_current_price) {
    CoinPrices = PortfolioStorage.addCoin({
        Name: coin_name.trim(),
        Quantity: Number(coin_quantity) || 0,
        Cost: Number(coin_cost) || 0,
        CurrentPrice: Number(coin_current_price) || 0
    });
    console.log("successfully stored the data");
}

function parseDate(d) {
    const [day, month, year] = d.split('/');
    return new Date(year, month - 1, day);
}

function storeForCompare(date, value, profit) {
    const parsedValue = Number(value) || 0;
    const parsedProfit = Number(profit) || 0;
    const newToday = {
        todaydate: date,
        todayvalue: parsedValue,
        todayprofit: parsedProfit
    };

    const prevToday = comparePortfolio?.today;
    const prevYesterday = comparePortfolio?.yesterday;

    let nextDay = {
        yesterday: prevYesterday || null,
        today: newToday
    };

    if (!prevToday) {
        nextDay.yesterday = null;
    } else if (parseDate(date) > parseDate(prevToday.todaydate)) {
        nextDay.yesterday = { ...prevToday };
    }

    comparePortfolio = PortfolioStorage.setCompareData(nextDay);
}
