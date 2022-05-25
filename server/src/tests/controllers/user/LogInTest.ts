import chai, {expect} from "chai";
import {Request, Response} from "express";
import sinon, {SinonSpy} from "sinon";
import sinonChai from "sinon-chai";
import Login from "../../../controllers/user/Login";

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
	user: {
		user_name: "test user"
	}
};

describe("Login controller", function () {
	let statusSpy: SinonSpy, jsonSpy: SinonSpy;
	before(function () {
		statusSpy = sinon.spy(resMock, "status");
		jsonSpy = sinon.spy(resMock, "json");

		Login(reqMock as unknown as Request, resMock as Response);
	});
	after(function () {
		statusSpy.restore();
		jsonSpy.restore();
	});
	it("status must be 200", function () {
		expect(statusSpy).to.have.been.calledWith(200);
	});
	it("json must be called with user name", function () {
		expect(jsonSpy).to.have.been.calledWith({userName: "test user"});
	});
});
