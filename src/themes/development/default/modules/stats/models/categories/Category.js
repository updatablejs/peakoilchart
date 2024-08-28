
import {Util} from '../../import.js';
import {AbstractCategoryList} from './AbstractCategoryList.js';

export class Category extends AbstractCategoryList {
	
	category_id;
	name;
	measure_unit;
	updated_at;
	slug;
	parent;
	
	constructor(values) {		
		super();
		
		for (var [key, value] of Object.entries(values)) {
			var method = 'set' + Util.capitalizeFirstLetter(key);
			if (method in this) 
				this[method](value);
			else
				this[key] = value;	
		}
	}

	setCategories(categories) {
		for (var category of categories) {
			this.categories.push(
				new this.constructor(category).setParent(this));
		}
		
		return this;
	}
	
	setParent(parent) {
		this.parent = parent;
		
		return this;
	}

	hasParent() {
		return this.parent !== undefined;
	}
	
	getParent() {
		return this.parent;
	}

	getSlug() {
		return this.parent ? `${this.parent.getSlug()}/${this.slug}` : this.slug;
	}

	getRoot() {
		return this.hasParent() ? this.parent.getRoot() : this;
	}	

	getName() {
		return this.parent ? `${this.parent.getName()} / ${this.name}` : this.name;
	}
	
	getNameAsArray() {
		var result = this.parent ? this.parent.getNameAsArray() : [];
		result.push(this.name);
		
		return result;
	}
}
