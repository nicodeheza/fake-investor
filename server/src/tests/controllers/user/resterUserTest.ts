import chai, {expect} from "chai";
import {Request, Response} from "express";
import sinon, {SinonSpy, SinonStub} from "sinon";
import sinonChai from "sinon-chai";
import resetUser from "../../../controllers/user/resetUser";
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

describe("resetUser controller", function () {
	let statusSpy: SinonSpy,
		jsonSpy: SinonSpy,
		deleteUserHistoryStub: SinonStub,
		deleteUserOwnershipsStub: SinonStub,
		createUfdOwnershipStub: SinonStub;
	describe("reset successfully", function () {
		before(async function () {
			statusSpy = sinon.spy(resMock, "status");
			jsonSpy = sinon.spy(resMock, "json");
			deleteUserHistoryStub = sinon.stub(User, "deleteUserHistory");
			deleteUserOwnershipsStub = sinon.stub(User, "deleteUserOwnerships");
			createUfdOwnershipStub = sinon.stub(User, "createUfdOwnership");

			await resetUser(reqMock as unknown as Request, resMock as Response);
		});
		after(function () {
			statusSpy.restore();
			jsonSpy.restore();
			deleteUserHistoryStub.restore();
			deleteUserOwnershipsStub.restore();
			createUfdOwnershipStub.restore();
		});
		it("deleteUserHistory must be call with user id", function () {
			expect(deleteUserHistoryStub).to.have.been.calledWith(1);
		});
		it("deleteUserOwnerships must be call with user id", function () {
			expect(deleteUserOwnershipsStub).to.have.been.calledWith(1);
		});
		it("createUfdOwnership must be call with user id", function () {
			expect(createUfdOwnershipStub).to.have.been.calledWith(1);
		});
		it("status must be 200", function () {
			expect(statusSpy).to.have.been.calledWith(200);
		});
		it("json must be called with SUCCESS", function () {
			expect(jsonSpy).to.have.been.calledWith({message: "SUCCESS"});
		});
	});
	describe("test error", function () {
		before(async function () {
			statusSpy = sinon.spy(resMock, "status");
			jsonSpy = sinon.spy(resMock, "json");
			deleteUserHistoryStub = sinon.stub(User, "deleteUserHistory");
			deleteUserOwnershipsStub = sinon.stub(User, "deleteUserOwnerships");
			createUfdOwnershipStub = sinon.stub(User, "createUfdOwnership");

			deleteUserHistoryStub.callsFake(() => Promise.reject("test error"));

			await resetUser(reqMock as unknown as Request, resMock as Response);
		});
		after(function () {
			statusSpy.restore();
			jsonSpy.restore();
			deleteUserHistoryStub.restore();
			deleteUserOwnershipsStub.restore();
			createUfdOwnershipStub.restore();
		});

		it("status must be 500", function () {
			expect(statusSpy).to.have.been.calledWith(500);
		});
		it("json must be called with error", function () {
			expect(jsonSpy).to.have.been.calledWith("test error");
		});
	});
});
