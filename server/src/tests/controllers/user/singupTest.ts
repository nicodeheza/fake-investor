import chai, {expect} from "chai";
import {Request, Response} from "express";
import passport from "passport";
import sinon, {SinonSpy, SinonStub} from "sinon";
import sinonChai from "sinon-chai";
import Singup from "../../../controllers/user/Singup";
import * as pass from "../../../functions/password";
import Stock from "../../../models/Stock";
import User from "../../../models/User";

chai.use(sinonChai);

const resMock = {
	status: function (n: number) {
		return this;
	},
	json: function (o: number) {
		return this;
	}
};

describe("Singup controller", function () {
	let statusSpy: SinonSpy,
		jsonSpy: SinonSpy,
		createHashStub: SinonStub,
		saveNewUserStub: SinonStub,
		getIdFromSymbolStub: SinonStub,
		addStockOwnershipStub: SinonStub,
		authenticateStub: SinonStub;

	describe("singup with incorrect email format", function () {
		before(async function () {
			const reqMock = {
				body: {
					email: "test",
					userName: "testUser",
					password: "testPassword",
					repeat: "testPassword"
				}
			};

			statusSpy = sinon.spy(resMock, "status");
			jsonSpy = sinon.spy(resMock, "json");
			createHashStub = sinon.stub(pass, "createHash");
			saveNewUserStub = sinon.stub(User, "saveNewUser");
			getIdFromSymbolStub = sinon.stub(Stock, "getIdFromSymbol");
			addStockOwnershipStub = sinon.stub(User, "addStockOwnership");
			authenticateStub = sinon.stub(passport, "authenticate");

			await Singup(reqMock as unknown as Request, resMock as Response);
		});
		after(function () {
			statusSpy.restore();
			jsonSpy.restore();
			createHashStub.restore();
			saveNewUserStub.restore();
			getIdFromSymbolStub.restore();
			addStockOwnershipStub.restore();
			authenticateStub.restore();
		});
		it("status must be 400", function () {
			expect(statusSpy).to.have.been.calledOnce;
			expect(statusSpy).to.have.been.calledWith(400);
		});
		it("json must be called with correct data", function () {
			expect(jsonSpy).to.have.been.calledOnce;
			expect(jsonSpy).to.have.been.calledWith({message: "Please enter a valid email."});
		});
	});
	describe("singup with an email that exist in the db", function () {
		before(async function () {
			const reqMock = {
				body: {
					email: "test@test.com",
					userName: "testUser",
					password: "testPassword",
					repeat: "testPassword"
				}
			};

			statusSpy = sinon.spy(resMock, "status");
			jsonSpy = sinon.spy(resMock, "json");
			createHashStub = sinon.stub(pass, "createHash");
			saveNewUserStub = sinon.stub(User, "saveNewUser");
			getIdFromSymbolStub = sinon.stub(Stock, "getIdFromSymbol");
			addStockOwnershipStub = sinon.stub(User, "addStockOwnership");
			authenticateStub = sinon.stub(passport, "authenticate");

			saveNewUserStub.callsFake(() =>
				Promise.resolve("Duplicate entry '1@1' for key 'Users.email'")
			);
			createHashStub.callsFake(() =>
				Promise.resolve({hash: "testHash", salt: "testSalt"})
			);

			await Singup(reqMock as unknown as Request, resMock as Response);
		});
		after(function () {
			statusSpy.restore();
			jsonSpy.restore();
			createHashStub.restore();
			saveNewUserStub.restore();
			getIdFromSymbolStub.restore();
			addStockOwnershipStub.restore();
			authenticateStub.restore();
		});
		it("createHash must be called with the correct argument", function () {
			expect(createHashStub).to.have.been.calledWith("testPassword");
		});
		it("saveUser must be called with correct arguments", function () {
			expect(saveNewUserStub).to.have.been.calledWith(
				"testUser",
				"test@test.com",
				"testHash",
				"testSalt"
			);
		});
		it("status must be 400", function () {
			expect(statusSpy).to.have.been.calledOnce;
			expect(statusSpy).to.have.been.calledWith(400);
		});
		it("json must be called with correct data", function () {
			expect(jsonSpy).to.have.been.calledOnce;
			expect(jsonSpy).to.have.been.calledWith({
				message: "There is already an account associated with that email"
			});
		});
	});
	describe("fail saving user ", function () {
		before(async function () {
			const reqMock = {
				body: {
					email: "test@test.com",
					userName: "testUser",
					password: "testPassword",
					repeat: "testPassword"
				}
			};

			statusSpy = sinon.spy(resMock, "status");
			jsonSpy = sinon.spy(resMock, "json");
			createHashStub = sinon.stub(pass, "createHash");
			saveNewUserStub = sinon.stub(User, "saveNewUser");
			getIdFromSymbolStub = sinon.stub(Stock, "getIdFromSymbol");
			addStockOwnershipStub = sinon.stub(User, "addStockOwnership");
			authenticateStub = sinon.stub(passport, "authenticate");

			saveNewUserStub.callsFake(() => Promise.resolve("test error"));
			createHashStub.callsFake(() =>
				Promise.resolve({hash: "testHash", salt: "testSalt"})
			);

			await Singup(reqMock as unknown as Request, resMock as Response);
		});
		after(function () {
			statusSpy.restore();
			jsonSpy.restore();
			createHashStub.restore();
			saveNewUserStub.restore();
			getIdFromSymbolStub.restore();
			addStockOwnershipStub.restore();
			authenticateStub.restore();
		});
		it("status must be 400", function () {
			expect(statusSpy).to.have.been.calledOnce;
			expect(statusSpy).to.have.been.calledWith(400);
		});
		it("json must be called with correct data", function () {
			expect(jsonSpy).to.have.been.calledOnce;
			expect(jsonSpy).to.have.been.calledWith({message: "Error"});
		});
	});
	describe("save user successfully and log it in", function () {
		before(async function () {
			const reqMock = {
				body: {
					email: "test@test.com",
					userName: "testUser",
					password: "testPassword",
					repeat: "testPassword"
				}
			};

			statusSpy = sinon.spy(resMock, "status");
			jsonSpy = sinon.spy(resMock, "json");
			createHashStub = sinon.stub(pass, "createHash");
			saveNewUserStub = sinon.stub(User, "saveNewUser");
			getIdFromSymbolStub = sinon.stub(Stock, "getIdFromSymbol");
			addStockOwnershipStub = sinon.stub(User, "addStockOwnership");
			authenticateStub = sinon.stub(passport, "authenticate");

			saveNewUserStub.callsFake(() => Promise.resolve(["success", 2]));
			createHashStub.callsFake(() =>
				Promise.resolve({hash: "testHash", salt: "testSalt"})
			);
			getIdFromSymbolStub.callsFake(() => Promise.resolve(1));

			await Singup(reqMock as unknown as Request, resMock as Response);
		});
		after(function () {
			statusSpy.restore();
			jsonSpy.restore();
			createHashStub.restore();
			saveNewUserStub.restore();
			getIdFromSymbolStub.restore();
			addStockOwnershipStub.restore();
			authenticateStub.restore();
		});
		it("getIdFromSymbol must be called with FUD as argument", function () {
			expect(getIdFromSymbolStub).to.have.been.calledWith("FUD");
		});
		it("addStockOwnership must be called with the correct arguments", function () {
			expect(addStockOwnershipStub).to.have.been.calledWith(2, 1, 1000000);
		});
		it("authenticate must be called", function () {
			expect(authenticateStub).to.have.been.calledOnce;
		});
	});
});
