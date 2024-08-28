
import {App, Component, Util, _url, _} from '../../../import.js';

export class Contact extends Component {

	setDefaults() {
		super.setDefaults();
		
		this.set({
			items: {}
		});
	}
	
	getTemplate() {
		return `<div class="content contact">
			<h1>Contact</h1>
			<ul>${this.buildList()}</ul> 
		</div>`;	
	}
	
	buildList() {
		var result = '';
		for (var [key, item] of Object.entries(this.items)) {
			if (item.href) {
				var value = `<a href="${item.href}" target="_blank" class="button image-left ${item.icon ? _(_(item.icon)) : ''} inline-block">
					${_(item.value)}	
				</a>`;
				
			}
			else {
				var value = `<span class="image-left ${item.icon ? _(_(item.icon)) : ''}">
					${_(item.value)}	
				</span>`;
			}
			
			result += `<li>${value}</li>`;
		}
		
		return result;
	}

	setItems(items) {
		this.items = items;	
		
		return this;
	}
}
