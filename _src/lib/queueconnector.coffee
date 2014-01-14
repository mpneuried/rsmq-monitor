Config = require( "../" ).Config
utils = require( "../" ).utils


RedisMQ = require("rsmq")

module.exports = new ( class QueuesConectors extends require( "../" ).Basic
	constructor: ->
		@queues = {}
		return

	list: =>
		return Object.keys( @queues )

	get: ( name )=>
		if not @has( name )
			@queues[ name ] = new QueueConnector( qname: name )

		return @queues[ name ]

	has: ( name )=>
		return @queues[ name ]?
)()

class QueueConnector extends require( "../" ).Basic
	defaults: =>
		return @extend true, {}, super,
			qname: Config.get( "queuename" ) or "monitortest"

	rsmqMirrorMethods: [ "changeMessageVisibility", "createQueue", "deleteMessage", "deleteQueue", "getQueueAttributes", "receiveMessage", "sendMessage" ]

	constructor: ->
		super
		@getter "qname", ->
			return @config.qname
		@rsmqConf = Config.get( "rsmq" )
		@ready = false

		@getQueue = @_waitUntil( @_getQueue, "connect" )

		for method in @rsmqMirrorMethods
			@_mirrorRsmq( method )

		@redisConnect()
		@getQueue()
		return

	_logname: =>
		return @constructor.name + ":" + ( @qname or "-" )

	_mirrorRsmq: ( method )=>
		@[ method ] = @_waitUntil ( opt, cb )=>
			@extend( opt, qname: @config.qname )
			@rsmq[ method ]( opt, cb )
			return

	_getQueue: =>
		@debug "getqueue"
		
		if not @rsmqConf.rsmq?
			@rsmq = new RedisMQ( client: @redis, ns: @rsmqConf.namespace )
			@rsmqConf.rsmq = @rsmq
		else
			@rsmq = @rsmqConf.rsmq


		@rsmq.createQueue qname: @config.qname, ( err, resp )=>
			if err?.name is "queueExists"
				@debug "queue allready existed"
				@ready = true
				@emit "ready"
				return
			
			if err
				@error( err )
				@ready = false
				return

			if resp is 1
				@debug "queue created"
			else
				@debug "queue allready existed"

			@ready = true
			@emit "ready"
			return

		return
