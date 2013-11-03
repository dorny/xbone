/**
	@module XBone
	@submodule Model
*/

/// <amd-dependency path="./deps/lodash"/>
declare var require;
var _ = require('./lodash')

import Events = require('./events')



export = Model


/**
	@class Model
	@extends Events
*/
class Model extends Events {

	/**
		On model attributes change
		@event change
		@param this {Model}
	*/



	/**
		Model attributes
		@attribute attrs
	*/
	public attrs;


	// for access to static properties in child class
	public constructor;


	/**
		@attribute defaults
		@static
	*/
	static defaults;


	/**
		During change event it's hash map with changed attributes keys.

		@attribute _changed
		@type {Object}
		@private
	*/
	private _changed: {[key: string]: boolean};
	private _changeEventScheduled;


	/**
		@constructor
		@param [attattributesr={}] initial model attributes
	*/
	constructor(attributes = {})
	{
		super()
		var defaults = this.constructor.defaults
		this.attrs = defaults ? _.merge(attributes, defaults) : attributes
	}


	/**
		Returns deep clone of model attributes.

		@method data
		@return {Object}
	*/
	public data()
	{
		return _.cloneDeep(this.attrs)
	}


	/**
		Shoul return unique id for current model.
		By default return 'id' attribute.
		Override in child classes if you need another id attribute or automatic temporary id.

		@method id
		@return {String}
	*/
	public id()
	{
		return this.attrs.id
	}


	/**
		Get the current value of an attribute from the model.
		If key match beings with '@' it's treated as computed property and this[<restOfKey>] will be returned

		@method get
		@param key {String}
	*/
	public get(key: string)
	{
		return key[0]=='@' ? this[key.substr(1)] : this.attrs[key]
	}


	/**
		Set current value of an model attribute.
		If {replace} is "true" or new value is not (deep) equeal to current value, model will schedule emit 'change' event.

		@method set
		@param key {String|Object}
		@param value {Any}
		@param replace {Boolean} skip deep equality check
	*/
	public set(key: string, value, replace?: boolean)
	{
		var isComputed = key[0]=='@'
		  , oldValue = isComputed ? this[key.substr(1)] : this.attrs[key]

		if ( replace || (! _.isEqueal(oldValue,value)) ) {
			this._changed[key] = true
			if (isComputed)
				this[key.substr(1)] = value
			else
				this.attrs[key] = value

			this.scheduleEmitChange()
		}
	}


	/**
		Update model attributes with new values.
		Calls {model.set(...)} for each attrs enumerable property.

		@method update
		@param attrs {Object}
		@param replace {Booelan} skip deep equality check
	*/
	public update(attrs: {[key: string]:any}, replace?: boolean)
	{
		for(var key in attrs)
			this.set(key, attrs[key], replace)
	}


	/**
		Smart "update" model attributes with new values and remove those not present in given {attrs} object.

		@method setAttrs
		@param attrs {Object}
		@param [replace] {Boolean} skip deep equality check
	*/
	public setAttrs(attrs)
	{
		var oldAttrs = this.attrs
		for(var key in oldAttrs) {
			if (!(key in attrs)) {
				this._changed[key] = true
				delete oldAttrs[key]
				this.scheduleEmitChange()
			}
		}

		this.update(attrs)
	}



	/**
		Reset model attributes.

		@method reset
		@param attrs {Object}
	*/
	public reset(attrs)
	{
		if (this.attrs)
			for(var key in this.attrs)
				this._changed[key] = true

		if (attrs)
			for(var key in attrs)
				this._changed[key] = true

		this.attrs = attrs
		this.scheduleEmitChange()
	}



	/**
		Returns {true} if model has given attribute.

		@method has
		@param key {String}
		@return {Boolean}
	*/
	public has(key: string) : boolean
	{
		return (key in this.attrs)
	}



	/**
		Register callback to change event.
		WatchAttributes parameter can be used to run callback only when some of specified attribute is changed.
		If {watchAttributes} parameter is provided, callback will be called with new values of given attributes as arguments.
		Last arguemnt of callback will always be model itself.

		@method onChange
		@param callback {Function}
		@param [watchAttributes] {String[]}
		@return {Function} - Function used on Events.on(...) - can be used in model.off('change', <returned Function>)
	*/
	public onChange(callback, watchAttributes?:string[])
	{
		if (watchAttributes) {
			var clb = ()=> {
				if (watchAttributes.some((it)=> this.isChanged(it))) {
					var args = watchAttributes.map((it)=> this.get(it))
					args.push(this)
					callback.apply(undefined, args)
				}
			}

			this.on('change', clb)
			return clb
		}
		else {
			this.on('change', callback)
			return callback
		}
	}


	/**
		Emit change event imediately and clear schedule.
		This method is automatically called after model attributes changes
		and execution context stack contains only platform code (setTimeout(...,0)).

		@method emitChange
	*/
	public emitChange()
	{
		if (!this.isChanged())
			return;

		clearTimeout(this._changeEventScheduled)
		this._changeEventScheduled = false
		this.beforeEmitChange(this._changed)
		this.emit('change', this)
		this._changed = {}
	}


	public scheduleEmitChange()
	{
		if (this._changeEventScheduled)
			return

		this._changeEventScheduled = setTimeout(()=> {
			this._changeEventScheduled = false
			this.emitChange()
		},0)

	}


	/**
		Returns {true} if model attribute or model itself is changed.

		@method isChanged
		@param [key] {String}
	*/
	public isChanged(key?: string) : boolean
	{
		return key ? this._changed[key] : (this._changeEventScheduled ? true : false)
	}



	/**
		It's called after some model attributes changed but before change event itself.
		Can be used to manipulate {changed} hash, evalute computed properties and cache results or whatever you wont.
		By default do nothing.

		@method beforeEmitChange
		@protected
		@param changed {Object}
	*/
	public beforeEmitChange(changed)
	{
		// Override me
	}


	/**
		Use this for model cleanup code.
		By default it will delete current attributes and turns off Events.

		@method free
	*/
	public free()
	{
		delete this.attrs
		this.off()
	}


	/**
		You can use this method to create getters and setters for given attributes without manualy write them.
		@param attributes {String[]}
		@param destClass
	*/
	static bindAttrs(attributes: string[], destClass)
	{
		attributes.forEach((name)=> {
			Object.defineProperty(destClass.prototype, name,{
				get: function() { return this.get(name) },
				set: function(value) { return this.set(name,value) }
			})
		})
	}


	static flatten(attributes)
	{
		return _flatten(attributes, '', {})
	}
}



function _flatten(attrs, prefix, acc)
{
	var val

	for(var key in attrs) {
		val = attrs[key]
		if (val && (typeof val==='object')) {
			_flatten(val, (prefix+key+'.'), acc)
		}
		else
			acc[prefix+key] = val
	}

	return acc
}
