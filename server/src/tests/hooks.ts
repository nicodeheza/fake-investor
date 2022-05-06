import db from "../db/db";
import createTables from "../db/tables";
import populateDb from "./populateDb";

export const mochaHooks = {
	beforeAll: async function () {
		await db.promise().execute(`
		DROP TABLE IF EXISTS  Users, Stocks, Ownerships, History, Transactions
		`);
		await createTables();
		await populateDb();
	},
	afterAll: async function () {
		// await db.promise().execute(`
		// DROP TABLE IF EXISTS  Users, Stocks, Ownerships, History, Transactions
		// `);
	}
};
