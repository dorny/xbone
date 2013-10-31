/**
	@module XBone
	@submodule Events
*/



import P = require('./promise')

/// <amd-dependency path="./deps/lodash"/>
declare var require;
var _ = require('./lodash')



export = Events

/*
// Interfaces
// -------------------------------------------
export interface IEvents
{
	_uid;
	_events;
	_listening;
	on(event: string, callback, thisArg?) : void;
	once(event: string, callback, thisArg?) : void;
	off(event?: string, callback?) : void;
	emit(event: string, ...args) : void;
	listenTo(source, event: string, callback, thisArg?) : void;
	stopListening(source, events?: string[]) : void;
}
*/


/**
	@class Events
*/
class Events
{
	/**
		@attribute _uid
		@protected
	*/
	_uid;

	/**
		@attribute _events
		@protected
	*/
	_events;

	/**
		@attribute _listening
		@protected
	*/
	_listening;



	/**
		@method on
		@param events {String}
		@param callback {Function}
		@param [thisArg]
	*/
	public on(events: string, callback, thisArg?)
	{
		if (thisArg)
			callback = _.bind(callback,thisArg)

		this._events || (this._events = {})

		events.split(' ').forEach( (evt)=>{
			this._events[evt] || (this._events[evt] = [])
			this._events[evt].push(callback)
		})

		return this
	}


	/**
		@method once
		@param events {String}
		@param callback {Function}
		@param [thisArg]
	*/
	public once(events: string, callback, thisArg?)
	{

		var call_once = () => {
			this.off(events, call_once)
			callback.apply(thisArg, arguments)
		}

		this.on(events, call_once)
		return this
	}


	/**
		@method off
		@param events {String}
		@param callback {Function}
	*/
	public off(events?: string, callback?)
	{
		if (!this._events)
			return

		if (arguments.length==0) {
			this.emit('__EVENTS_OFF__', this)
			this._events = {}
			return
		}

		if (callback) {
			events.split(' ').forEach( (evt)=>{
				var list = this._events[evt]
				if (!list) return
				var pos = list.indexOf(callback)
				if (pos != -1)
					this._events[evt].splice(pos,1)
			})
		}
		else {
			events.split(' ').forEach( (evt)=>{
				delete this._events[evt]
			})
		}

		return this
	}


	/**
		@method emit
		@param events {String}
		@param [args]* {Any}
	*/
	public emit(events: string, ...args)
	{
		if (!this._events)
			return

		events.split(' ').forEach( (evt)=>{
			var list = this._events[evt]
			if (!list) return
			for(var i=0; i<list.length; i++)
				list[i].apply(this, args)
		})

		return this
	}


	/**
		@method listenTo
		@param source {Events}
		@param events {String}
		@param callback {Function}
		@param [thisArg]
	*/
	public listenTo(source, events: string, callback, thisArg?)
	{
		if (thisArg)
			callback = _.bind(callback,thisArg)

		source.on(events, callback)

		var listening = this._listening || (this._listening = {})
		  , uid = source._uid || (source._uid = _.uniqueId('l'))

		var tuple
		if (listening[uid])
			tuple = listening[uid]
		else {
			var cleaner = source.on('__EVENTS_OFF__', ()=>{delete this._listening[uid]})
			tuple = listening[uid] = {source: source, events:{ '__EVENTS_OFF__':[cleaner] }}
		}

		events.split(' ').forEach( (evt)=>{
			var list = tuple.events[evt] || (tuple.events[evt]=[])
			list.push(callback)
		})

		return this
	}


	/**
		@method stopListening
		@param source {Events}
		@param events {String}
	*/
	public stopListening(source?, events?: string)
	{
		if (!this._listening)
			return

		if (arguments.length==0) {
			for(var uid in this._listening) {
				var tuple = this._listening[uid]
				for(var evt in tuple.events)
					tuple.events[evt].forEach( (callback)=>tuple.source.off(evt, callback))
			}
			return
		}

		var uid = source._uid
		if (!this._listening[uid])
			return

		var map = this._listening[uid].events
		if (events) {
			events.split(' ').forEach( (evt)=>{
				if (evt in map) {
					map[evt].forEach( (callback)=>source.off(evt, callback))
					delete map[evt]
				}
			})
		}
		else {
			for(var evt in map)
				map[evt].forEach( (callback)=>source.off(evt, callback))

			delete this._listening[uid]
		}

		return this
	}


	/**
		@method extend
		@static
		@param dest {Object}
	*/
	static extend(dest) {
		var proto = Events.prototype;
		['on','once','off','emit','listenTo','stopListening'].forEach( (fn)=> { dest.prototype[fn] = proto[fn] })
	}
}
