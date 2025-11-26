function transformCoins(originalArray) {
    return originalArray.map(obj => {
        const quantity = Number(obj.Quantity);
        const buyPrice = Number(obj["Cost"]);
        const currentPrice = Number(obj["CurrentPrice"]);

        const pl = ((currentPrice - buyPrice) * quantity).toFixed(2);
        const plPercent = (((currentPrice - buyPrice) / buyPrice) * 100).toFixed(2);

        return {
        "Coin Name": obj["Name"],
        "Quantity": quantity,
        "Buy Price": buyPrice,
        "Current Price": currentPrice,
        "P&L": pl,
        "P&L %": plPercent
        };
    });
}



function downloadJSON(originalArray, filename = "portfolio.json") {
    const transformed = transformCoins(originalArray);
    const jsonStr = JSON.stringify(transformed, null, 2);

    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
}



function downloadCSV(originalArray, filename = "portfolio.csv") {
    const transformed = transformCoins(originalArray);

    // Extract headers
    if (transformed.length === 0) {
        alert("Add coins to download your portfolio.");
        return;
    }
    const headers = Object.keys(transformed[0]);

    // Build rows
    const rows = [
        headers,
        ...transformed.map(obj => headers.map(h => obj[h]))
    ];

    // Convert to CSV string
    const csvContent = rows.map(e => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
    }


