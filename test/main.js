(function() {
  var StatsGen, async, auth, config, should, _;

  should = require("should");

  async = require("async");

  _ = require("lodash")._;

  StatsGen = require("../lib/").StatsGenerator;

  auth = null;

  config = {};

  describe("=== MAIN TESTS === ", function() {
    describe("- Init -", function() {
      it("create auth app. UserStore with missing method.", function(done) {
        var _err;
        try {
          new TCSAuth(DummyUserStores.missingmethod, config);
          throw "Should fail";
        } catch (_error) {
          _err = _error;
          should.exist(_err);
          should.exist(_err.name);
          _err.name.should.equal("EUSTOREMISSINGMETHOD");
          done();
        }
      });
      it("create auth app. UserStore with method not a function.", function(done) {
        var _err;
        try {
          new TCSAuth(DummyUserStores.notfunction, config);
          throw "Should fail";
        } catch (_error) {
          _err = _error;
          should.exist(_err);
          should.exist(_err.name);
          _err.name.should.equal("EUSTOREMISSINGMETHOD");
          done();
        }
      });
      return it("create auth app", function(done) {
        auth = new TCSAuth(DummyUserStores.main, config);
        auth.should.be.an.instanceOf(TCSAuth);
        done();
      });
    });
  });

}).call(this);
