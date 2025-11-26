# Crypto Portfolio Tracker

A Crypto tracker that keeps tabs on your favorite cryptocurrencies, draws seven-day trends with Chart.js, and stores every holding inside a dedicated `localStorage` bucket.

## Usage

1. Open `index.html` locally or host via GitHub Pages / any static server.
2. Click **Add Coin** → enter the CoinGecko ID (e.g. `bitcoin`), quantity, and buy price.
3. Use **Refresh** to fetch the latest USD price and chart (rate-limited to once every **2 minutes** per coin).
4. Delete holdings with the **Delete** button, download the list as JSON/CSV, or search/filter by name.
5. Stats cards show the total value/profit, yesterday’s snapshot, and the difference once a second daily refresh is recorded.

## Data persistence

- Holdings are normalized and saved under `crypto-portfolio-data`; comparison snapshots live under `crypto-portfolio-compare`.
- Legacy data stored under the old `DATA`/`compare` keys is migrated automatically on first load.
- Everything stays in the browser’s `localStorage`, so closing the tab keeps your portfolio but clearing storage or using a private session will reset it.

## Limitations

- Each coin refresh enforces a **two-minute cooldown** to avoid hitting the public CoinGecko rate limits.
- Only coins with valid CoinGecko IDs are supported; misspelled names are rejected client-side.
- There is no server-side persistence or authentication—data lives locally and is visible to anyone with access to the same browser profile.
- Charts show only the last 7 days of price history and rely on the CoinGecko free API, which may throttle rapid requests.



