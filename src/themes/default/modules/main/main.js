import {App} from '../../library/App.js';
			import {Controller} from '../../library/Controller.js';
			import {_url} from '../../library/functions.js';
			import {Component,Switch,Layout,Util,AbstractApi,Resources,Locale,_} from '../../library/vendor/updatableJs/updatableJs.js';
			import {Task,Selector,Expandable} from '../../library/vendor/views/views.js';
			import {Common} from '../stats/stats.js';
			/** themes/default/modules/main/import.js */








/** themes/default/modules/main/views/components/error/Error.js */


 class Error extends Component {

	setDefaults() {
		super.setDefaults();
		
		this.set({
			title: null,
			message: null
		});
	}
	
	getTemplate() {
		return `<div class="content error">
			<h1 class="title">@{this.title}</h1>
			<div class="message">@{this.message}</div>
		</div>`;	
	}
}
/** themes/default/modules/main/controllers/Errors.js */



 class Errors extends Controller {

	actionNotFound() {
		this.setTitle('Not Found');
		
		this._displayError(new Error({
			title: 404,
			message: 'Page not found.'	
		}));
	}

	actionError() {
		this.setTitle('Internal error');	
		
		this._displayError(new Error({
			title: 'Internal error',
			message: 'Something went wrong, try again later.'	  
		}));
	}
	
	_displayError(error) {	
		var layout = this.getLayout('stats.common').setContent(error)
			.setStickyFooterEnabled(true);
		
		layout.getHeader().clearActive();
		
		this.changeLayout(layout.update());
	}
}
/** themes/default/modules/main/controllers/Events.js */


 class Events extends Controller {
	
	/* I made a class DependencyImporterManager but it's too complicated. */
	dependencies(id, ...keys) {		
		var fetch = [];
		this._getDependencies(keys).forEach((dependency) => {
			if (!dependency.check()) {
				if (!dependency.call) {
					dependency.call = dependency.fetch().then((result) => {
						dependency.store(result);
						
						return result;
					})
					.finally(() => {
						delete dependency.call;  
					});	
				}
				
				fetch.push(dependency.call);
			}
		});
		
		if (fetch.length) {
			return new Task({				
				task: (component) => {
					return Promise.all(fetch);	
				},
								
				onSuccess: (result, component) => {
					if (this.isChangeLayoutAllowed(id)) {
						var layout = App.getController(this.route.controller)
							['action' + Util.capitalizeFirstLetter(this.route.action)](id);	
						
						if (layout)
							App.getInstance().changeLayout(layout);	
					}
				}
			});
		}
	}
	
	_getDependencies(keys) {
		var result = [];
		for (var key of keys) {
			var [module, dependency] = key.split('.');

			result.push(App.getModule(module).get('dependencies')[dependency]);
		}

		return result;
	}
}
/** themes/default/modules/main/controllers/Legal.js */



 class Legal extends Controller {

	actionPrivacyPolicy(id) {
		this.setTitle('Privacy Policy');
		
		this._legal('privacyPolicy', id);
	}
	
	actionTermsAndConditions(id) {
		this.setTitle('Terms and Conditions');

		this._legal('termsAndConditions', id);
	}
	
	_legal(page, id) {
		var task = new Task({
			task: (component) => {
				var method = 'get' + Util.capitalizeFirstLetter(page);
				
				return this.getApi('main').get('legal')[method]().fetch();
			},
						
			onSuccess: (result, component) => {	
				if (this.isChangeLayoutAllowed(id)) {	
					this.changeLayout(this.getLayout('stats.common')
						.setContent(result).update());
				}
			}
		});

		var layout = this.getLayout('stats.common').setContent(task)
			.setStickyFooterEnabled(true);
		
		layout.getHeader().clearActive();
		
		this.changeLayout(layout.update());
	}
}
/** themes/default/modules/main/views/components/contact/Contact.js */


 class Contact extends Component {

	setDefaults() {
		super.setDefaults();
		
		this.set({
			items: {}
		});
	}
	
	getTemplate() {
		return `<div class="content contact">
			<h1>Contact</h1>
			<ul>${this.buildList()}</ul> 
		</div>`;	
	}
	
	buildList() {
		var result = '';
		for (var [key, item] of Object.entries(this.items)) {
			if (item.href) {
				var value = `<a href="${item.href}" target="_blank" class="button image-left ${item.icon ? _(_(item.icon)) : ''} inline-block">
					${_(item.value)}	
				</a>`;
				
			}
			else {
				var value = `<span class="image-left ${item.icon ? _(_(item.icon)) : ''}">
					${_(item.value)}	
				</span>`;
			}
			
			result += `<li>${value}</li>`;
		}
		
		return result;
	}

	setItems(items) {
		this.items = items;	
		
		return this;
	}
}
/** themes/default/modules/main/controllers/Main.js */



 class Main extends Controller {

	actionMain(id) {}
	
	actionContact(id) {
		this.setTitle('Contact');
		
		var layout = this.getLayout('stats.common').setContent(
				new Contact().setItems(this.getConfig('main').contact)
			)
			.setStickyFooterEnabled(true);
		
		layout.getHeader().clearActive();
		
		this.changeLayout(layout.update());
	}
}
/** themes/default/modules/main/settings/config.js */

var _1dfc65e4b527d9f9 =  {};
/** themes/default/modules/main/library/api/Main.js */


 class MainApi extends AbstractApi { 	

	getConfig() {
		return this.getFetcher(_url(`/api/config`));
	}
}
/** themes/default/modules/main/library/api/Legal.js */


 class LegalApi extends AbstractApi { 	

	getPrivacyPolicy() {
		return this.getFetcher(_url(`/api/en/legal/privacy-policy`))
			.setContentType('text');
	}

	getTermsAndConditions() {
		return this.getFetcher(_url(`/api/en/legal/terms-and-conditions`))
			.setContentType('text');
	}
}
/** themes/default/modules/main/settings/resources.js */var config = _1dfc65e4b527d9f9;






var _b70d37efbeb24af5 =  new Resources()
	.set('config', config)
	
	.set('dependencies', {
		config: {
			check: () => 'contact' in App.getConfig('main'),
			fetch: () => App.getApi('main').get('main').getConfig().fetch(),
			store: (result) => Object.assign(App.getConfig('main'), result.content)
		}
	})
	
	.set('api', () => {
		return new Map().set('main', new MainApi())
			.set('legal', new LegalApi());
	});
/** themes/default/modules/main/settings/routes.js */



var _17f2c5b909462dfa =  {
	main: {
		controller: 'main_',
		routable: false,
		routes: {
			main: {
				path: '/',
				module: 'stats',
				action: 'main',
				controller: 'main',
				events: {
					dependencies: {
						handler: [new Events(App.getInstance()), 'dependencies'],
						values: ['main.config', 'stats.config', 'stats.categories', 'stats.countries']
					}	
				}
			},
			
			contact: {
				path: '/contact',
				action: 'contact',	
			}
		}
	},
	
	legal: {
		controller: 'legal',
		routable: false,
		routes: {
			privacyPolicy: {
				path: '/privacy-policy',
				action: 'privacyPolicy'
			},
			
			termsAndConditions: {
				path: '/terms-and-conditions',
				action: 'termsAndConditions'
			}
		}
	},
	
	errors: {
		controller: 'errors',
		routable: false,
		routes: {
			notFound: {
				path: '/not-found',
				action: 'notFound'
			},
			
			error: {
				path: '/error',
				action: 'error'
			}
		}
	}
};
/** themes/default/modules/main/initialize.js */var resources = _b70d37efbeb24af5;var routes = _17f2c5b909462dfa;





 function initialize() {
	App.get('modules').set('main', resources);
	
	App.get('router').setRoute('main', {
		module: 'main',
		routable: false,
		events: {
			dependencies: {
				handler: [new Events(App.getInstance()), 'dependencies'],
				values: ['main.config', 'stats.config', 'stats.categories']
			}
		},
		routes: routes
	});
}
/** themes/default/modules/main/export.js */

// Controllers






// Initialize


export {Main,Legal,Errors,initialize};