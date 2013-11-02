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
		Model attributes
		@attribute attrs
	*/
	public attrs;


	/**
		During change event it's hash map with changed attributes keys.

		@attribute _changed
		@type {Object}
		@private
	*/
	private _changed: {[key: string]: boolean};


	/**
		@constructor
		@param [attattributesr={}] initial model attributes
		@param [options] {Any} options will be passed to init() method
	*/
	constructor(attributes = {}, options?)
	{
		super()
		this.attrs = attributes
		this.init(options)
	}


	/**
		Model initialization method.

		@method init
		@protected
		@param options {Any}
	*/
	public init(options)
	{

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
		If new value is not equeal to current value and silent argument is not true, model will emit 'change' event.

		@method set
		@param key {String|Object}
		@param value {Any}
		@param [silent] {Boolean}
	*/
	public set(key, value, silent?)
	{
		if ( this._set(key,value) && !silent) {
			var changed = {key: true}
			this.afterChange(changed)
			this.emitChange(changed)
		}
	}


	/**
		Set or replace model attributes.
		If {replace} is true, all atributes will be marked as changed and attrs attribute of model will be replaced with new value.

		@method setAttrs
		@param attrs {Object}
		@param [replace] {Boolean}
		@param [silent] {Boolean}
	*/
	public setAttrs(attrs, replace?, silent?)
	{
		var changed = {}
		  , emit = false

		if (replace) {
			emit = true

			if (this.attrs)
				for(var key in this.attrs)
					changed[key] = true

			if (attrs)
				for(var key in attrs)
					changed[key] = true

			this.attrs = attrs
		} else {
			for (var key in attrs)
				if (this._set(key,attrs[key])) {
					changed[key] = true
					emit = true
				}
		}

		if (emit && !silent) {
			this.afterChange(changed)
			this.emitChange(changed)
		}
	}


	/**
		Model internal method used to set attribute.

		@method _set
		@protected
		@param key {String}
		@param value
		@return {Boolean} is attribute changed
	*/
	public _set(key: string, value)
	{
		if (key[0]=='@') {
			key = key.substr(1)
			if (this[key] != value) {
			 	this[key] = value
			 	return true
			}
		}
		else {
			if (this.attrs[key] != value) {
				this.attrs[key] = value
				return true
			}
		}
	}


	/**
		Returns {true} if model has given attribute.

		@method has
		@param key {String}
		@return {Boolean}
	*/
	public has(key: string)
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
		Emit change event with changed parameter.
		This method is automatically called after set() or setAttrs().

		@method emitChange
		@param changed {Object}
	*/
	public emitChange(changed: {[key: string]: boolean})
	{
		this._changed = changed
		this.emit('change', changed, this)
		this._changed = null
	}

	/**
		Return {true} if attribute is changed

		@method isChanged
		@param key {String}
	*/
	public isChanged(key: string)
	{
		return this._changed[key]
	}



	/**
		It's called after some model attributes changed but before change event itself.
		Can be used to manipulate {changed} hash, evalute computed properties and cache results or whatever you wont.
		By default do nothing.

		@method afterChange
		@protected
		@param changed {Object}
	*/
	public afterChange(changed)
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
}
