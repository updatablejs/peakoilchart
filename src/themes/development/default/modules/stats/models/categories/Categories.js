
import {AbstractCategoryList} from './AbstractCategoryList.js';
import {Category} from './Category.js';

export class Categories extends AbstractCategoryList {
	
	constructor(categories) {	
		super();
		
		if (categories)
			this.setCategories(categories);
	}
	
	setCategories(categories) {
		for (var category of categories) {
			this.categories.push(new Category(category));
		}
		
		return this;
	}

	toArray() {
		return this.categories;
	}	
}
