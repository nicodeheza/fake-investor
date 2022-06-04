import chai, {expect} from "chai";
import chaiHttp from "chai-http";
import sinon, {SinonStub} from "sinon";
import app from "../../../index";
import * as node_fetch from "node-fetch";
import db from "../../../db/db";

chai.use(chaiHttp);

const reqBody = {
	amount: 5,
	symbol: "GOOG",
	name: "test stock",
	price: 300
};

describe("/stock/sell route", function () {
	let fetchStub: SinonStub;
	before(function () {
		fetchStub = sinon.stub(node_fetch, "default");
		fetchStub.callsFake(() =>
			Promise.resolve({
				json: () =>
					Promise.resolve({
						quoteResponse: {
							error: null,
							result: [
								{
									symbol: "IBM",
									regularMarketPrice: 100,
									regularMarketChangePercent: 1
								},
								{
									symbol: "AAPL",
									regularMarketPrice: 200,
									regularMarketChangePercent: 2
								},
								{
									symbol: "GOOG",
									regularMarketPrice: 300,
									regularMarketChangePercent: 3
								}
							]
						}
					})
			})
		);
	});
	after(async function () {
		fetchStub.restore();

		await Promise.all([
			db.promise().execute(`
		    UPDATE Ownerships SET quantity=994000 WHERE stock_id=1 AND user_id=1
		    `),
			db.promise().execute(`
		    UPDATE Ownerships SET quantity=20 WHERE stock_id=4 AND user_id=1
		    `),
			db.promise().execute(`
		    DELETE FROM History WHERE history_id > 4
		    `),
			db.promise().execute(`
		    DELETE FROM Transactions WHERE stock_id > 4
		    `)
		]);
	});
	describe("request unauth", function () {
		let res: ChaiHttp.Response;
		before(function (done) {
			chai
				.request(app)
				.post("/api/stock/sell")
				.set("Content-Type", "application/json")
				.send(reqBody)
				.end((e, r) => {
					res = r;
					done();
				});
		});
		it("status must be 401", function () {
			expect(res).to.have.status(401);
		});
		it("empty user must be returned", function () {
			expect(res.body.userName).to.be.equal("");
		});
	});
	describe("request auth", function () {
		let stockId: number,
			liquid: number,
			historyId: number,
			amount = 20;
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
					agent
						.post("/api/stock/sell")
						.set("Content-Type", "application/json")
						.send(reqBody)
						.end((e, r) => {
							res = r;
							done();
						});
				});
		});
		it("fud must be updated correctly", async function () {
			const [dbData] = await db.promise().execute(
				`
            SELECT quantity FROM Ownerships WHERE stock_id=1 AND user_id=1
            `
			);
			const quantity = parseFloat((dbData as any[])[0].quantity);
			liquid = 994000 + reqBody.amount * reqBody.price;
			expect(quantity).to.be.equal(liquid);
		});
		it("ownership must be updated correctly", async function () {
			const [dbData] = await db.promise().execute(
				`
            SELECT quantity FROM Ownerships WHERE stock_id=4 AND user_id=1
            `
			);

			expect(parseFloat((dbData as any[])[0].quantity)).to.equal(amount - reqBody.amount);
		});
		it("history must be created correctly", async function () {
			const [dbData] = await db.promise().execute(`
				SELECT * FROM History WHERE history_date=CURRENT_DATE
				`);
			const history = (dbData as any[])[0];
			historyId = history.history_id;
			expect(parseFloat(history.portfolio_value)).to.be.equal(1003000);
			expect(parseFloat(history.liquid)).to.be.equal(liquid);
		});
		it("transaction must be added correctly", async function () {
			const [dbData] = await db.promise().query(
				`
            SELECT * FROM Transactions WHERE history_id=? AND stock_id=4
            `,
				[historyId]
			);
			const transaction = (dbData as any[])[0];
			expect(transaction.buy).to.be.equal(0);
			expect(parseFloat(transaction.price)).to.be.equal(reqBody.price);
			expect(transaction.quantity).to.be.equal(reqBody.amount);
		});
		it("status must be 200", function () {
			expect(res).to.have.status(200);
		});
		it("message must be 'ok'", function () {
			expect(res.body.message).to.be.equal("ok");
		});
	});
});
