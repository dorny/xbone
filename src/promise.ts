/**
	@module XBone
	@submodule Promise
*/


export = Promise


var taskQueue = []

enum PromiseState {
	PENDING,
	RESOLVED,
	FULFILLED,
	REJECTED
}



/**
	@class Promise
*/
class Promise
{
	private value: any;
	private state: PromiseState = PromiseState.PENDING;
	private promises: Promise[] = [];

	private onFulfilled;
	private onRejected;



	/**
		If onerror callback is set, it will be called in case of:

		 * invalid arguemnts for onFulfilled or onRejected
		 * multiple call to resolve/reject on same promise
		 * rejection, where there are no consumer promises and onRejected callback is undefined (set it to NULL to mute this error).

		@property onerror
		@type {Function}
		@default (e)=> \{throw e\}
		@static
	*/
	static onerror = (e)=> {throw e};


	constructor( onFulfilled?: (any)=>any, onRejected?: (any)=>any)
	{
		if (typeof onFulfilled ==='function')
			this.onFulfilled = onFulfilled
		else
			if (onFulfilled && Promise.onerror)
				Promise.onerror(TypeError('onFulfilled must be function, null or undefined'))

		if (typeof onRejected ==='function' || onRejected===null)
			this.onRejected = onRejected
		else
			if (onRejected && Promise.onerror)
				Promise.onerror(new TypeError('onRejected must be function, null or undefined'))
	}



	/**
		Register handlers for this promise.

		@method then
		@param [onFulfilled] {Function} fulfillment handler
		@param [onRejected] {Function} rejection handler
		@return {Promise} new Promise
	*/
	public then( onFulfilled?: (any)=>any, onRejected?: (any)=>any)
	{
		var p = new Promise(onFulfilled, onRejected)
		p.resolve(this)
		return p
	}



	/**
		Register a rejection handler. Shortcut for .then(undefined, onRejected)

		@method catch
		@param onRejected {function}
		@return {Promise}
	*/
	public catch(onRejected)
	{
		return this.then(undefined, onRejected)
	}



	/**
		Ensures that onFulfilledOrRejected will be called regardless of whether
		this promise is fulfilled or rejected.  onFulfilledOrRejected WILL NOT
		receive the promises' value or reason.  Any returned value will be disregarded.
		onFulfilledOrRejected may throw or return a rejected promise to signal
		an additional error.

		@method finally
		@param onFulfilledOrRejected {function} handler to be called regardless of
		  fulfillment or rejection
		@returns {Promise}
	*/
	public finally(onFulfilledOrRejected)
	{
		var injectHandler = ()=> Promise.resolve(onFulfilledOrRejected()).yield(this)
		return this.then(injectHandler,injectHandler)
	}



	/**
		Shortcut for .then(function() { return value; })

		@method yield
		@param value {*}
		@return {Promise} a promise that:
		- is fulfilled if value is not a promise, or
		- if value is a promise, will fulfill with its value, or reject with its reason.
	*/
	public yield(value)
	{
		return this.then(()=> value)
	}



	/**
		Runs a side effect when this promise fulfills, without changing the fulfillment value.

		@method tap
		@desc
		@param onFulfilledSideEffect {function}
		@returns {Promise}
	*/
	public tap(onFulfilledSideEffect)
	{
		return this.then(onFulfilledSideEffect).yield(this)
	}



	/**
		Assumes that this promise will fulfill with an array, and arranges
		for the onFulfilled to be called with the array as its argument list
		i.e. onFulfilled.apply(undefined, array).

		@method spread
		@param onFulfilled {function} function to receive spread arguments
		@param [onRejected] {function}
		@return {Promise}
	*/
	public spread(onFulfilled, onRejected?)
	{
		return this
			.then((array)=> Promise.all(array))
			.then((array)=> onFulfilled.apply(undefined, array), onRejected)
	}



	/**
		Synchronous test if promise is in PENDING state.

		@method isPending
		@return {Boolean}
	*/
	public isPending()
	{
		return this.state === PromiseState.PENDING
	}



	/**
		Synchronous test if promise is in FULFILLED state.

		@method isFulfilled
		@return {Boolean}
	*/
	public isFulfilled()
	{
		return this.state === PromiseState.FULFILLED
	}



	/**
		Synchronous test if promise is in REJECTED state.

		@method isRejected
		@return {Boolean}
	*/
	public isRejected()
	{
		return this.state === PromiseState.REJECTED
	}




	/**
		Get promise value.

		@method getValue
		@return {Any}
	*/
	public getValue()
	{
		return this.value
	}



	/**
		Resolve promise with given promiseOrValue.
		This method should only be called internally from Promise class

		@method resolve
		@private
	*/
	private resolve(promiseOrValue)
	{
		if (this.state !== PromiseState.PENDING) {
			if (Promise.onerror)
				Promise.onerror(new Error('Promise is already '+(PromiseState[this.state])))

			return
		}

		this.state = PromiseState.RESOLVED
		this._resolve(promiseOrValue)
	}


	/*
		Internal method
	 	- skips promise state check (can be called on promise in PENDIND and RESOLVED state)
	*/
	private _resolve(promiseOrValue)
	{
		var then
		  , isPromise

		if (promiseOrValue instanceof Promise) {

			if (promiseOrValue===this) {
				enqueue(this, '_reject', new TypeError('Cyclic promise'))
				return
			}

			switch (promiseOrValue.state) {
				case PromiseState.PENDING:
				case PromiseState.RESOLVED:
					promiseOrValue.promises.push(this); break;

				case PromiseState.FULFILLED:
					enqueue(this, '_resolveTask', promiseOrValue.value); break;

				case PromiseState.REJECTED:
					enqueue(this, '_reject', promiseOrValue.value); break;
			}
		}
		else {
			try {
				var type = typeof promiseOrValue
				isPromise = (promiseOrValue && (type==='object' || type==='function') && (then = promiseOrValue.then, typeof then==='function'))
			} catch (e) {
				enqueue(this, '_reject', e);
				return
			}

			if (isPromise) {
				var executed = false
				try {
					then.call(promiseOrValue,
						(value)=> {
							if (executed) return
							this._resolve(value)
							executed = true
						}, (reason)=> {
							if (executed) return
							this._reject(reason)
							executed = true
					})
				} catch (e) {
					if (!executed)
						enqueue(this, '_reject', e);
					return
				}
			}
			else {
				enqueue(this, '_resolveTask', promiseOrValue)
			}
		}
	}


	/*
		Internal method
	 	- finally run onFulfilled function and consumer promises _resolve() or _reject() method.
	*/
	private _resolveTask(value)
	{
		var result
		  , promises = this.promises
		  , l = promises.length

		if (this.onFulfilled) {
			try{
				result = this.onFulfilled.call(undefined,value)
				if (result===this) throw new TypeError('Cyclic promise')
			} catch (e) {

				this.state = PromiseState.REJECTED
				this.value = e
				for(var i=0; i<l; i++)
					promises[i]._reject(e)

				return
			}
		}
		else
			result = value

		this.state = PromiseState.FULFILLED
		this.value = result
		for(var i=0; i<l; i++)
			promises[i]._resolve(result)
	}



	/**
		Reject promise with given reason.
		This method should only be called internally from Promuse class

		@method reject
		@private
	*/
	private reject(reason)
	{
		if (this.state !== PromiseState.PENDING) {
			if (Promise.onerror)
				Promise.onerror(new Error('Promise is already '+(PromiseState[this.state])))

			return
		}

		this.state = PromiseState.RESOLVED
		enqueue(this, '_reject', reason)
	}



	/*
		Internal method
	 	- skips promise state check (can be called on promise in PENDIND and RESOLVED state)
	*/
	private _reject(reason)
	{
		var result
		  , promises = this.promises
		  , l = promises.length

		if (this.onRejected) {
			try{
				result = this.onRejected.call(undefined,reason)
				if (result===this) throw new TypeError('Cyclic promise')
			} catch (e) {
				this.state = PromiseState.REJECTED
				this.value = e
				for(var i=0; i<l; i++)
					promises[i]._reject(e)
			}

			this.state = PromiseState.FULFILLED
			this.value = result
			for(var i=0; i<l; i++)
				promises[i]._resolve(result)
		}
		else {
			this.state = PromiseState.REJECTED
			this.value = reason
			for(var i=0; i<l; i++)
				promises[i]._reject(reason)

			if (promises.length===0 && this.onRejected===undefined && Promise.onerror)
				Promise.onerror(reason)
		}
	}



	/**
		Returns a resolved promise. The returned promise will be
		 - fulfilled with promiseOrValue if it is a value, or if promiseOrValue is a promise
		 - fulfilled with promiseOrValue's value after it is fulfilled
		 - rejected with promiseOrValue's reason after it is rejected

		@method resolve
		@static
		@param [promiseOrValue] {*}
		@return {Promise}
	*/
	static resolve(promiseOrValue?)
	{
		var p = new Promise()
		p.resolve(promiseOrValue)
		return p
	}



	/**
		Returns a rejected promise for the supplied reason.

		@method reject
		@static
		@param [reason] {Any} rejected value of the returned Promise
		@return {Promise}
	*/
	static reject(reason?)
	{
		var p = new Promise()
		p.reject(reason)
		return p
	}



	/**
		Creates a \{Promise, resolve(), reject()\} object.

		@method defer
		@static
		@return {Deferred}
	*/
	static defer()
	{
		var promise = new Promise()
		return {
			promise: promise,
			resolve: (x)=> promise.resolve(x),
			reject: (x)=> promise.reject(x),
		}
	}


	/**
		Returns promise resolved by result of fn() after {delay} ms

		@method deferCall
		@static
		@param fn {Function}
		@param [delay] {Number}
		@return {Promise}
	*/
	static deferCall(fn, delay=0)
	{
		var defer = Promise.defer()
		setTimeout(()=> {
			var res
			try {
				res = fn.call(undefined)
			} catch (e) {
				defer.reject(e)
				return
			}
			defer.resolve(res)
		}, delay)

		return defer.promise
	}



	/**
		If promiseOrValue is not trusted promise (instanceof Promise) it will return
		trusted promise resolved with promiseOrValue. Otherwise promiseOrValue will be directly returned.

		@method when
		@static
		@param promiseOrValue {*}
		@returns {Promise}
	*/
	static when(promiseOrValue)
	{
		return (promiseOrValue instanceof Promise) ? promiseOrValue : Promise.resolve(promiseOrValue)
	}



	/**
		Return a promise that will resolve only once all the supplied promisesOrValues
		have resolved. The resolution value of the returned promise will be an array
		containing the resolution values of each of the promisesOrValues.

		@method all
		@static
		@param promisesOrValues {Array} array of anything, may contain a mix
		  of {@link Promise}s and values
		@returns {Promise}
	*/
	static all(promiseOrValues)
	{
		var results = []
		  , pending = promiseOrValues.length

		var promise = new Promise(()=> results)
		  , reject = (e)=> promise.reject(e)

		promiseOrValues.forEach((p,i)=> {
			Promise.when(p).then( (value)=> {
				results[i]=value
				if (--pending===0) promise.resolve(results)
			}, reject)
		})

		return promise
	}



	/**
		Joins multiple promises into a single returned promise.

		@method join
		@static
		@param [promisesOrValues]* {Any}
		@return {Promise} a promise that will fulfill when *all* the input promises
		  have fulfilled, or will reject when *any one* of the input promises rejects.
	*/
	static join(...promisesOrValues)
	{
		return Promise.all(promisesOrValues)
	}

}



function enqueue(promise, fn, arg)
{
	if(taskQueue.push([promise,fn,arg]) === 1) {
		nextTick(runTasks)
	}
}

function runTasks()
{
	var task, i = 0;

	while (task = taskQueue[i++]) {
		task[0][task[1]](task[2])
	}

	taskQueue = []
}

var nextTick;

declare var setImmediate
declare var global
declare var process
declare var vertx

if (typeof setImmediate === 'function')
	nextTick = setImmediate.bind(global)
else if (typeof process === 'object' && process.nextTick)
	nextTick = process.nextTick
else if (typeof vertx === 'object')
	nextTick = vertx.runOnLoop
else
	nextTick = function(t) { setTimeout(t, 0); }
