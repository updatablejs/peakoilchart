

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

import {Main as Main_, Legal, Errors, initialize as main} from './modules/main/export.js';
main(); 

// Stats 

import {Main, Category, Country, Nav, PeakChart, Sparkline, Footer, initialize as stats} from './modules/stats/export.js';
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



class a {
	fooo = 'aaaaa';
}

var b = a;

const ca = 'caaaaa';
const cb = ca;


function fa() {
	console.log('faaaaa');	
}

var fb = fa;


var tttt =  function foo() {
  console.log("Hi");
}




window.addEventListener('DOMContentLoaded', (event) => {	
		
	setTimeout(function () {	 
		console.log('ready');
		
		var el = document.querySelector('#testTable');
		if (!el) return;

		el.addEventListener('click', function(event) {
			console.log('bo!');
			
			
			
			var test = new b();
			
			console.log(test); 
			console.log(cb); 
			fb();
			
			
			
			return;





			var dialog = new Dialog({
				title: 'Donations appreciated and help us continue to provide valuable and updat',
				content: 'All donations are appreciated and help us continue to provide valuable and updated information about global energy.',						
			});
			console.log(dialog);
			
			dialog.attachTo(document.querySelector('body'));
			//dialog.attachTo(document.querySelector('.testdialog'));
			return;

										
		});
	}, 2000);
});







	
	
	

	


			
				
				
				
				
			