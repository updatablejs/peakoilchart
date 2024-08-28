
import {AbstractApi, _url} from '../../import.js';

export class Legal extends AbstractApi { 	

	getPrivacyPolicy() {
		return this.getFetcher(_url(`/api/en/legal/privacy-policy`))
			.setContentType('text');
	}

	getTermsAndConditions() {
		return this.getFetcher(_url(`/api/en/legal/terms-and-conditions`))
			.setContentType('text');
	}
}
