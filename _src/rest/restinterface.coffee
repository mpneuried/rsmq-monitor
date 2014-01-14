StatsManager = require( "../" ).StatsManager

module.exports = class RestInterface extends require( "./basic" )

	createRoutes: ( basepath, express )=>
		@basepath = basepath

		express.get "#{basepath}list", @list
		express.get "#{basepath}graph/:qname", @graph
		return

	list: ( req, res )=>
		StatsManager.list ( err, stats )=>
			if err
				@_error( err )
				return
			res.json( stats )
			return
		return

	graph: ( req, res )=>

		_qname = req.params.qname
		_start = req.query.start
		_end = req.query.end

		_q = StatsManager.get( _qname )

		if not _q?
			@_error( "not-found" )
			return

		_q.graph _start, _end, ( err, graph )=>
			if err
				@_error( err )
				return
			res.json( graph )
			return
		return
