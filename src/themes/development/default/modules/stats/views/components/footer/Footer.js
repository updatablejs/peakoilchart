
import {Component, _url} from '../../../import.js';

export class Footer extends Component {
	
	setDefaults() {
		super.setDefaults();
		
		this.set({
			source: null
		});
	}
	
	getTemplate() {
		return `<div class="footer">
			<div class="content">
				<div class="logo"></div>
				<div class="copyright">&#169; PeakOilChart</div>
	
				<ul class="legal">
					<li><a href="${_url('/privacy-policy')}">Privacy Policy</a></li>
					<li><a href="${_url('/terms-and-conditions')}">Terms of use</a></li>
				</ul>
	
				<ul class="misc">
					<li><a href="${_url('/contact')}">Contact</a></li>
				</ul>
				
				<div class="subscribe"></div>
			</div>
			
			<div class="content">
				<ul class="social">
					<li><a href="[^\\\\w/:.-]{this.source}" class="icon-github button image-left" target="_blank">Download <br>source code</a></li>
				</ul>
			</div>
		</div>`;
	}
}
