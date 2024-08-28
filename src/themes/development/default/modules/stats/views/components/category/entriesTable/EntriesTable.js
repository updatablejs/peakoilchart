
import {App, Util, Table, _url} from '../../../../import.js';

export class EntriesTable extends Table {
	
	sparklineValuesCall;

	setDefaults() {
		super.setDefaults();
		
		this.set({
			intersectionObserverEnabled: true,
			category: {},
			maxRows: 30,
			sparklineValues: {},
			columns: {
				rank: {
					name: '#', 
					class: 'text-center rank',
					value: (index, values) => {
						return ++index;
					}
				},
				
				name: {
					name: 'Country', 
					class: 'text-left name', 
					sortable: 'country.name',
					value: (index, values) => {
						var url = `/${this.category.getRoot().getSlug()}/${values.country.slug}`;
						
						if (this.category.category_id != 3) 
							url += `?subcategory=${this.category.category_id}`;

						return `<a href="${_url(url)}"> 
								${values.country.code ? `<span class="fflag fflag-${values.country.code} ff-md ff-app"></span>` : ''}
								<span>${values.country.name}</span>
							</a>`;
					}
				},
				
				value: {
					name: () => {
						if (this.category.category_id == 3)
							return 'Value';
							
						return `<span class="tooltip" data-tooltip="${this.category.measure_unit.name}">
								Value <span class="measure-unit">(${this.category.measure_unit.symbol})</span>
							</span>`;	
					},
					class: (location) => {
						return this.category.category_id != 3 ? 
							(location == 'thead' ? 'text-right value tooltip-activation-area' : 'text-right value') : 'text-right value';
					},	
					sortable: 'value', 
					value: (index, values) => Util.formatNumber(values.value)
				},
				
				date: {
					name: 'Date', 
					class: 'text-right date',
					value: (index, values) => {
						return new Date(values.updated_at).toLocaleString([], {year:'numeric', month:'short'});
					}
				},
				
				y1: {
					name: '<span class="tooltip" data-tooltip="One year change">1Y</span>',
					class: (location) => {
						return location == 'thead' ? 'text-right y1 tooltip-activation-area' : 'text-right y1';
					},
					sortable: 'changes.y1.percentage',
					value: (index, values) => {
						return 'y1' in values.changes ? 
							`<span class="${values.changes.y1.percentage > 0 ? 'text-green' : 'text-red'}">
								${Util.formatNumber(values.changes.y1.percentage)} %</span>` : '-';	
					}
				},
				
				y10: {
					name: '<span class="tooltip" data-tooltip="Ten year change">10Y</span>',
					class: (location) => {
						return location == 'thead' ? 'text-right y10 tooltip-activation-area' : 'text-right y10';
					},
					sortable: 'changes.y10.percentage',
					value: (index, values) => {
						return 'y10' in values.changes ? 
							`<span class="${values.changes.y10.percentage > 0 ? 'text-green' : 'text-red'}">
								${Util.formatNumber(values.changes.y10.percentage)} %</span>` : '-';	
					}
				},
					
				perCapacity: {
					name: () => {
						return `<span class="tooltip" data-tooltip="Production per 1 MW of installed capacity">
								Per Capacity <span class="measure-unit">(${this.category.measure_unit.symbol})</span>
							</span>`;
					},
					class: 'text-right per-capacity', 
					sortable: 'per_capacity',
					value: (index, values) => values.per_capacity ? Util.formatNumber(values.per_capacity) : '-' 
				},
					
				perCapita: {
					name: () => {
						var measureUnit = this.category.measure_unit;
						if (this.category.category_id == 33) {
							measureUnit = {
								symbol: 'CM',
								name: 'Cubic meters'
							};
						}
						
						return `<span class="tooltip" data-tooltip="${measureUnit.name}">
								Per Capita <span class="measure-unit">(${measureUnit.symbol})</span>
							</span>`;
					},
					class: (location) => {
						return location == 'thead' ? 'text-right per-capita tooltip-activation-area' : 'text-right per-capita';
					},
					sortable: 'per_capita', 
					value: (index, values) => {
						return values.per_capita ? 
							(this.category.category_id == 33 ? 
							 	Util.formatNumber(values.per_capita * 1000000000000) : Util.formatNumber(values.per_capita)) : '-';
					}
				},
				
				worldShare: {
					name: 'World Share', 
					class: 'text-right world-share', 
					sortable: 'world_share',
					value: (index, values) => `${Util.formatNumber(values.world_share)} %`
				},
				
				_sparkline: {
					name: 'Chart', 
					class: 'text-center _sparkline',
					value: (index, values) => {
						return `<Sparkline id="${values.country.country_id}" temporary />`;
					}
				}
			}
		});
	}
	
	getTemplate() {
		return `<div class="entries">
			<table class="default">
  				<thead>
					<tr>		
						${Object.entries(this.getColumns()).map(([key, column]) => {	
							var _class = Util.getValue(column.class, 'thead');	
								
							if (column.sortable)
								_class += ` sortable {{this.isSortedBy('${column.sortable}') ? this.getSortOrder() : ''}}`;
					
							return `<th class="${_class}" ${column.sortable ? `onclick="this.sortBy('${column.sortable}')"` : ''}>
									${Util.getValue(column.name)}
								</th>`;
						}).join('')}
					</tr>
				</thead>
				<tbody>{{this.populate()}}</tbody>
			</table>
			
			<button class="button showAll" type="button" onclick="this.eventHandlers.showAll();" 
				style="display: {{this.maxRows !== null && this.maxRows < this.values.length  ? 'block' : 'none'}}">Show All</button>
  		</div>`;
	}
	
	eventHandlers = {
		showAll: () => {
			this.maxRows = null;
			
			this.update();
		}
	};

	populate() {
		var values = this.maxRows !== null ? 
			this.values.slice(0, this.maxRows) : this.values;
		
		return values.map((values, index) => {
			return this.buildRow(index, values);
		}).join('');
	}

	buildRow(index, values) {
		return `<tr data-id="${values.country.country_id}">
			${Object.entries(this.getColumns()).map(([key, column]) => {
				return `<td class="${Util.getValue(column.class, 'tbody')}">
						${column.value(index, values)}
					</td>`;			
			}).join('')}
		</tr>`;
	}

	getColumns() {
		var columns = Object.assign({}, this.columns); 
		if (this.category.category_id == 3)
			delete columns.perCapita;
		
		if (![43, 46, 49, 52, 55, 58, 61].includes(this.category.category_id))
			delete columns.perCapacity;
		
		return columns;
	}

	sortValues(sortBy, sortOrder) {
		this.values.sort((a, b) => {
			a = Util.getProperty(a, sortBy);
			b = Util.getProperty(b, sortBy);
			
			if (a === undefined) return 1;	
			if (b === undefined) return -1;

			if (a < b) return sortOrder == 'asc' ? -1 : 1;
	  		if (a > b) return sortOrder == 'asc' ? 1 : -1;
	  
  			return 0;
		});
	}


	// IntersectionObserver
	
	getSparklineValuesCall() {
		if (!this.sparklineValuesCall) {
			this.sparklineValuesCall = App.getApi('stats').get('categories')
				.getSparklines(this.category.category_id)			
				.then(response => {
					this.sparklineValues = response.content;
				})
				.fetch();	
		}
		
		return this.sparklineValuesCall;
	}
	
	getIntersectionObserverCallback() {
		return (entries, observer) => {
			entries.forEach(entry => {		
				if (entry.isIntersecting) {
					var callback = () => {
						if (this.hasSparklineValues(entry.target.dataset.id)) {
							this.components.get(entry.target.dataset.id).display(
								this.sparklineValues[entry.target.dataset.id]);
						}
					};
					
					if (this.hasSparklineValues())
						callback();
					else
						this.getSparklineValuesCall().then(callback);
				
      				observer.unobserve(entry.target);
   				}
			});
		};
	}

	hasSparklineValues(id) {
		return id != undefined ? 
			id in this.sparklineValues : !Util.isEmptyObject(this.sparklineValues);
	}
}
