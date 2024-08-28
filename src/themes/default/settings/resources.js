
import {Resources, LayoutManager, Router, Chronometer,
	AbstractValuesContainerFactory, AbstractValuesContainer} from '../library/vendor/updatableJs/updatableJs.js';
import config from './config.js';

export default new Resources()
	.set('chronometer', new Chronometer())
	
	.set('config', config)
	
	.set('layoutManager', new LayoutManager())
	
	.set('router', () => {
		// https://www.geeksforgeeks.org/can-we-instantiate-an-abstract-class-in-java/
		var valuesContainerFactory = new AbstractValuesContainerFactory(); // {};
		valuesContainerFactory.create = function(values) {
			var valuesContainer = new AbstractValuesContainer(); 
			
			valuesContainer.setEvents = function(events) {
				var inherit = 'inherit' in events ? !!events.inherit : true; 
				
				this.values.events = inherit ? 
					Object.assign({}, this.values.events, events) : 
					Object.assign({}, events);
					
				delete this.values.events.inherit; 
			};
			
			if (values) valuesContainer.setValues(values);
			
			return valuesContainer;
		};
	
		return new Router().setValuesContainerFactory(valuesContainerFactory);
	})
	
	.set('modules', new Map());
