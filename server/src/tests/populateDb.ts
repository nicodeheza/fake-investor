import db from "../db/db";
import {createHash} from "../functions/password";

export default async function populateDb() {
	const {hash, salt} = (await createHash("test")) as {hash: string; salt: string};
	const startDay = new Date(Date.now() - 1000 * 60 * 60 * 24 * 7);

	const [userCreated] = await db.promise().query(
		`
        INSERT INTO Users (user_name, email, hash, salt, start_day)
        VALUES(?, ?, ?, ?, ?);
    `,
		["testUser", "testUser@test.com", hash, salt, startDay]
	);
	const userId: number = (userCreated as {[key: string]: any}).insertId;
	// console.log(userId);
	const stocks: {
		name: string;
		symbol: string;
		id?: number;
	}[] = [
		{
			name: "International Business Machines Corporation",
			symbol: "IBM"
		},
		{
			name: "Apple Inc.",
			symbol: "AAPL"
		},
		{
			name: "Alphabet Inc.",
			symbol: "GOOG"
		}
	];
	const stocksCreated = await Promise.all(
		stocks.map((stock) => {
			return db.promise().query(
				`
            INSERT INTO Stocks (stock_name, symbol)
            VALUES(?,?);
        `,
				[stock.name, stock.symbol]
			);
		})
	);
	stocks.forEach((ele, i) => {
		ele.id = (stocksCreated[i][0] as {[key: string]: any}).insertId;
	});
	// console.log(stocksCreated);
	// console.log(stocks);
	const histories = [
		{
			date: startDay,
			userId,
			portfolioValue: 1000000,
			liquid: 999000,
			transactions: {
				stockId: stocks.filter((ele) => ele.symbol === "IBM")[0].id,
				buy: true,
				price: 100,
				quantity: 10
			}
		},
		{
			date: new Date(startDay.getTime() + 1000 * 60 * 60 * 24 * 2),
			userId,
			portfolioValue: 1000000,
			liquid: 996000,
			transactions: {
				stockId: stocks.filter((ele) => ele.symbol === "AAPL")[0].id,
				buy: true,
				price: 200,
				quantity: 15
			}
		},
		{
			date: new Date(startDay.getTime() + 1000 * 60 * 60 * 24 * 4),
			userId,
			portfolioValue: 1000000,
			liquid: 997000,
			transactions: {
				stockId: stocks.filter((ele) => ele.symbol === "AAPL")[0].id,
				buy: false,
				price: 200,
				quantity: 5
			}
		},
		{
			date: new Date(startDay.getTime() + 1000 * 60 * 60 * 24 * 5),
			userId,
			portfolioValue: 1000000,
			liquid: 994000,
			transactions: {
				stockId: stocks.filter((ele) => ele.symbol === "GOOG")[0].id,
				buy: true,
				price: 150,
				quantity: 20
			}
		}
	];
	Promise.all(
		histories.map(async (ele) => {
			const [hc] = await db.promise().query(
				`
		INSERT INTO History (history_date, user_id, portfolio_value, liquid)
		VALUES (?, ?, ?, ?)
		`,
				[ele.date, ele.userId, ele.portfolioValue, ele.liquid]
			);
			const historyId = (hc as {[key: string]: any}).insertId;
			await db.promise().query(
				`
			INSERT INTO Transactions (history_id, stock_id, buy, price, quantity)
			VALUES (?, ?, ?, ?, ?)
		`,
				[
					historyId,
					ele.transactions.stockId,
					ele.transactions.buy,
					ele.transactions.price,
					ele.transactions.quantity
				]
			);
		})
	);

	Promise.all([
		db.promise().query(
			`
			INSERT INTO Ownerships (user_id, stock_id, quantity)
			VALUES (? ,? ,?)
		`,
			[userId, stocks.filter((ele) => ele.symbol === "IBM")[0].id, 10]
		),
		db.promise().query(
			`
			INSERT INTO Ownerships (user_id, stock_id, quantity)
			VALUES (? ,? ,?)
		`,
			[userId, stocks.filter((ele) => ele.symbol === "AAPL")[0].id, 10]
		),
		db.promise().query(
			`
			INSERT INTO Ownerships (user_id, stock_id, quantity)
			VALUES (? ,? ,?)
		`,
			[userId, stocks.filter((ele) => ele.symbol === "GOOG")[0].id, 20]
		),
		db.promise().query(
			`
			INSERT INTO Ownerships (user_id, stock_id, quantity)
			VALUES (? ,? ,?)
		`,
			[userId, 1, 994000]
		)
	]);
}
