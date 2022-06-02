import chai, {expect} from "chai";
import chaiHttp from "chai-http";
import app from "../../../index";
import sinon, {SinonSpy, SinonStub} from "sinon";
import sinonChai from "sinon-chai";
import * as node_fetch from "node-fetch";
import {redisClientCache} from "../../../redis/redisConn";
import quoteRes from "../../mocks/quoteRes";

chai.use(chaiHttp);
chai.use(sinonChai);

const apiRes = {
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
};

describe("/user/userStats route", function () {
	let fetchStub: SinonStub;
	after(function () {
		(async function () {
			await redisClientCache.DEL([
				"stockValue=IBM",
				"stockValue=AAPL",
				"stockValue=GOOG"
			]);
		})();
	});
	describe("request unauth", function () {
		let res: ChaiHttp.Response;
		before(function (done) {
			fetchStub = sinon.stub(node_fetch, "default");
			fetchStub.callsFake(() => Promise.resolve({json: () => Promise.resolve(apiRes)}));

			chai
				.request(app)
				.get("/api/user/userStats")
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
		describe("get stock data must first fetch from yfApi", function () {
			let res: ChaiHttp.Response;
			before(function (done) {
				fetchStub = sinon.stub(node_fetch, "default");
				fetchStub.callsFake(() => Promise.resolve({json: () => Promise.resolve(apiRes)}));

				const agent = chai.request.agent(app);
				agent
					.post("/api/user/login")
					.set("Content-Type", "application/json")
					.send({
						email: "testUser@test.com",
						password: "test"
					})
					.end(function () {
						agent.get("/api/user/userStats").end(function (e, r) {
							res = r;
							agent.close();
							done();
						});
					});
			});
			after(function () {
				fetchStub.restore();
			});
			it("api must be called", function () {
				expect(fetchStub).to.have.been.called;
			});
			it("status must be 200", function () {
				expect(res).to.have.status(200);
			});
			it("must return correct data", function () {
				const expectRes = {
					gainMony: 3000,
					gainPer: 0.3,
					liquidMon: 994000,
					liquidPer: 99.10269192422732,
					stocksMon: 9000,
					stocksPer: 0.8973080757726819,
					total: 1003000
				};
				expect(res.body).to.be.eql(expectRes);
			});
		});
		describe("get stock data must fetch from redis", function () {
			let res: ChaiHttp.Response;
			before(function (done) {
				fetchStub = sinon.stub(node_fetch, "default");
				fetchStub.callsFake(() => Promise.resolve({json: () => Promise.resolve(apiRes)}));

				const agent = chai.request.agent(app);
				agent
					.post("/api/user/login")
					.set("Content-Type", "application/json")
					.send({
						email: "testUser@test.com",
						password: "test"
					})
					.end(function () {
						agent.get("/api/user/userStats").end(function (e, r) {
							res = r;
							agent.close();
							done();
						});
					});
			});
			after(function () {
				fetchStub.restore();
			});
			it("fetch must not been called", function () {
				expect(fetchStub).to.have.not.been.called;
			});
			it("status must be 200", function () {
				expect(res).have.status(200);
			});
			it("must return correct data", function () {
				const expectRes = {
					gainMony: 3000,
					gainPer: 0.3,
					liquidMon: 994000,
					liquidPer: 99.10269192422732,
					stocksMon: 9000,
					stocksPer: 0.8973080757726819,
					total: 1003000
				};
				expect(res.body).to.be.eql(expectRes);
			});
		});
	});
});
