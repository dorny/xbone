/**
	@module XBone
*/


/// <amd-dependency path="./deps/lodash"/>
declare var require
var lodash = require('./lodash')


import ajax = require('./ajax')
import dom = require('./dom')
import events = require('./events')
import model = require('./model')
import promise = require('./promise')



export var _ = lodash
export var ajax = ajax
export var dom = dom
export var Events = events
export var Model = model
export var Promise = promise


