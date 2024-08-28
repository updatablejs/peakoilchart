
import {App, Controller, Util, Task} from '../import.js';

export class Events extends Controller {
	
	/* I made a class DependencyImporterManager but it's too complicated. */
	dependencies(id, ...keys) {		
		var fetch = [];
		this._getDependencies(keys).forEach((dependency) => {
			if (!dependency.check()) {
				if (!dependency.call) {
					dependency.call = dependency.fetch().then((result) => {
						dependency.store(result);
						
						return result;
					})
					.finally(() => {
						delete dependency.call;  
					});	
				}
				
				fetch.push(dependency.call);
			}
		});
		
		if (fetch.length) {
			return new Task({				
				task: (component) => {
					return Promise.all(fetch);	
				},
								
				onSuccess: (result, component) => {
					if (this.isChangeLayoutAllowed(id)) {
						var layout = App.getController(this.route.controller)
							['action' + Util.capitalizeFirstLetter(this.route.action)](id);	
						
						if (layout)
							App.getInstance().changeLayout(layout);	
					}
				}
			});
		}
	}
	
	_getDependencies(keys) {
		var result = [];
		for (var key of keys) {
			var [module, dependency] = key.split('.');

			result.push(App.getModule(module).get('dependencies')[dependency]);
		}

		return result;
	}
}
