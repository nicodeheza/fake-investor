import chai, {expect} from "chai";
import {Request, Response} from "express";
import sinon, {SinonSpy} from "sinon";
import sinonChai from "sinon-chai";
import logout from "../../../controllers/user/logout";

chai.use(sinonChai);

const reqMock = {
	logOut: () => ""
};

const resMock = {
	status: function (n: number) {
		return this;
	},
	json: function (o: {}) {
		return this;
	}
};

describe("Logout controller", function () {
	let statusSpy: SinonSpy, jsonSpy: SinonSpy, logOutSpy: SinonSpy;
	before(function () {
		statusSpy = sinon.spy(resMock, "status");
		jsonSpy = sinon.spy(resMock, "json");
		logOutSpy = sinon.spy(reqMock, "logOut");

		logout(reqMock as unknown as Request, resMock as Response);
	});
	after(function () {
		statusSpy.restore();
		jsonSpy.restore();
		logOutSpy.restore();
	});
	it("logOut must be called", function () {
		expect(logOutSpy).to.have.been.calledOnce;
	});
	it("status must be 200", function () {
		expect(statusSpy).to.have.been.calledWith(200);
	});
	it("json must return an empty name", function () {
		expect(jsonSpy).to.have.been.calledWith({userName: ""});
	});
});
