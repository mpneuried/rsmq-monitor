redis = require("redis")
express = require('express')
http = require( "http" )
path = require( "path" )

Config = require( "./" ).Config

_ = require('lodash')._

module.exports = class Server extends require( "./" ).Basic

	defaults: =>
		@extend super,
			port: 8400,
			host: "localhost"
			listenHost: null
			basepath: "/"
			title: "RSMQ Monitor"


	constructor: ( options )->
		super( null, options )
		@express = express()
		
		@on "configured", @load
		@on "loaded", @start

		@rest = {}

		@configure()

		return

	configure: =>
		@debug "configue express"
		expressConf = Config.get( "express" )

		@express.set( "title", @config.title )
		@express.use( @allowCrossDomain )
		@express.use( express.cookieParser(  ) )
		@express.use( express.logger( expressConf.logger ) )
		@express.use( express.compress() )
		@express.use( express.bodyParser( uploadDir: expressConf.tmpFolder ) )
		
		#@express.use( express.directory( path.resolve( "./static/" ) ) )
		#console.log path.resolve( __dirname + "/../static/" )
		@express.use( express.static( path.resolve( __dirname, "../static" ), maxAge: expressConf.staticCacheTime ) )

		@express.set('views', path.resolve( __dirname, '../views' ))
		@express.set('view engine', 'jade')

		###
		i18n = require('i18next')
		i18n.init
			fallbackLng: "de"
			resGetPath: 'static/i18n/__lng__/__ns__.json'

		i18n.registerAppHelper(@express)
		###
		@emit "configured"
		return

	load: =>
		# load rest modules
		@rest.gui = new ( require( "./rest/restinterface" ) )( @, "gui" )
	
		@rest.gui.createRoutes( @config.basepath, @express )

		# init 404 route
		@express.use @send404

		@emit "loaded"

		return

	start: =>
		# we instantiate the app using express 2.x style in order to use socket.io
		server = http.createServer( @express )
		server.listen( @config.port, @config.listenHost )
	
		@info "http listen to port #{@config.listenHost}:#{ @config.port }"
		return

	allowCrossDomain: ( req, res, next ) =>
		res.header "Access-Control-Allow-Origin", "*"
		res.header "Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS"
		res.header "Access-Control-Allow-Headers", "Content-Type, Authorization, Content-Length, X-Requested-With"
		
		# intercept OPTIONS method
		if "OPTIONS" is req.method
			res.send 200
		else
			next()

	send404: ( req, res )=>

		if req.url is "/"
			@rest.gui.redirBase( req, res )
		else
			res.status( 404 )
			res.send( "Page not found!" )

		return