"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = __importStar(require("chai"));
const passport_1 = __importDefault(require("passport"));
const sinon_1 = __importDefault(require("sinon"));
const sinon_chai_1 = __importDefault(require("sinon-chai"));
const Singup_1 = __importDefault(require("../../../controllers/user/Singup"));
const pass = __importStar(require("../../../functions/password"));
const Stock_1 = __importDefault(require("../../../models/Stock"));
const User_1 = __importDefault(require("../../../models/User"));
chai_1.default.use(sinon_chai_1.default);
const resMock = {
    status: function (n) {
        return this;
    },
    json: function (o) {
        return this;
    }
};
describe("Singup controller", function () {
    let statusSpy, jsonSpy, createHashStub, saveNewUserStub, getIdFromSymbolStub, addStockOwnershipStub, authenticateStub;
    describe("singup with incorrect email format", function () {
        before(function () {
            return __awaiter(this, void 0, void 0, function* () {
                const reqMock = {
                    body: {
                        email: "test",
                        userName: "testUser",
                        password: "testPassword",
                        repeat: "testPassword"
                    }
                };
                statusSpy = sinon_1.default.spy(resMock, "status");
                jsonSpy = sinon_1.default.spy(resMock, "json");
                createHashStub = sinon_1.default.stub(pass, "createHash");
                saveNewUserStub = sinon_1.default.stub(User_1.default, "saveNewUser");
                getIdFromSymbolStub = sinon_1.default.stub(Stock_1.default, "getIdFromSymbol");
                addStockOwnershipStub = sinon_1.default.stub(User_1.default, "addStockOwnership");
                authenticateStub = sinon_1.default.stub(passport_1.default, "authenticate");
                yield (0, Singup_1.default)(reqMock, resMock);
            });
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
            (0, chai_1.expect)(statusSpy).to.have.been.calledOnce;
            (0, chai_1.expect)(statusSpy).to.have.been.calledWith(400);
        });
        it("json must be called with correct data", function () {
            (0, chai_1.expect)(jsonSpy).to.have.been.calledOnce;
            (0, chai_1.expect)(jsonSpy).to.have.been.calledWith({ message: "Please enter a valid email." });
        });
    });
    describe("singup with an email that exist in the db", function () {
        before(function () {
            return __awaiter(this, void 0, void 0, function* () {
                const reqMock = {
                    body: {
                        email: "test@test.com",
                        userName: "testUser",
                        password: "testPassword",
                        repeat: "testPassword"
                    }
                };
                statusSpy = sinon_1.default.spy(resMock, "status");
                jsonSpy = sinon_1.default.spy(resMock, "json");
                createHashStub = sinon_1.default.stub(pass, "createHash");
                saveNewUserStub = sinon_1.default.stub(User_1.default, "saveNewUser");
                getIdFromSymbolStub = sinon_1.default.stub(Stock_1.default, "getIdFromSymbol");
                addStockOwnershipStub = sinon_1.default.stub(User_1.default, "addStockOwnership");
                authenticateStub = sinon_1.default.stub(passport_1.default, "authenticate");
                saveNewUserStub.callsFake(() => Promise.resolve("Duplicate entry '1@1' for key 'Users.email'"));
                createHashStub.callsFake(() => Promise.resolve({ hash: "testHash", salt: "testSalt" }));
                yield (0, Singup_1.default)(reqMock, resMock);
            });
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
            (0, chai_1.expect)(createHashStub).to.have.been.calledWith("testPassword");
        });
        it("saveUser must be called with correct arguments", function () {
            (0, chai_1.expect)(saveNewUserStub).to.have.been.calledWith("testUser", "test@test.com", "testHash", "testSalt");
        });
        it("status must be 400", function () {
            (0, chai_1.expect)(statusSpy).to.have.been.calledOnce;
            (0, chai_1.expect)(statusSpy).to.have.been.calledWith(400);
        });
        it("json must be called with correct data", function () {
            (0, chai_1.expect)(jsonSpy).to.have.been.calledOnce;
            (0, chai_1.expect)(jsonSpy).to.have.been.calledWith({
                message: "There is already an account associated with that email"
            });
        });
    });
    describe("fail saving user ", function () {
        before(function () {
            return __awaiter(this, void 0, void 0, function* () {
                const reqMock = {
                    body: {
                        email: "test@test.com",
                        userName: "testUser",
                        password: "testPassword",
                        repeat: "testPassword"
                    }
                };
                statusSpy = sinon_1.default.spy(resMock, "status");
                jsonSpy = sinon_1.default.spy(resMock, "json");
                createHashStub = sinon_1.default.stub(pass, "createHash");
                saveNewUserStub = sinon_1.default.stub(User_1.default, "saveNewUser");
                getIdFromSymbolStub = sinon_1.default.stub(Stock_1.default, "getIdFromSymbol");
                addStockOwnershipStub = sinon_1.default.stub(User_1.default, "addStockOwnership");
                authenticateStub = sinon_1.default.stub(passport_1.default, "authenticate");
                saveNewUserStub.callsFake(() => Promise.resolve("test error"));
                createHashStub.callsFake(() => Promise.resolve({ hash: "testHash", salt: "testSalt" }));
                yield (0, Singup_1.default)(reqMock, resMock);
            });
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
            (0, chai_1.expect)(statusSpy).to.have.been.calledOnce;
            (0, chai_1.expect)(statusSpy).to.have.been.calledWith(400);
        });
        it("json must be called with correct data", function () {
            (0, chai_1.expect)(jsonSpy).to.have.been.calledOnce;
            (0, chai_1.expect)(jsonSpy).to.have.been.calledWith({ message: "Error" });
        });
    });
    describe("save user successfully and log it in", function () {
        before(function () {
            return __awaiter(this, void 0, void 0, function* () {
                const reqMock = {
                    body: {
                        email: "test@test.com",
                        userName: "testUser",
                        password: "testPassword",
                        repeat: "testPassword"
                    }
                };
                statusSpy = sinon_1.default.spy(resMock, "status");
                jsonSpy = sinon_1.default.spy(resMock, "json");
                createHashStub = sinon_1.default.stub(pass, "createHash");
                saveNewUserStub = sinon_1.default.stub(User_1.default, "saveNewUser");
                getIdFromSymbolStub = sinon_1.default.stub(Stock_1.default, "getIdFromSymbol");
                addStockOwnershipStub = sinon_1.default.stub(User_1.default, "addStockOwnership");
                authenticateStub = sinon_1.default.stub(passport_1.default, "authenticate");
                saveNewUserStub.callsFake(() => Promise.resolve(["success", 2]));
                createHashStub.callsFake(() => Promise.resolve({ hash: "testHash", salt: "testSalt" }));
                getIdFromSymbolStub.callsFake(() => Promise.resolve(1));
                yield (0, Singup_1.default)(reqMock, resMock);
            });
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
            (0, chai_1.expect)(getIdFromSymbolStub).to.have.been.calledWith("FUD");
        });
        it("addStockOwnership must be called with the correct arguments", function () {
            (0, chai_1.expect)(addStockOwnershipStub).to.have.been.calledWith(2, 1, 1000000);
        });
        it("authenticate must be called", function () {
            (0, chai_1.expect)(authenticateStub).to.have.been.calledOnce;
        });
    });
});
