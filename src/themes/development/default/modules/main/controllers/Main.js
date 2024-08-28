
import {App, Controller, Switch, Task} from '../import.js';
import {Contact} from '../views/components/contact/Contact.js';

export class Main extends Controller {

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
