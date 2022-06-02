import chai, {expect} from "chai";
import chaiHttp from "chai-http";
import app from "../../../index";
import sinon, {SinonSpy, SinonStub} from "sinon";
import sinonChai from "sinon-chai";
import db from "../../../db/db";

chai.use(chaiHttp);
chai.use(sinonChai);

interface history {
	history_id: number;
	history_date: Date;
	user_id: number;
	portfolio_value: string;
	liquid: string;
}
interface ownership {
	user_id: number;
	stock_id: number;
	quantity: string;
}
interface transaction {
	transaction_id: number;
	history_id: number;
	stock_id: number;
	buy: number;
	price: string;
	quantity: string;
}

describe("/user/reset route", function () {
	let initialHistoryState: history[],
		initialOwnershipState: ownership[],
		transactionsInitialState: transaction[];

	before(async function () {
		const [historyDbData] = await db.promise().execute(`
        SELECT * FROM History WHERE user_id=1
        `);
		initialHistoryState = historyDbData as history[];

		const [ownershipDbDate] = await db.promise().execute(`
        SELECT * FROM Ownerships WHERE user_id=1
        `);
		initialOwnershipState = ownershipDbDate as ownership[];

		const [transactionsDbDate] = await db.promise().execute(`
        SELECT * FROM Transactions
        `);
		transactionsInitialState = transactionsDbDate as transaction[];
	});
	after(async function () {
		await db.promise().execute(`
		DELETE FROM History WHERE user_id=1
		`);
		await db.promise().execute(`
        DELETE FROM Ownerships WHERE user_id=1
        `);
		await db.promise().execute(`
        DELETE FROM Transactions
        `);

		await Promise.all(
			initialOwnershipState.map((ele) => {
				return db.promise().query(
					`
            INSERT INTO Ownerships (user_id, stock_id, quantity) VALUES (?,?,?)
            `,
					[ele.user_id, ele.stock_id, ele.quantity]
				);
			})
		);

		await Promise.all(
			initialHistoryState.map((ele) => {
				return db.promise().query(
					`
		    INSERT INTO History (history_id, history_date, user_id, portfolio_value, liquid) VALUES (?,?,?,?,?)
		    `,
					[ele.history_id, ele.history_date, ele.user_id, ele.portfolio_value, ele.liquid]
				);
			})
		);

		await Promise.all(
			transactionsInitialState.map((ele) => {
				return db.promise().query(
					`
		    INSERT INTO Transactions (transaction_id, history_id, stock_id, buy, price, quantity) VALUES (?,?,?,?,?,?)
		    `,
					[
						ele.transaction_id,
						ele.history_id,
						ele.stock_id,
						ele.buy,
						ele.price,
						ele.quantity
					]
				);
			})
		);
	});
	describe("request unauth", function () {
		let res: ChaiHttp.Response;
		before(function (done) {
			chai
				.request(app)
				.delete("/api/user/reset")
				.end(function (e, r) {
					res = r;
					done();
				});
		});
		it("status must be 401", function () {
			expect(res).to.have.status(401);
		});
		it("must return empty user name", function () {
			expect(res.body.userName).to.be.equal("");
		});
	});
	describe("request auth", function () {
		let res: ChaiHttp.Response;
		before(function (done) {
			const agent = chai.request.agent(app);
			agent
				.post("/api/user/login")
				.set("Content-Type", "application/json")
				.send({
					email: "testUser@test.com",
					password: "test"
				})
				.end(function () {
					agent.delete("/api/user/reset").end(function (e, r) {
						res = r;
						agent.close();
						done();
					});
				});
		});
		it("user history has been deleted", async function () {
			const [dbData] = await db.promise().execute(`
            SELECT * FROM History WHERE user_id=1
            `);
			expect(dbData).to.be.eql([]);
		});
		it("user must have 1000000 ufd", async function () {
			const [dbData] = await db.promise().execute(`
            SELECT quantity FROM Ownerships WHERE user_id=1 AND stock_id=1
            `);

			expect(parseInt((dbData as {quantity: string}[])[0].quantity)).to.be.equal(1000000);
		});
		it("status must be 200", function () {
			expect(res).to.have.status(200);
		});
		it("SUCCESS must be returned", function () {
			expect(res.body.message).to.be.equal("SUCCESS");
		});
	});
});
