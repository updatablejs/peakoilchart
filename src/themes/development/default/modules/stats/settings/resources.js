
import {App} from '../import.js';
import {Resources} from '../import.js';
import config from './config.js';
import {Categories} from '../library/api/Categories.js';
import {Countries} from '../library/api/Countries.js';
import {Main} from '../library/api/Main.js';

export default new Resources()
	.set('config', config)
	
	.set('dependencies', {
		config: {
			check: () => 'donate' in App.getConfig('stats'),
			fetch: () => App.getApi('stats').get('main').getConfig().fetch(),
			store: (result) => Object.assign(App.getConfig('stats'), result.content)
		},
			
		categories: {
			check: () => App.getModule('stats').has('categories'),
			fetch: () => App.getApi('stats').get('categories').getList().fetch(),
			store: (result) => App.getModule('stats').set('categories', result.content)
		},
			
		countries: {
			check: () => App.getModule('stats').has('countries'),
			fetch: () => App.getApi('stats').get('countries').getList().fetch(),
			store: (result) => App.getModule('stats').set('countries', result.content)
		},

		measureUnits: {
			check: () => App.getModule('stats').has('measureUnits'),
			fetch: () => App.getApi('stats').get('main').getMeasureUnits().fetch(),
			store: (result) => App.getModule('stats').set('measureUnits', result.content)
		}
	})
	
	.set('api', () => {
		return new Map().set('main', new Main())
			.set('categories', new Categories())
			.set('countries', new Countries());
	});
