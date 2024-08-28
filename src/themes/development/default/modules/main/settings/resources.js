
import {App} from '../import.js';
import {Resources} from '../import.js';
import config from './config.js';
import {Main} from '../library/api/Main.js';
import {Legal} from '../library/api/Legal.js';

export default new Resources()
	.set('config', config)
	
	.set('dependencies', {
		config: {
			check: () => 'contact' in App.getConfig('main'),
			fetch: () => App.getApi('main').get('main').getConfig().fetch(),
			store: (result) => Object.assign(App.getConfig('main'), result.content)
		}
	})
	
	.set('api', () => {
		return new Map().set('main', new Main())
			.set('legal', new Legal());
	});
