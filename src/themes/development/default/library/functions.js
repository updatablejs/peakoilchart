
import {Util} from './vendor/updatableJs/updatableJs.js';
import {App} from './App.js';

export function _url(url) {
	return App.get('config').sitePath + url;
}
