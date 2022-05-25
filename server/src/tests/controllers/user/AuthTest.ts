import chai, {expect} from "chai";
import {Request, Response} from "express";
import sinon, {SinonSpy} from "sinon";
import sinonChai from "sinon-chai";
import Auth from "../../../controllers/user/Auth";

chai.use(sinonChai);

const resMock = {
	status: function (n: number) {
		return this;
	},
	json: function (o: {}) {
		return this;
	}
};

describe("Auth controller", function () {
	let statusSpy: SinonSpy, jsonSpy: SinonSpy;

	describe("user is auth", function () {
		before(function () {
			const reqMock = {
				isAuthenticated: () => true,
				user: [
					{
						user_name: "test user"
					}
				]
			};
			statusSpy = sinon.spy(resMock, "status");
			jsonSpy = sinon.spy(resMock, "json");

			Auth(reqMock as unknown as Request, resMock as Response);
		});
		after(function () {
			statusSpy.restore();
			jsonSpy.restore();
		});
		it("status is 200", function () {
			expect(statusSpy).to.have.been.calledWith(200);
		});
		it("json returns the user name", function () {
			expect(jsonSpy).to.have.been.calledWith({userName: "test user"});
		});
	});
	describe("user is unauth", function () {
		before(function () {
			const reqMock = {
				isAuthenticated: () => false,
				user: [
					{
						user_name: "test user"
					}
				]
			};
			statusSpy = sinon.spy(resMock, "status");
			jsonSpy = sinon.spy(resMock, "json");

			Auth(reqMock as unknown as Request, resMock as Response);
		});
		after(function () {
			statusSpy.restore();
			jsonSpy.restore();
		});
		it("status is 200", function () {
			expect(statusSpy).to.have.been.calledWith(200);
		});
		it("json returns empty name", function () {
			expect(jsonSpy).to.have.been.calledWith({userName: ""});
		});
	});
});
