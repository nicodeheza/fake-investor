import {expect} from "chai";
import db from "../../db/db";
import User from "../../models/User";
import user from "../../models/UserType";
import {populateDb} from "../populateDb";
import testConst from "../testConst";

describe("User methods", function () {
	let fudId: number;
	before(async function () {
		const [row] = await db.promise().execute(`
		SELECT stock_id FROM Stocks WHERE symbol="FUD"
		`);
		fudId = (<{stock_id: number}[]>row)[0].stock_id;
	});
	describe("FindUserByEmail", function () {
		it("FindUserByEmail(testUser@test.com) must return the test user", async function () {
			const findUserRes = await User.findUserByEmail("testUser@test.com");
			const findUser: user = (findUserRes as user[])[0];
			expect(findUser.user_id).to.equal(testConst.userId);
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
			expect(findUser.user_id).to.equal(testConst.userId);
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

			expect(findOwnership.user_id).to.equal(testConst.userId);
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
				[testConst.userId, stockId, 100]
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
				[testConst.userId, stockId]
			);
			const res = (row as {[key: string]: any}[])[0];
			expect(res.user_id).to.equal(testConst.userId);
			expect(res.stock_id).to.equal(stockId);
			expect(parseInt(res.quantity)).to.equal(200);
		});
		it("if quantity === 0 value must be deleted", async function () {
			await User.updateStockQuantity(stockId, 1, 0);
			const [row] = await db.promise().query(
				`
                SELECT * FROM Ownerships WHERE user_id= ? AND stock_id= ?
            `,
				[testConst.userId, stockId]
			);
			expect((row as any[]).length).to.equal(0);
		});
	});
	describe("SubtractFud", function () {
		after(async function () {
			await db.promise().query(
				`
			UPDATE Ownerships  SET quantity=?
			WHERE user_id=? AND stock_id=?
			`,
				[994000, testConst.userId, fudId]
			);
		});
		it("subtractFud(4000) must return 990000", async function () {
			await User.subtractFud(1, 4000);
			const [res] = await db.promise().query(
				`
                SELECT quantity FROM Ownerships WHERE user_id=? AND stock_id=?
            `,
				[testConst.userId, fudId]
			);
			const result = (res as {quantity: string}[])[0].quantity;
			expect(parseInt(result)).to.equal(990000);
		});
	});
	describe("AddFud", function () {
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
				[994000, testConst.userId, fudId]
			);
		});
		it("addFud(4000) must be 998000", async function () {
			await User.addFud(1, 4000);
			const [res] = await db.promise().query(
				`
                	SELECT quantity FROM Ownerships WHERE user_id=? AND stock_id=?
            		`,
				[testConst.userId, fudId]
			);
			const result = (res as {quantity: string}[])[0].quantity;
			expect(parseInt(result)).to.equal(998000);
		});
	});

	describe("CreateUfdOwnership", function () {
		let userId: number;
		let res: any;
		before(async function () {
			const [row] = await db.promise().execute(`
				INSERT INTO Users (user_name, email, hash, salt)
				VALUES ("testUser2", "test2@test.com", "my_hash", "my_salt")
			`);
			res = row;
			userId = (row as {[key: string]: any}).insertId;
		});
		after(async function () {
			await db.promise().query(
				`
				DELETE FROM Users WHERE user_id=?
			`,
				[userId]
			);
		});
		it("Ownership must be created successfully", async function () {
			await User.createUfdOwnership(userId);

			const [row] = await db.promise().query(
				`
				SELECT * FROM Ownerships WHERE user_id=?
			`,
				[userId]
			);
			const owner = (row as {[key: string]: any}[])[0];
			expect(owner.stock_id).to.equal(fudId);
			expect(parseInt(owner.quantity)).to.equal(1000000);
		});
	});
	describe("GetToDayHistory", function () {
		before(async function () {
			await db.promise().query(
				`
				INSERT INTO History (user_id, portfolio_value, liquid)
				VALUES (?, 1000, 100)
			`,
				[testConst.userId]
			);
		});
		after(async function () {
			await db.promise().execute(`
				DELETE FROM History WHERE portfolio_value=1000 AND liquid= 100
			`);
		});
		it("Today history muy be return successfully", async function () {
			type history = {
				history_id: number;
				history_date: Date;
				user_id: number;
				portfolio_value: string;
				liquid: string;
			};
			const toDayHistory = (await User.getToDayHistory(1)) as history;
			expect(toDayHistory.history_date.getDate()).to.equal(new Date().getDate());
			expect(toDayHistory.history_date.getMonth()).to.equal(new Date().getMonth());
			expect(toDayHistory.history_date.getFullYear()).to.equal(new Date().getFullYear());
			expect(parseInt(toDayHistory.portfolio_value)).to.equal(1000);
			expect(parseInt(toDayHistory.liquid)).to.equal(100);
		});
	});
	describe("AddHistory", function () {
		afterEach(async function () {
			await db.promise().execute(`
				DELETE FROM History WHERE portfolio_value=1000 AND liquid= 100
			`);
		});
		it("Add history to an specific date", async function () {
			const date = new Date(1995, 11, 17);
			const {insertId} = (await User.addHistory(1, 1000, 100, date)) as {
				[key: string]: any;
			};
			const [row] = await db.promise().query(
				`
				SELECT * FROM History WHERE history_id=?
			`,
				[insertId]
			);
			const res = (row as {[key: string]: any}[])[0];
			expect(res.history_date).to.deep.equal(date);
			expect(parseInt(res.portfolio_value)).to.equal(1000);
			expect(parseInt(res.liquid)).to.equal(100);
		});
		it("Add today history", async function () {
			const {insertId} = (await User.addHistory(1, 1000, 100)) as {
				[key: string]: any;
			};
			const [row] = await db.promise().query(
				`
				SELECT * FROM History WHERE history_id=?
			`,
				[insertId]
			);
			const today = new Date();
			const res = (row as {[key: string]: any}[])[0];
			expect(res.history_date.getDate()).to.equal(today.getDate());
			expect(res.history_date.getMonth()).to.equal(today.getMonth());
			expect(res.history_date.getFullYear()).to.equal(today.getFullYear());
			expect(parseInt(res.portfolio_value)).to.equal(1000);
			expect(parseInt(res.liquid)).to.equal(100);
		});
	});
	describe("GetFudQuantity", function () {
		it("getFudQuantity(1) must return 994000", async function () {
			const qua = await User.getFudQuantity(1);
			expect(qua).to.equal(994000);
		});
	});
	describe("updateHistory", function () {
		let historyId: number;
		before(async function () {
			const [row] = await db.promise().query(
				`
				INSERT INTO History (user_id, portfolio_value, liquid)
				VALUES (?, 1000, 100)
			`,
				[testConst.userId]
			);
			historyId = (row as {[key: string]: any}).insertId;
		});
		after(async function () {
			await db.promise().query(
				`
				DELETE FROM History WHERE history_id=?
			`,
				[historyId]
			);
		});
		it("History must be updated successfully", async function () {
			await User.updateHistory(historyId, 2000, 200);
			const [row] = await db.promise().query(
				`
				SELECT * FROM History WHERE history_id=?
			`,
				[historyId]
			);
			const res = (row as {[key: string]: any}[])[0];
			expect(parseInt(res.portfolio_value)).to.equal(2000);
			expect(parseInt(res.liquid)).to.equal(200);
		});
	});
	describe("AddTransaction", function () {
		let historyId: number;
		before(async function () {
			const [row] = await db.promise().query(
				`
				INSERT INTO History (user_id, portfolio_value, liquid)
				VALUES (?, 1000, 100)
			`,
				[testConst.userId]
			);
			historyId = (row as {[key: string]: any}).insertId;
		});
		after(async function () {
			await db.promise().query(
				`
				DELETE FROM History WHERE history_id=?
			`,
				[historyId]
			);
		});
		it("transaction mut be added successfully", async function () {
			await User.addTransaction(historyId, 2, true, 10, 1);
			const [row] = await db.promise().query(
				`
				SELECT * FROM Transactions WHERE history_id=? AND 
				stock_id=? AND buy=? AND price=? AND quantity=?
			`,
				[historyId, 2, true, 10, 1]
			);
			expect(row).to.have.lengthOf(1);
		});
	});
	describe("GetChartHistoryPoints", function () {
		it("get history point successfully", async function () {
			const points = await User.getChartHistoryPoints(1);
			const keys = Object.keys(points);
			expect(keys).to.have.lengthOf(4);
			for (let i = 0; i < keys.length; i++) {
				const s = keys[i];
				const date = new Date(parseInt(s));
				expect(date.getDate()).to.equal(testConst.historyPoints[i].date.getDate());
				expect(date.getMonth()).to.equal(testConst.historyPoints[i].date.getMonth());
				expect(date.getFullYear()).to.equal(
					testConst.historyPoints[i].date.getFullYear()
				);
				expect(points[s].portfolioValue).to.equal(
					testConst.historyPoints[i].portfolioValue
				);
				expect(points[s].liquid).to.equal(testConst.historyPoints[i].liquid);
				expect(points[s].transactions[0].price).to.equal(
					testConst.historyPoints[i].transactions.price
				);
				expect(points[s].transactions[0].buy).to.equal(
					testConst.historyPoints[i].transactions.buy
				);
				expect(points[s].transactions[0].quantity).to.equal(
					testConst.historyPoints[i].transactions.quantity
				);

				const [row] = await db.promise().query(
					`
					SELECT stock_id FROM Stocks WHERE 
					symbol=?
				`,
					[points[s].transactions[0].symbol]
				);
				expect((row as {stock_id: number}[])[0].stock_id).to.equal(
					testConst.historyPoints[i].transactions.stockId
				);
			}
		});
	});
	describe("GetTransactionFromDateToNow", function () {
		it("get all transactions from 10 days ago", async function () {
			const date = new Date(Date.now() - 1000 * 60 * 60 * 24 * 10);
			let transactions = await User.getTransactionFromDateToNow(1, date);

			expect(transactions).to.have.lengthOf(4);
			if (transactions) {
				for (let i = 0; i < transactions.length; i++) {
					expect(transactions[i].history_date.getDate()).to.equal(
						testConst.historyPoints[i].date.getDate()
					);
					expect(transactions[i].history_date.getMonth()).to.equal(
						testConst.historyPoints[i].date.getMonth()
					);
					expect(transactions[i].history_date.getFullYear()).to.equal(
						testConst.historyPoints[i].date.getFullYear()
					);
					expect(transactions[i].buy).to.equal(
						testConst.historyPoints[i].transactions.buy
					);
					expect(transactions[i].quantity).to.equal(
						testConst.historyPoints[i].transactions.quantity
					);

					const [row] = await db.promise().query(
						`
						SELECT stock_id FROM Stocks WHERE
						symbol=?
					`,
						[transactions[i].symbol]
					);
					expect((row as {stock_id: number}[])[0].stock_id).to.equal(
						testConst.historyPoints[i].transactions.stockId
					);
				}
			} else {
				expect(transactions).to.be.an("array");
			}
		});
	});
	describe("DeleteUserHistory", function () {
		let id: number;
		before(async function () {
			const {histories, userId} = await populateDb(
				testConst.stocks,
				"deleteHistory@test.com"
			);
			id = userId;
		});
		after(async function () {
			await db.promise().query(
				`
				DELETE FROM Users WHERE user_id= ?
			`,
				[id]
			);
		});
		it("history must be deleted successfully", async function () {
			await User.deleteUserHistory(id);
			const [row] = await db.promise().query(
				`
				SELECT * FROM History WHERE user_id= ?
			`,
				[id]
			);
			expect(row).to.have.lengthOf(0);
		});
	});
	describe("DeleteUserOwnerships", function () {
		let id: number;
		before(async function () {
			const {histories, userId} = await populateDb(
				testConst.stocks,
				"deleteOwnership@test.com"
			);
			id = userId;
		});
		after(async function () {
			await db.promise().query(
				`
				DELETE FROM Users WHERE user_id= ?
			`,
				[id]
			);
		});
		it("ownership must be deleted successfully", async function () {
			await User.deleteUserOwnerships(id);
			const [row] = await db.promise().query(
				`
				SELECT * FROM Ownerships WHERE user_id= ?
			`,
				[id]
			);
			expect(row).to.have.lengthOf(0);
		});
	});
});
