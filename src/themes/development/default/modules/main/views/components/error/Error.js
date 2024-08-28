
import {App, Component, Util, _url} from '../../../import.js';

export class Error extends Component {

	setDefaults() {
		super.setDefaults();
		
		this.set({
			title: null,
			message: null
		});
	}
	
	getTemplate() {
		return `<div class="content error">
			<h1 class="title">@{this.title}</h1>
			<div class="message">@{this.message}</div>
		</div>`;	
	}
}
