import chai, {expect} from "chai";
import chaiHttp from "chai-http";
import app from "../../../index";
import sinon, {SinonStub} from "sinon";
import sinonChai from "sinon-chai";
import * as node_fetch from "node-fetch";

chai.use(chaiHttp);
chai.use(sinonChai);

describe("/search/:query route", function () {
	let res: ChaiHttp.Response, fetchStub: SinonStub;
	before(function (done) {
		fetchStub = sinon.stub(node_fetch, "default");
		fetchStub.callsFake(() =>
			Promise.resolve({json: () => Promise.resolve({test: "test"})})
		);

		chai
			.request(app)
			.get("/api/stock/search/IBM")
			.end((e, r) => {
				res = r;
				done();
			});
	});
	after(function () {
		fetchStub.restore();
	});
	it("status must be 200", function () {
		expect(res).to.have.status(200);
	});
	it("must return fetched data from yfApi", function () {
		expect(res.body).to.be.eql({test: "test"});
	});
});
