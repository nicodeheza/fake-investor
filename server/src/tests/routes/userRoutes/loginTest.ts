import chai, {expect} from "chai";
import chaiHttp from "chai-http";
import app from "../../../index";

chai.use(chaiHttp);

describe("/user/login route", function () {
	describe("login with valid user and password", function () {
		it("status must be 200", function () {});
		it("userName must be returned", function () {});
	});
	describe("login with invalid user and password", function () {});
});
