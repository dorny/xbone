/**
	@module XBone
*/


/// <amd-dependency path="./deps/lodash"/>
declare var require
var lodash = require('./lodash')


import ajax = require('./ajax')
import dom = require('./dom')
import events = require('./events')
import promise = require('./promise')



export var _ = lodash
export var ajax = ajax
export var dom = dom
export var Promise = promise
export var Events = events


