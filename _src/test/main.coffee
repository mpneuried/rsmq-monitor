should = require( "should" )
async = require( "async" )
_ = require( "lodash" )._

StatsGen = require( "../lib/" ).StatsGenerator

auth = null

config = {}

describe "=== MAIN TESTS === ", ->	
	describe "- Init -", ->
		it "create auth app. UserStore with missing method.", ( done )->
			try
				new TCSAuth( DummyUserStores.missingmethod, config )
				throw "Should fail"
			catch _err
				should.exist( _err )
				should.exist( _err.name )
				_err.name.should.equal( "EUSTOREMISSINGMETHOD" )
				done()
			return

		it "create auth app. UserStore with method not a function.", ( done )->
			try
				new TCSAuth( DummyUserStores.notfunction, config )
				throw "Should fail"
			catch _err
				should.exist( _err )
				should.exist( _err.name )
				_err.name.should.equal( "EUSTOREMISSINGMETHOD" )
				done()
			return

		it "create auth app", ( done )->
			auth = new TCSAuth( DummyUserStores.main, config )
			auth.should.be.an.instanceOf( TCSAuth )
			done()
			return
	return


