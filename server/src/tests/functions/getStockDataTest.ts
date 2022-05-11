import chai, {expect} from "chai";
import * as node_fetch from "node-fetch";
import * as chunks from "../../functions/sliceIntoChunks";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import {redisClientCache} from "../../redis/redisConn";
import getStocksData from "../../functions/getStocksData";
import quoteRes from "../mocks/quoteRes";

chai.use(sinonChai);

describe("GetStocksData", function () {
	describe("get stocks with no data in the cache", function () {
		let fetchStub: sinon.SinonStub,
			redisGetStub: sinon.SinonStub,
			redisSetExStub: sinon.SinonStub,
			chunckStub: sinon.SinonStub;

		afterEach(function () {
			fetchStub.restore();
			redisGetStub.restore();
			redisSetExStub.restore();
			chunckStub.restore();
		});
		it("fetch must be called once every 10 symbols", async function () {
			fetchStub = sinon.stub(node_fetch, "default");
			redisGetStub = sinon.stub(redisClientCache, "get");
			redisGetStub.callsFake(() => Promise.resolve(null));
			redisSetExStub = sinon.stub(redisClientCache, "setEx");
			chunckStub = sinon.stub(chunks, "default");
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
			fetchStub = sinon.stub(node_fetch, "default");

			redisGetStub = sinon.stub(redisClientCache, "get");
			redisGetStub.callsFake(() => Promise.resolve(null));

			redisSetExStub = sinon.stub(redisClientCache, "setEx");

			chunckStub = sinon.stub(chunks, "default");
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
			// expect(fetchStub).to.have.been.calledTwice;
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
	});
});
