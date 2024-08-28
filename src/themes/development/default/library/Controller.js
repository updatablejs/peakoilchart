
import {AbstractController} from './vendor/updatableJs/updatableJs.js';

export class Controller extends AbstractController {
	
	get route() {
		return this.get('route');	
	}

	getModule(name) {
		return this.app.getModule(name);
	}
	
	loadRoute(name, values, pushState) {
		return this.app.loadRoute(name, values, pushState);
	}
	
	setTitle(title) {
		document.title = title;
	}

	getApi(module) {
		return this.app.getApi(module);
	}
	
	getConfig(module) {
		return this.app.getConfig(module);
	}


	// Layout
	
	getLayoutManager() {
		return this.get('layoutManager');	
	}
	
	changeLayout(layout, key) {
		this.get('layoutManager').changeLayout(layout, key);	
		
		return this;
	}
	
	getLayout(key, values) {
		return this.get('layoutManager').getLayout(key, values);	
	}
	
	hasLayout(key) {
		return this.get('layoutManager').hasLayout(key);	
	}
	
	setChangeLayoutIntention(id) {
		return this.app.setChangeLayoutIntention(id);	
	}
	
	isChangeLayoutAllowed(id) {
		return this.app.isChangeLayoutAllowed(id);	
	}
}
