/**
	@module XBone
	@submodule View
*/

import dom = require('./dom')
import P = require('./promise')
import Events = require('./events')
import Model = require('./model')

var $ = dom.$
  , $doc = dom.$doc


export = View
/**
	@class View
	@extends Events
*/
class View extends Events
{

	public children: View[] = [];

	public events: {[description: string]: (e)=>any } = {};

	public bindings = {};

	public routes: { [path: string]: (...paths:string[]) => void };


	public $el: dom.$HTMLElement;


	constructor( public el: HTMLElement, public parent?: View)
	{
		super()
		this.$el = $(el)

		if (parent)
			parent.registerChild(this)
	}

	public init()
	{
		this.initView()
		return this
	}

	public initView()
	{
		this.initEvents()
		this.initBindings()
		this.initNavigation()
	}

	private initEvents()
	{
		var pos, events, selector

		for(var desc in this.events) {
			var pos = desc.indexOf(':')
			if (pos!=-1) {
				events = desc.substr(0,pos)
				selector = desc.substr(pos+1)
			}
			else {
				events = desc
				selector = null
			}

			this.$el.on(events, selector, this.events[desc])
		}
	}

	private initBindings()
	{
		// TODO
	}

	private initNavigation()
	{
		this.$el.on( 'tap click', 'a[data-navigate],button[data-navigate]', (e : Event, src: HTMLElement)=> {
			e.preventDefault()
			e.stopPropagation()

			var link = src.getAttribute('href') || src.getAttribute('data-navigate')

			if (link[0]=='#')
				link = link.substr(1)

			this.navigate(link)
			return false
		})
	}



	public navigate(...path)
	{
		var spath = path.join('/')

		if (spath[0]=='/')
			throw new Error('Absolute paths not implemented')

		var parts = spath.split('/')
		  , first = parts[0]
		  , rest = parts.slice(1)
		  , route = this.routes[first]

		if (!route)
			throw new Error('Route not found')

		route.apply(this, rest)
	}



	private registerChild(view: View)
	{
		this.children.push(view)
	}

	private unregisterChild(view: View)
	{
		this.children.splice( this.children.indexOf(view), 1)
	}



	public remove()
	{
		this.children.forEach((view)=> view.remove())

		if (this.parent)
			this.parent.unregisterChild(this)

		this.off()
		this.$el.remove()
	}

}
