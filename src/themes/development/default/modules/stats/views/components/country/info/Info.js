
import {Table, Util} from '../../../../import.js';

export class Info extends Table {

	setDefaults() {
		super.setDefaults();
		
		this.set({
			category: null,

			columns: {
				name: {
					name: '', 
					class: 'text-right name',
					value: (index, values) => values.name
				},
				
				value: {
					name: 'Value',
					class: 'text-left value',
					value: (index, values) => {						
						if (!values.measure_unit)
							return Util.formatNumber(values.value);
						
						return `<span class="tooltip" data-tooltip="${values.measure_unit.name}">
								${Util.formatNumber(values.value)} ${values.measure_unit.symbol}
							</span>`;
					}
				},
				
				date: {
					name: 'Date', 
					class: 'text-left date',
					value: (index, values) => new Date(values.updated_at).toLocaleString([], {year:'numeric', month:'short'})
				},
				
				y1: {
					name: '<span class="tooltip" data-tooltip="One year change">1Y</span>',
					class: (location) => {
						return location == 'thead' ? 'text-right y1 tooltip-activation-area' : 'text-right y1';
					},
					value: (index, values) => values.y1 ? 
						`<span class="${values.y1 > 0 ? 'text-green' : 'text-red'}">${Util.formatNumber(values.y1)} %</span>` : '-'
				},

				y10: {
					name: '<span class="tooltip" data-tooltip="Ten year change">10Y</span>',
					class: (location) => {
						return location == 'thead' ? 'text-right y10 tooltip-activation-area' : 'text-right y10';
					},
					value: (index, values) => values.y10 ? 
						`<span class="${values.y10 > 0 ? 'text-green' : 'text-red'}">${Util.formatNumber(values.y10)} %</span>` : '-'
				},
				
				perCapita: {
					name: 'Per Capita',
					class: 'text-right per-capita', 
					value: (index, values) => {
						var measureUnit = values.measure_unit;
						if (values.category_id == 33) {
							measureUnit = {
								symbol: 'CM',
								name: 'Cubic meters'
							};
						}
						
						var perCapita = values.per_capita ? 
							(values.category_id == 33 ? 
							 	Util.formatNumber(values.per_capita * 1000000000000) : Util.formatNumber(values.per_capita)) : '-'
						
						return `<span class="tooltip" data-tooltip="${measureUnit.name}">
								${perCapita} <span class="measure-unit">${measureUnit.symbol}</span> 
							</span>`;
					}
				},
	
				rank: {
					name: 'Rank', 
					class: 'text-center rank',
					value: (index, values) => values.rank
				},
				
				worldShare: {
					name: 'World Share', 
					class: 'text-right world-share', 
					value: (index, values) => `${Util.formatNumber(values.world_share)} %`
				}		
			}
		});
	}
	
	getTemplate() {
		var rows = this.getRows(this.category);

		return `<table class="default info">
			<thead>
				<tr>
					${Object.entries(this.getColumns()).map(([key, column]) => {
						return key != 'name' ? 
							`<th class="${Util.getValue(column.class, 'thead')}">${column.name}</th>` : 
							`<th colspan="${rows[1] ? rows[1] : 1}"></th>`;
					}).join('')}
				</tr>
			</thead>
						
			<tbody>${rows[0].join('')}</tbody>
		</table>`;
	}

	getColumns() {
		var columns = {
			1: ['name', 'value', 'date', 'y1', 'y10', 'perCapita', 'worldShare', 'rank'], // Oil
			3: ['name', 'value', 'date', 'y1', 'y10', 'worldShare', 'rank'], // Population
			10: ['name', 'value', 'date', 'y1', 'y10', 'perCapita', 'worldShare', 'rank'], // Gas
			11: ['name', 'value', 'date', 'y1', 'y10', 'perCapita', 'worldShare', 'rank'], // Coal
			12: ['name', 'value', 'date', 'y1', 'y10', 'perCapita', 'worldShare', 'rank'] // Electricity
		};
		
		var result = {};
		for (var column of columns[this.category.category_id]) {
			result[column] = this.columns[column];
		}
		
		return result;
	}

	buildRow(index, values) {
		return `<tr>		
			${Object.entries(this.getColumns()).map(([key, column]) => {			
				return `<td class="${Util.getValue(column.class, 'tbody')}">
						${column.value(index, values)}
					</td>`;			
			}).join('')}
		</tr>`
	}
	
	getRows(category, level) {
		level = level || 0;
			
		if (!category.categories.length) {
			return [
				[this.buildRow(null, category)], level];
		}	

		var maxLevel = level + 1;
		var results = category.categories.map(category => {
			var result = this.getRows(category, level + 1);
			if (result[1] > maxLevel)
				maxLevel = result[1];
			
			return result;	
		});
			
		var rows = [];
		results.forEach(result => {
			if (result[1] < maxLevel)
				result[0][0] = result[0][0].replace(`<td`, `<td colspan="${maxLevel - result[1] + 1}"`);
			
			rows = rows.concat(result[0]);
		});
			
		if (level > 0) {
			var rowSpan = `${rows.length > 1 ? `rowspan="${rows.length}"` : ``}`;
			rows[0] = rows[0].replace(`<tr>`, `<tr><td class="text-right name" ${rowSpan}>${category.name}</td>`);
		}
		else {
			for (var i = 0; i < rows.length; i++) {
				if (i > 5)
					rows[i] = rows[i].replace(`<tr>`, `<tr class="more">`);
			}
		}
			
		return [rows, maxLevel];
	}
}
