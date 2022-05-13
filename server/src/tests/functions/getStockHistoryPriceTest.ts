import chai, {expect} from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import * as node_fetch from "node-fetch";
import * as chunks from "../../functions/sliceIntoChunks";
import {redisClientCache} from "../../redis/redisConn";
import sparkRes from "../mocks/sparkRes";
import getStockHistoricalPrice from "../../functions/getStockHistoricalPrice";

chai.use(sinonChai);

const subDay = 1000 * 60 * 60 * 24 * 5;

describe("getStockHistoricalPrice", function () {
	let fetchStub: sinon.SinonStub,
		chunksStub: sinon.SinonStub,
		redisGetStub: sinon.SinonStub,
		redisSetEXStub: sinon.SinonStub;

	describe("call with not data in cache", function () {
		beforeEach(function () {
			fetchStub = sinon.stub(node_fetch, "default");
			chunksStub = sinon.stub(chunks, "default");
			redisGetStub = sinon.stub(redisClientCache, "get");
			redisSetEXStub = sinon.stub(redisClientCache, "setEx");
		});
		afterEach(function () {
			fetchStub.restore();
			chunksStub.restore();
			redisGetStub.restore();
			redisSetEXStub.restore();
		});
		it("fetch and setEx must be called with the correct arguments", async function () {
			const stockDate = [{symbol: "S1", date: Date.now() - subDay}];
			redisGetStub.callsFake(() => Promise.resolve(null));
			chunksStub.callsFake(() => [["S1"]]);
			const sparckData = sparkRes(["S1"]);
			fetchStub.callsFake(() =>
				Promise.resolve({json: () => Promise.resolve(sparckData)})
			);
			await getStockHistoricalPrice(stockDate);
			expect(fetchStub).to.have.been.calledWith(
				`https://yfapi.net/v8/finance/spark?interval=1d&range=5y&symbols=S1`,
				{
					method: "GET",
					headers: {
						"x-api-key": process.env.YF_API_KEY || "",
						"Content-Type": "application/json"
					}
				}
			);
			expect(redisSetEXStub).to.have.been.calledWith(
				`stockHistory=S1`,
				60 * 12,
				JSON.stringify(sparckData["S1"])
			);
		});
		it("fetch and setEx must be called the correct number of times", async function () {
			const stockDate = [
				{symbol: "S1", date: Date.now() - subDay},
				{symbol: "S2", date: Date.now() - subDay},
				{symbol: "S3", date: Date.now() - subDay},
				{symbol: "S4", date: Date.now() - subDay},
				{symbol: "S5", date: Date.now() - subDay},
				{symbol: "S6", date: Date.now() - subDay},
				{symbol: "S7", date: Date.now() - subDay},
				{symbol: "S8", date: Date.now() - subDay},
				{symbol: "S9", date: Date.now() - subDay},
				{symbol: "S10", date: Date.now() - subDay},
				{symbol: "S11", date: Date.now() - subDay},
				{symbol: "S12", date: Date.now() - subDay},
				{symbol: "S13", date: Date.now() - subDay},
				{symbol: "S14", date: Date.now() - subDay},
				{symbol: "S15", date: Date.now() - subDay}
			];
			redisGetStub.callsFake(() => Promise.resolve(null));
			chunksStub.callsFake(() => [
				["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9", "S10"],
				["S11", "S12", "S13", "S14", "S15"]
			]);
			const sparckData = sparkRes(stockDate.map((e) => e.symbol));
			fetchStub.callsFake(() =>
				Promise.resolve({json: () => Promise.resolve(sparckData)})
			);
			await getStockHistoricalPrice(stockDate);

			expect(fetchStub).to.have.been.calledTwice;
			expect(redisSetEXStub).to.have.been.callCount(15);
		});
		it("function must return the correct data", async function () {
			const targetDate = Date.now() - subDay;
			const stockDate = [
				{symbol: "S1", date: targetDate},
				{symbol: "S2", date: targetDate},
				{symbol: "S3", date: targetDate},
				{symbol: "S4", date: targetDate},
				{symbol: "S5", date: targetDate},
				{symbol: "S6", date: targetDate},
				{symbol: "S7", date: targetDate},
				{symbol: "S8", date: targetDate},
				{symbol: "S9", date: targetDate},
				{symbol: "S10", date: targetDate}
			];
			redisGetStub.callsFake(() => Promise.resolve(null));
			chunksStub.callsFake(() => [
				["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9", "S10"]
			]);
			const sparckData = sparkRes(stockDate.map((e) => e.symbol));
			fetchStub.callsFake(() =>
				Promise.resolve({json: () => Promise.resolve(sparckData)})
			);

			const res = await getStockHistoricalPrice(stockDate);
			expect(res).to.have.lengthOf(10);
			res?.forEach((e, i) => {
				expect(e.symbol).to.equal(`S${i + 1}`);
				expect(e.date).to.equal(targetDate);
				expect(sparckData[e.symbol].close).to.include(e.price);
			});
		});
	});
	describe("call with all data in the cache", function () {
		beforeEach(function () {
			fetchStub = sinon.stub(node_fetch, "default");
			chunksStub = sinon.stub(chunks, "default");
			redisGetStub = sinon.stub(redisClientCache, "get");
			redisSetEXStub = sinon.stub(redisClientCache, "setEx");
		});
		afterEach(function () {
			fetchStub.restore();
			chunksStub.restore();
			redisGetStub.restore();
			redisSetEXStub.restore();
		});
		it("redis get must be called with the correct arguments", async function () {
			//test
		});
		it("fetch and setEx must not be called", async function () {
			//test
		});
		it("function must return the correct data", function () {
			//test
		});
	});
	describe("call with some data in the cache", function () {
		beforeEach(function () {
			fetchStub = sinon.stub(node_fetch, "default");
			chunksStub = sinon.stub(chunks, "default");
			redisGetStub = sinon.stub(redisClientCache, "get");
			redisSetEXStub = sinon.stub(redisClientCache, "setEx");
		});
		afterEach(function () {
			fetchStub.restore();
			chunksStub.restore();
			redisGetStub.restore();
			redisSetEXStub.restore();
		});
		it("fetch and setEx must be called with the correct arguments", async function () {
			//test
		});
		it("fetch and setEx must be called the correct number of times", async function () {
			//test
		});
		it("function must return the correct data", function () {
			//test
		});
		it("if the search date is a non-working day, it returns the result of the previous working day", async function () {
			//test
		});
	});
});
