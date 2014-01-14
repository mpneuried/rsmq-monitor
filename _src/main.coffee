fs = require "fs"
path = require "path"
extend = require( "extend" )
fs.readFile path.resolve( __dirname + "/config.json" ), ( err, file )=>
	if err?.code is "ENOENT"
		_cnf = {}
	else if err
		throw err
		return
	else
		try 
			_cnf = JSON.parse( file )
		catch err
			err.message = "cannot parse config.json"
			throw err
			return

	_config = extend( true, {}, _cnf )

	new ( require "./server" )( _config )

	return