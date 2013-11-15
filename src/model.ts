/**
	@module XBone
	@submodule Model
*/

import _ = require('./lodash')
import Events = require('./events')



export = Model


/**
	@class Model
	@extends Events
*/
class Model extends Events {

	/**
		Emits when model attributes is changed.
		@event change
		@param this {Model}
	*/


	/**
		Emit when models id is changed.
		@event change:id
		@param oldId {String}
		@param newId {String}
		@param this {Model}
	*/



	/**
		Model attributes
		@attribute attrs
	*/
	public attrs;


	/**
		Model identifier - must be unique and must not change once model is in collection.
		It's automatically managed by Model class and uses "Model.idAttribute" property.
		When "idAttribute" is not present in model, client side unique identifier is generated instead.
		@attribute id
		@type {String}
	*/
	public id: string;


	// for access to static properties in child class
	public constructor;

	/**
		@attribute idAttribute
		@static
		@type {String}
		@default "id"
	*/
	static idAttribute = 'id';


	/**
		@attribute defaults
		@static
		@type {Object}
	*/
	static defaults;


	/**
		During change event it's hash map with changed attributes keys.

		@attribute _changed
		@type {Object}
		@private
	*/
	private _changed: {[key: string]: boolean} = {};
	private _isChanged: boolean;
	private _emitChangeTimer;


	/**
		@constructor
		@param [attattributesr={}] initial model attributes
	*/
	constructor(attributes = {})
	{
		super()
		var defaults = this.constructor.defaults
		this.attrs = defaults ? _.merge(attributes, defaults) : attributes
		this.id = this.get(this.constructor.idAttribute) || _.uniqueId('cid')
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

		if ( replace || (! _.isEqual(oldValue,value)) ) {
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
		Adapt "model" state.
		By default it will set attirbutes via setAttrs and update model.id
		@method setModel
		@param model {Model}
	*/
	public setModel(model: Model)
	{
		this.setAttrs(model.attrs)
		if (!this._changed[this.constructor.idAttribute] && this.id != model.id) {
			var old = this.id
			this.id = model.id
			this.emit('change:id', old, this.id, this)
		}
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
		if (this._changed[this.constructor.idAttribute]) {
			var old = this.id
			this.id = this.get('id')
			if (old != this.id)
				this.emit('change:id', old, this.id, this)
		}

		if (this._emitChangeTimer)
			clearTimeout(this._emitChangeTimer)

		this._emitChangeTimer = false
		this.beforeEmitChange(this._changed)
		this.emit('change', this)
		this._changed = {}
	}


	public scheduleEmitChange()
	{
		if (this._emitChangeTimer)
			return

		this._isChanged = true
		this._emitChangeTimer = setTimeout(()=> {
			this._isChanged = false
			this._emitChangeTimer = null
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
		return key ? this._changed[key] : this._isChanged
	}



	/**
		It's called after some model attributes changed but before change event itself.
		Can be used to manipulate {changed} hash, evalute computed properties and cache results or whatever you want.
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
