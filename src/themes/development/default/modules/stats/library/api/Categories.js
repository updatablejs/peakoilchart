
import {AbstractApi, _url} from '../../import.js';
import {Category} from '../../models/categories/Category.js';
import {Categories as CategoryList} from '../../models/categories/Categories.js';

export class Categories extends AbstractApi { 
	
	getList() {
		return this.getFetcher(_url(`/api/categories/list`))
			.then(response => { 
				response.content = new CategoryList(response.content)
				
				return response;	  
			});
	}
	
	getLatestEntries(categoryId) {
		return this.getFetcher(_url(`/api/categories/${categoryId}/latest-entries`));
	}
	
	getGroupedEntries(categoryId, excludedCountries) {
		return this.getFetcher(_url(`/api/categories/${categoryId}/grouped-entries?` + new URLSearchParams({
   				'excludedCountries': excludedCountries
			})));
	}
	
	getSparklines(categoryId) {
		return this.getFetcher(_url(`/api/categories/${categoryId}/sparklines`));
	}
	
	getCountryEntries(countryId, categoryId) {
		return this.getFetcher(_url(`/api/categories/${categoryId}/entries/${countryId}`));
	}
	
	getCountryValues(countryId, categoryId) {
		return this.getFetcher(_url(`/api/categories/${categoryId}/country-values/${countryId}`))
			.then(response => { 
				response.content = new Category(response.content);
				
				return response;	  
			});
	}
}
