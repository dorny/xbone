/**
	@module XBone
	@submodule DOM
*/

export var $ = (el)=> new $HTMLElement(el)
export var $doc = new $Document(document)



/**
	@class $HTMLElement
*/
export class $HTMLElement
{
	private _eventlisteners;

	/**
		@attribute el
		@type {HTMLElement}
	*/

	/**
		@constructor
		@param el {HTMLElement}
	*/

	constructor (public el: HTMLElement)
	{}


	/**
		@method one
		@param selector {String}
		@return {HTMLElement}
	*/
	public one(selector: string) : HTMLElement
	{
		return <HTMLElement> this.el.querySelector(selector)
	}


	/**
		@method all
		@param selector {String}
		@return {HTMLElement[]}
	*/
	public all(selector: string) : HTMLElement[]
	{
		return slice.call(this.el.querySelectorAll(selector))
	}


	/**
		@method byTag
		@param tagName {String}
		@return {HTMLElement[]}
	*/
	public byTag(tagName: string) : HTMLElement[]
	{
		return slice.call(this.el.getElementsByTagName(tagName))
	}


	/**
		@method byClass
		@param className {String}
		@return {HTMLElement[]}
	*/
	public byClass(className: string) : HTMLElement[]
	{
		return slice.call(this.el.getElementsByClassName(className))
	}


	/**
		@method closest
		@param selector {String}
		@return {HTMLElement}
	*/
	public closest(selector: string) : HTMLElement
	{
		var el = this.el

		do {
			el = el.parentElement
		} while(el && matches.call(el, selector))

		return el && matches.call(el, selector) ? el : null
	}


	/**
		@method $one
		@param selector {String}
		@return {$HTMLElement}
	*/
	public $one(selector: string) : $HTMLElement
	{
		return $(this.one(selector))
	}


	/**
		@method $closest
		@param selector {String}
		@return {$HTMLElement}
	*/
	public $closest(selector) : $HTMLElement
	{
		return $(this.closest(selector))
	}


	/**
		@method createMap
		@param selector {String}
		@param attrName {String}
		@return {Object}
	*/
	public createMap(selector: string, attrName: string) : {[key: string]: HTMLElement}
	{
		var map = {}
		var els = this.all(selector)
		for(var i=0; i<els.length; i++)
			map[ els[i].getAttribute(attrName)] = els[i]

		return map
	}




	/**
		@method attr
		@param name {String}
		@return {String}
	*/
	public attr(name: string)
	{
		return this.el.getAttribute(name)
	}


	/**
		@method hasAttr
		@param name {String}
		@return {Boolean}
	*/
	public hasAttr(name: string)
	{
		return this.el.hasAttribute(name)
	}


	/**
		@method setAttr
		@param {String} name
		@param value
		@return {$HTMLElement} this
	*/
	public setAttr(name: string, value)
	{
		this.el.setAttribute(name, value)
		return this
	}


	/**
		@method setAttrs
		@param {Object} attributes
		@return {$HTMLElement} this
	*/
	public setAttrs(attributes: {[name: string]: any})
	{
		for(var name in attributes)
			this.el.setAttribute(name, attributes[name])

		return this
	}


	/**
		@method data
		@param name {String}
		@return {String}
	*/
	public data(name: string)
	{
		return this.el.getAttribute('data-'+name)
	}


	/**
		@method setData
		@param {String} name
		@param value
		@return {$HTMLElement} this
	*/
	public setData(name: string, value)
	{
		this.el.setAttribute('data-'+name, value)
		return this
	}


	/**
		@method setData
		@param values {Object}
		@return {$HTMLElement} this
	*/
	public setDataAttrs(values: {[key: string]:any})
	{
		for(var key in values)
			this.el.setAttribute('data-'+key, values[key])

		return this
	}


	/**
		@method matches
		@param selector {String}
		@return {Boolean}
	*/
	public matches(selector) : boolean
	{
		return matches.call(this.el, selector)
	}


	/**
		@method show
		@return
	*/
	public show()
	{
		this.el.removeAttribute('hidden')
		return this
	}


	/**
		@method hide
		@return
	*/
	public hide()
	{
		this.el.setAttribute('hidden','hidden')
		return this
	}


	/**
		@method remove
		@return {$HTMLElement} this
	*/
	public remove()
	{
		remove(this.el)
		return this
	}






	/**
		@method on
		@param events {String}
		@param selector {String}
		@param callback {Function}
		@param [thisArg]
		@param [useCapture=false] {Boolean}
		@return {$HTMLElement}
	*/
	public on(events: string, selector: string, callback, thisArg?, useCapture: boolean = false)
	{
		this._eventlisteners || (this._eventlisteners = [])

		events.split(' ').forEach((evt)=> {
			var clb
			if (selector)
				clb = (e)=> { if ( matches.call(e.target, selector)) return callback.call(thisArg,e) }
			else
				clb = (e)=> callback.call(thisArg,e)

			this._eventlisteners.push({event: evt, callback: callback, listener: clb, useCapture: useCapture})
			this.el.addEventListener(evt, clb, useCapture)
		})

		return this
	}


	/**
		@method bind
		@param events {String}
		@param callback {Function}
		@param [thisArg]
		@param [useCapture=false] {Boolean}
		@return {$HTMLElement}
	*/
	public bind(events, callback, thisArg?, useCapture: boolean = false)
	{
		return this.on(events, null, callback, thisArg, useCapture)
	}


	/**
		@method off
		@param events {String}
		@param callback {Function}
		@param [useCapture=false] {Boolean}
		@return
	*/
	public off(events, callback?, useCapture?)
	{
		if (!this._eventlisteners)
			return

		events.split(' ').forEach((evt)=> {
			this._eventlisteners = this._eventlisteners.filter((it)=> {
				if (it.event===evt && (!callback || it.callback===callback) && (!useCapture || it.useCapture===useCapture)) {
					this.el.removeEventListener(evt, it.listener, it.useCapture)
					return false
				}
				else
					return true
			})
		})
	}

}


/**
	@class $Document
*/
export class $Document
{
	private _eventlisteners;

	constructor(public el: Document)
	{}

	/**
		@method create
		@param tagName {String}
		@param [attrs] {Object}
		@param [childs] {HTMLElement[]}
	*/
	public create(tagName: string, attrs?:{[name: string]: any}, childs?: HTMLElement[]) : HTMLElement
	{
		var el = document.createElement(tagName)

		if (attrs) {

			if ('text' in attrs) {
				el.textContent = attrs['text']
				delete attrs['text']
			}

			if ('html' in attrs) {
				el.innerHTML = attrs['html']
				delete attrs['html']
			}

			$(el).setAttrs(attrs)
		}

		if (childs)
			for(var i=0; i<childs.length; i++)
				el.appendChild(el[i])

		return el
	}


	/**
		@method get
		@param id {String}
		@return {HTMLElement}
	*/
	public get(id: string) : HTMLElement
	{
		return (<any>this.el).getElementById(id)
	}


	/**
		@method $get
		@param id {String}
		@return {$HTMLElement}
	*/
	public $get(id: string) : $HTMLElement
	{
		return $(this.get(id))
	}

	public one: (selector: string) => HTMLElement;
	public all: (selector: string) => HTMLElement[];
	public byTag: (tagName: string) => HTMLElement[];
	public byClass: (className: string) => HTMLElement[];
	public $one: (selector: string) => $HTMLElement;
	public $all: (selector: string) => $HTMLElement[];
	public on: (events: string, selector: string, callback, thisArg?, useCapture: boolean = false) => $Document;
	public bind: (events, callback, thisArg?, useCapture: boolean = false) => $Document;
	public off: (events, callback?, useCapture?) => $Document;
}

$Document.prototype.one = $HTMLElement.prototype.one
$Document.prototype.all = $HTMLElement.prototype.all
$Document.prototype.byTag = $HTMLElement.prototype.byTag
$Document.prototype.byClass = $HTMLElement.prototype.byClass
$Document.prototype.$one = $HTMLElement.prototype.$one
$Document.prototype.on = <any> $HTMLElement.prototype.on
$Document.prototype.bind = <any> $HTMLElement.prototype.bind
$Document.prototype.off = <any> $HTMLElement.prototype.off




var slice = Array.prototype.slice


var remove = ('remove' in Element.prototype) ? _removeNative : _remove
function _remove(el: Node) : void
{
	if (el.parentNode)
		el.parentNode.removeChild(el)
}
function _removeNative(el: Node) : void
{
	el['remove']()
}


var proto = <any> Element.prototype
var matches = proto.matches || proto.webkitMatchesSelector || proto.mozMatchesSelector || proto.msMatchesSelector






/*
 * Minimal classList shim for IE 9
 * By Devon Govett
 * MIT LICENSE
 */

if (!("classList" in document.documentElement) && Object.defineProperty && typeof HTMLElement !== 'undefined') {
    Object.defineProperty(HTMLElement.prototype, 'classList', {
        get: function() {
            var self = this;
            function update(fn) {
                return function(value) {
                    var classes = self.className.split(/\s+/),
                        index = classes.indexOf(value);

                    fn(classes, index, value);
                    self.className = classes.join(" ");
                }
            }

            var ret = {
                add: update(function(classes, index, value) {
                    ~index || classes.push(value);
                }),

                remove: update(function(classes, index) {
                    ~index && classes.splice(index, 1);
                }),

                toggle: update(function(classes, index, value) {
                    ~index ? classes.splice(index, 1) : classes.push(value);
                }),

                contains: function(value) {
                    return !!~self.className.split(/\s+/).indexOf(value);
                },

                item: function(i) {
                    return self.className.split(/\s+/)[i] || null;
                }
            };

            Object.defineProperty(ret, 'length', {
                get: function() {
                    return self.className.split(/\s+/).length;
                }
            });

            return ret;
        }
    });
}
