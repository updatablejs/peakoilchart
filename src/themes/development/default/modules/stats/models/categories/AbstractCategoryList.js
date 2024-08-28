

export class AbstractCategoryList {
	
	categories = [];
	
	setCategories(categories) {}
	
	getCategory(id) {
		return this.getCategories([id]).shift();
	}
	
	getCategories(ids) {
		if (!ids) return this.categories;
		
		var result = [];
		for (var category of this.categories) {
			if (ids.includes(category.category_id))
				result.push(category);
			
			result = result.concat(category.getCategories(ids));
		}
		
		return result;
	}	
	
	hasCategories() {
		return !!this.categories.length;
	}
		
	getCategoryBySlug(slug) {
		var slugs = !Array.isArray(slug) ? slug.split('/') : [...slug];
		var slug = slugs.shift();
		for (var category of this.categories) {
			if (category.slug == slug)
				return slugs.length ? category.getCategoryBySlug(slugs) : category;
		}
	}
	
	idTokey(id) {
		for (var i = 0; i < this.categories.length; i++) {
			if (this.categories[i].category_id == id) return `${i}`;
			
			var key = this.categories[i].idTokey(id);
			
			if (key) return `${i}.${key}`;
		}
	}	
}	
