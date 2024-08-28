
import {AbstractApp, Util, Events, config} from './vendor/updatableJs/updatableJs.js';
import {_url} from './functions.js';

export class App extends AbstractApp {

	changeLayoutIntention;

	setChangeLayoutIntention(id) {
		if (!id) id = Math.random();

		this.changeLayoutIntention = id;
		
		return id;
	}

	isChangeLayoutAllowed(id) {
		return this.changeLayoutIntention == id;
	}

	changeLayout(layout, id) {
		this.get('layoutManager').changeLayout(layout, id);
		
		return this;
	}
	
	getModule(name) {
		return this.get('modules').get(name);
	}
	
	static getModule(name) {
		return this.getInstance().getModule(name);
	}
	
	getConfig(module) {
		return module ? this.getModule(module).get('config') : this.get('config');
	}
	
	static getConfig(module) {
		return this.getInstance().getConfig(module);
	}
	
	getApi(module) {
		return this.getModule(module).get('api');
	}
	
	static getApi(module) {
		return this.getInstance().getApi(module);
	}
	
	getController(controller) {
		return config.initialize(
			Util.capitalizeFirstLetter(controller), this);
	}
	
	static getController(controller) {
		return this.getInstance().getController(controller);
	}
	
	
	// Query
	
	hasQuery(...keys) {
		var url = new URL(window.location);
		for (var key of keys) {
			if (!url.searchParams.has(key))
				return false;
		}
		
		return true;	
	}
	
	static hasQuery(...keys) {
		return this.getInstance().hasQuery(...keys);
	}
	
	getQuery(keys, _default = null) {
		var url = new URL(window.location);
		var result = [].concat(keys).map(
			key => url.searchParams.has(key) ? url.searchParams.get(key) : _default);
		
		return Array.isArray(keys) ? result : result.shift();
	}
	
	static getQuery(keys, _default = null) {
		return this.getInstance().getQuery(keys, _default);
	}
	
	setQuery(key, value, removeIfEmpty = true) {
		value = String(value);
		
		if (!value && removeIfEmpty) 
			return this.removeQuery(key);
		
		var url = new URL(window.location);
		url.searchParams.set(key, value);
		window.history.replaceState(window.history.state, '', url);	
		
		return this;
	}

	static setQuery(key, value, removeIfEmpty = true) {
		return this.getInstance().setQuery(key, value, removeIfEmpty);
	}

	removeQuery(key) {
		var url = new URL(window.location);
		url.searchParams.delete(key);				
		window.history.replaceState(window.history.state, '', url);	
		
		return this;
	}
	
	static removeQuery(key) {
		return this.getInstance().removeQuery(key);
	}
	
	
	// Router
	
	loadRoute(name, values, pushState = true) {	
		var route = App.get('router').getRoute(name);
		if (!route)
			throw `Unknown route ${name}`;
			
		this._loadRoute(_url(route.build(values)), route.getValues(values), pushState);
	}
	
	loadRouteByPath(path, pushState = true) {
		var sitePath = new RegExp('^' + App.get('config').sitePath);
		
		var path_ = path instanceof URL ? path.pathname.replace(sitePath, '') : path.replace(sitePath, '');

		path_ = Util.trimEnd(path_, '/');
		
		if (!/^\//.test(path_)) 
			path_ = '/' + path_;
				
		var result = App.get('router').match(path_);
		if (!result)
			throw `Unknown route ${path_}`;
		
		this._loadRoute(path, result, pushState);
	}
	
	_loadRoute(path, values, pushState) {
		console.log(path);
		console.log(values);
		console.log(pushState);
		console.log('------------');
		
		App.set('route', values);
		
		if (pushState) 
			window.history.pushState({}, '', path);
		
		var id = this.setChangeLayoutIntention();
		
		var events = new Events({
			events: Object.values(values.events)
		});
		
		var layout = events.trigger('events', id).getResult();
		
		if (!layout) {
			var layout = this.getController(values.controller)
				['action' + Util.capitalizeFirstLetter(values.action)](id);		
		}
		
		if (layout)
			this.changeLayout(layout);	
	}	
}








		





