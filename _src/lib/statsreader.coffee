Config = require( "../" ).Config
moment = require( "moment" )
queueConnectors = require( "../" ).queueConnectors

module.exports = class StatsReader extends require( "../" ).Basic
	defaults: =>
		return @extend true, {}, super,
			# **countsampleintervall** *Number* Intervall in minutes to ask rsmq for current stats.
			countsampleintervall: 1
			savestats: true
			qname: "monitortest"

	_logname: =>
		return @constructor.name + ":" + ( @qname or "-" )

	constructor: ->
		super
		@getter "qname", ->
			return @config.qname

		@rsmqConf = Config.get( "rsmq" )

		@rsmq = queueConnectors.get( @qname )

		@start = @_waitUntil( @_start, "ready", @rsmq )
		@current = @_waitUntil( @_current, "ready", @rsmq )
		@graph = @_waitUntil( @_graph, "ready", @rsmq )

		@on( "stats:done", @nextStatsRead )

		@redisConnect()
		@start()
		return

	_start: =>

		@debug "start"
		@startTime = Date.now()

		@nextStatsRead()
		return

	nextStatsRead: =>
		if not @config.savestats
			return
		_diff = moment( @lastGetTime or  moment().startOf( "minute" ) ).add( "m", @config.countsampleintervall ).startOf( "minute" ).diff(moment())
		@debug "next stats in #{_diff/1000}s"
		@timer = setTimeout( @_getQueueStats, _diff )
		return

	_current: ( cb )=>
		@debug "_current"
		@rsmq.getQueueAttributes { qname: @qname }, ( err, stats )=>
			if err
				cb( err )
				return
			stats.qname = @qname
			cb( null, stats )
			return
		return

	_graph: ( start = moment().add( "d", -7 ).unix(), end = moment().unix(), cb )=>
		@debug "_graph"
		
		@redis.zrangebyscore "#{@rsmqConf.namespace}:#{@qname}:STATS", start, end, "WITHSCORES", ( err, stats )=>
			@debug "_graph return", err, stats
			if err
				cb( err )
				return

			_aStats = for stat, idx in stats by 2
				[ count, ts ] = stat.split(":")
				ts: parseInt( stats[ idx + 1 ], 10 )
				msgs: parseInt( count, 10 )

			cb( null, _aStats )
			return
		return

	_getQueueStats: =>
		clearTimeout( @timer )
		@lastGetTime = _t = moment().startOf( "minute" )
		@current ( err, stats )=>
			if err
				@error( err )
			@debug( "got stats", stats )

			@_writeMessageCount( _t.unix(), stats.msgs )
			
			return
		return

	_writeMessageCount: ( time, msgcount )=>
		try
			_key = msgcount + ":" + time
			@debug "write stats", time, msgcount, "#{@rsmqConf.namespace}:#{@qname}:STATS"
			@redis.zadd "#{@rsmqConf.namespace}:#{@qname}:STATS", time, _key, ( err, result )=>
				if err
					@error( err )
				else
					@info "stats save: #{msgcount} at #{new Date( time * 1000 )}"
				@emit( "stats:done" )
				return
		catch _err
			@emit( "stats:done" )
			@error _err
		return
