
import {App, Controller, Switch, Task} from '../import.js';
import {Error} from '../views/components/error/Error.js';

export class Errors extends Controller {

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
