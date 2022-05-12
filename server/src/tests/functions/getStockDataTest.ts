import chai, {expect} from "chai";
import * as node_fetch from "node-fetch";
import * as chunks from "../../functions/sliceIntoChunks";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import {redisClientCache} from "../../redis/redisConn";
import getStocksData from "../../functions/getStocksData";
import quoteRes, {quote} from "../mocks/quoteRes";

chai.use(sinonChai);

describe("GetStocksData", function () {
	describe("get stocks with no data in the cache", function () {
		let fetchStub: sinon.SinonStub,
			redisGetStub: sinon.SinonStub,
			redisSetExStub: sinon.SinonStub,
			chunckStub: sinon.SinonStub;

		beforeEach(function () {
			fetchStub = sinon.stub(node_fetch, "default");
			redisGetStub = sinon.stub(redisClientCache, "get");
			redisSetExStub = sinon.stub(redisClientCache, "setEx");
			chunckStub = sinon.stub(chunks, "default");
		});

		afterEach(function () {
			fetchStub.restore();
			redisGetStub.restore();
			redisSetExStub.restore();
			chunckStub.restore();
		});
		it("fetch must be called once every 10 symbols", async function () {
			redisGetStub.callsFake(() => Promise.resolve(null));
			chunckStub.callsFake(() => [
				["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9", "S10"],
				["S11", "S12"]
			]);
			const symbols = [
				"S1",
				"S2",
				"S3",
				"S4",
				"S5",
				"S6",
				"S7",
				"S8",
				"S9",
				"S10",
				"S11",
				"S12"
			];
			const apiRes = quoteRes(symbols);
			fetchStub.callsFake(() => Promise.resolve({json: () => Promise.resolve(apiRes)}));
			await getStocksData(symbols);
			expect(fetchStub).to.have.been.calledTwice;
		});
		it("fetch must be called with correct url and one time", async function () {
			const symbols = ["S1", "S2", "S3"];
			redisGetStub.callsFake(() => Promise.resolve(null));
			chunckStub.callsFake(() => [
				symbols.map((e) => {
					return {
						symbol: e
					};
				})
			]);

			const apiRes = quoteRes(symbols);
			fetchStub.callsFake(() => Promise.resolve({json: () => Promise.resolve(apiRes)}));

			await getStocksData(symbols);
			expect(fetchStub).to.have.been.calledOnceWith(
				`https://yfapi.net/v6/finance/quote?region=US&lang=en&symbols=S1,S2,S3,`,
				{
					method: "GET",
					headers: {
						"x-api-key": process.env.YF_API_KEY || "",
						"Content-Type": "application/json"
					}
				}
			);
		});
		it("all data must be saved in redis", async function () {
			const symbols = ["S1", "S2", "S3"];

			redisGetStub.callsFake(() => Promise.resolve(null));

			chunckStub.callsFake(() => [
				symbols.map((e) => {
					return {
						symbol: e
					};
				})
			]);

			const apiRes = quoteRes(symbols);
			fetchStub.callsFake(() => Promise.resolve({json: () => Promise.resolve(apiRes)}));

			await getStocksData(symbols);
			expect(redisSetExStub).to.have.been.calledThrice;
		});
		it("redis.setEx must be called with correct arguments", async function () {
			const symbols = ["S1"];

			redisGetStub.callsFake(() => Promise.resolve(null));

			chunckStub.callsFake(() => [
				symbols.map((e) => {
					return {
						symbol: e
					};
				})
			]);

			const apiRes = quoteRes(symbols);
			fetchStub.callsFake(() => Promise.resolve({json: () => Promise.resolve(apiRes)}));

			await getStocksData(symbols);
			const obj = apiRes.quoteResponse.result[0];
			expect(redisSetExStub).to.have.been.calledWith(
				`stockValue=${obj.symbol}`,
				3600,
				JSON.stringify({
					price: obj.regularMarketPrice,
					change: obj.regularMarketChangePercent
				})
			);
		});
		it("return correct data", async function () {
			const symbols = ["S1", "S2", "S3"];

			redisGetStub.callsFake(() => Promise.resolve(null));

			chunckStub.callsFake(() => [
				symbols.map((e) => {
					return {
						symbol: e
					};
				})
			]);

			const apiRes = quoteRes(symbols);
			fetchStub.callsFake(() => Promise.resolve({json: () => Promise.resolve(apiRes)}));

			const res = await getStocksData(symbols);
			const mData = apiRes.quoteResponse.result;

			res.forEach((ele, i) => {
				expect(ele.symbol).to.equal(mData[i].symbol);
				expect(ele.price).to.equal(mData[i].regularMarketPrice);
				expect(ele.change).to.equal(mData[i].regularMarketChangePercent);
			});
		});
	});
	describe("get stock width all data in cache", function () {
		let fetchStub: sinon.SinonStub,
			redisGetStub: sinon.SinonStub,
			redisSetExStub: sinon.SinonStub,
			chunckStub: sinon.SinonStub;

		const redisGetReturnData = (fdRes: quote[]) => (key: string) => {
			const symbol = key.split("=")[1];
			const obj = fdRes.filter((e) => e.symbol === symbol)[0];
			return Promise.resolve(
				JSON.stringify({
					price: obj.regularMarketPrice,
					change: obj.regularMarketChangePercent
				})
			);
		};

		beforeEach(function () {
			fetchStub = sinon.stub(node_fetch, "default");
			redisGetStub = sinon.stub(redisClientCache, "get");
			redisSetExStub = sinon.stub(redisClientCache, "setEx");
			chunckStub = sinon.stub(chunks, "default");
		});

		afterEach(function () {
			fetchStub.restore();
			redisGetStub.restore();
			redisSetExStub.restore();
			chunckStub.restore();
		});
		it("redis get must be called the correct times", async function () {
			const symbols = ["S1", "S2", "S3"];

			const fakeData = quoteRes(symbols);
			const fdRes = fakeData.quoteResponse.result;
			redisGetStub.callsFake(redisGetReturnData(fdRes));

			await getStocksData(symbols);

			expect(redisGetStub).to.have.been.calledThrice;
		});
		it("redis get must be called with correct argument", async function () {
			const symbols = ["S1"];
			const fakeData = quoteRes(symbols);
			const fdRes = fakeData.quoteResponse.result;
			redisGetStub.callsFake(redisGetReturnData(fdRes));

			await getStocksData(symbols);
			expect(redisGetStub).to.have.been.calledWith("stockValue=S1");
		});
		it("fetch, sliceIntoChunks, redis.setEx should not be called", async function () {
			const symbols = ["S1", "S2", "S3"];

			const fakeData = quoteRes(symbols);
			const fdRes = fakeData.quoteResponse.result;
			redisGetStub.callsFake(redisGetReturnData(fdRes));

			await getStocksData(symbols);
			expect(fetchStub).to.have.been.callCount(0);
			expect(chunckStub).to.have.been.callCount(0);
			expect(redisSetExStub).to.have.been.callCount(0);
		});
		it("expect to return correct values", async function () {
			const symbols = ["S1", "S2", "S3"];

			const fakeData = quoteRes(symbols);
			const fdRes = fakeData.quoteResponse.result;
			redisGetStub.callsFake(redisGetReturnData(fdRes));

			const res = await getStocksData(symbols);

			res.forEach((ele, i) => {
				expect(ele.symbol).to.equal(fdRes[i].symbol);
				expect(ele.price).to.equal(fdRes[i].regularMarketPrice);
				expect(ele.change).to.equal(fdRes[i].regularMarketChangePercent);
			});
		});
	});
	describe("get stock with partial data cached", function () {
		let fetchStub: sinon.SinonStub,
			redisGetStub: sinon.SinonStub,
			redisSetExStub: sinon.SinonStub,
			chunckStub: sinon.SinonStub;

		const redisGetReturnData = (fdRes: quote[]) => (key: string) => {
			const symbol = key.split("=")[1];
			const obj = fdRes.filter((e) => e.symbol === symbol)[0];
			if (obj) {
				return Promise.resolve(
					JSON.stringify({
						price: obj.regularMarketPrice,
						change: obj.regularMarketChangePercent
					})
				);
			} else {
				return null;
			}
		};
		const fetchData = (fdRes: quote[]) => () =>
			Promise.resolve({
				json: () =>
					Promise.resolve({
						quoteResponse: {
							error: null,
							result: fdRes
						}
					})
			});

		beforeEach(function () {
			fetchStub = sinon.stub(node_fetch, "default");
			redisGetStub = sinon.stub(redisClientCache, "get");
			redisSetExStub = sinon.stub(redisClientCache, "setEx");
			chunckStub = sinon.stub(chunks, "default");
		});

		afterEach(function () {
			fetchStub.restore();
			redisGetStub.restore();
			redisSetExStub.restore();
			chunckStub.restore();
		});
		it("fetch and redis.setEx must be called the correct amount of times", async function () {
			const symbols = [
				"S1",
				"S2",
				"S3",
				"S4",
				"S5",
				"S6",
				"S7",
				"S8",
				"S9",
				"S10",
				"S11",
				"S12"
			];
			const fakeData = quoteRes(symbols);
			const fdRes = fakeData.quoteResponse.result;
			redisGetStub.callsFake(redisGetReturnData(fdRes.slice(0, 6)));
			chunckStub.callsFake(() => [fdRes.slice(-6)]);
			fetchStub.callsFake(fetchData(fdRes.slice(-6)));

			await getStocksData(symbols);

			expect(redisSetExStub).to.have.been.callCount(6);
			expect(fetchStub).to.have.been.calledOnce;
		});
		it("fetch and redis.setEx must be called with correct arguments", async function () {
			const symbols = [
				"S1",
				"S2",
				"S3",
				"S4",
				"S5",
				"S6",
				"S7",
				"S8",
				"S9",
				"S10",
				"S11",
				"S12"
			];
			const fakeData = quoteRes(symbols);
			const fdRes = fakeData.quoteResponse.result;
			redisGetStub.callsFake(redisGetReturnData(fdRes.slice(0, 11)));
			const fetchD = fdRes.slice(-1);
			chunckStub.callsFake(() => [fetchD]);
			fetchStub.callsFake(fetchData(fetchD));

			await getStocksData(symbols);

			expect(redisSetExStub).to.have.been.calledWith(
				`stockValue=S12`,
				3600,
				JSON.stringify({
					price: fetchD[0].regularMarketPrice,
					change: fetchD[0].regularMarketChangePercent
				})
			);
			expect(fetchStub).to.have.been.calledWith(
				`https://yfapi.net/v6/finance/quote?region=US&lang=en&symbols=S12,`,
				{
					method: "GET",
					headers: {
						"x-api-key": process.env.YF_API_KEY || "",
						"Content-Type": "application/json"
					}
				}
			);
		});
		it("must return correct data", async function () {
			const symbols = [
				"S1",
				"S2",
				"S3",
				"S4",
				"S5",
				"S6",
				"S7",
				"S8",
				"S9",
				"S10",
				"S11",
				"S12"
			];
			const fakeData = quoteRes(symbols);
			const fdRes = fakeData.quoteResponse.result;
			redisGetStub.callsFake(redisGetReturnData(fdRes.slice(0, 6)));
			chunckStub.callsFake(() => [fdRes.slice(-6)]);
			fetchStub.callsFake(fetchData(fdRes.slice(-6)));

			const res = await getStocksData(symbols);
			res.forEach((ele, i) => {
				expect(ele.symbol).to.equal(fdRes[i].symbol);
				expect(ele.price).to.equal(fdRes[i].regularMarketPrice);
				expect(ele.change).to.equal(fdRes[i].regularMarketChangePercent);
			});
		});
	});
});
