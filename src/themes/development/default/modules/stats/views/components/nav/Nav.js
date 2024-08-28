
import {Component} from '../../../import.js';

export class Nav extends Component {

	constructor(values) {
		values = Object.assign({}, values);
		values.structure.onSelect = key => {
			this._close();
			this.onSelect(key);
		};
			
		values.structure.floatation = true;
			
		super(values);
	}

	setDefaults() {
		super.setDefaults();
		
		this.set({
			opened: false,
			structure: {},
			onSelect: key => {}
		});
	}
	
	/* In order not to change the style of the buttons in css file, the component can be made resize aware and when the page size changes, 
		update the component and change the button class underline or non underline (if page size is less than 768px). */
	getTemplate() {
		return `<div class="nav {{this.isOpen() ? 'opened' : ''}}">
			<div class="content">
				<button type="button" class="image-button close" onclick="this.close()"></button>
				<Structure id="structure" src="structure" />
			</div>
					
			<div class="overlay" onclick="this.close()"></div>
		</div>`;	
	}
	
	isOpen() {
		return this.opened;
	}
	
	open() {
		this.opened = true;
		this.update();
	}
	
	close() {
		this.getComponent('structure').close();
		this._close();
	}
	
	_close() {
		this.opened = false;
		this.update();
	}
	
	setActive(key) {
		this.getComponent('structure').setActive(key);

		return this;
	}
	
	clearActive() {
		this.getComponent('structure').clearActive();
			
		return this;
	}
}
