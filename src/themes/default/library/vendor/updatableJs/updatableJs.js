/** ../updatableJs/src/common/Fetcher.js */

 class Fetcher {
	
	resource;
	init;
	contentType = 'json';
	callbacks = { // https://stackoverflow.com/questions/56901106/fetch-then-after-catch-still-be-called-even-be-catched
		'then': [],
		'catch': [],
		'finally': []
	};
	
	constructor(resource, init) {		
		this.resource = resource;
		this.init = init;
	}
	
	setContentType(contentType) {
		this.contentType = contentType;
		
		return this;
	}
	
	fetch() {
		var response = fetch(this.resource, this.init).then(response => {
			if (!response.ok)
				throw new Error('HTTP error! status: ' + response.status);
			
			return this.contentType ? response[this.contentType]() : response;
		});	
		
		Object.entries(this.callbacks).forEach(([type, callbacks]) => {
			if (type == 'catch') {
				if (callbacks.length) {
					response = response.catch(error => {
						for (var callback of callbacks) {
							callback(error);
						}
					});
				}
			}
			else {
				for (var callback of callbacks) {
					response = response[type](callback);
				}
			}	
		});

		return response;	
	}
	
	then(callback) {
		this.callbacks['then'].push(callback);
		
		return this;
	}
	
	catch(callback) {
		this.callbacks['catch'].push(callback);
		
		return this;
	}
	
	finally(callback) {
		this.callbacks['finally'].push(callback);
		
		return this;
	}
}
/** ../updatableJs/src/common/AbstractApi.js */


 class AbstractApi {
	
	getFetcher(resource, init) {
		return new Fetcher(resource, init);
	}
}
/** ../updatableJs/src/resources/AbstractResource.js */

 class AbstractResource {
	
	resource; 
	
	constructor(resource) {
		this.set(resource);
	}
	
	set(resource) {}
	
	get() {}
}
/** ../updatableJs/src/resources/AbstractGenerator.js */


 class AbstractGenerator extends AbstractResource {

	shared;
	generated; 
	
	generate() {}
	
	get(values) {		
		if (!this.shared) return this.generate(values);
		
		if (this.generated === undefined)
			this.generated = this.generate(values);
			
		return this.generated;
	}	
	
	setShared(shared) {
		this.shared = !!shared;
		
		return this;
	}
	
	reset() {
		this.generated = undefined;
		
		return this;
	}
}
/** ../updatableJs/src/resources/Callback.js */


 class Callback extends AbstractGenerator {
	
	constructor(resource, shared) {
		super(resource);
		this.setShared(shared);
	}
	
	generate(values = []) {
		return this.resource(...values);	
	}
	
	set(resource) {
		if (typeof resource != 'function') 
			throw 'The resource must be callable.';
		
		this.resource = resource;
		
		return this;
	}
}
/** ../updatableJs/src/resources/Fixed.js */


 class Fixed extends AbstractResource {
	
	set(resource) {
		this.resource = resource;
		
		return this;
	}
	
	get() {
		return this.resource;
	}
}
/** ../updatableJs/src/resources/ResourceFactory.js */



 class ResourceFactory {
	
	static create(resource, shared) {
		return typeof resource == 'function' ? 
			new Callback(resource, shared) : new Fixed(resource);
	}	
}
/** ../updatableJs/src/resources/Resources.js */


 class Resources {
	
	resources = {};
	
	set(key, resource, shared = true, bindContext = true) {
		if (typeof resource == 'function' && bindContext)
			resource = resource.bind(this);	
		
		this.resources[key] = ResourceFactory.create(resource, shared);
		
		return this;
	}

	get(key, values) {
		if (!(key in this.resources)) 
			throw `Unknown resource ${key}`;

		return this.resources[key].get(values);
	}
	
	has(key) {
		return key in this.resources;
	}
}
/** ../updatableJs/src/common/AbstractApp.js */


 class AbstractApp {
	
	resources;
	
	static instance;
	
	constructor(resources) {
		this.resources = resources ? resources : new Resources();
	}

	static getInstance() {
        if (!this.instance)
            this.instance = new this();
		
        return this.instance;
    }

	setResources(resources) {
		this.resources = resources;
		
		return this;
	}

	set(name, resource, shared = true) {
		this.resources.set(name, resource, shared);
		
		return this;
	}
	
	static set(name, resource, shared = true) {
		return this.getInstance().set(name, resource, shared);
	}
	
	get(name, values) {	
		return this.resources.get(name, values);
	}
	
	static get(name, values) {
		return this.getInstance().get(name, values);
	}
}
/** ../updatableJs/src/common/AbstractController.js */

 class AbstractController {
	
	app;
	
	constructor(app) {
		this.app = app;
	}

	get(name, values) {
		return this.app.get(name, values);
    }
}
/** ../updatableJs/src/common/Chronometer.js */

 class Chronometer {
	
	startTime;
	stopTime;
	timeList = {};
   
	constructor() {
		this.start();
	}
   
	start() {
		this.startTime = Date.now();
	}
	
	stop() {
		this.stopTime = Date.now();
		
		return this.getTime();
	}
	
	getTime() {
		var result = this.stopTime - this.startTime;
        
		return result > 0 ? result : 0;
    }
	
	reset() {
		this.startTime = null;
		this.stopTime = null;
		this.timeList = [];
	}
	
	mark(key) {
		var time = Date.now();
		
		if (key) this.timeList[key] = time;
	
		return time - this.startTime;
	}

	display() {
		for (var key of Object.keys(this.timeList)) {
    		console.log(key + ' ' + this.timeList[key] - this.startTime)
		}
	}
}
/** ../updatableJs/src/component/AbstractComponentCallbacks.js */

 class AbstractComponentCallbacks {

	callbacks = {};
	
	onCreate() {
		if ('onCreate' in this.callbacks)
			this.callbacks.onCreate(this);
	}
	
	onRecreate() {
		if ('onRecreate' in this.callbacks)
			this.callbacks.onRecreate(this);
	}
	
	onAttach() {
		if ('onAttach' in this.callbacks)
			this.callbacks.onAttach(this);
	}

	onAncestorAttach(ancestor) {
		if ('onAncestorAttach' in this.callbacks)
			this.callbacks.onAncestorAttach(ancestor, this);
	}
	
	triggerOnAncestorAttach(ancestor) {}
	
	onDetach() {
		if ('onDetach' in this.callbacks)
			this.callbacks.onDetach(this);
	}
	
	onUpdate() {
		if ('onUpdate' in this.callbacks)
			this.callbacks.onUpdate(this);
	}
}
/** ../updatableJs/src/common/Util.js */

 class Util {
	
	static capitalizeFirstLetter(string) {
    	return string.charAt(0).toUpperCase() + string.slice(1);
	}
	
	static trimStart(string, trim) {
   		if (trim === undefined)
        	trim = '\\s';
    	
		return string.replace(new RegExp('^[' + trim + ']*'), '');
	}
	
	static trimEnd(string, trim) {
   		if (trim === undefined)
        	trim = '\\s';
    	
		return string.replace(new RegExp('[' + trim + ']*$'), '');
	}
	
	static isString(value) {
		return typeof value == 'string' || value instanceof String;
	}
	
	static hasTemplatePlaceholders(string) {
		return /\$\{.+\}/s.test(string);
	}
	
	static isEmptyObject(object) {
    	return Object.keys(object).length == 0;
	}
	
	static isObject(value) {
    	return typeof value == 'object' && value !== null;
	}
	
	static getProperty(object, keys, defaultValue) {
		if (!Array.isArray(keys))
			keys = keys.split('.');
		
		for (var key of keys) {
			if (!this.isObject(object)) 
				return defaultValue;
			
			object = object[key];
		}
		
		return object;
	}
	
	static getValue(value, ...args) {
		return typeof value == 'function' ? value(...args) : value;
	}
	
	static formatNumber(number) {
		if (typeof number != 'number') return number;
		
		var decimals;
		switch (true) {
			case number > 1000:
				decimals = 0;
				break;
				
			case number > 100:
				decimals = 1;
				break;
			  
			case number > 10:
				decimals = 2;
				break;
			  
			case number > 1:
				decimals = 4;
				break;
			  
			default:
				decimals = 16;
		}
		
		return number.toLocaleString(undefined, {maximumFractionDigits: decimals});
	}
	
	static escapeRegex(string) {
		return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'); 
	}
	
	static isAbsolutePath(path) {
		return /^[/\\]/.test(path);
	}
	
	isPath(path) {
		return /[/\\]/.test(path);
	}
}
/** ../updatableJs/src/component/AbstractComponent.js */



 class AbstractComponent extends AbstractComponentCallbacks {
	
	ignoredSetters = [];
	settersEnabled = false;
	parent;

	constructor(values) {		
		super();
		
		this.setDefaults();
			
		if (values)
			this.set(values);
	}
	
	// https://stackoverflow.com/questions/55479511/access-javascript-class-property-in-parent-class
	setDefaults() {}
	
	set(values) {
		var callbacks = ['onCreate', 'onRecreate', 'onAttach', 'onAncestorAttach', 'onDetach', 'onUpdate'];
		
		for (var [key, value] of Object.entries(values)) {
			var method = 'set' + Util.capitalizeFirstLetter(key);

			if (this.settersEnabled && !this.ignoredSetters.includes(key) && method in this) 
				this[method](value);
			else if (callbacks.includes(key))
				this.callbacks[key] = value;
			else
				this[key] = value;
		}
		
		return this;	
	}
	
	setIgnoredSetters(setters) {
		this.ignoredSetters = setters;
		
		return this;
	}
	
	setSettersEnabled(value) {
		this.settersEnabled = !!value;
		
		return this;
	}
	
	areSettersEnabled() {
		return this.settersEnabled;
	}
	
	attachTo(element) {}
	
	attachAfter(element) {}
	
	replace(element) {}
	
	detach() {}
	
	update(values) {}
	
	deepUpdate(values) {}
	
	recreate() {}
	
	isCreated() {}
	
	isAttached() {}
	
	getElement() {}
	
	hide() {}
	
	show() {}
	
	setParent(parent) {
		this.parent = parent;
		
		return this;
	}
	
	getParent() {
		return this.parent;
	}
}
/** ../updatableJs/src/component/Switch.js */


 class Switch extends AbstractComponent {

	_selected;
	
	setDefaults() {
		super.setDefaults();
		
		this.setSettersEnabled(true);
		
		this.set({	
			selected: null, // key, (component) => {}
			components: {}
		});
	}

	setSelected(key) {
		this.selected = key;
		
		return this;
	}
	
	getComponent(key) {
		return this.components[key];
	}
	
	setComponents(components) { 
		if (!this.components) this.components = {};
		
		for (var key of Object.keys(components)) {
			this.setComponent(key, components[key]);
		}
		
		return this;
	}
	
	setComponent(key, component) {
		this.components[key] = component.setParent(this);
		
		return this;
	}
	
	getSelected() {
		if (!this._selected) 
			this._selected = this._getSelectedComponent();
		
		return this._selected;
	}
	
	select(key) {
		if (key) this.setSelected(key);
		
		var selected = this._getSelectedComponent();
		if (selected != this.getSelected()) {
			if (this.getSelected().isAttached()) {
				selected.replace(this.getSelected().getElement());	
				this.getSelected().detach();
			}
			
			this._selected = selected;
		}
		
		return this;
	}
	
	_getSelectedComponent() {
		if (typeof this.selected == 'function')
			return this.components[this.selected()];
		
		return this.selected !== null ? 
			this.components[this.selected] : 
			this.components[Object.keys(this.components).shift()];
	}
	
	
	// Override
	
	attachTo(element) {
		this.getSelected().attachTo(element);
		
		return this;
	}
	
	appendTo(element) {
		this.getSelected().appendTo(element);
		
		return this;
	}
	
	triggerOnAncestorAttach(ancestor) {
		this.getSelected().triggerOnAncestorAttach(ancestor);
		
		return this;
	}
	
	prependTo(element) {
		this.getSelected().prependTo(element);
		
		return this;
	}
	
	attachAfter(element) {
		this.getSelected().attachAfter(element);
		
		return this;
	}
	
	replace(element) {
		this.getSelected().replace(element);
		
		return this;
	}
		
	recreate() {
		this.getSelected().recreate();

		return this;
	}

	detach() {
		this.getSelected().detach();
		
		return this;
	}

	update(values) {
		this.getSelected().update(values);

		return this;
	}
	
	deepUpdate(values) {
		this.getSelected().deepUpdate(values);

		return this;
	}

	isCreated() {
		return this.getSelected().isCreated();
	}

	isAttached() {
		return this.getSelected().isAttached();
	}
	
	getElement() {
		return this.getSelected().getElement();
	}
	
	hide() {
		this.getSelected().hide();
		
		return this;
	}
	
	show() {
		this.getSelected().show();
		
		return this;
	}
}
/** ../updatableJs/src/common/Locale.js */


// https://www.i18next.com/
 class Locale {

	translations = {};
	
	constructor(translations) {		
		if (translations)
			this.setTranslations(translations);
	}
	
	setTranslations(translations) {
		Object.assign(this.translations, translations);
	
		return this;
	}

	// options = {'plural' => 0, 1, 2, 3 ...};
	translate(value, values, options) {
		if (this.hasTranslation(value))
			value = this.translations[value];
		
		if (values) {
			value = value.replace(/\{\{([^}]+)\}\}/g, (match, p1) => {	
				var value = Util.getProperty(values, p1);

				return value !== undefined ? value : `{{${p1}}}`;
			});
		}

		return value;
	}
	
	hasTranslation(value) {
   		return value in this.translations;
	}
}
/** ../updatableJs/src/router/valuesContainer/valuesContainerFactory/AbstractValuesContainerFactory.js */

 class AbstractValuesContainerFactory {
	
	create(values) {}
}
/** ../updatableJs/src/router/valuesContainer/AbstractValuesContainer.js */


 class AbstractValuesContainer {
	
	values = {};
	
	constructor(values) {
		if (values) this.setValues(values);
	}
	
	setValues(values) {
		if (values instanceof AbstractValuesContainer)
			values = values.getValues();
		
		for (var [key, value] of Object.entries(values)) {
			var method = 'set' + Util.capitalizeFirstLetter(key);
			if (method in this) 
				this[method](value);
			else
				this.values[key] = value;
		}
		
		return this;
	}
	
	getValues() {
		return this.values;	
	}
}
/** ../updatableJs/src/router/valuesContainer/ValuesContainer.js */


 class ValuesContainer extends AbstractValuesContainer {}
/** ../updatableJs/src/router/valuesContainer/valuesContainerFactory/ValuesContainerFactory.js */



 class ValuesContainerFactory extends AbstractValuesContainerFactory {
	
	create(values) {
		return new ValuesContainer(values);
	}
}
/** ../updatableJs/src/router/AbstractRouteList.js */
// Uncaught ReferenceError: can't access lexical declaration 'AbstractRouteList' before initialization.




 class AbstractRouteList {

	routes = {};	
	valuesContainerFactory;

	match(url) {
		for (var route of Object.values(this.routes)) {
			var result = route.match(url);
			
			if (result) return result;
		}
	}
	
	setRoutes(routes) {
		for (var [key, route] of Object.entries(routes)) {
			this.setRoute(key, route);
		}
		
		return this;
	}
	
	// Uncaught ReferenceError: can't access lexical declaration 'AbstractRouteList' before initialization.
	/*setRoute(key, route) {
		if (!(route instanceof AbstractRoute))
			route = RouteFactory.create(route);
			
		this.routes[key] = route.setParent(this);
		
		return this;
	}*/
	
	getRoute(key) {
		return key in this.routes ? this.routes[key] : null;
	}
	
	getValuesContainerFactory() {
		if (!this.valuesContainerFactory)
			this.valuesContainerFactory = new ValuesContainerFactory();
		
		return this.valuesContainerFactory;
	}
	
	setValuesContainerFactory(valuesContainerFactory) {
		this.valuesContainerFactory = valuesContainerFactory;
		
		return this;
	}
}
/** ../updatableJs/src/router/AbstractRoute.js */



 class AbstractRoute extends AbstractRouteList {
	
	parent;
	path;
	routable = true; // If it is false, only the children's routes will be checked.
	values;
	
	constructor(values) {
		super();
		
		if (values) this.hydrate(values);
	}
	
	build() {}
	
    hydrate(values) {
		if ('values' in values) {
			values = Object.assign({}, values, values['values']);
				
			delete values.values;
		}
			
		var properties = ['path', 'routable', 'routes'];
		var _values = {};
		for (var [key, value] of Object.entries(values)) {
			if (!properties.includes(key)) {
				_values[key] = value;
					
				continue;
			}
				
			var method = 'set' + Util.capitalizeFirstLetter(key);
			if (method in this) 
				this[method](value);
			else
				this[key] = value;
		}
		
		this.setValues(_values);
	}
	
	setParent(parent) {
		this.parent = parent;
		
		return this;
	}
	
	getParent() {
		return this.parent;
	}
	
	setPath(path) {
		this.path = path;
		
		return this;	
	}
	
	getPath() {	
		if (Util.isAbsolutePath(this.path) || !(this.parent instanceof AbstractRoute)) 
			return this.path;
			
		var path = this.parent.getPath();
		if (path === undefined) return this.path;
		
		if (this.path === undefined) return path;
		
		return this.path.indexOf('[/') == 0 ? // [/:path]
			Util.trimEnd(path, '/') + this.path :
			Util.trimEnd(path, '/') + '/' + Util.trimStart(this.path, '/');
	}
	
	setRoutable(routable) {
		this.routable = !!routable;
		
		return this;
	}

	isRoutable() {
		return this.routable;
	}
	
	setValues(values) {
		this.values = values;

		return this;
	}
	
	getValues(values) {
		var result = this.getValuesContainerFactory().create();
		
		if (this.parent instanceof AbstractRoute)
			result.setValues(this.parent.getValues());
		
		if (this.values)
			result.setValues(this.values);
	
		if (values)
			result.setValues(values);
		
		return result.getValues();
	}
	
	getValuesContainerFactory() {
		return this.getParent().getValuesContainerFactory();
	}
}
/** ../updatableJs/src/router/Segment.js */


 class Segment extends AbstractRoute {
	
	//models = {};
	
	hydrate(values) {
		if ('models' in values) {
			values = Object.assign({}, values);
			
			this.setModels(values.models);
			
			delete values.models;
		}
		
		super.hydrate(values);
	}
	
	setRoute(key, route) {
		if (!(route instanceof AbstractRoute))
			route = Object.assign({}, {models: {}}, route); // Change Literal to Segment.

		return super.setRoute(key, route);
	}
	
	setModels(models) {
		this.models = models;
	}
	
	getModels() {
		var models;
		var parent = this.getParent();
		while (parent) {
			if (parent instanceof this.constructor) {
				models = parent.getModels();
				
				break;
			}
			
			parent = parent instanceof AbstractRoute ? parent.getParent() : null;
		}
		
		return Object.assign({}, models, this.models);
	}
	
	match(url) {
		if (!this.routable)
			return super.match(url);

		var result = this.getRegex().exec(url);
		if (result === null) 
			return super.match(url);
		
		var values = {};
		if (result.groups) {
			var models = this.getModels();
			for (var [key, value] of Object.entries(result.groups)) {
				if (value !== undefined && key in models)
					values[key] = value;
			}
		}
		
		return this.getValues(values);
	}
	
	build(values) {
		var values = this.getValues(values);
		var models = this.getModels();
		var path = this.replaceOptionalSegments(this.getPath(), '$1');
		for (var [key, value] of Object.entries(values)) {
			if (key in models)
				path = path.replace(':' + key, value);	
		}

		return path;
	}
	
	getRegex() {
		var regex = this.replaceOptionalSegments(`^${this.getPath()}$`, '($1)?');
		for (var [key, value] of Object.entries(this.getModels())) {
			regex = regex.replace(`:${key}`, `(?<${key}>${value})`);	
		}

		return new RegExp(regex);
	}
	
	// Ce se afla intre paranteze patrate este optional.
	// ex. [/:page], [/:controller[/:action]]
	replaceOptionalSegments(string, replacement) {
		var regex = /\[([^\[]+?)\]/g;
		while (regex.test(string))
			string = string.replace(regex, replacement);
		
		return string;
	}
}
/** ../updatableJs/src/router/Literal.js */


 class Literal extends AbstractRoute {
	
	match(url) {
		if (!this.routable)
			return super.match(url);
			
		return url == this.getPath() ?
			this.getValues() : super.match(url);
	}
	
	build() {
		return this.getPath();
	}
}
/** ../updatableJs/src/router/RouteFactory.js */



 class RouteFactory {
	
	static create(values) {
		return 'models' in values ? new Segment(values) : new Literal(values);
	}
}
/** ../updatableJs/src/router/Router.js */


 class Router extends AbstractRouteList {
	
	constructor(routes) {
		super();
		
		if (routes) 
			this.setRoutes(routes);
	}
	
	getRoute(key) {
		var keys = key.split('.');
		
		var route = super.getRoute(keys.shift());
		
		if (!route) return null;
	
		for (var key of keys){
			if (!(route = route.getRoute(key)))
				return null;
		}

		return route;
	}
}

// Uncaught ReferenceError: can't access lexical declaration 'AbstractRouteList' before initialization.



AbstractRouteList.prototype.setRoute = function(key, route) {
	if (!(route instanceof AbstractRoute))
		route = RouteFactory.create(route);
	
	this.routes[key] = route.setParent(this);
		
	return this;
}
/** ../updatableJs/src/events/EventHandler.js */

 class EventHandler {

	handler;
	values;
	mergeValues;
	removeAfterUse;

	// handler, values
	// [object, method], values
	constructor(handler, values, mergeValues, removeAfterUse) {
		if (Array.isArray(handler) && handler.length != 2) 
			throw 'Handler has a wrong format.';
			
		this.handler = handler;
		this.values = !Array.isArray(values) ? (values !== undefined ? [values] : []) : values;
		this.mergeValues = !!mergeValues;
		this.removeAfterUse = !!removeAfterUse;
	}
	
	trigger(values) {
		if (this.mergeValues) 
			values = values.concat(this.values);
		else if (!values.length)
			values = this.values;
	
		if (Array.isArray(this.handler)) {
			var [object, method] = this.handler;
					
			return object[method](...values);
		}
		else
			return this.handler(...values);	
	}
	
	shouldBeRemoved() {
		return this.removeAfterUse;
	}
}
/** ../updatableJs/src/events/Events.js */



 class Events {
	
	events = {};
	result;
	
	constructor(handlers) {
		if (handlers) this.setHandlers(handlers);
	}

	set(event, handler, values, mergeValues = true, removeAfterUse = false) {
		return this.setHandler(event, handler, values, mergeValues, removeAfterUse);
	}
	
	setSingleUseHandler(event, handler, values, mergeValues = true) {
		return this.setHandler(event, handler, values, mergeValues, true);
	}
	
	setHandler(event, handler, values, mergeValues = true, removeAfterUse = false) {
		if (handler !== undefined) {
			if (!(event in this.events))
				this.events[event] = [];
			
			this.events[event].push(new EventHandler(handler, values, mergeValues, removeAfterUse));
		}
		
		return this;
	}
	
	/*{
		event: 'handler', // Not array, it is difficult to differentiate a handler from a list of handlers.
		
		event: ['handler', ['object', 'method']],
		
		event => {
			handler: '',
			values: []
		},
		
		'event' => [
			{handler: '', values: []},		
			{handler: '', values: []}
		]
	}*/
	setHandlers(handlers) {
		for (var [key, value] of Object.entries(handlers)) {	
			this._setHandlers(key, Array.isArray(value) ? value : [value]);
		}

		return this;
	}
	
	_setHandlers(event, handlers) {
		for (var handler of handlers) {
			if (!Util.isObject(handler) || Array.isArray(handler)) {
				this.setHandler(event, handler);
			}
			else {
				var {handler, values = undefined, mergeValues = true, removeAfterUse = false} = handler;
				this.setHandler(event, handler, values, mergeValues, removeAfterUse);
			}
		}
		
		return this;
	}
	
	trigger(event, ...values) {
		this.result = undefined;
		
		if (!(event in this.events)) return this;
		
		for (var [index, handler] of this.events[event].entries()) { 
			var result = handler.trigger(values);

			if (handler.shouldBeRemoved())
				this.events[event].splice(index, 1);
			 
			// Break on result. 
			if (result !== undefined && result !== null) { 
				this.result = result;
				
				break;
			}
		}
		
		return this;
	}

	getResult() {
		return this.result;
	}
	
	remove(event, handler) {
		if (event in this.events) {
			if (handler)
				this.events[event] = this.events[event].filter(h => h !== handler);
			else 
				delete this.events[event];
		}
		
		return this;
	}
	
	clear() {
		this.events = {};
		
		return this;
	}
}
/** ../updatableJs/src/export.js */

// Component








// Common











// Resources




// Router






// Events




// Config

export var config = {
	initialize: undefined,
	classExists: undefined,
};


// Functions

export function _(value, regex) {
	return Component.sanitize(value, regex);
}

export function ___(value) {
	return Component.sanitize(Component.sanitize(value));
}


// Misc

// https://www.w3schools.com/tags/ref_eventattributes.asp
export var events = [
	// Window Events
	'onafterprint', 'onbeforeprint', 'onbeforeunload', 'onerror', 'onhashchange', 'onload', 'onmessage', 'onoffline', 
	'ononline', 'onpagehide', 'onpageshow', 'onpopstate', 'onresize', 'onstorage', 'onunload', 
		
	// Form Events
	'onblur', 'onchange', 'oncontextmenu', 'onfocus', 'oninput', 'oninvalid', 'onreset', 'onsearch', 'onselect', 'onsubmit', 
		
	// Keyboard Events
	'onkeydown', 'onkeypress', 'onkeyup', 
	
	// Mouse Events
	'onclick', 'ondblclick', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'onmousewheel', 'onwheel', 
	
	// Drag Events
	'ondrag', 'ondragend', 'ondragenter', 'ondragleave', 'ondragover', 'ondragstart', 'ondrop', 'onscroll', 
	
	// Clipboard Events
	'oncopy', 'oncut', 'onpaste', 
	
	// Media Events
	'onabort', 'oncanplay', 'oncanplaythrough', 'oncuechange', 'ondurationchange', 'onemptied', 'onended', 'onloadeddata', 
	'onloadedmetadata', 'onloadstart', 'onpause', 'onplay', 'onplaying', 'onprogress', 'onratechange', 'onseeked', 'onseeking', 
	'onstalled', 'onsuspend', 'ontimeupdate', 'onvolumechange', 'onwaiting', 
	
	// Misc Events
	'ontoggle'
];
export {Component,Updatable,Switch,Layout,AbstractApp,AbstractApi,LayoutManager,Chronometer,AbstractController,Fetcher,Locale,Util,Resources,Router,AbstractValuesContainerFactory,AbstractValuesContainer,Events};/** ../updatableJs/src/component/updatable/Updatable.js */


 class Updatable {
	
	component;
	template;
	contentGenerationMode = 'fill';
	singleUse = false;
	
	static noChange = '@#$';

	constructor(component) {
		this.component = component;
	}
	
	update() {}
	
	setTemplate(template) {
		this.template = template.replace(/\[u\]/g, '${')
			.replace(/\[\/u\]/g, '}')
			.replace(/\[lt\]/g, '<')
			.replace(/\[gt\]/g, '>');
			
		if (/^\s*\$\{\?/.test(this.template)) {
			this.singleUse = true;
			this.template = this.template.replace(/^\s*\$\{\?/, '${');
		}
		
		var regex = /^\s*\$\{\s*(.+?)\s*\}\s*$/s;
		var matches = regex.exec(this.template);
		if (matches && (!/\$\{/.test(matches[1]) || this.isJavaScript(matches[1]))) { // {{}} {{}} 
			this.template = matches[1];
			
			this.contentGenerationMode = 'eval';	
		}
	}
	
	isJavaScript(value) {
		return /(if|switch)\s*\(.*\)/.test(value);
	}
	
	generateContent() {
		try {
			var content;
			switch(this.contentGenerationMode) {
				case 'fill':
					content = this._fill();
					break;
					
				case 'eval':
					content = this._eval();
					break;
				
				default:
					throw `Unknown mode ${this.contentGenerationMode}.`;
			}
			
			return content !== undefined ? content : '';
		}
		catch(exception) {
			throw `Content generation error "${exception}" ${this.template}`; 
		}
	}

	_fill() {
		return function(template, updatable) {
			return eval('`' + template + '`');
		}.call(this.component, this.template, this);
	}
	
	_eval() {
		return function(template, updatable) {
			return eval(template);
		}.call(this.component, this.template, this);
	}
	
	isSingleUse() {
		return this.singleUse;
	}
}
/** ../updatableJs/src/component/updatable/AbstractUpdatableElement.js */





 class AbstractUpdatableElement extends Updatable {
	
	parentElement;
	previousSibling;
	elements = [];
	temporaryComponents = [];
	components = [];

	parse(string) {
		return new DOMParser().parseFromString(string, 'text/html').body;
	}
	
	update() {
		var previousSibling = this.previousSibling;
		if (this.elements.length > 0) {
			previousSibling = this.elements[0] instanceof AbstractComponent ? 
				this.elements[0].getElement().previousSibling : this.elements[0].previousSibling;
		}
		
		var content = this.generateContent();
		if (content == Updatable.noChange) return;

		this.removeTemporaryComponents();
		var components = this.components;
		this.components = [];
			
		var elements = this.prepareContent(content);
		
		// Remove old elements.
		
		for (var element of this.elements) {
			if (!(element instanceof AbstractComponent))
				element.remove();
		}
	
		for (var component of components) {
			if (!this.components.includes(component))
				component.detach();
		}	
		
		// Attach new elements.
		
		for (var element of elements) {
			if (!previousSibling) {
				if (element instanceof AbstractComponent) 
					element.prependTo(this.parentElement);
				else
					this.parentElement.prepend(element);	
			}
			else {
				if (element instanceof AbstractComponent) 
					element.attachAfter(previousSibling);
				else
					previousSibling.after(element);
			}
			
			previousSibling = element instanceof AbstractComponent ? element.getElement() : element;
		}

		this.elements = elements;
	}
	
	prepareContent(content) {
		if (!Array.isArray(content))
			content = [content];	
			
		var elements = [];
		for (var element of content) {		
			if (element instanceof AbstractComponent) {
				elements.push(element);
				this.component.components.set(element);
				this.temporaryComponents.push(element);
				this.components.push(element);
			}
			else if (element instanceof Node) {
				elements.push(element);
			}
			else {
				element = this.prepareAttributes(
					this.parse(this.component.prepareComponentTags(String(element))));

				for (var element of element.childNodes) {
					if (element.tagName) {
						if (element.tagName.toLowerCase() == 'component')
							element = this.prepareComponent(element);
						else
							this.prepareComponents(element); 	
					}

					elements.push(element);
				}
			}
		}
		
		return elements;
	}
	
	prepareAttributes(element) {
		var selector = '[' + events.join('], [') + ']';
		for (var e of element.querySelectorAll(selector)) {
			this._prepareAttributes(e); 
		}
		
		return element;
	}
	
	_prepareAttributes(element) {
		Array.from(element.attributes).forEach(attribute => {								   
			if (/^on/.test(attribute.localName) && /\bthis\.\w+/.test(attribute.value)) {
				var template = attribute.value;
				var type = attribute.localName.replace(/^on/, '');
					
				element.addEventListener(type, function(event) {
					var e = event;
					
					eval(template);
				}.bind(this.component));
	
				element.removeAttribute(attribute.localName);
			}
		});
	}
	
	prepareComponents(element) {
		for (var element of element.querySelectorAll('component')) {
			this.prepareComponent(element, true); 
		}
	}
	
	prepareComponent(element, replace = false) {
		if (element.hasAttribute('id')) {
			if (!this.component.components.has(element.id)) {
				var component = this.component.initComponent(element);
				this.component.components.setWithId(element.id, component);
					
				if (element.hasAttribute('temporary'))
					this.temporaryComponents.push(component);	
			}
			else
				var component = this.component.components.get(element.id);
		}
		else {
			var component = this.component.initComponent(element);
			this.component.components.set(component);
			this.temporaryComponents.push(component);
		}
		
		if (replace) component.replace(element);
		
		this.components.push(component);
		
		return component;	
	}
	
	removeTemporaryComponents() {
		if (this.temporaryComponents.length) {
			this.component.components.removeComponents(this.temporaryComponents);
			
			this.temporaryComponents = [];
		}
	}	
}
/** ../updatableJs/src/component/updatable/UpdatableElement.js */


 class UpdatableElement extends AbstractUpdatableElement {

	constructor(element, component) {
		super(component);
		this.parentElement = element.parentNode;
		this.previousSibling = element.previousSibling;
		this.elements = [element];
		this.setTemplate(element.textContent);
	}
}
/** ../updatableJs/src/component/updatable/UpdatableTable.js */


 class UpdatableTable extends AbstractUpdatableElement {
	
	constructor(element, component) {
		super(component);
		this.setTemplate(element.textContent.replace(/^\(table\)/, ''));
		var tr = element.parentNode.closest('tr');
		this.previousSibling = tr.previousSibling;
		this.parentElement = tr.parentNode;
		tr.remove();
	}

	parse(string) {	
		return super.parse(`<table><tbody>${string}</tbody></table>`).querySelector('tbody');
	}
}
/** ../updatableJs/src/component/updatable/UpdatableAttribute.js */



 class UpdatableAttribute extends Updatable {
	
	attribute;

	constructor(attribute, component) {
		super(component);
		
		this.attribute = attribute;
			
		this.setTemplate(attribute.value);
	}

	update() {
		var value = this.generateContent();
		if (Util.isString(value))
			value = value.trim();

		this.attribute.value = value;
	}
}
/** ../updatableJs/src/component/updatable/UpdatableBooleanAttribute.js */



// https://stackoverflow.com/questions/10650233/checked-checked-vs-checked-true
// https://stackoverflow.com/questions/426258/setting-checked-for-a-checkbox-with-jquery/5916151#5916151
 class UpdatableBooleanAttribute extends Updatable {
	
	attribute;
	element;

	constructor(attribute, component) {
		super(component);
		this.attribute = attribute;
		this.setTemplate(attribute.value.replace(/^\(bool\)/, ''));
		this.element = attribute.ownerElement;
		this.element.removeAttributeNode(attribute);
	}

	update() {
		var value = this.generateContent();
		if (Util.isString(value))
			value = value.trim();
			
		if (value) {
			this.attribute.value = value;
			this.element.setAttributeNode(this.attribute);
			this.element[this.attribute.localName] = true;
		}
		else if (this.element.hasAttribute(this.attribute.localName)) {
			this.element.removeAttributeNode(this.attribute);
			this.element[this.attribute.localName] = false;
		}
	}
}
/** ../updatableJs/src/component/updatable/UpdatableFactory.js */





 class UpdatableFactory {
	
	static create(node, component) {
		switch(node.nodeType) {
			case Node.TEXT_NODE:
				return /^\(table\)/.test(node.textContent) ? 
					new UpdatableTable(node, component) : new UpdatableElement(node, component);
					
			case Node.ATTRIBUTE_NODE:
				var booleanAttributes = ['checked', 'selected'];
				
				return booleanAttributes.includes(node.localName) || /^\(bool\)/.test(node.value) ? 
					new UpdatableBooleanAttribute(node, component) : new UpdatableAttribute(node, component);

			default:
   				throw `Unknown node type ${node.nodeType}.`;
		}
	}
}
/** ../updatableJs/src/component/UpdatableList.js */

 class UpdatableList {
	
	updatables = [];
	
	setUpdatables(updatables) {
		this.updatables = this.updatables.concat(updatables);
		
		return this;
	}
	
	setUpdatable(updatable) {
		this.updatables.push(updatable);
		
		return this;
	}
	
	getUpdatables() {
		return this.updatables;
	}
	
	update() {
		var singleUse = [];
		for (var updatable of this.updatables) {
			if (updatable.isSingleUse())
				singleUse.push(updatable);
			
			updatable.update();
		}
		
		if (singleUse.length)
			this.removeUpdatables(singleUse);
	}

	remove(updatable) {
		this.updatables = this.updatables.filter(u => u != updatable);
	}

	removeUpdatables(updatables) {
		this.updatables = this.updatables.filter(updatable => !updatables.includes(updatable));
		
		return this;
	}
	
	isEmpty() {
		return !this.updatables.length;
	}
}
/** ../updatableJs/src/component/ComponentList.js */

 class ComponentList {
	
	components = [];
	idsToComponents = {};
	
	set(component) {
		this.components.push(component);
		
		return this;
	}
	
	setWithId(id, component) {
		this.set(component);
		
		this.idsToComponents[id] = component;
		
		return this;
	}
	
	get(id) {
		return id in this.idsToComponents ? this.idsToComponents[id] : null;
	}
	
	has(id) {
		return id in this.idsToComponents;
	}
	
	update() {
		for (var component of this.components) {
    		component.update();
		}

		return this;
	}
	
	deepUpdate() {
		for (var component of this.components) {
    		component.deepUpdate();
		}

		return this;
	}
	
	removeComponents(components) {
		this.components = this.components.filter(component => !components.includes(component));
		
		for (var id of Object.keys(this.idsToComponents)) {
			if (components.includes(this.idsToComponents[id]))
				 delete this.idsToComponents[id];
		}
		
		return this;
	}
	
	intersect(components) {
		if (components instanceof this.constructor)
			components = components.toArray();
		
		this.components = this.components.filter(component => components.includes(component));
		
		for (var id of Object.keys(this.idsToComponents)) {
			if (!components.includes(this.idsToComponents[id]))
				 delete this.idsToComponents[id];
		}
		
		return this;
	}
	
	toArray() {
		return this.components;
	}
	
	clone() {
		var ob = new this.constructor();
		ob.components = [...this.components];
		Object.assign(ob.idsToComponents, this.idsToComponents);
		
		return ob;
	}
}
/** ../updatableJs/src/component/Component.js */








 class Component extends AbstractComponent {

	element;
	attachedTo;
	updatables = new UpdatableList();
	components = new ComponentList();
	updateCount = 0;
	executionTimes = {};
	
	setDefaults() {
		this.set({
			fetching: false	
		});
	}
	
	getTemplate() {}
	
	attachTo(element) {
		return this.appendTo(element);
	}
	
	prependTo(element) {
		element.prepend(this.getElement());
		this._setAttachedTo(element);
		
		return this;
	}
	
	appendTo(element) {
		element.append(this.getElement());
		this._setAttachedTo(element);
		
		return this;
	}

	attachAfter(element) {
		element.after(this.getElement());
		this._setAttachedTo(element.parentNode);
			
		return this;
	}
	
	replace(element) {		
		var attachedTo = element.parentNode;
		attachedTo.replaceChild(this.getElement(), element);
		this._setAttachedTo(attachedTo);
			
		return this;
	}
	
	_setAttachedTo(attachedTo) {	
		var isAttached = this.isAttached();
		this.attachedTo = attachedTo;
		if (!isAttached) {
			this.onAttach();
    		this.triggerOnAncestorAttach(this);
		}
	}

	triggerOnAncestorAttach(ancestor) {
		if (ancestor != this)
			this.onAncestorAttach(ancestor);
		
		for (var component of this.components.toArray()) {
			component.triggerOnAncestorAttach(ancestor);
		}
	}
	
	detach() {
		if (this.element)
			this.element.remove();

		if (this.isAttached()) 
			this.onDetach();

		this.attachedTo = undefined;

		return this;
	}
	
	update(values, deepUpdate = false) {
		if (values) this.set(values);

		if (this.element) {
			var chronometer = new Chronometer();
			
			if (deepUpdate) {
				var components = this.components.clone();
				this.updatables.update();
				components.intersect(this.components).deepUpdate();
			}
			else
				this.updatables.update();
			
			this.executionTimes.update = chronometer.stop();
			
			
			
			if (this.executionTimes.update > 30) {
				/*console.log('executionTimes');
				console.log(this);
				console.log(this.executionTimes);
				console.log('///////////////////////');*/
			}
			
			
			
			
			this.updateCount++;
			
			this.onUpdate();
		}

		return this;
	}
	
	deepUpdate(values) {
		return this.update(values, true);	
	}
	
	recreate() {
		if (!this.element) return this;
		
		this.updatables = new UpdatableList();
		this.components = new ComponentList();
		
		var element = this.element;
		delete this.executionTimes.create;
		this.createElement();
	
		if (this.isAttached())
			this.attachedTo.replaceChild(this.element, element);
			
		this.onRecreate();
		
		return this;
	}
	
	isAttached() {
		return !!this.attachedTo;
	}
	
	isCreated() {
		return !!this.element && 'create' in this.executionTimes;
	}
	
	
	// Element
	
	getElement() {
		if (!this.element) {
			this.createElement();
			this.onCreate();
		}
		
		return this.element;
	}

	createElement() {
		var chronometer = new Chronometer();
		this.element = this.parse(this.prepareTemplate(this.getTemplate()));
		this.element.remove(); // this.element.isConnected becomes false
		this.prepareElement(this.element);
		this.updatables.update();
		this.executionTimes.create = chronometer.stop();	
	}

	prepareTemplate(template) {
		template = this.prepareComponentTags(
			this.asperandSanitizing(template));
		
		function prepare(template) {
			return template.replace(/\{\{(.+?)\}\}/gs, (match, p1) => {									
				if (/\{\{/.test(p1))
					return '{{' + prepare(p1 + '}}');
			
				var matches = /^[?@]+/.exec(p1);
				if (matches) {
					var length = matches[0].split('@').length - 1;
					if (length) {
						p1 = p1.replace(/^[?@]+/, '');
						
						p1 = `${matches[0].replace(/@/g, '')}${length > 1 ? `_(_(${p1}))` : `_(${p1})`}`;	
					}
				}
			
				return '[u]' + p1.replace(/</g, '[lt]')
					.replace(/>/g, '[gt]') + '[/u]';
			});
		}
		
		while (/\{\{.+?\}\}/s.test(template)) {
			template = prepare(template);	
		}
		
		return this.prepareTemplateSpecialCases(template);
	}
	
	asperandSanitizing(template) {
		var re = new RegExp(
			'(?:' 
				+ '(@+)' 
				+ '|'
				+ '(\\[[^\\]]+\\])' 
			+ ')' 
			
			+ '\\{([^}]+)\\}', 
			
			'g'
		);
		
		template = template.replace(/[$`]/g, '\\$&')
			.replace(re, (match, p1, p2, p3) => {												
				if (p2) return `\${Component.sanitize(${p3}, '${p2}')}`;
				
				return p1.length > 1 ? `\${Component.sanitize(Component.sanitize(${p3}))}` : 
					`\${Component.sanitize(${p3})}`;
			});
		
		return eval('`' + template + '`');
	}

	prepareTemplateSpecialCases(template) {
		// If you are using a RegExp object, you must double escape \s*, \$, \{, \}
		var regex = /(<table.*?>|<tbody.*?>|<thead.*?>|<tfoot.*?>|<\/tr>)\s*(\[u\].+?\[\/u\])\s*(<\/table>|<\/tbody>|<\/thead>|<\/tfoot>|<tr.*?>)/gs;
		
		return template.replace(regex, (match, p1, p2, p3) => {
			return `${p1}<tr><td>(table)${p2}</td></tr>${p3}`;	
		});
	}
	
	prepareComponentTags(template) {
		return template.replace(/<([a-z0-9_]+)([^>]*)\/>/gi, (match, p1, p2) => 
			config.classExists(p1) ? `<component type="${p1}"${p2}></component>` : match);
	}
	
	hasUpdatables(template) {
		return /\[u\].+\[\/u\]/s.test(template);
	}
	
	static removeReserved(template) {
		var regex = /\[u\]|\[\/u\]|\[lt\]|\[gt\]/g;
		while (regex.test(template)) {
			template = template.replace(regex, '');	
		}
		
		return template;
	}
	
	static sanitize(value, regex) {
		if (regex) return String(value).replace(new RegExp(regex, 'g'), '');
		
		var characters = {
			'<': '&lt;',
			'>': '&gt;',
			'{': '&lcub;',
			'}': '&rcub;',
			'[': '&lsqb;',
			']': '&rsqb;',
			'(': '&lpar;',
			')': '&rpar;',
			'@': '&commat;',
			'?': '&quest;',
			'&': '&amp;',
			'"': '&quot;',
			'\'': '&apos;',
			':': '&colon;',
			';': '&semi;',
			'.': '&period;',
			'\\': '&bsol;',
			'$': '&dollar;'
		};
		
		var re = new RegExp('[' + Util.escapeRegex(Object.keys(characters).join('')) + ']', 'g');
				
		return this.removeReserved(String(value)).replace(re, (match) => {									
			return characters[match];
		});	
	}

	prepareElement(element) {
		for (var childNode of element.childNodes) {
			switch(childNode.nodeType) {
				case Node.ELEMENT_NODE:
					if (childNode.tagName.toLowerCase() == 'component') {
						var component = this.initComponent(childNode).replace(childNode);
				
						if (childNode.hasAttribute('id'))
							this.components.setWithId(childNode.id, component);
						else
							this.components.set(component);
					}
					else
						this.prepareElement(childNode);
					
					break;
				
				case Node.TEXT_NODE:
					if (this.hasUpdatables(childNode.textContent)) 
						this.updatables.setUpdatable(UpdatableFactory.create(childNode, this));
	
    				break;
			} 
		}
		
		this.prepareAttributes(element);
	}
	
	prepareAttributes(element) {
		Array.from(element.attributes).forEach(attribute => {
			if (/^on/.test(attribute.localName)) {
				if (/\bthis\.\w+/.test(attribute.value)) {
					var template = attribute.value;
					var type = attribute.localName.replace(/^on/, '');
					
					element.addEventListener(type, event => {
						var e = event;
					
						eval(template);
					});

					element.removeAttribute(attribute.localName);
				}
			}
			else if (this.hasUpdatables(attribute.value)) {
				this.updatables.setUpdatable(UpdatableFactory.create(attribute, this));
			}
		});
	}
	
	initComponent(element) {		
		if (element.hasAttribute('src')) {
			var source = Util.getValue(Util.getProperty(this, element.getAttribute('src')));
		}
		else {
			var source = {};
			var ignore = ['id', 'type'];
			var attrs = element.attributes;
			for (var i = 0; i < attrs.length; i++) {
				if (!ignore.includes(attrs[i].name))
					source[attrs[i].name] = attrs[i].value;
			}	
		}

		var type = Util.capitalizeFirstLetter(element.getAttribute('type'));
		
		if (source instanceof AbstractComponent) {
			if (type != 'Component' && type != source.constructor.name) 
				throw `Source ${source.constructor.name} is not instanceof ${type}.`;
			
			return source.setParent(this);
		}
		else {
			if (type == 'Component') 
				throw `If type is Component, source must be instanceof AbstractComponent.`;
			
			return config.initialize(type, source).setParent(this);
		}
	}

	parse(string) {
		return new DOMParser().parseFromString(string, 'text/html').body.firstChild;
	}
	

	// Misc
	
	getComponent(id) {
		return this.components.get(id);
	}
	
	getUpdateCount() {
		return this.updateCount;
	}
	
	setFetching(value) {
		this.fetching = value;
		
		return this;
	}

	isFetching() {
		return this.fetching;
	}
	
	hide() {
		this.element.style.display = 'none';
	}
	
	show() {
		this.element.style.display = 'block';
	}
	
	querySelector(selectors) {
		return this.element.querySelector(selectors);
	}
	
	querySelectorAll(selectors) {
		return this.element.querySelectorAll(selectors);
	}	
}




















/** ../updatableJs/src/component/Layout.js */


 class Layout extends Component {

	parse(string) {
		return new DOMParser().parseFromString(string, 'text/html').body;
	}
}
/** ../updatableJs/src/common/LayoutManager.js */




 class LayoutManager {
	
	currentLayout;
	layouts;
	
	constructor(layouts) {
		this.layouts = layouts ? layouts : new Resources();
	}

	changeLayout(layout, key) {
		if (key) this.setLayout(key, layout);	
				
		if (this.currentLayout == layout) return;
		
		if (layout instanceof Layout) {
			layout.replace(document.querySelector('body'));
		}
		else {
			var body = document.createElement('body');
			document.querySelector('body').replaceWith(body);

			layout.attachTo(document.querySelector('body'));
		}
		
		if (this.currentLayout)
			this.currentLayout.detach();
		
		this.currentLayout = layout;
	}
	
	setLayout(key, layout, shared = true) {
		return this.layouts.set(key, layout, shared);	
	}
	
	getLayout(key, values) {
		return this.layouts.get(key, values);
	}
	
	hasLayout(key) {
		return this.layouts.has(key);
	}
}
