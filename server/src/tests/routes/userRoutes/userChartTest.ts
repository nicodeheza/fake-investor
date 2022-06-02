import chai, {expect} from "chai";
import chaiHttp from "chai-http";
import app from "../../../index";
import sinon, {SinonSpy, SinonStub} from "sinon";
import sinonChai from "sinon-chai";
import {QUOTE_RES_STATIC} from "../../mocks/quoteRes";
import {redisClientCache} from "../../../redis/redisConn";
import * as node_fetch from "node-fetch";
import sparkRes from "../../mocks/sparkRes";
import db from "../../../db/db";
import * as UCTH from "../../../functions/updateOrCreateToDayHistory";
import User from "../../../models/User";

chai.use(chaiHttp);
chai.use(sinonChai);

const apiResSpark = sparkRes(["IBM", "AAPL", "GOOG"], false);
const expectResWithNoDates = {
	"1": {
		portfolioValue: 1000000,
		liquid: 999000,
		transactions: [{price: 100, quantity: 10, buy: true, symbol: "IBM"}]
	},
	"2": {portfolioValue: 1000900, liquid: 999000, transactions: []},
	"3": {
		portfolioValue: 1000000,
		liquid: 996000,
		transactions: [{price: 200, quantity: 15, buy: true, symbol: "AAPL"}]
	},
	"4": {portfolioValue: 1000750, liquid: 996000, transactions: []},
	"5": {
		portfolioValue: 1000000,
		liquid: 997000,
		transactions: [{price: 200, quantity: 5, buy: false, symbol: "AAPL"}]
	},
	"6": {
		portfolioValue: 1000000,
		liquid: 994000,
		transactions: [{price: 150, quantity: 20, buy: true, symbol: "GOOG"}]
	},
	"7": {portfolioValue: 1001600, liquid: 994000, transactions: []},
	"8": {portfolioValue: 1003000, liquid: 994000, transactions: []}
};

describe("/user/userChart route", function () {
	let fetchStub: SinonStub, expectRes: {[key: string]: any}, dates: number[];
	after(async function () {
		await redisClientCache.DEL([
			"stockHistory=IBM",
			"stockHistory=AAPL",
			"stockHistory=GOOG",
			"stockValue=IBM",
			"stockValue=AAPL",
			"stockValue=GOOG"
		]);
		await db.promise().execute(`
        DELETE FROM History WHERE history_id > 4
        `);
	});
	describe("request unauth", function () {
		let res: ChaiHttp.Response;
		before(function (done) {
			fetchStub = sinon.stub(node_fetch, "default");
			chai
				.request(app)
				.get("/api/user/userChart")
				.end(function (e, r) {
					res = r;
					done();
				});
		});
		after(function () {
			fetchStub.restore();
		});
		it("status must be 401", function () {
			expect(res).to.have.status(401);
		});
		it("must return empty user name", function () {
			expect(res.body.userName).to.be.equal("");
		});
	});
	describe("request authenticated", function () {
		describe("request with not to day history point and with no data in cache", function () {
			let res: ChaiHttp.Response;
			before(function (done) {
				fetchStub = sinon.stub(node_fetch, "default");
				fetchStub
					.onFirstCall()
					.returns(Promise.resolve({json: () => Promise.resolve(QUOTE_RES_STATIC)}));
				fetchStub
					.onSecondCall()
					.returns(Promise.resolve({json: () => Promise.resolve(apiResSpark)}));

				const agent = chai.request.agent(app);
				agent
					.post("/api/user/login")
					.set("Content-Type", "application/json")
					.send({
						email: "testUser@test.com",
						password: "test"
					})
					.end(function () {
						agent.get("/api/user/userChart").end(function (e, r) {
							res = r;
							agent.close();
							done();
						});
					});
			});
			after(function () {
				fetchStub.restore();
			});
			it("missing history points have been added to the database.", async function () {
				const [dbData] = await db.promise().execute(`
                        SELECT history_date FROM History WHERE user_id=1
                        `);
				const sortData = (dbData as {history_date: Date}[]).sort(
					(a, b) => a.history_date.getTime() - b.history_date.getTime()
				);
				dates = sortData.map((e) => e.history_date.getTime());
				const oneDay = 1000 * 60 * 60 * 24;
				for (let i = 1; i < dates.length - 1; i++) {
					expect(dates[i + 1] - dates[i]).to.be.equal(oneDay);
				}
			});
			it("historical price have been fetched from yfApi", function () {
				expect(fetchStub).to.have.been.calledTwice;
			});
			it("status must be 200", function () {
				expect(res).to.have.status(200);
			});
			it("correct data has been returned", function () {
				expectRes = {};
				Object.keys(expectResWithNoDates).forEach((key, i) => {
					expectRes[dates[i]] = (expectResWithNoDates as {[key: string]: any})[key];
				});
				expect(res.body).to.be.eql(expectRes);
			});
		});
		describe("request with to day history point, all history point completed and data in the cache", function () {
			let res: ChaiHttp.Response,
				updateOrCreateToDayHistorySpy: SinonSpy,
				addHistorySpy: SinonSpy;
			before(function (done) {
				fetchStub = sinon.stub(node_fetch, "default");
				updateOrCreateToDayHistorySpy = sinon.spy(UCTH, "default");
				addHistorySpy = sinon.spy(User, "addHistory");
				const agent = chai.request.agent(app);
				agent
					.post("/api/user/login")
					.set("Content-Type", "application/json")
					.send({
						email: "testUser@test.com",
						password: "test"
					})
					.end(function () {
						agent.get("/api/user/userChart").end(function (e, r) {
							res = r;
							agent.close();
							done();
						});
					});
			});
			after(function () {
				fetchStub.restore();
				updateOrCreateToDayHistorySpy.restore();
				addHistorySpy.restore();
			});
			it("to day history must be updated", function () {
				expect(updateOrCreateToDayHistorySpy).to.have.been.called;
			});
			it("historical price have been fetched from redis", function () {
				expect(fetchStub).to.have.not.been.called;
			});
			it("new history points haven't been addedd", function () {
				expect(addHistorySpy).to.have.not.been.called;
			});
			it("status must be 200", function () {
				expect(res).to.have.status(200);
			});
			it("correct data has been returned", function () {
				expect(res.body).to.be.eql(expectRes);
			});
		});
	});
});
