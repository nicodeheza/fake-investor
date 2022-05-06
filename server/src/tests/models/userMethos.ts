import {expect} from "chai";
import db from "../../db/db";
import User from "../../models/User";
import user from "../../models/UserType";

describe("User methods", function () {
	describe("FindUserByEmail", function () {
		it("FindUserByEmail(testUser@test.com) must return the test user", async function () {
			const findUserRes = await User.findUserByEmail("testUser@test.com");
			const findUser: user = (findUserRes as user[])[0];
			expect(findUser.user_id).to.equal(1);
			expect(findUser.email).to.equal("testUser@test.com");
			expect(findUser.hash).to.be.a("string");
			expect(findUser.salt).to.be.a("string");
			expect(findUser.start_day).to.be.a("Date");
		});
	});
	describe("SaveNewUser", async function () {
		let newUser: [string, number];
		before(async function () {
			newUser = await User.saveNewUser(
				"suitUser",
				"suitUser@test.com",
				"user_hash",
				"user_salt"
			);
		});
		after(async function () {
			await db.promise().execute(`
                DELETE FROM Users WHERE email= "suitUser@test.com"
            `);
		});

		it("User must be saved correctly in the db", async function () {
			const [row] = await db.promise().execute(`
                SELECT * FROM Users WHERE email= "suitUser@test.com"
            `);
			const findUser: user = (row as user[])[0];
			expect(findUser.user_id).to.be.a("number");
			expect(findUser.user_name).to.equal("suitUser");
			expect(findUser.email).to.equal("suitUser@test.com");
			expect(findUser.hash).to.equal("user_hash");
			expect(findUser.salt).to.equal("user_salt");
			const toDate = new Date();
			expect(findUser.start_day?.getDate()).to.equal(toDate.getDate());
			expect(findUser.start_day?.getMonth()).to.equal(toDate.getMonth());
			expect(findUser.start_day?.getFullYear()).to.equal(toDate.getFullYear());
		});

		it("Must return an array with 'success' and id", function () {
			expect(newUser[0]).to.equal("success");
			expect(newUser[1]).to.be.a("number");
			expect(newUser[1] % 1).to.equal(0);
		});
	});
	describe("FindById", function () {
		it("FindById(1) must return test user", async function () {
			const findUserRes = await User.findById(1);
			const findUser = (findUserRes as user[])[0];
			expect(findUser.user_id).to.equal(1);
			expect(findUser.email).to.equal("testUser@test.com");
			expect(findUser.user_name).to.equal("testUser");
		});
	});
	describe("AddStockOwnership", function () {
		let stockId: number;
		before(async function () {
			const [row] = await db.promise().execute(`
                INSERT INTO Stocks (stock_name, symbol)
                VALUES ("test-stock", "TS")
            `);
			stockId = (row as {[key: string]: any}).insertId;
		});
		after(async function () {
			await db.promise().execute(`
                DELETE FROM Stocks WHERE symbol= "TS"
            `);
		});
		it("Stock ownership must be saved correctly", async function () {
			await User.addStockOwnership(1, stockId, 200);
			const [row] = await db.promise().query(
				`
                SELECT * FROM Ownerships WHERE user_id= ? AND stock_id= ?
            `,
				[1, stockId]
			);
			const findOwnership = (row as {[key: string]: any}[])[0];

			expect(findOwnership.user_id).to.equal(1);
			expect(findOwnership.stock_id).to.equal(stockId);
			expect(parseInt(findOwnership.quantity)).to.equal(200);
		});
	});
	describe("GetStockHolding", function () {
		it("getStockHolding(1,2) must return 10", async function () {
			const result = await User.getStockHolding(1, 2);
			expect(result).to.equal(10);
		});
	});
	describe("GetAllStock", function () {
		const allUserStocks = [
			{
				symbol: "FUD",
				stock_name: "Fake Us Dolar",
				quantity: "994000.0000"
			},
			{
				symbol: "IBM",
				stock_name: "International Business Machines Corporation",
				quantity: "10.0000"
			},
			{symbol: "AAPL", stock_name: "Apple Inc.", quantity: "10.0000"},
			{symbol: "GOOG", stock_name: "Alphabet Inc.", quantity: "20.0000"}
		];
		it("Get all test user stocks correctly", async function () {
			const result = await User.getAllStock(1);
			expect(result).to.deep.equal(allUserStocks);
		});
	});

	describe("UpdateStockQuantity", function () {
		let stockId: number;
		before(async function () {
			const [row] = await db.promise().execute(`
                INSERT INTO Stocks (stock_name, symbol)
                VALUES ("test-stock", "TS")
            `);
			stockId = (row as {[key: string]: any}).insertId;
			await db.promise().query(
				`
            INSERT INTO Ownerships (user_id, stock_id, quantity)
            VALUES (?, ?, ?)
        `,
				[1, stockId, 100]
			);
		});
		after(async function () {
			await db.promise().query(
				`
		    DELETE FROM Stocks
		    WHERE stock_id=?
		    `,
				[stockId]
			);
		});
		it("if quantity > 0 update value correctly", async function () {
			await User.updateStockQuantity(stockId, 1, 200);
			const [row] = await db.promise().query(
				`
                SELECT * FROM Ownerships WHERE user_id= ? AND stock_id= ?
            `,
				[1, stockId]
			);
			const res = (row as {[key: string]: any}[])[0];
			expect(res.user_id).to.equal(1);
			expect(res.stock_id).to.equal(stockId);
			expect(parseInt(res.quantity)).to.equal(200);
		});
		it("if quantity === 0 value must be deleted", async function () {
			await User.updateStockQuantity(stockId, 1, 0);
			const [row] = await db.promise().query(
				`
                SELECT * FROM Ownerships WHERE user_id= ? AND stock_id= ?
            `,
				[1, stockId]
			);
			expect((row as any[]).length).to.equal(0);
		});
	});
	describe("SubtractFud", function () {
		after(async function () {
			const [row] = await db.promise().execute(`
			SELECT stock_id FROM Stocks WHERE symbol="FUD"
			`);
			const fudId = (<{stock_id: number}[]>row)[0].stock_id;
			await db.promise().query(
				`
			UPDATE Ownerships  SET quantity=?
			WHERE user_id=? AND stock_id=?
			`,
				[994000, 1, fudId]
			);
		});
		it("subtractFud(4000) must return 990000", async function () {
			await User.subtractFud(1, 4000);
			const [row] = await db.promise().execute(`
			SELECT stock_id FROM Stocks WHERE symbol="FUD"
			`);
			const fudId = (<{stock_id: number}[]>row)[0].stock_id;
			const [res] = await db.promise().query(
				`
                SELECT quantity FROM Ownerships WHERE user_id=? AND stock_id=?
            `,
				[1, fudId]
			);
			const result = (res as {quantity: string}[])[0].quantity;
			expect(parseInt(result)).to.equal(990000);
		});
	});
});
