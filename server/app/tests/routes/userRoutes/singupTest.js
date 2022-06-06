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
const chai_http_1 = __importDefault(require("chai-http"));
const db_1 = __importDefault(require("../../../db/db"));
const index_1 = __importDefault(require("../../../index"));
chai_1.default.use(chai_http_1.default);
describe("/user/singup route", function () {
    after(function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield db_1.default.promise().execute(`
		DELETE FROM Users WHERE user_name= 'newUser'
		`);
        });
    });
    describe("user must have been saved correctly in the db and logged in", function () {
        let res, err, newUser;
        before(function (done) {
            chai_1.default
                .request(index_1.default)
                .post("/api/user/singup")
                .set("Content-Type", "application/json")
                .send({
                email: "newUser@test.com",
                userName: "newUser",
                password: "newUserPassword",
                repeat: "newUserPassword"
            })
                .end(function (e, r) {
                res = r;
                err = e;
                done();
            });
        });
        it("user has been saved correctly in the db", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const [dbData] = yield db_1.default.promise().execute(`
                SELECT * FROM Users WHERE user_name= 'newUser'
            `);
                newUser = dbData[0];
                (0, chai_1.expect)(newUser.user_id).to.be.a("number");
                (0, chai_1.expect)(newUser.user_name).to.be.equal("newUser");
                (0, chai_1.expect)(newUser.email).to.be.equal("newUser@test.com");
                (0, chai_1.expect)(newUser.hash).to.be.a("string").and.to.not.be.equal("newUserPassword");
                (0, chai_1.expect)(newUser.salt).to.be.a("string");
                (0, chai_1.expect)(newUser.start_day.getTime()).to.be.equal(new Date().setHours(0, 0, 0, 0));
            });
        });
        it("User must have 1000000 UFD ownership", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const [dbData] = yield db_1.default.promise().query(`
                SELECT quantity FROM Ownerships WHERE user_id=? AND stock_id= 1
            `, [newUser.user_id]);
                const userUfd = dbData[0].quantity;
                (0, chai_1.expect)(parseFloat(userUfd)).to.be.equal(1000000);
            });
        });
        it("user must be logged in", function () {
            (0, chai_1.expect)(res).to.have.cookie("connect.sid");
        });
        it("status must be 200", function () {
            (0, chai_1.expect)(res).to.have.status(200);
            (0, chai_1.expect)(err).to.be.null;
        });
        it("user name must be returned", function () {
            (0, chai_1.expect)(res).to.be.json;
            (0, chai_1.expect)(res.body.userName).to.be.equal("newUser");
        });
    });
    describe("singup with invalid email", function () {
        let res, err;
        before(function (done) {
            chai_1.default
                .request(index_1.default)
                .post("/api/user/singup")
                .set("Content-Type", "application/json")
                .send({
                email: "newUser",
                userName: "newUser2",
                password: "newUserPassword2",
                repeat: "newUserPassword2"
            })
                .end(function (e, r) {
                res = r;
                err = e;
                done();
            });
        });
        it("status must be 400", function () {
            (0, chai_1.expect)(res).to.have.status(400);
        });
        it("must return correct message", function () {
            (0, chai_1.expect)(res.body.message).to.be.equal("Please enter a valid email.");
        });
        it("new user has not been created", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const [dbData] = yield db_1.default.promise().execute(`
			SELECT * FROM Users WHERE user_name= 'newUser2'
			`);
                (0, chai_1.expect)(dbData).to.be.eql([]);
            });
        });
    });
    describe("signup with existing email", function () {
        let res, err, newUser;
        before(function (done) {
            chai_1.default
                .request(index_1.default)
                .post("/api/user/singup")
                .set("Content-Type", "application/json")
                .send({
                email: "newUser@test.com",
                userName: "newUser3",
                password: "newUserPassword",
                repeat: "newUserPassword"
            })
                .end(function (e, r) {
                res = r;
                err = e;
                done();
            });
        });
        it("status must be 400", function () {
            (0, chai_1.expect)(res).to.have.status(400);
        });
        it("must return correct message", function () {
            (0, chai_1.expect)(res.body.message).to.be.equal("There is already an account associated with that email");
        });
        it("new user has not been created", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const [dbData] = yield db_1.default.promise().execute(`
			SELECT * FROM Users WHERE user_name= 'newUser3'
			`);
                (0, chai_1.expect)(dbData).to.be.eql([]);
            });
        });
    });
});
