StatsReader = require( "../" ).StatsReader
Config = require( "../" ).Config
async = require( "async" )

module.exports = new ( class StatsManager extends require( "../" ).Basic
	constructor: ->
		super
		@queues = {}
		@ready = false
		@rsmqConf = Config.get( "rsmq" )
		@refreshQueues = @_waitUntil( @_refreshQueues, "connect" )

		@redisConnect()	
		@refreshQueues()
		return

	_refreshQueues: ( cb )=>
		@redis.smembers "#{@rsmqConf.namespace}:QUEUES", ( err, queues )=>
			if err
				if cb?
					cb( err )
				else
					@error( err )
				return

			@debug "found queues", queues
			for queue in queues
				@add( queue )
			@ready = true
			@emit "ready"
			return
		return

	add: ( name, cb )=>
		@debug "add queue `#{name}`"
		if @queues[ name ]?
			@warning "tried to add an existing queue"
			_q = @queues[ name ]
		else
			_q = @queues[ name ] = new StatsReader( qname: name )

		if cb?
			if _q.ready
				cb( null, _q )
			else
				_q.once "ready", =>
					cb( _q )
			return
		else
			return _q

	get: ( name )=>
		return @queues[ name ]

	list: ( cb )=>
		_fns = []
		for queuename, queue of @queues
			do ( queue )=>
				_fns.push ( cba )=>
					queue.current( cba )
					return

		async.parallel _fns, ( err, stats )=>
			if err 
				cb( err )
				return
			cb( null, stats )
			return
		return
)()