utils = require( "../" ).utils
queueConnectors = require( "../" ).queueConnectors

module.exports = new ( class MessageCreator extends require( "../" ).Basic
	defaults: =>
		return @extend true, {}, super,
			interval: [ 10, 1000 ]
			qname: process.argv[ 2 ] or "monitortest"

	constructor: ->
		super
		@rsmq = queueConnectors.get( @config.qname )
		@start = @_waitUntil( @_start, "ready", @rsmq )
		@on( "message:send", @nextMessage )

		@start()
		return

	_start: =>
		@debug "start"

		@createMessage()

		return

	nextMessage: =>
		_t = utils.randRange( @config.interval )
		@debug "next messaage in #{_t/1000}s"
		@timer = setTimeout( @createMessage, _t )
		return

	createMessage: =>
		@debug "createMessage"
		clearTimeout( @timer )

		@rsmq.sendMessage { qname: @config.qname, message: JSON.stringify( "url": "http://127.0.0.1:5000", "random": utils.randomString( 5 ) ) }, ( err, msgid )=>
			@emit( "message:send" )
			if err?
				@error( err )
				return
			@info "message send", err, msgid
			return
		return

)()

process.on "uncaughtException", ( err )=>
	console.error( err )
	return