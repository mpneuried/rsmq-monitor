moment = require( "moment" )
_ = require( "lodash" )

module.exports = class TimeSeries
	
	constructor: ( @raw, _opt )->
		#console.log "TIMESERIES", moment( _.last( @raw ).ts * 1000 ).format( "HH:mm:ss" ), @raw.length
		@opt = _.extend( {}, timekey: "ts", countkey: "msgs", timeformat: "ms", _opt )
		return
	
	_calc: ( frame, steps, beginat )=>
		end = beginat.startOf( frame )
		start= beginat.clone().add( frame, 1 )
		step = moment(0).add( steps, 1 ).valueOf()
		ret = []
		
		_cursor = end.valueOf()
		_cursorEnd = start.valueOf()
		dataidx = 0

		_startCursor = _cursor
		
		_frame = 
			cnt: 0
			sum: 0 

		_saveidx = 0

		while _cursor < _cursorEnd and _saveidx < 20000
			#console.log _saveidx
			if @raw?[ dataidx ]?
				_dataTS =  @_toTimestamp( @raw?[ dataidx ]?[ @opt.timekey ] )
			else 
				_dataTS = +Infinity
			#console.log "     #{_saveidx}-INFO: cursor:", moment( _cursor ).format( "LL HH:mm:ss" ), " ts:",moment( _dataTS ).format( "LL HH:mm:ss" ), " dataidx:", dataidx, " count:", @raw?[ dataidx ]?[ @opt.countkey ], ":::", @raw?[ dataidx ]? and _dataTS <= _cursor
			if _dataTS < _startCursor
				#console.log "too old"
				dataidx++
			else if dataidx is 0 and _dataTS > _cursor
				#console.log "no old data"
				_data = {}
				_data[ @opt.timekey ] = @_returnTimestamp( _cursor )
				_data[ @opt.countkey ] = 0
				_data._date = moment( _cursor ).format( "LLLL" )
				ret.push _data
					
				_cursor += step
			else if _dataTS >= _cursor
				#console.log "next frame", _frame.cnt, _frame.sum
				
				if @raw?[ dataidx ]?
					_frame.cnt++
					_frame.sum += @raw?[ dataidx ]?[ @opt.countkey ]

				_data = {}
				_data[ @opt.timekey ] = @_returnTimestamp( _cursor )
				_data[ @opt.countkey ] = ( if _frame.cnt > 0 then Math.round( _frame.sum / _frame.cnt ) else 0 )
				_data._date = moment( _cursor ).format( "LLLL" )
				ret.push _data
					
				_cursor += step
				_frame = 
					cnt: 0
					sum: 0 
				dataidx++
				
			else if @raw?[ dataidx ]? and _dataTS <= _cursor
				#console.log "added", _frame.cnt, _frame.sum
				_frame.cnt++
				_frame.sum += @raw?[ dataidx ]?[ @opt.countkey ]
				dataidx++
			else
				#console.log "skip"
				_cursor += step
				

			_saveidx++

		#console.log  "RETURN"
		return ret
	
	_toDate: ( inp )=>
		if inp instanceof Date
			return inp
		else if moment.isMoment( inp )
			return inp._d
		else if _.isNumber( inp )
				switch @opt.timeformat
					when "ms" then return new Date( inp )
					when "s" then return new Date( inp * 1000 )
					else throw( "unkown timeformat" )
		else
			throw( "invalid Date" )
		return
 
	_toTimestamp: ( inp )=>
		if inp instanceof Date
			return inp.getTime()
		else if moment.isMoment( inp )
			return inp.valueOf()
		else if _.isNumber( inp )
			switch @opt.timeformat
				when "ms" then return inp
				when "s" then return inp * 1000
				else throw( "unkown timeformat" )
		else
			throw( "invalid Date" )
		return
	 
	_toMoment: ( inp )=>

		console.log "_toMoment", inp instanceof Date, moment.isMoment( inp ), _.isNumber( inp )
		if inp instanceof Date
			return moment( inp )
		else if moment.isMoment( inp )
			return inp
		else if _.isNumber( inp )
			switch @opt.timeformat
				when "ms" then return moment( inp )
				when "s" then return moment.unix( inp )
				else throw( "unkown timeformat" )
		else if _.isString( inp )
			if not isNaN( parseInt( inp, 10 ) )
				switch @opt.timeformat
					when "ms" then return moment( inp )
					when "s" then return moment.unix( inp )
					else throw( "unkown timeformat" )
			_m = moment( inp )
			if not _m.isValid()
				throw( "invalid Date" )
			return _m

		else
			throw( "invalid Date" )
		return
	
	_returnTimestamp: ( inp )=>
		switch @opt.timeformat
			when "ms" then return inp
			when "s" then return Math.round( inp / 1000 )
			else throw( "unkown timeformat" )
	
	month: ( start, end )=>
		_end = if end? then @_toMoment( end ) else moment()
		return @_calc( "M", "d", if start? then @_toMoment( start ) else moment(), _end. )
	
	week: ( start, end )=>
		_end = if end? then @_toMoment( end ) else moment()
		return @_calc( "w", "d", if start? then @_toMoment( start ) else moment(), _end. )
	
	day: ( start, end )=>
		_end = if end? then @_toMoment( end ) else moment()
		return @_calc( "d", "h", if start? then @_toMoment( start ) else moment(), _end. )
	
	hour: ( start, end )=>
		_end = if end? then @_toMoment( end ) else moment()
		return @_calc( "h", "m", if start? then @_toMoment( start ) else moment(), _end. )