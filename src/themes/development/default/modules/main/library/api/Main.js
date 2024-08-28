
import {AbstractApi, _url} from '../../import.js';

export class Main extends AbstractApi { 	

	getConfig() {
		return this.getFetcher(_url(`/api/config`));
	}
}
