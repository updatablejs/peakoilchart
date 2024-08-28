

import {App} from './library/App.js';


// UpdatableJs

import {Component, Util, config, Fetcher, Events} from './library/vendor/updatableJs/updatableJs.js';

config.initialize = function(name, ...values) {
	return new (eval(name))(...values);
};

config.classExists = function(name) {
	try {
		eval(name);
			
		return true;
	} 
	catch (e) {
		return false;
	}
};


// Views

import {Dropdown, Structure, Selector, Expandable, Search, Table, Tabs, Pages, Chart, Dialog, Task} from './library/vendor/views/views.js';


/**
 * Modules
 */

import resources from './settings/resources.js';
App.getInstance().setResources(resources);

// Main 

import {Main as Main_, Legal, Errors, initialize as main} from './modules/main/main.js';
main(); 

// Stats 

import {Main, Category, Country, Nav, PeakChart, Sparkline, Footer, initialize as stats} from './modules/stats/stats.js';
stats(); 


// Initialize

window.addEventListener('DOMContentLoaded', (event) => {	
	window.onpopstate = function(event) {
		App.getInstance().loadRouteByPath(window.location.pathname, false);
	}
	
	App.getInstance().loadRouteByPath(window.location.pathname, false);

	document.querySelector('html').addEventListener('click', event => {	
		var a = event.target.closest('a');
		if (a && a.href) {		
			var url = new URL(a.href);
				
			var re = App.get('config').host instanceof RegExp ? 
				App.get('config').host : new RegExp(`^${App.get('config').host}$`);
				
			if (re.test(url.host)) {
				event.preventDefault();	
					
				if (event._replaceState)
					window.history.replaceState(window.history.state, '', url);	
				else 
					App.getInstance().loadRouteByPath(url);
			}
		}	
	});
});


/*
window.addEventListener('error', (event) => {
	console.log(event);
});


window.addEventListener('unhandledrejection', (event) => {
	console.log(event);
	//console.log(event.promise); // [object Promise] - the promise that generated the error
	//console.log(event.reason); // Error: Whoops! - the unhandled error object
});
*/


		