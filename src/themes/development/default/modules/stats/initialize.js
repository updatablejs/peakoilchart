
import {App, Events} from './import.js';
import {Common} from './views/layouts/common/Common.js';
import resources from './settings/resources.js';
import routes from './settings/routes.js';

export function initialize() {
	App.get('modules').set('stats', resources);
	
	App.get('router').setRoute('stats', {
		module: 'stats',
		routable: false,
		events: {
			dependencies: {
				handler: [new Events(App.getInstance()), 'dependencies'],
				values: ['stats.config', 'stats.categories']
			}
		},
		routes: routes
	});
	
	App.get('layoutManager').setLayout('stats.common', () => {
		var layout = new Common({
			footer: {
				source: App.getConfig('stats').source	
			}						
		});
			
		layout.getHeader().setItems(
			App.getModule('stats').get('categories').toArray());
		
		return layout;
	});
}
