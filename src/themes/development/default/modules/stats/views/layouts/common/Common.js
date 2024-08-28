
import {Layout, _url} from '../../../import.js';
import {Header} from '../../components/header/Header.js';

export class Common extends Layout {

	setDefaults() {
		super.setDefaults();
		
		this.set({
			header: new Header(),
			footer: {},
			content: null,
			stickyFooter: true
		});
	}
	
	getTemplate() {
		return `<body class="{{this.isStickyFooterEnabled() ? 'sticky-footer' : ''}}">
			<Component src="header" id="header"/>
			{{if (this.content) {
				this.content;
			}}}
			<Footer src="footer" id="footer"/>
		</body>`;	
	}
	
	setContent(content) {
		this.content = content;
		
		return this;
	}
	
	getHeader() {
		return this.header;	
	}
	
	isStickyFooterEnabled() {
		return this.stickyFooter;
	}
	
	setStickyFooterEnabled(value) {
		this.stickyFooter = !!value;
		
		return this;
	}
}
