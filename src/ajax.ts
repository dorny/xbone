/**
	@module XBone
	@submodule Ajax
*/

import P = require('./promise')
import _ = require('./lodash')


var ArrayBuffer = window['ArrayBuffer']
var Blob = window['Blob']
var FormData = window['FormData']


var dataTypes = [
	'',
	'arraybuffer',
	'blob',
	'document',
	'json',
	'text',
]

var isDataTypeNativeSupported = {}


var xhr = new XMLHttpRequest()
if ('responseType' in xhr) {
	dataTypes.forEach((type)=> {
		try {
			xhr.responseType = type
			isDataTypeNativeSupported[type] = (xhr.responseType===type)
		} catch (e) {
			isDataTypeNativeSupported[type] = false
		}
	})
}
else {
	dataTypes.forEach((type)=> { isDataTypeNativeSupported[type] = false })
}
xhr.abort()



export var mimeTypes = {
	'binary'  : 'application/octet-stream',
	'css'     : 'text/css',
	'csv'     : 'text/csv',
	'form'    : 'application/x-www-form-urlencoded',
	'html'    : 'text/html',
	'json'    : 'application/json',
	'soap'    : 'application/soap+xml',
	'text'    : 'text/plain',
	'vcard'	  : 'text/vcard',
	'xhtml'   : 'application/xhtml+xml',
	'xml'     : 'application/xml',
}


/**
	@class AjaxOptions
*/
export interface AjaxOptions
{
	/**
		@property url
		@type {String}
	*/
	url: string;

	/**
		@property timeout
		@type {Number}
		@optional
	*/
	timeout?: number;


	/**
		@property data
		@type {String|Object|Document|ArrayBuffer|Blob}
		@optional
	*/
	data?;


	/**
		@property url
		@type {String}
		@optional
	*/
	contentType?: string;

	/**
		@property accepts
		@type {String}
		@optional
	*/
	accepts?: string[];

	/**
		@property responseType
		@type {String}
		@optional
	*/
	responseType?: string;

	/**
		@property overrideMimeType
		@type {Boolean|String}
		@optional
	*/
	overrideMimeType?;

	/**
		@property headers
		@type {Object}
		@optional
	*/
	headers?: {[name:string]: string};

	/**
		@property beforeSend
		@type {Function}
		@optional
	*/
	beforeSend?: (xhr)=> void;

	/**
		@property basicAuth
		@type {Object}
		@optional
	*/
	basicAuth?: {user: string; password: string};

	/**
		@property user
		@type {String}
		@optional
	*/
	user?: string;

	/**
		@property password
		@type {String}
		@optional
	*/
	password?: string;
}



/**
	@class AjaxRequest
	@extends Promise
*/
export interface AjaxRequest extends P
{
	/**
		@attribute xhr
		@type {XMLHttpRequest}
	*/
	xhr: XMLHttpRequest;

	/**
		@method abort
		@param {Any?} reason
	*/
	abort: (reason?)=> void;

	/**
		@attribute _uid
		@type {String}
	*/
	_uid: string;
}



/**
	@class AjaxResponse
*/
export interface AjaxResponse {

	/**
		@attribute status
		@type {Number}
	*/
	status: number;

	/**
		@attribute data
		@type {Any}
	*/
	data;

	/**
		@attribute xhr
		@type {XMLHttpRequest}
	*/
	xhr: XMLHttpRequest;
}


/**
	@class Ajax
*/
export class Ajax
{
	private requests : {[id: string]: AjaxRequest} = {};



	/**
		@constructor
		@param [options] {object}
	*/
	constructor( public options = {})
	{}




	/**
		@method onsuccess
		@param xhr {XMLHttpRequest}
		@param options {AjaxOptions}
	*/
	public onsuccess(xhr, options: AjaxOptions)
	{
		xhr.onreadystatechange = null

		var data

		if ( !options.responseType || (xhr.responseType===options.responseType)) {
			data = xhr.response || xhr.responseText
		}
		else {
			switch(options.responseType) {
				case 'document':
					if (xhr.responseXML)
						data = xhr.responseXML
					else {
						var parser = new DOMParser()
						data = parser.parseFromString(xhr.responseText, 'application/xml')
					}
					break;

				case 'json':
					data = JSON.parse(xhr.responseText)
					break;

				default:
					throw new TypeError('Unsuported data type')
			}
		}

		return {
			status: xhr.status,
			data: data,
			xhr: xhr,
		}
	}



	/**
		@method onerror
		@param XMLHttpRequest xhr
		@param options {AjaxOptions}
	*/
	public onerror(xhr,options)
	{
		return xhr
	}



	/**
		Shortcut for Ajax.send('GET', options)

		@method get
		@param options {AjaxOptions}

	*/
	public get(options: AjaxOptions)
	{
		return this.send('GET', options)
	}



	/**
		Shortcut for Ajax.send('POST', options)

		@method post
		@param options {AjaxOptions}

	*/
	public post(options: AjaxOptions)
	{
		return this.send('POST', options)
	}



	/**
		Shortcut for Ajax.send('PUT', options)

		@method put
		@param options {AjaxOptions}

	*/
	public put(options: AjaxOptions)
	{
		return this.send('PUT', options)
	}



	/**
		Shortcut for Ajax.send('DELETE', options)

		@method delete
		@param options {AjaxOptions}

	*/
	public delete(options: AjaxOptions)
	{
		return this.send('DELETE', options)
	}



	/**
		@method send
		@param {string} method
		@param {AjaxOptions} options
		@return {Promise}
	*/
	public send(method: string, options: AjaxOptions) : AjaxRequest
	{
		method = method.toUpperCase()

		var opts = _.merge({}, this.options, options)
		  , data = this.processRequestData(method, opts.data, opts)
		  , headers = opts.headers

		var xhr = new XMLHttpRequest()
		  , defer = P.defer()

		var promise = <AjaxRequest> defer.promise


		xhr.onreadystatechange = () => {
			if (xhr.readyState != 4) return;

			delete this.requests[promise._uid]

			if (defer.promise.isPending()) {
				if (xhr.status>=200 && xhr.status<=300)
					defer.resolve( this.onsuccess(xhr,options))
				else
					defer.reject( this.onerror(xhr,options))
			}
		}


		xhr.open( method, opts.url, true, opts.user, opts.password)


		if (opts.overrideMimeType) {
			var mime
			if (opts.overrideMimeType===true)
				mime = mimeTypes[opts.responseType] || opts.responseType
			else
				mime = opts.overrideMimeType

			xhr.overrideMimeType(mime)
		}

		if (opts.responseType && isDataTypeNativeSupported[opts.responseType])
			xhr.responseType = opts.responseType

		if (opts.contentType)
			xhr.setRequestHeader('Content-Type', mimeTypes[opts.contentType] || opts.contentType)

		if (opts.accepts)
			xhr.setRequestHeader('Accepts', opts.accepts.map( (mime)=> mimeTypes[mime] || mime).join(','))

		if (opts.basicAuth)
			xhr.setRequestHeader('Authorization', 'Basic '+btoa(opts.basicAuth.user+':'+opts.basicAuth.password))

		if (headers)
			for (name in headers)
				xhr.setRequestHeader(name, headers[name])

		if (opts.timeout > 0)
			xhr.timeout = opts.timeout

		if (opts.beforeSend)
			opts.beforeSend(xhr)


		xhr.send(data)

		promise.xhr = xhr
		promise._uid = _.uniqueId('ajax')
		promise.abort = (reason?)=> {
			defer.reject(reason||'abort')
			xhr.abort()
		}


		this.requests[promise._uid] = promise

		return promise
	}



	/**
		@method abortAll
		@param {Any} [reason]
	*/
	public abortAll(reason?)
	{
		for(var key in this.requests)
			this.requests[key].abort(reason||'abort')
	}



	private processRequestData(method, data, opts)
	{
		if (data && (typeof data == 'object') && data!==null) {
			if (method=='GET') {
				if (Object.getPrototypeOf(data) === Object.prototype) {
					var url = opts.url
					  , qsa = this.serializeQueryData(data)

					opts.url = url + (url.indexOf('?')==-1 ? '?':'&')+qsa
					return null
				}
				else
					throw new TypeError('Unsuported data type')
			}
			else {
				if (data instanceof Document) {
					if (!isDataTypeNativeSupported['document']) {
						opts.contentType || (opts.contentType = 'xml')
						var serializer = new XMLSerializer()
						return serializer.serializeToString(data)
					}
				}
				else if (Object.getPrototypeOf(data) === Object.prototype) {
					if (!isDataTypeNativeSupported['json']) {
						opts.contentType || (opts.contentType = 'json')
						return JSON.stringify(opts.data)
					}
				}
				else if (FormData && data instanceof FormData) {
					return data
				}
				else if (ArrayBuffer && (data instanceof ArrayBuffer)) {
					if (!isDataTypeNativeSupported['arraybuffer'])
						throw new TypeError('Unsuported data type')
					return data
				}
				else if (Blob && (data instanceof Blob)) {
					if (!isDataTypeNativeSupported['blob'])
						throw new TypeError('Unsuported data type')
					return data
				}
				else
					throw new TypeError('Unsuported data type')
			}
		}
		else
			return data
	}


	private serializeQueryData(data)
	{
		var params = []
		for(var key in data) {
			var val = data[key]
			if (Array.isArray(val))
				params.push( encodeURIComponent(key)+'[]='+val.map(encodeURIComponent).join(','))
			else
				params.push( encodeURIComponent(key)+'='+encodeURIComponent(val))
		}

		return params.join('&')
	}

}



export var ajax = new Ajax()
