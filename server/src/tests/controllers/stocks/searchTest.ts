import chai, {expect} from "chai";
import sinon, {SinonSpy, SinonStub} from "sinon";
import sinonChai from "sinon-chai";
import * as F from "node-fetch";
import SearchStock from "../../../controllers/stoks/search";
import {Request, Response} from "express";

chai.use(sinonChai);

const reqMock = {
	params: {
		query: "test"
	}
};

const resMock = {
	status: function (num: number) {
		return this;
	},
	json: function (onj: {}) {
		return this;
	}
};

describe("SearchStock controller", function () {
	let jsonSpy: SinonSpy, statusSpy: SinonSpy, fetchStub: SinonStub;
	before(async function () {
		jsonSpy = sinon.spy(resMock, "json");
		statusSpy = sinon.spy(resMock, "status");
		fetchStub = sinon.stub(F, "default");

		fetchStub.callsFake(() =>
			Promise.resolve({json: () => Promise.resolve("fetch res")})
		);

		await SearchStock(reqMock as unknown as Request, resMock as Response);
	});
	after(function () {
		jsonSpy.restore();
		statusSpy.restore();
		fetchStub.restore();
	});
	it("fetch must be called with correct arguments", function () {
		expect(fetchStub).to.have.been.calledWith(
			`https://yfapi.net/v6/finance/autocomplete?region=US&lang=en&query=${reqMock.params.query}`,
			{
				method: "GET",
				headers: {
					"x-api-key": process.env.YF_API_KEY || "",
					"Content-Type": "application/json"
				}
			}
		);
	});
	it("res with status 200", function () {
		expect(statusSpy).to.have.been.calledWith(200);
	});
	it("call res json with correct data", function () {
		expect(jsonSpy).to.have.been.calledWith("fetch res");
	});
});
