import chai, {expect} from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import * as node_fetch from "node-fetch";
import * as chunks from "../../functions/sliceIntoChunks";
import {redisClientCache} from "../../redis/redisConn";
import sparkRes, {sparkData} from "../mocks/sparkRes";
import getStockHistoricalPrice from "../../functions/getStockHistoricalPrice";
import e from "express";

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
		const fakeRedisGet = (data: sparkData) => (key: string) => {
			const symbol = key.split("=")[1];
			return Promise.resolve(JSON.stringify(data[symbol]));
		};
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
			const stockDate = [{symbol: "S1", date: Date.now() - subDay}];
			const stocksData = sparkRes(stockDate.map((e) => e.symbol));
			redisGetStub.callsFake(fakeRedisGet(stocksData));
			await getStockHistoricalPrice(stockDate);
			expect(redisGetStub).to.have.been.calledWith("stockHistory=S1");
		});
		it("fetch and setEx must not be called", async function () {
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
			const stocksData = sparkRes(stockDate.map((e) => e.symbol));
			redisGetStub.callsFake(fakeRedisGet(stocksData));
			await getStockHistoricalPrice(stockDate);
			expect(fetchStub).to.have.been.callCount(0);
			expect(redisSetEXStub).to.have.been.callCount(0);
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
			const stocksData = sparkRes(stockDate.map((e) => e.symbol));
			redisGetStub.callsFake(fakeRedisGet(stocksData));
			const res = await getStockHistoricalPrice(stockDate);
			expect(res).to.have.lengthOf(10);
			res?.forEach((e, i) => {
				const symbol = `S${i + 1}`;
				expect(e.symbol).to.equal(symbol);
				expect(e.date).to.equal(targetDate);
				expect(stocksData[symbol].close).to.include(e.price);
			});
		});
	});
	describe("call with some data in the cache", function () {
		const fakeRedisGet = (data: sparkData) => (key: string) => {
			const symbol = key.split("=")[1];
			if (!data[symbol]) return null;
			return Promise.resolve(JSON.stringify(data[symbol]));
		};
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
			const apiSym = ["S1", "S2", "S3", "S4", "S5"];
			const cacheSym = ["S6", "S7", "S8", "S9", "S10"];
			const apiData = sparkRes(apiSym);
			const cacheData = sparkRes(cacheSym);
			redisGetStub.callsFake(fakeRedisGet(cacheData));
			chunksStub.callsFake(() => [apiSym]);
			fetchStub.callsFake(() => Promise.resolve({json: () => Promise.resolve(apiData)}));

			await getStockHistoricalPrice(stockDate);
			expect(fetchStub).to.have.been.calledWith(
				`https://yfapi.net/v8/finance/spark?interval=1d&range=5y&symbols=S1,S2,S3,S4,S5`,
				{
					method: "GET",
					headers: {
						"x-api-key": process.env.YF_API_KEY || "",
						"Content-Type": "application/json"
					}
				}
			);
			apiSym.forEach((e) => {
				expect(redisSetEXStub).to.have.been.calledWith(
					`stockHistory=${e}`,
					60 * 12,
					JSON.stringify(apiData[e])
				);
			});
		});
		it("fetch and setEx must be called the correct number of times", async function () {
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
			const apiSym = ["S1", "S2", "S3", "S4", "S5"];
			const cacheSym = ["S6", "S7", "S8", "S9", "S10"];
			const apiData = sparkRes(apiSym);
			const cacheData = sparkRes(cacheSym);
			redisGetStub.callsFake(fakeRedisGet(cacheData));
			chunksStub.callsFake(() => [apiSym]);
			fetchStub.callsFake(() => Promise.resolve({json: () => Promise.resolve(apiData)}));

			await getStockHistoricalPrice(stockDate);
			expect(fetchStub).to.have.been.calledOnce;
			expect(redisSetEXStub).to.have.been.callCount(5);
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
			const apiSym = ["S1", "S2", "S3", "S4", "S5"];
			const cacheSym = ["S6", "S7", "S8", "S9", "S10"];
			const apiData = sparkRes(apiSym);
			const cacheData = sparkRes(cacheSym);
			redisGetStub.callsFake(fakeRedisGet(cacheData));
			chunksStub.callsFake(() => [apiSym]);
			fetchStub.callsFake(() => Promise.resolve({json: () => Promise.resolve(apiData)}));

			const res = await getStockHistoricalPrice(stockDate);

			expect(res).to.have.lengthOf(10);
			res?.forEach((e, i) => {
				const symbol = `S${i + 1}`;
				expect(e.symbol).to.equal(symbol);
				expect(e.date).to.equal(targetDate);
				if (apiSym.includes(e.symbol)) {
					expect(apiData[symbol].close).to.include(e.price);
				} else {
					expect(cacheData[symbol].close).to.include(e.price);
				}
			});
		});
		it("if the search date is a non-working day, it returns the result of the previous working day", async function () {
			const targetDate = Date.now() - subDay;
			function getNonWorkingDate(td: number): number {
				const date = new Date(td);
				const day = date.getDay();
				if (day === 6 || day === 0) return td;
				return getNonWorkingDate(td - 1000 * 60 * 60 * 24);
			}
			const nonWorkingDate = getNonWorkingDate(targetDate);
			const stockDate = [
				{symbol: "S1", date: nonWorkingDate},
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
			const apiSym = ["S1", "S2", "S3", "S4", "S5"];
			const cacheSym = ["S6", "S7", "S8", "S9", "S10"];
			const apiData = sparkRes(apiSym);
			const cacheData = sparkRes(cacheSym);
			redisGetStub.callsFake(fakeRedisGet(cacheData));
			chunksStub.callsFake(() => [apiSym]);
			fetchStub.callsFake(() => Promise.resolve({json: () => Promise.resolve(apiData)}));

			const res = await getStockHistoricalPrice(stockDate);

			const dates = apiData["S1"].timestamp;
			const close = apiData["S1"].close;
			const index = close.indexOf(res![0].price);
			const prevWd = dates[index];
			const nextWd = dates[index + 1];
			expect(nonWorkingDate > prevWd * 1000).to.be.true;
			expect(nonWorkingDate < nextWd * 1000).to.be.true;
		});
	});
});
