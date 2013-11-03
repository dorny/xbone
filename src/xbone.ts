/**
	@module XBone
*/

// Imports
// ------------------------------------

/// <amd-dependency path="./deps/lodash"/>
declare var require
var lodash = require('./lodash')

import ajax = require('./ajax')
import dom = require('./dom')
import promise = require('./promise')

import events = require('./events')
import model = require('./model')
import view = require('./view')
import collection = require('./collection')


// Exports
// ------------------------------------

export var _ = lodash
export var ajax = ajax
export var dom = dom
export var Promise = promise

export var Events = events
export var Model = model
export var View = view
export var Collection = collection
