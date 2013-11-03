/**
	@module XBone
	@submodule Collection
*/

/// <amd-dependency path="./deps/lodash"/>
declare var require;
var _ = require('./lodash')

import Events = require('./events')
import Model = require('./model')


/**
	@class Collection
	@extends Model
*/
class Collection<T extends Model> extends Events
{
	/**
		Items of collection

		@attribute models
		@type {Models[]}
	*/
	public models: T[] = [];


	/**
		Hash of items of collection

		@attribute _models
		@protected
	*/
	public _models: {[key: string]: T} = {};


	/**
		"callback" parameter for _.sortBy(), defines sort order of items in collection
		http://lodash.com/docs#sortBy

		@attribute
	*/
	public comparator;


	/**
		What to do when model emits change.
		By default it emits change event on collection with "model" and "collection" as parameters.

		@attribute onModelChanged
		@type {Function}

	*/
	public onModelChanged = (model)=> { this.emit('change', model, this) }


	/**
		Returns model with given id

		@method get
		@param id {String}
	*/
	public get(id: string) : T
	{
		return this._models[id]
	}


	public at(index: number) : T
	{
		return this.models[index]
	}


	/**
		Returns deep clone of collection models attributes

		@method data
		@return {Object}
	*/
	public data()
	{
		var data = []
		this.models.forEach((model)=> { data.push(model.data()) })
		return data
	}


	/**
		Add model to collection.
		Emits "add" event with "model", "position", "collection" as arguments

		@method add
		@param model {Model}
	*/
	public add(model: T)
	{
		var id = model.id()
		  , pos

		if (this._models[id])
			throw new Error('Model with same id() in already in Collection')


		if (this.comparator) {
			pos = _.sortedIndex(this.models, this.comparator, model)
			this.models.splice(pos,0,model)
		} else {
			pos = this.models.length
			this.models.push(model)
		}

		this._models[id] = model

		this.processNewItem(model)
		this.emit('add', model, pos, this)
	}


	/**
		Shortcut for {removeById(model.id())}

		@method remove
		@param model {Model}
	*/
	public remove(model: T)
	{
		return this.removeById(model.id())
	}


	/**
		Remove model with given id from collection.
		Emits "remove" event with "model", "position", "collection" as arguments

		@method removeById
		@param id {String}
	*/
	public removeById(id: string)
	{
		var model = this._models[id]
		if (model) {
			delete this._models[id]
			var pos = this.models.indexOf(model)
			this.models.splice(pos,1)

			this.processRemovedItem(model)
			this.emit('remove', model, pos, this)
		}
		else
			throw new Error('Model not found')
	}


	/**
		Resets collection.
		Emits "reset" event witch "models", "collection" as arguments

		@method reset
		@param models {Model[]}
	*/
	public reset(models: T[])
	{
		var oldModels = this.models

		this._models = {}
		for(var i=0; i<models.length; i++)
			this._models[models[i].id()] = models[i]

		this.models = this.comparator ? _.sortBy(models, this.comparator) : models

		oldModels.forEach(this.processRemovedItem, this)
		this.models.forEach(this.processNewItem, this)
		this.emit('reset', models, this)
	}


	/**
		The set method performs a "smart" update of the collection with the passed list of models.

		 * If a model in the list isn't yet in the collection it will be added;
		 * if the model is already in the collection its attributes will be replaced via setAttrs
		 * If the collection contains any models that aren't present in the list, they'll be removed.

		All of the appropriate "add", "remove", and "change" events are fired as this happens.

		@method update
		@param models {Model[]}
	*/
	public setModels(models: T[])
	{
		var newHash = _.indexBy(models, (it)=> it.id())
		  , oldHash = this._models

		for(var key in newHash)
			if (!(key in oldHash))
				this.removeById(key)

		models.forEach((model)=> {
			var current = this._models[model.id()]
			if (current) {
				current.setAttrs(model.attrs)
				current.emitChange()
			}
			else
				this.add(model)
		})
	}


	/**
		@method sort
	*/
	public sort()
	{
		if (this.comparator)
			this.models = _.sortBy(this.models, this.comparator)
		else
			this.models.sort()

		this.emit('sort', this)
	}


	/**
		Alows custom processing of new items in collection.
		By default adds "change" listener which emits "change" event of collection

		@method processNewItem
		@param model {Model}
	*/
	public processNewItem(model: T)
	{
		model.onChange(this.onModelChanged)
	}


	/**
		Alows custom processing of removed items from collection.
		By default removes "change" listener.

		@method processRemovedItem
		@param model {Model}
	*/
	public processRemovedItem(model: T)
	{
		model.off('change', this.onModelChanged)
	}


	// Lodash methods
	// ---------------------------------------------------------


	/**
		Shortcut for _.find(collection.models, ...args).
		http://lodash.com/docs#find

		@method find

	*/
	public find(callback?, thisArg?) { return _.find(this.models, callback, thisArg) }

	/**
		@method groupBy
		Shortcut for _.groupBy(collection.models, ...args).
		http://lodash.com/docs#groupBy
	*/
	public groupBy(callback?, thisArg?) { return _.groupBy(this.models, callback, thisArg) }

	/**
		@method indexBy
		Shortcut for _.indexBy(collection.models, ...args).
		http://lodash.com/docs#indexBy
	*/
	public indexBy(callback?, thisArg?) { return _.indexBy(this.models, callback, thisArg) }


	/**
		@method max
		Shortcut for _.max(collection.models, ...args).
		http://lodash.com/docs#max
	*/
	public max(callback?, thisArg?) { return _.max(this.models, callback, thisArg) }

	/**
		@method min
		Shortcut for _.min(collection.models, ...args).
		http://lodash.com/docs#min
	*/
	public min(callback?, thisArg?) { return _.min(this.models, callback, thisArg) }

	/**
		@method sortBy
		Shortcut for _.sortBy(collection.models, ...args).
		http://lodash.com/docs#sortBy
	*/
	public sortBy(callback?, thisArg?) { return _.sortBy(this.models, callback, thisArg) }

	/**
		@method where
		Shortcut for _.where(collection.models, ...args).
		http://lodash.com/docs#where
	*/
	public where(callback?, thisArg?) { return _.where(this.models, callback, thisArg) }
}
