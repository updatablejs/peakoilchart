
import {App} from '../import.js';
import {Events} from '../controllers/Events.js';

export default {
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
