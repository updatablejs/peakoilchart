
import {App, Events} from '../import.js';

export default {
	main: {
		controller: 'main',
		routable: false,
		routes: {
			peakOilChart: {
				path: '/peak-oil-chart',
				action: 'peakOilChart'
			},
			
			donate: {
				path: '/donate',
				action: 'donate',
			},
			
			categoryOrCountry: {
				path: '/:slug',
				models: {
					slug: '[\\w\\-/]+'
				},
				action: 'categoryOrCountry',
				events: {
					dependencies: {
						handler: [new Events(App.getInstance()), 'dependencies'],
						values: ['stats.config', 'stats.categories', 'stats.countries']
					}	
				}
			}
		}
	}
};
