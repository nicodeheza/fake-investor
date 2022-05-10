import {expect} from "chai";
import db from "../../db/db";
import Stock from "../../models/Stock";

describe("Stock methods", function () {
	describe("GetIdFromSymbol", function () {
		it("FUD must return 1", async function () {
			const fudId = await Stock.getIdFromSymbol("FUD");
			expect(fudId).to.equal(1);
		});
	});
	describe("AddStock", function () {
		after(async function () {
			await db.promise().execute(`
                DELETE FROM Stocks WHERE symbol= "TEST"
            `);
		});
		it("stock must be add successfully", async function () {
			const stockId = await Stock.addStock("TEST", "test stock");
			const [row] = await db.promise().query(
				`
                SELECT * FROM Stocks WHERE stock_id= ?
            `,
				[stockId]
			);
			const stock = (row as {[key: string]: any}[])[0];
			expect(stock.stock_name).to.equal("test stock");
			expect(stock.symbol).to.equal("TEST");
		});
	});
	describe("GetTopSymbols", function () {
		it("return top symbols successfully and in order", async function () {
			const top = await Stock.getTopSymbols();
			expect(top).to.have.lengthOf(3);
			const sortTop = [...(top as [])].sort((a, b) => b["buys-num"] - a["buys-num"]);
			expect(top).to.deep.equal(sortTop);
			expect((top as {}[])[0]).to.have.property("symbol");
			expect((top as {}[])[0]).to.have.property("stock_name");
			expect((top as {}[])[0]).to.have.property("buys-num");
		});
	});
});
