/**
	@module XBone
	@submodule Events
*/

export = Events



/**
	@class Events
*/
class Events
{
	/**
		@attribute _events
		@protected
	*/
	_events;



	/**
		@method on
		@param events {String}
		@param callback {Function}
	*/
	public on(events: string, callback)
	{
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
	*/
	public once(events: string, callback)
	{

		var call_once = () => {
			this.off(events, call_once)
			callback.call(undefined,arguments)
		}

		return this.on(events, call_once)
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
			delete this._events
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
			var i = -1, l = list.length, a1 = args[0], a2 = args[1], a3 = args[2]
			switch (args.length) {
				case 0: while (++i < l) list[i].call(undefined); return;
				case 1: while (++i < l) list[i].call(undefined, a1); return;
				case 2: while (++i < l) list[i].call(undefined, a1, a2); return;
				case 3: while (++i < l) list[i].call(undefined, a1, a2, a3); return;
				default: while (++i < l) list[i].apply(undefined, args);
			}
		})

		return this
	}



	/**
		@method extend
		@static
		@param dest {Object}
	*/
	static extend(dest) {
		var proto = Events.prototype;
		['on','once','off','emit'].forEach( (fn)=> { dest.prototype[fn] = proto[fn] })
	}
}
