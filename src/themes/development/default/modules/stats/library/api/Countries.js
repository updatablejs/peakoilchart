
import {AbstractApi, _url} from '../../import.js';

export class Countries extends AbstractApi { 

	getList() {
		return this.getFetcher(_url(`/api/countries/list`));
	}
}
