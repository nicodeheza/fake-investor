import db from "../db/db";
import createTables from "../db/tables";
import populateDb from "./populateDb";
import testConst from "./testConst";

export const mochaHooks = {
	beforeAll: async function () {
		await db.promise().execute(`
		DROP TABLE IF EXISTS  Users, Stocks, Ownerships, History, Transactions
		`);
		await createTables();
		const h = await populateDb();
		testConst.historyPoints = h;
	},
	afterAll: async function () {
		// await db.promise().execute(`
		// DROP TABLE IF EXISTS  Users, Stocks, Ownerships, History, Transactions
		// `);
	}
};
