import chai, {expect} from "chai";
import chaiHttp from "chai-http";
import app from "../../../index";

chai.use(chaiHttp);

describe("/user/logout", function () {
	describe("try to logout loged", function () {
		let res: ChaiHttp.Response, err: any;
		before(function (done) {
			const agent = chai.request.agent(app);
			agent
				.post("/api/user/login")
				.set("Content-Type", "application/json")
				.send({
					email: "testUser@test.com",
					password: "test"
				})
				.end(function () {
					agent.get("/api/user/logout").end(function (e, r) {
						res = r;
						err = e;
						agent.close();
						done();
					});
				});
		});
		it("status must be 200", function () {
			expect(res).to.have.status(200);
		});
		it("must response empty user name", function () {
			expect(res.body.userName).to.be.equal("");
		});
	});
	describe("try to logout unloged", function () {
		let res: ChaiHttp.Response, err: any;
		before(function (done) {
			chai
				.request(app)
				.get("/api/user/logout")
				.end(function (e, r) {
					res = r;
					err = e;
					done();
				});
		});
		it("status must be 401", function () {
			console.log("body: ", res.body);
			expect(res).to.have.status(401);
		});
		it("must response empty user name", function () {
			expect(res.body.userName).to.be.equal("");
		});
	});
});
