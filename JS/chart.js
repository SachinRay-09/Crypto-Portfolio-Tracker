
let ChartInstances = {};


function RenderChart(coin){
    if(CoinPrices && coin.Dates && coin.Prices){  // Check if data exists
        const ctx = document.getElementById(coin.Id);
        
        if(ChartInstances[coin.Id]) {
            ChartInstances[coin.Id].destroy();
        }
        
        // Determine if price went up or down
        const firstPrice = coin.Prices[0];
        const lastPrice = coin.Prices[coin.Prices.length - 1];
        const isProfit = lastPrice >= firstPrice;
        
        ChartInstances[coin.Id] = new Chart(ctx, {
            type: 'line',  // Line looks better than bar for price trends
            data: {
                labels: coin.Dates,
                datasets: [{
                    label: `${coin.Name.toUpperCase()} Price (USD)`,
                    data: coin.Prices,
                    borderColor: isProfit ? '#10b981' : '#ef4444',  // Green/Red
                    backgroundColor: isProfit ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4  // Smooth curves
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toFixed(2);
                            }
                        }
                    }
                }
            }
        });
    }
}