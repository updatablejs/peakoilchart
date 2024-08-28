
import {App, Util, Controller, Switch, Task} from '../import.js';
import {Common} from '../../stats/export.js';

export class Legal extends Controller {

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
