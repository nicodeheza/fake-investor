import chai, {expect} from "chai";
import chaiHttp from "chai-http";
import app from "../../../index";
import sinon, {SinonStub} from "sinon";
import sinonChai from "sinon-chai";
import {redisClientCache} from "../../../redis/redisConn";
import * as node_fetch from "node-fetch";
import {QUOTE_RES_STATIC} from "../../mocks/quoteRes";

chai.use(chaiHttp);
chai.use(sinonChai);

describe("/stock/buy-card route", function () {
	let fetchStub: SinonStub;
	after(async function () {
		await redisClientCache.DEL(["stockValue=IBM", "stockValue=AAPL", "stockValue=GOOG"]);
	});
	describe("request unauth", function () {
		let res: ChaiHttp.Response;
		before(function (done) {
			fetchStub = sinon.stub(node_fetch, "default");
			chai
				.request(app)
				.get("/api/stock/buy-card")
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
	describe("request auth", function () {
		describe("request with no data in cache", function () {
			let res: ChaiHttp.Response;
			before(function (done) {
				fetchStub = sinon.stub(node_fetch, "default");
				fetchStub.callsFake(() =>
					Promise.resolve({json: () => Promise.resolve(QUOTE_RES_STATIC)})
				);

				const agent = chai.request.agent(app);
				agent
					.post("/api/user/login")
					.set("Content-Type", "application/json")
					.send({
						email: "testUser@test.com",
						password: "test"
					})
					.end(function () {
						agent.get("/api/stock/buy-card").end(function (e, r) {
							res = r;
							agent.close();
							done();
						});
					});
			});
			after(function () {
				fetchStub.restore();
			});
			it("Data has to be fetched from yfApi", function () {
				expect(fetchStub).to.have.been.called;
			});
			it("status must be 200", function () {
				expect(res).to.have.status(200);
			});
			it("correct data must be returned", function () {
				expect(res.body).to.be.eql({fud: 994000, portfolioV: 1003000});
			});
		});
		describe("request with cached data", function () {
			let res: ChaiHttp.Response;
			before(function (done) {
				fetchStub = sinon.stub(node_fetch, "default");

				const agent = chai.request.agent(app);
				agent
					.post("/api/user/login")
					.set("Content-Type", "application/json")
					.send({
						email: "testUser@test.com",
						password: "test"
					})
					.end(function () {
						agent.get("/api/stock/buy-card").end(function (e, r) {
							res = r;
							agent.close();
							done();
						});
					});
			});
			after(function () {
				fetchStub.restore();
			});
			it("Data has to be fetched from redis cache", function () {
				expect(fetchStub).to.have.not.been.called;
			});
			it("status must be 200", function () {
				expect(res).to.have.status(200);
			});
			it("correct data must be returned", function () {
				expect(res.body).to.be.eql({fud: 994000, portfolioV: 1003000});
			});
		});
	});
});
