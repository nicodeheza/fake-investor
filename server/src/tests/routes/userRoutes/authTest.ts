import chai, {expect} from "chai";
import chaiHttp from "chai-http";
import app from "../../../index";

chai.use(chaiHttp);
describe("/user/auth", function () {
	describe("called loged", function () {
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
					agent.get("/api/user/auth").end(function (e, r) {
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
		it("must return user name", function () {
			expect(res.body.userName).to.be.equal("testUser");
		});
	});
	describe("called unloged", function () {
		let res: ChaiHttp.Response, err: any;
		before(function (done) {
			chai
				.request(app)
				.get("/api/user/auth")
				.end(function (e, r) {
					res = r;
					err = e;
					done();
				});
		});
		it("status must be 200", function () {
			expect(res).to.have.status(200);
		});
		it("must return empty user name", function () {
			expect(res.body.userName).to.be.equal("");
		});
	});
});
