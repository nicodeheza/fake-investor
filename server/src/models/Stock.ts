import db from "../db/db";

const Stock = {
	getIdFromSymbol: async (symbol: string) => {
		try {
			const [rows] = await db.promise().query(
				`
			SELECT stock_id FROM Stocks WHERE symbol=?
			`,
				[symbol]
			);

			// console.log((<{stock_id: number}[]>rows)[0].stock_id);
			return (<{stock_id: number}[]>rows)[0]?.stock_id;
		} catch (err) {
			console.log(err);
		}
	},
	addStock: async (symbol: string, name: string) => {
		try {
			const [rows] = await db.promise().query(
				`
			INSERT INTO Stocks (stock_name, symbol) VALUES (?,?)
			`,
				[name, symbol]
			);
			// console.log(rows);

			return (<{[key: string]: any}>rows).insertId;
		} catch (err) {
			console.log(err);
		}
	}
};

export default Stock;
