
import {App} from './import.js';
import {Events} from './controllers/Events.js';
import resources from './settings/resources.js';
import routes from './settings/routes.js';

export function initialize() {
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
