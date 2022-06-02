import chai, {expect} from "chai";
import chaiHttp from "chai-http";
import app from "../../../index";
import sinon, {SinonStub} from "sinon";
import sinonChai from "sinon-chai";
import {QUOTE_RES_STATIC} from "../../mocks/quoteRes";
import {redisClientCache} from "../../../redis/redisConn";
import * as node_fetch from "node-fetch";

chai.use(chaiHttp);
chai.use(sinonChai);

const apiRes = QUOTE_RES_STATIC;
const expectedRes = [
	{
		fullName: "Fake Us Dolar",
		symbol: "FUD",
		price: 1,
		change: "",
		quaNum: 994000,
		quaMon: 994000
	},
	{
		fullName: "International Business Machines Corporation",
		symbol: "IBM",
		price: 100,
		change: 1,
		quaNum: 10,
		quaMon: 1000
	},
	{
		fullName: "Apple Inc.",
		symbol: "AAPL",
		price: 200,
		change: 2,
		quaNum: 10,
		quaMon: 2000
	},
	{
		fullName: "Alphabet Inc.",
		symbol: "GOOG",
		price: 300,
		change: 3,
		quaNum: 20,
		quaMon: 6000
	}
];

describe("/user/userStock route", function () {
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
				.get("/api/user/stocks")
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
						agent.get("/api/user/stocks").end(function (e, r) {
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
				expect(res.body).to.be.eql(expectedRes);
			});
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
					agent.get("/api/user/stocks").end(function (e, r) {
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
			expect(res.body).to.be.eql(expectedRes);
		});
	});
});
