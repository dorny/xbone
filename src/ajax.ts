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


	/**
		@attribute options
		@type {AjaxOptions}
	*/
	options: AjaxOptions;
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
	public onsuccess(xhr: XMLHttpRequest, options: AjaxOptions)
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
						switch (xhr.getResponseHeader('Content-Type')) {
							case 'text/html':
							case 'application/xhtml+xml':
								data = this.parseHTML(xhr)
								break

							case 'application/xml':
							case 'text/xml':
								data = this.parseXML(xhr)
								break

							case 'image/svg+xml':
								data = this.parseSVG(xhr)

							default:
								throw new TypeError('Unsuported Content-Type for responseType="document"')
						}
					}
					break

				case 'json':
					data = JSON.parse(xhr.responseText)
					break

				default:
					throw new TypeError('Unsuported data type')
			}
		}

		return {
			status: xhr.status,
			data: data,
			xhr: xhr,
			options: options
		}
	}



	/**
		@method onerror
		@param XMLHttpRequest xhr
		@param options {AjaxOptions}
		@param error {String|Any} Status text or thrown error
	*/
	public onerror(xhr:XMLHttpRequest, options: AjaxOptions, error)
	{
		return {
			status: xhr.status,
			error: error,
			xhr: xhr,
			options: options
		}
	}



	/**
		Shortcut for Ajax.send('GET', options)

		@method get
		@param url {String}
		@param [options] {AjaxOptions}

	*/
	public get(url: string, options?: AjaxOptions)
	{
		return this.send('GET', url, options)
	}



	/**
		Shortcut for Ajax.send('POST', options)

		@method post
		@param url {String}
		@param [options] {AjaxOptions}

	*/
	public post(url: string, options?: AjaxOptions)
	{
		return this.send('POST', url, options)
	}



	/**
		Shortcut for Ajax.send('PUT', options)

		@method put
		@param url {String}
		@param [options] {AjaxOptions}

	*/
	public put(url: string, options?: AjaxOptions)
	{
		return this.send('PUT', url, options)
	}



	/**
		Shortcut for Ajax.send('DELETE', options)

		@method delete
		@param url {String}
		@param [options] {AjaxOptions}

	*/
	public delete(url: string, options?: AjaxOptions)
	{
		return this.send('DELETE', url, options)
	}



	/**
		@method send
		@param method {string}
		@param url {String}
		@param [options] {AjaxOptions}
		@return {Promise}
	*/
	public send(method: string, url: string, options: AjaxOptions = {}) : AjaxRequest
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
				if (xhr.status>=200 && xhr.status<=300) {
					var resp
					try {
						resp = this.onsuccess(xhr,options)
					} catch (e) {
						defer.reject( this.onerror(xhr, options, e))
						return
					}
					defer.resolve(resp)
				}
				else
					defer.reject( this.onerror(xhr, options, xhr.statusText))
			}
		}


		xhr.open( method, url, true, opts.user, opts.password)


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


	private parseHTML(xhr: XMLHttpRequest)
	{
		var parser = new DOMParser()
		var doc = parser.parseFromString(xhr.responseText, 'text/html')
		if (doc===null) {
			doc = document.implementation.createHTMLDocument("")
			doc.documentElement['innerHTML'] = xhr.responseText
		}

		return doc
	}


	private parseXML(xhr: XMLHttpRequest)
	{
		var parser = new DOMParser()
		return parser.parseFromString(xhr.responseText, 'application/xml')
	}


	private parseSVG(xhr: XMLHttpRequest)
	{
		var parser = new DOMParser()
		return parser.parseFromString(xhr.responseText, 'image/svg+xml')
	}
}



export var ajax = new Ajax()
