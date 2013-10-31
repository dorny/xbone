/**
	@module XBone
*/


/// <amd-dependency path="./deps/lodash"/>
declare var require
var lodash = require('./lodash')
import promise = require('./promise')

import ajax = require('./ajax')
import events = require('./events')



export var _ = lodash
export var Ajax = ajax
export var Promise = promise

export var Events = events


