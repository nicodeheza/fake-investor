import chai, {expect} from "chai";
import chaiHttp from "chai-http";
import app from "../../../index";

chai.use(chaiHttp);

describe("/user/login route", function () {
	describe("login with valid user and password", function () {
		let res: ChaiHttp.Response, err: any;
		before(function (done) {
			chai
				.request(app)
				.post("/api/user/login")
				.set("Content-Type", "application/json")
				.send({
					email: "testUser@test.com",
					password: "test"
				})
				.end(function (e, r) {
					res = r;
					err = e;
					done();
				});
		});
		it("status must be 200", function () {
			expect(res).to.have.status(200);
		});
		it("userName must be returned", function () {
			expect(res.body.userName).to.be.equal("testUser");
		});
	});
	describe("login with invalid password", function () {
		let res: ChaiHttp.Response, err: any;
		before(function (done) {
			chai
				.request(app)
				.post("/api/user/login")
				.set("Content-Type", "application/json")
				.send({
					email: "testUser@test.com",
					password: "badPassword"
				})
				.end(function (e, r) {
					res = r;
					err = e;
					done();
				});
		});
		it("status must be 401", function () {
			expect(res).to.have.status(401);
		});
		it("must response an empty object", function () {
			expect(res.body).to.be.eql({});
		});
	});
	describe("login with invalid user", function () {
		let res: ChaiHttp.Response, err: any;
		before(function (done) {
			chai
				.request(app)
				.post("/api/user/login")
				.set("Content-Type", "application/json")
				.send({
					email: "badUser@test.com",
					password: "test"
				})
				.end(function (e, r) {
					res = r;
					err = e;
					done();
				});
		});
		it("status must be 401", function () {
			expect(res).to.have.status(401);
		});
		it("must response an empty object", function () {
			expect(res.body).to.be.eql({});
		});
	});
});
