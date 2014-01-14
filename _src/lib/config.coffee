DEFAULT = 
	rsmq: 
		# redis settings
		host: "localhost"
		port: 6379
		options: {}
		client: null
		# rsmq settings
		namespace: "rsmq"

	# stats settings
	# stats generator settings 
	statsreader:
		# **countsampleintervall** *Number* Intervall in minutes to ask rsmq for current stats.
		countsampleintervall: 1

		savestats: true

	server: 
		port: 8401
		host: "localhost"
		listenHost: null
		basepath: "/"
		title: "RSMQ Monitor"

	express:
		logger: "dev"
		tmpFolder: null
		staticCacheTime: 1000 * 60 * 60 * 24 * 31

# The config module
extend = require( "extend" )

class Config
	constructor: ( @severity = "info" )->
		return

	init: ( input )=>
		@config = extend( true, {}, DEFAULT, input )
		@_inited = true
		return

	all: ( logging = false )=>
		if not @_inited
			@init( {} )

		_all = for _k, _v in @config
			@get( _k, logging )
		return _all

	get: ( name, logging = false )=>
		if not @_inited
			@init( {} )

		_cnf = @config?[ name ] or null
		if logging

			logging = 
				logging:
					severity: process.env[ "severity_#{name}"] or @severity
					severitys: "fatal,error,warning,info,debug".split( "," )
			return extend( true, {}, logging, _cnf )
		else
			return _cnf

module.exports = new Config( process.env.severity )