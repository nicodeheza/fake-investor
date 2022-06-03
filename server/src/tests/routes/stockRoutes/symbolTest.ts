import chai, {expect} from "chai";
import chaiHttp from "chai-http";
import app from "../../../index";
import sinon, {SinonStub} from "sinon";
import sinonChai from "sinon-chai";
import * as node_fetch from "node-fetch";
import {redisClientCache} from "../../../redis/redisConn";

chai.use(chaiHttp);
chai.use(sinonChai);

const fetchRes = {
	quoteResponse: {
		result: [
			{
				language: "en-US",
				region: "US",
				quoteType: "EQUITY",
				typeDisp: "Equity",
				quoteSourceName: "Nasdaq Real Time Price",
				triggerable: true,
				customPriceAlertConfidence: "HIGH",
				currency: "USD",
				exchangeTimezoneShortName: "EDT",
				gmtOffSetMilliseconds: -14400000,
				marketState: "POST",
				market: "us_market",
				esgPopulated: false,
				messageBoardId: "finmb_24937",
				exchangeTimezoneName: "America/New_York",
				exchange: "NMS",
				shortName: "Apple Inc.",
				longName: "Apple Inc.",
				sharesOutstanding: 16185199616,
				bookValue: 4.158,
				fiftyDayAverage: 159.5864,
				fiftyDayAverageChange: -14.20639,
				fiftyDayAverageChangePercent: -0.08902006,
				twoHundredDayAverage: 159.49174,
				twoHundredDayAverageChange: -14.11174,
				twoHundredDayAverageChangePercent: -0.08847944,
				marketCap: 2353004281856,
				forwardPE: 22.161587,
				priceToBook: 34.963924,
				sourceInterval: 15,
				exchangeDataDelayedBy: 0,
				pageViewGrowthWeekly: 0.16060829,
				averageAnalystRating: "1.9 - Buy",
				tradeable: false,
				firstTradeDateMilliseconds: 345479400000,
				priceHint: 2,
				postMarketChangePercent: -0.0515973,
				postMarketTime: 1654294880,
				postMarketPrice: 145.305,
				postMarketChange: -0.0750122,
				regularMarketChange: -5.830002,
				regularMarketChangePercent: -3.8555663,
				regularMarketTime: 1654286404,
				regularMarketPrice: 145.38,
				regularMarketDayHigh: 147.95,
				regularMarketDayRange: "144.462 - 147.95",
				regularMarketDayLow: 144.462,
				regularMarketVolume: 88371635,
				regularMarketPreviousClose: 151.21,
				bid: 145.61,
				ask: 145.54,
				bidSize: 8,
				askSize: 11,
				fullExchangeName: "NasdaqGS",
				financialCurrency: "USD",
				regularMarketOpen: 146.9,
				averageDailyVolume3Month: 98025590,
				averageDailyVolume10Day: 101944890,
				fiftyTwoWeekLowChange: 21.530006,
				fiftyTwoWeekLowChangePercent: 0.17383938,
				fiftyTwoWeekRange: "123.85 - 182.94",
				fiftyTwoWeekHighChange: -37.559998,
				fiftyTwoWeekHighChangePercent: -0.2053132,
				fiftyTwoWeekLow: 123.85,
				fiftyTwoWeekHigh: 182.94,
				dividendDate: 1652313600,
				earningsTimestamp: 1651163400,
				earningsTimestampStart: 1658779200,
				earningsTimestampEnd: 1659124800,
				trailingAnnualDividendRate: 0.88,
				trailingPE: 23.6891,
				trailingAnnualDividendYield: 0.0058197207,
				epsTrailingTwelveMonths: 6.137,
				epsForward: 6.56,
				epsCurrentYear: 6.14,
				priceEpsCurrentYear: 23.677526,
				displayName: "Apple",
				symbol: "AAPL"
			}
		],
		error: null
	}
};
const expectRes = {
	longName: "Apple Inc.",
	regularMarketPrice: 145.38,
	regularMarketChange: -5.830002,
	regularMarketChangePercent: -3.8555663,
	regularMarketPreviousClose: 151.21,
	regularMarketOpen: 146.9,
	regularMarketDayRange: "144.462 - 147.95",
	fiftyTwoWeekRange: "123.85 - 182.94",
	regularMarketVolume: 88371635,
	averageDailyVolume3Month: 98025590,
	userProp: false
};

describe("/stock/:symbol", function () {
	after(async function () {
		await redisClientCache.flushDb();
	});
	describe("request with no cached data", function () {
		let res: ChaiHttp.Response, fetchStub: SinonStub;
		before(function (done) {
			fetchStub = sinon.stub(node_fetch, "default");
			fetchStub.callsFake(() => Promise.resolve({json: () => Promise.resolve(fetchRes)}));

			chai
				.request(app)
				.get("/api/stock/AAPL")
				.end((e, r) => {
					res = r;
					done();
				});
		});
		after(function () {
			fetchStub.restore();
		});
		it("data must be fetched from yfApi", function () {
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
				.get("/api/stock/AAPL")
				.end((e, r) => {
					res = r;
					done();
				});
		});
		after(function () {
			fetchStub.restore();
		});
		it("data must be fetched from redis cache", function () {
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
