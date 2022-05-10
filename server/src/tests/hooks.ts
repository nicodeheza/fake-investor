import db from "../db/db";
import createTables from "../db/tables";
import {addStocks, populateDb} from "./populateDb";
import testConst from "./testConst";

export const mochaHooks = {
	beforeAll: async function () {
		await db.promise().execute(`
		DROP TABLE IF EXISTS  Users, Stocks, Ownerships, History, Transactions
		`);
		await createTables();
		const stocks = await addStocks();
		const {histories, userId} = await populateDb(stocks, "testUser@test.com");
		testConst.historyPoints = histories;
		testConst.stocks = stocks;
		testConst.userId = userId;
	},
	afterAll: async function () {
		// await db.promise().execute(`
		// DROP TABLE IF EXISTS  Users, Stocks, Ownerships, History, Transactions
		// `);
	}
};
