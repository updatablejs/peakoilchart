
import {Component, Util} from '../../../import.js';

export class Sparkline extends Component {

	setDefaults() {
		this.set({
			displayed: false,
			
			sparkline: {
				width: '148px', 
				height: '64px',
				lineWidth: 1.5,
				fillColor: false,
				spotColor: false,
				minSpotColor: false,
				maxSpotColor: false,
				highlightSpotColor: 'red',			
				tooltipFormatter: function(sparkline, options, fields) {	
					var date = new Date(fields.x * 1000).toLocaleString([], {year:'numeric', month:'short'});
					
					return `<div class="sparkline-tooltip">
						<div class="date">${date}</div> ${Util.formatNumber(fields.y)}</div>`;	
				}
			}
		});
	}

	getTemplate() {
		return `<div class="sparkline">
			<div class="placeholder" style="display: {{this.isDisplayed() ? 'none' : 'block'}}"></div>
			<div class="content"></div>
		</div>`;
	}

	display(values) {
		$(this.querySelector('.content')).sparkline(values, this.sparkline);	
		
		this.setDisplayed(true).update();
		
		return this;
	}
	
	isDisplayed() {
		return this.displayed;
	}
	
	setDisplayed(value) {
		this.displayed = !!value;
		
		return this;
	}
}
