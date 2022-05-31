import chai, {expect} from "chai";
import {Request, Response} from "express";
import sinon, {SinonSpy, SinonStub} from "sinon";
import sinonChai from "sinon-chai";
import userChart from "../../../controllers/user/userChart";
import * as FUHP from "../../../functions/fillUserHistoryPoints";
import * as UCTH from "../../../functions/updateOrCreateToDayHistory";
import User from "../../../models/User";

chai.use(sinonChai);

const resMock = {
	status: function (n: number) {
		return this;
	},
	json: function (o: {}) {
		return this;
	}
};

const reqMock = {
	user: [
		{
			user_id: 1
		}
	]
};

const initHistoryPoint = {
	"1111111": {
		portfolioValue: 1000,
		liquid: 500,
		transactions: [
			{
				price: 5,
				quantity: 5,
				buy: true,
				symbol: "S1"
			}
		]
	},
	"333333": {
		portfolioValue: 1000,
		liquid: 500,
		transactions: [
			{
				price: 5,
				quantity: 5,
				buy: true,
				symbol: "S1"
			}
		]
	}
};

const finalHistoryPoint = {
	...initHistoryPoint,
	"222222": {
		portfolioValue: 1000,
		liquid: 500,
		transactions: [
			{
				price: 5,
				quantity: 5,
				buy: true,
				symbol: "S1"
			}
		]
	}
};

describe("UserChart controller", function () {
	let statusSpy: SinonSpy,
		jsonSpy: SinonSpy,
		updateOrCreateToDayHistoryStub: SinonStub,
		getChartHistoryPointsStub: SinonStub,
		fillUserHistoryPointsStub: SinonStub;

	describe("response successfully", function () {
		before(async function () {
			statusSpy = sinon.spy(resMock, "status");
			jsonSpy = sinon.spy(resMock, "json");
			updateOrCreateToDayHistoryStub = sinon.stub(UCTH, "default");
			getChartHistoryPointsStub = sinon.stub(User, "getChartHistoryPoints");
			fillUserHistoryPointsStub = sinon.stub(FUHP, "default");

			getChartHistoryPointsStub.callsFake(() => Promise.resolve(initHistoryPoint));
			fillUserHistoryPointsStub.callsFake(() => Promise.resolve(finalHistoryPoint));

			await userChart(reqMock as unknown as Request, resMock as Response);
		});
		after(function () {
			statusSpy.restore();
			jsonSpy.restore();
			updateOrCreateToDayHistoryStub.restore();
			getChartHistoryPointsStub.restore();
			fillUserHistoryPointsStub.restore();
		});
		it("updateOrCreateToDayHistory must be called with correct argumentes", function () {
			expect(updateOrCreateToDayHistoryStub).to.have.been.calledWith(1);
		});
		it("getChartHistoryPoints must be called with correct argumentes", function () {
			expect(getChartHistoryPointsStub).to.have.been.calledWith(1);
		});
		it("fillUserHistoryPoints must be called with correct argumentes", function () {
			expect(fillUserHistoryPointsStub).to.have.been.calledWith(1, initHistoryPoint);
		});
		it("status must be 200", function () {
			expect(statusSpy).to.have.been.calledWith(200);
		});
		it("json must be called with correct arguments", function () {
			expect(jsonSpy).to.have.been.calledWith(finalHistoryPoint);
		});
	});
	describe("error test", function () {
		before(async function () {
			statusSpy = sinon.spy(resMock, "status");
			jsonSpy = sinon.spy(resMock, "json");
			updateOrCreateToDayHistoryStub = sinon.stub(UCTH, "default");
			getChartHistoryPointsStub = sinon.stub(User, "getChartHistoryPoints");
			fillUserHistoryPointsStub = sinon.stub(FUHP, "default");

			getChartHistoryPointsStub.callsFake(() => Promise.reject("test error"));

			await userChart(reqMock as unknown as Request, resMock as Response);
		});
		after(function () {
			statusSpy.restore();
			jsonSpy.restore();
			updateOrCreateToDayHistoryStub.restore();
			getChartHistoryPointsStub.restore();
			fillUserHistoryPointsStub.restore();
		});
		it("status must be 500", function () {
			expect(statusSpy).to.have.been.calledWith(500);
		});
		it("json must be caller with correct arguments", function () {
			expect(jsonSpy).to.have.been.calledWith("test error");
		});
	});
});
