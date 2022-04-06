import db from "../db/db";

const Stock = {
	getIdFromSymbol: async (symbol: string) => {
		const [rows] = await db.promise().query(
			`
        SELECT stock_id FROM Stocks WHERE symbol=?
        `,
			[symbol]
		);

		// console.log((<{stock_id: number}[]>rows)[0].stock_id);
		return (<{stock_id: number}[]>rows)[0]?.stock_id;
	}
};

export default Stock;
