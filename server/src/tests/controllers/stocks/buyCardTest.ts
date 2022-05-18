import chai, {expect} from "chai";
import sinon, {SinonSpy, SinonStub} from "sinon";
import sinonChai from "sinon-chai";
import User from "../../../models/User";
import * as GPV from "../../../functions/getPortfolioVal";
import buyCard from "../../../controllers/stoks/buyCard";
import {Request, Response} from "express";

chai.use(sinonChai);

const reqMock = {
	user: [
		{
			user_id: 1
		}
	]
};
const resMock = {
	status: function (num: number) {
		return this;
	},
	json: function (obj: {}) {
		return this;
	}
};

describe("BuyCard controller", async function () {
	let getFudQuantityStub: SinonStub,
		getPortfolioValStub: SinonStub,
		statusSpy: SinonSpy,
		jsonSpy: SinonSpy;
	before(async function () {
		getFudQuantityStub = sinon.stub(User, "getFudQuantity");
		getPortfolioValStub = sinon.stub(GPV, "default");
		statusSpy = sinon.spy(resMock, "status");
		jsonSpy = sinon.spy(resMock, "json");

		getFudQuantityStub.callsFake(() => Promise.resolve(1000));
		getPortfolioValStub.callsFake(() => Promise.resolve(9000));

		await buyCard(reqMock as unknown as Request, resMock as Response);
	});
	after(function () {
		getFudQuantityStub.restore();
		getPortfolioValStub.restore();
		statusSpy.restore();
		jsonSpy.restore();
	});
	it("getFudQuantity have been called with correct arguments", function () {
		expect(getFudQuantityStub).to.have.been.calledWith(reqMock.user[0].user_id);
	});
	it("getPortfolioVal have been called with correct arguments", function () {
		expect(getPortfolioValStub).to.have.been.calledWith(reqMock.user[0].user_id);
	});
	it("status must be called with 200", function () {
		expect(statusSpy).to.have.been.calledWith(200);
	});
	it("json must be called with correct data", function () {
		expect(jsonSpy).to.have.been.calledWith({
			fud: 1000,
			portfolioV: 9000
		});
	});
});
