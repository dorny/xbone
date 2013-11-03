/**
	@module XBone
	@submodule DOM
*/



/**
	@class $HTMLElement
*/
export class $HTMLElement
{
	/**
		@attribute el
		@type {HTMLElement}
	*/

	/**
		@constructor
		@param el {HTMLElement}
	*/

	constructor (public el: HTMLElement)
	{
		if (!el)
			throw new TypeError('$HTMLElement: "el" cannot be null or undefined')
	}


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
	public closest(selector: string, maxParent?: Node) : HTMLElement
	{
		var el = this.el
		maxParent && (maxParent = maxParent.parentNode)

		do {
			if (matches.call(el, selector))
				return el

			el = el.parentElement
		} while(el && el!=maxParent)

		return null
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
		@method val
		@return {String|Number}
	*/
	public value()
	{
		switch(this.el.tagName) {
			case 'INPUT':
				var inp = (<HTMLInputElement> this.el)
				switch ((inp.getAttribute('type')||inp.type).toLowerCase()) {
					case 'radio':
					case 'checkbox':
						return inp.checked

					case 'number':
						return parseFloat(inp.value)

					default:
						return inp.value
				}

			case 'SELECT':
				var sel = (<HTMLSelectElement> this.el)
				if (sel.multiple && sel['selectedOptions'])
					return slice.call(sel['selectedOptions']).map((el)=> el.value)
				else
					return sel.options[sel.selectedIndex].value

			case 'TEXTAREA':
				return (<HTMLTextAreaElement> this.el).value

			default:
				return this.el.textContent
		}
	}


	/**
		@method setVal
		@param value {String|Number}
	*/
	public setValue(value)
	{
		switch(this.el.tagName) {
			case 'INPUT':
				var inp = (<HTMLInputElement> this.el)
				switch ((inp.getAttribute('type')||inp.type).toLowerCase()) {
					case 'checkbox':
						inp.checked = value ? true:false
						return

					case 'radio':
						if (typeof value === 'boolean')
							inp.checked = (inp.value ? true : false)
						else
							inp.checked = (value==inp.value ? true : false)
						return

					default:
						inp.value = value
						return
				}

			case 'SELECT':
				var sel = (<HTMLSelectElement> this.el)
				  , options = sel.options
				  , found = false
				for(var i=0, l=options.length; i<l; i++) {
					if (options[i].value==value) {
						sel.selectedIndex = i
						return
					}
				}
				throw new Error('Option not found')

			case 'TEXTAREA':
				(<HTMLTextAreaElement> this.el).value = value

			default:
				this.el.textContent = value
				return
		}
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
		@method getPageOffset
		@return {Object}
	*/
	public getPageOffset()
	{
		var el = this.el
		  , x = this.el.offsetLeft
		  , y = this.el.offsetTop

		while (el.offsetParent) {
			el = <HTMLElement> el.offsetParent
			x += el.offsetLeft
			y += el.offsetTop
		}

		return { pageX: x, pageY: y }
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
		@param selector {String|Null}
		@param callback {Function}
		@param [useCapture=false] {Boolean}
		@return {Function}
	*/
	public on(events: string, selector: string, callback, useCapture: boolean = false)
	{
		var bindCallback
		if (selector) {
			bindCallback = (e)=> {
				var match = $(e.target).closest(selector)
				if (match)
					return callback(e, match)
			}
		}
		else
			bindCallback = callback

		events.split(' ').forEach((evt)=> {
			this.el.addEventListener(evt, bindCallback, useCapture)
		})

		return bindCallback
	}


	/**
		@method bind
		@param events {String}
		@param callback {Function}
		@param [useCapture=false] {Boolean}
		@return {$HTMLElement}
	*/
	public bind(events, callback, useCapture: boolean = false)
	{
		return this.on(events, null, callback, useCapture)
	}


	/**
		@method off
		@param events {String}
		@param callback {Function}
		@param [useCapture=false] {Boolean}
		@return
	*/
	public off(events, callback, useCapture=false)
	{
		events.split(' ').forEach((evt)=> {
			this.el.removeEventListener(evt, callback, useCapture)
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
		var el = this.el.createElement(tagName)

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



	/**
		@method read
		@param elements {HTMLElement[]}
		@param [nameAttr] {String}
		@return values {Object}
	*/
	public read(elements: HTMLElement[], nameAttr?: string)
	{
		var ret = {}
		  , el
		  , key

		for(var i=0,l=elements.length; i<l; i++) {
			el = elements[i]
			key = nameAttr ? el.getAttribute(nameAttr) : (el.name || el.getAttribute('data-name'))

			if (el.tagName=='INPUT' && el.type=='radio') {
				if (el.checked)
					ret[key] = el.value
			}
			else
				ret[key] = $(el).value()
		}

		return ret
	}


	/**
		@method fill
		@param elements {HTMLElement[]}
		@param values {Object|Function}
		@param [nameAttr] {String}
		@param [defaultValue] {String}
		@return $
	*/
	public fill(elements: HTMLElement[], values, nameAttr?: string, defaultValue?: string)
	{
		var el, key, val
		  , useFun = typeof values === 'function'


		for(var i=0,l=elements.length; i<l; i++) {
			el = elements[i]
			key = nameAttr ? el.getAttribute(nameAttr) : (el.name || el.getAttribute('data-name'))
			val =  useFun ? values(key,el) : (key in values ? values[key] : defaultValue)
			$(el).setValue(val)
		}

		return this
	}

	public one: (selector: string) => HTMLElement;
	public all: (selector: string) => HTMLElement[];
	public byTag: (tagName: string) => HTMLElement[];
	public byClass: (className: string) => HTMLElement[];
	public createMap: (selector: string, attrName: string) => {[key: string]: HTMLElement};
	public $one: (selector: string) => $HTMLElement;
	public $all: (selector: string) => $HTMLElement[];
	public on: (events: string, selector: string, callback, useCapture: boolean = false) => $Document;
	public bind: (events, callback, useCapture: boolean = false) => $Document;
	public off: (events, callback?, useCapture?) => $Document;
}

$Document.prototype.one = $HTMLElement.prototype.one
$Document.prototype.all = $HTMLElement.prototype.all
$Document.prototype.byTag = $HTMLElement.prototype.byTag
$Document.prototype.byClass = $HTMLElement.prototype.byClass
$Document.prototype.createMap = $HTMLElement.prototype.createMap
$Document.prototype.$one = $HTMLElement.prototype.$one
$Document.prototype.on = <any> $HTMLElement.prototype.on
$Document.prototype.bind = <any> $HTMLElement.prototype.bind
$Document.prototype.off = <any> $HTMLElement.prototype.off



// Shortcuts
export var $ = (el)=> new $HTMLElement(el)
export var $doc = new $Document(document)



// Internals
// -------------------------------
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
