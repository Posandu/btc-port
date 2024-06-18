const PRICES_CSV = "prices.csv";
const CHART = document.getElementById("chart");
const DAILY_BUY_AMOUNT = 1.75;

let prices = [];
let avgPrices = [];
let cummAccumilatedBTC = [];
let cummAccumilatedUSD = [];

let totalInvestedUSD = 0;
let totalInvestedBTC = 0;
let ROI = 0;

const loadPrices = async () => {
	const response = await fetch(PRICES_CSV);
	const data = await response.text();
	const rows = data.split("\n").slice(1);

	prices = rows.map((row) => {
		const cols = row.split(",");
		return parseFloat(cols[4]);
	});
};

const makeData = async () => {
	for (let i = 0; i < prices.length; i++) {
		const priceAtDay = prices[i];
		const priceAtDayBefore = prices[i - 1] || priceAtDay;

		const movement = (priceAtDay / priceAtDayBefore - 1) * 100;

		let buying = DAILY_BUY_AMOUNT / priceAtDay;

		console.log(movement, buying);

		if (i === 0) {
			cummAccumilatedBTC.push(buying);
			cummAccumilatedUSD.push(DAILY_BUY_AMOUNT);
		} else {
			cummAccumilatedBTC.push(cummAccumilatedBTC[i - 1] + buying);
			cummAccumilatedUSD.push(cummAccumilatedUSD[i - 1] + DAILY_BUY_AMOUNT);
		}

		const avgPrice = cummAccumilatedUSD[i] / cummAccumilatedBTC[i];

		avgPrices.push(avgPrice);
	}
};

const drawChart = async () => {
	const ctx = CHART.getContext("2d");

	new Chart(ctx, {
		type: "line",
		data: {
			labels: Array.from({ length: prices.length }, (_, i) => i),
			datasets: [
				{
					label: "Price",
					data: prices,
					borderColor: "rgba(255, 99, 132, 1)",
					backgroundColor: "rgba(255, 99, 132, 0.2)",
					fill: true,
				},
				{
					label: "Avg Price",
					data: avgPrices,
					borderColor: "rgba(54, 162, 235, 1)",
					backgroundColor: "rgba(54, 162, 235, 0.2)",
					fill: true,
				},
				{
					label: "Cummulative Accumilated BTC",
					type: "line",
					data: cummAccumilatedBTC,
					borderColor: "rgba(75, 192, 192, 1)",
					backgroundColor: "rgba(75, 192, 192, 0.2)",
					fill: true,
					yAxisID: "y-axis-2",
				},
			],
		},
		options: {
			responsive: true,
			maintainAspectRatio: false,
			scales: {
				y: {
					beginAtZero: true,
					type: "logarithmic",
					min: Math.min(...prices) - 1000,
				},
			},
		},
	});
};

const calculateROI = async () => {
	totalInvestedUSD = DAILY_BUY_AMOUNT * prices.length;
	totalInvestedBTC = cummAccumilatedBTC.at(-1);

	ROI =
		(totalInvestedBTC * prices[prices.length - 1] - totalInvestedUSD) /
		totalInvestedUSD;
	ROI *= 100;

	const totalInvestedUSDFormatted = new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
	}).format(totalInvestedUSD);

	const totalInvestedBTCFormatted = new Intl.NumberFormat("en-US", {
		style: "decimal",
		maximumFractionDigits: 8,
	}).format(totalInvestedBTC);

	document.getElementById("investment-usd").innerText =
		"Invested: " + totalInvestedUSDFormatted;
	document.getElementById("investment-btc").innerText =
		"Got: " +
		totalInvestedBTCFormatted +
		" BTC (" +
		(totalInvestedBTC * prices.at(-1)).toFixed(2) +
		" USD)";
	document.getElementById("investment-roi").innerText =
		"ROI: " +
		ROI.toFixed(2) +
		"%" +
		(ROI > 0 ? " 🚀" : " 💩") +
		"\n" +
		((totalInvestedBTC * prices.at(-1)).toFixed(2) - totalInvestedUSD).toFixed(
			2
		);
};

const main = async () => {
	await loadPrices();
	await makeData();
	await drawChart();
	await calculateROI();
};

main();
