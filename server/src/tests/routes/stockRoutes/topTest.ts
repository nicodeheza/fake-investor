import chai, {expect} from "chai";
import chaiHttp from "chai-http";
import app from "../../../index";
import sinon, {SinonStub} from "sinon";
import sinonChai from "sinon-chai";
import {redisClientCache} from "../../../redis/redisConn";
import * as node_fetch from "node-fetch";
import {QUOTE_RES_STATIC} from "../../mocks/quoteRes";
import db from "../../../db/db";

chai.use(chaiHttp);
chai.use(sinonChai);

const expectRes = {
	"1": {
		name: "Alphabet Inc.(GOOG)",
		symbol: "GOOG",
		price: 300,
		variation: 1
	},
	"2": {
		name: "Apple Inc.(AAPL)",
		symbol: "AAPL",
		price: 200,
		variation: 1
	},
	"3": {
		name: "International Business Machines Corporation(IBM)",
		symbol: "IBM",
		price: 100,
		variation: 1
	},
	"4": {name: "test stock 5(S5)", symbol: "S5", price: 100, variation: 1},
	"5": {name: "test stock 4(S4)", symbol: "S4", price: 100, variation: 1},
	"6": {name: "test stock 3(S3)", symbol: "S3", price: 100, variation: 1},
	"7": {name: "test stock 2(S2)", symbol: "S2", price: 100, variation: 1},
	"8": {name: "test stock 1(S1)", symbol: "S1", price: 100, variation: 1},
	"9": {name: "test stock 0(S0)", symbol: "S0", price: 100, variation: 1},
	"10": {name: "test stock 6(S6)", symbol: "S6", price: 100, variation: 1}
};

describe("/stock/top route", function () {
	before(async function () {
		await Promise.all(
			new Array(10).fill(true).map((e, i) => {
				db.promise().query(
					`
            INSERT INTO Stocks (stock_name, symbol) VALUES (?,?)
            `,
					[`test stock ${i}`, `S${i}`]
				);
			})
		);
		await Promise.all(
			new Array(10).fill(true).map((e, i) => {
				db.promise().query(
					`
            INSERT INTO Transactions (history_id, stock_id, buy, price, quantity) VALUES (1,?,1,100,?)
            `,
					[i + 5, (i % 9) + 1]
				);
			})
		);
	});
	after(async function () {
		await Promise.all(
			new Array(10).fill(true).map((e, i) => {
				db.promise().execute(
					`
		    DELETE FROM Stocks WHERE stock_id > 4
		    `
				);
			})
		);
		await redisClientCache.flushDb();
	});
	describe("request with no cached data", function () {
		let res: ChaiHttp.Response, fetchStub: SinonStub;
		before(function (done) {
			fetchStub = sinon.stub(node_fetch, "default");
			const fetchRes = {
				quoteResponse: {
					error: null,
					result: [...QUOTE_RES_STATIC.quoteResponse.result]
				}
			};
			for (let i = 0; i <= 10; i++) {
				fetchRes.quoteResponse.result.push({
					symbol: `S${i}`,
					regularMarketPrice: 100,
					regularMarketChangePercent: 1
				});
			}

			fetchStub.callsFake(() => Promise.resolve({json: () => Promise.resolve(fetchRes)}));

			chai
				.request(app)
				.get("/api/stock/top")
				.end((e, r) => {
					res = r;
					done();
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
			expect(res.body).to.be.eql(expectRes);
		});
	});
	describe("request with cached data", function () {
		let res: ChaiHttp.Response, fetchStub: SinonStub;
		before(function (done) {
			fetchStub = sinon.stub(node_fetch, "default");
			chai
				.request(app)
				.get("/api/stock/top")
				.end((e, r) => {
					res = r;
					done();
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
			expect(res.body).to.be.eql(expectRes);
		});
	});
});
