/**
	@module XBone
	@submodule Ajax
*/

import P = require('./promise')

/// <amd-dependency path="./deps/lodash"/>
declare var require;
var _ = require('./lodash')



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
		@param {object} options
	*/
	constructor( public options = {

	}){}




	/**
		@method onsuccess
		@param XMLHttpRequest xhr
		@param {AjaxOptions} options
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
		@param {AjaxOptions} options
	*/
	public onerror(xhr,options)
	{
		return xhr
	}



	/**
		@method send
		@param {string} method
		@param {AjaxOptions} options
		@return {Promise}
	*/
	public send(method: string, options: AjaxOptions) : AjaxRequest
	{
		var opts = _.merge({}, this.options, options)
		  , data = opts.data
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

		xhr.open( method, opts.url,true, opts.user, opts.password)


		if (opts.overrideMimeType) {
			var mime = typeof opts.overrideMimeType==='boolean' ? mimeTypes[opts.responseType] : opts.responseType
			xhr.overrideMimeType(mime)
		}

		if (opts.responseType && isDataTypeNativeSupported[opts.responseType])
			xhr.responseType = opts.responseType


		if (data && (typeof data == 'object') && data!==null) {
			if (data instanceof Document) {
				if (!isDataTypeNativeSupported['document']) {
					var serializer = new XMLSerializer()
					data = serializer.serializeToString(data)
					opts.contentType || (opts.contentType = 'xml')
				}
			}
			else if (Object.getPrototypeOf(data) === Object.prototype) {
				if (!isDataTypeNativeSupported['json']) {
					data = JSON.stringify(opts.data)
					opts.contentType || (opts.contentType = 'json')
				}
			}
			else if (window['ArrayBuffer'] && (data instanceof window['ArrayBuffer'])) {
				if (!isDataTypeNativeSupported['arraybuffer'])
					throw new TypeError('Unsuported data type')
			}
			else if (window['Blob'] && (data instanceof window['Blob'])) {
				if (!isDataTypeNativeSupported['blob'])
					throw new TypeError('Unsuported data type')
			}
			else
				throw new TypeError('Unsuported data type')
		}


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
		@param {Any?} reason
	*/
	public abortAll(reason?)
	{
		for(var key in this.requests)
			this.requests[key].abort(reason||'abort')
	}

}

var ajax = new Ajax()


/**
	exposed send() method on default Ajax class instance

	@method send
	@param {string} method
	@param {AjaxOptions} options
*/
export function send(method: string, options: AjaxOptions) : AjaxRequest
{
	return ajax.send(method, options)
}


/**
	exposed abortAll() method on default Ajax class instance

	@method abortAll
*/
export function abortAll()
{
	return ajax.abortAll()
}
