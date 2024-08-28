
import {Util} from '../import.js';

export default {
	lineChartOptions: {
		chart: {
       		type: 'line',
    		zoomType: 'x',
		},
			
		title: {
       	 	text: null
    	},
			
		exporting: {
			enabled: false
		},

   		yAxis: {                
			opposite: true,
			tickPixelInterval: 80,
			gridLineColor: '#F5F5F5',
       		title: {
				text: null
        	},
   			labels: {
     			align: 'left'
   			}
   		},
			
		xAxis: {
			type: 'datetime',
			title: {
				text: null
        	}
		},
			
		tooltip: {
			crosshairs: [true],
			shared: true,
    		borderWidth: 0,
			split: false,
			xDateFormat: '%b %Y',
			
          	pointFormatter: function() {
				var valueSuffix = 'valueSuffix' in this.series.options.tooltip ? this.series.options.tooltip.valueSuffix : '';

				return `<span style="color:${this.series.color}">&#9679;</span>  
					${this.series.name}: <b>${Util.formatNumber(this.y)}${valueSuffix}</b><br/>`;	
			}
		},
			
		plotOptions: {
			series: {
				color: '#2962ff',
				dataGrouping: {
					enabled: false
				},
				showInLegend: false
			}
		}
	}
};
