import {App} from '../../library/App.js';
			import {Controller} from '../../library/Controller.js';
			import {_url} from '../../library/functions.js';
			//import {Events} from '../main/controllers/Events.js';
			import {Component,Switch,Layout,Util,AbstractApi,Resources,Locale,_} from '../../library/vendor/updatableJs/updatableJs.js';
			import {Task,AggregateChart,MultiSeriesChart,ChartCard,Table,Selector,Expandable,Structure,Dialog} from '../../library/vendor/views/views.js';
			/** themes/default/modules/stats/import.js */



 class Events extends Controller {
	
	/* I made a class DependencyImporterManager but it's too complicated. */
	dependencies(id, ...keys) {		
		var fetch = [];
		this._getDependencies(keys).forEach((dependency) => {
			if (!dependency.check()) {
				if (!dependency.call) {
					dependency.call = dependency.fetch().then((result) => {
						dependency.store(result);
						
						return result;
					})
					.finally(() => {
						delete dependency.call;  
					});	
				}
				
				fetch.push(dependency.call);
			}
		});
		
		if (fetch.length) {
			return new Task({				
				task: (component) => {
					return Promise.all(fetch);	
				},
								
				onSuccess: (result, component) => {
					if (this.isChangeLayoutAllowed(id)) {
						var layout = App.getController(this.route.controller)
							['action' + Util.capitalizeFirstLetter(this.route.action)](id);	
						
						if (layout)
							App.getInstance().changeLayout(layout);	
					}
				}
			});
		}
	}
	
	_getDependencies(keys) {
		var result = [];
		for (var key of keys) {
			var [module, dependency] = key.split('.');

			result.push(App.getModule(module).get('dependencies')[dependency]);
		}

		return result;
	}
}






/** themes/default/modules/stats/views/components/category/entriesTable/EntriesTable.js */


 class EntriesTable extends Table {
	
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
/** themes/default/modules/stats/views/components/category/Category.js */



 class CategoryComponent extends Component {
	
	constructor(category) {
		var excluded = App.getQuery('excluded');
		
		var values = {
			category: category,	
			
			tabs: {
				active: App.hasQuery('tab') ? 
					App.getQuery('tab') : 'countries',	
				
				eventExtra: {
					_replaceState: true
				},
				
				items: {
					countries: {
						value: 'Countries',
						href: '?tab=countries'
					},
					
					chart: {
						value: 'Chart',
						href: excluded ? `?tab=chart&excluded=${excluded}` : '?tab=chart'
					}
				},

				onSelect: (key, item) => {
					this.getComponent('pages').change(key);
				}
			},
			
			pages:  {
				active: App.hasQuery('tab') ? 
					App.getQuery('tab') : 'countries',	

				pages: {
					countries: new Task({		
						task: () => {	
							return App.getApi('stats').get('categories')
								.getLatestEntries(this.category.category_id).fetch();
						},

						onSuccess: (result, component) => {
							var table = new EntriesTable({
								category: this.category,
								values: result.content,
								maxRows: 0
							});
							
							this.getComponent('pages').setPage('countries', table).update();
						}
					}), 
					
					chart: {
						title: '<h2>Chart</h2>',
						
						content: new Task({
							task: () => {
								return App.getApi('stats').get('categories')
									.getLatestEntries(this.category.category_id).fetch();
							},
							
							onSuccess: (result, component) => {
								var chart = this.getAggregateChart();
								chart.selector.values = result.content;

								if (excluded) {
									excluded = excluded.split('.');
									
									chart.selector.excluded = result.content.filter(
										value => excluded.includes(value.country.country_id.toString()));
								}
		
								this.getComponent('pages').setPage('chart', {title: '<h2>Chart</h2>', content: chart}).update();
							}
						})
					}
				}
			}
		};
			
		super(values);
	}

	setDefaults() {
		super.setDefaults();
		
		this.set({
			category: {},	
			tabs: {},	
			pages: {}
		});
	}
	
	getTemplate() {
		var date = new Date(this.category.updated_at).toLocaleString([], {year:'numeric', month:'long'});
		
		return `<div class="content category">
			<div class="header">
				<div class="group">
					<h1>{{@this.category.getName()}}</h1>
					<p class="date">Last update: ${date}</p>
				</div>
				
				<button class="button image-right icon-expand-more" id="testTable" type="button">Click Me!</button> 
			</div>

			<Tabs id="tabs" src="tabs" />
			<Pages id="pages" src="pages" />
		</div>`;
	}
	
	getAggregateChart() {
		return new AggregateChart({
			buildInfo: () => {
				return `<div class="info {{this.isFetching() && this.getUpdateCount() ? '_overlay' : ''}}">
					{{this.currentValue ? 
						\`Total: {{@this.formatNumber(this.currentValue[1])}} 
							${this.category.measure_unit ? _(_(this.category.measure_unit.symbol)) : ''}\` : 
							
						(!this.getUpdateCount() ? '<div class="placeholder"></div>' : '-')
					}}	
				</div>`;
			},
			
			selector: {
				includedListTitle: 'Included Countries',
				excludedListTitle: 'Excluded Countries',
				
				buildItem: (index, values) => {
					return `<li data-index="${_(_(index))}" class="selectable">
						<div class="country">
							<span class="fflag fflag-${_(_(values.country.code))} ff-md ff-app"></span>
							<span>${_(values.country.name)}</span>
						</div>
						<div class="value">
							${_(Util.formatNumber(values.value))} 
								${this.category.measure_unit ? _(this.category.measure_unit.symbol) : ''} 
						</div>
						<div class="change text-primary-3 tooltip" data-tooltip="Ten year change">
							${'y10' in values.changes ? _(Util.formatNumber(values.changes.y10.percentage)) + ' %' : '-'}
						</div>
					</li>`;	
				},
				
				onChange: selector => {
					var excluded = selector.excluded.map(
						value => value.country.country_id).join('.');
					
					App.setQuery('excluded', excluded);
					
					var a = this.getComponent('tabs').querySelector('[data-key="chart"] > a');
					
					var params = new URLSearchParams(a.getAttribute('href'));
					if (excluded)
						params.set('excluded', excluded);
					else
						params.delete('excluded');
					
					a.href = '?' + params;
				}
			},
							
			getFetcher: (selector) => {
				return App.getApi('stats').get('categories')
					.getGroupedEntries(this.category.category_id, selector.excluded.map(value => value.country.country_id))		
					.then(response => response.content);
			},
							
			getSeriesOptions: () => {
				return {                     
					name: this.category.name,
					showInLegend: false,
					dataGrouping: {
						enabled: false
					},
					tooltip: {
						valueSuffix: this.category.measure_unit ? ` ${this.category.measure_unit.symbol}` : ''
					}
				};
			},
							
			chart: {
				options: App.getConfig('stats').lineChartOptions
			}
		});	
	}
}
/** themes/default/modules/stats/views/components/country/info/Info.js */


 class Info extends Table {

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
/** themes/default/modules/stats/views/components/country/Country.js */



 class Country extends Component {
	
	setDefaults() {
		super.setDefaults();
		
		this.set({
			country: null,
			category: null,
			
			dropdown: {
				content: () => {
					return new Structure({
						outsideClickAwareEnabled: false,

						items: App.getModule('stats').get('categories').toArray(),
					
						buildItem: (key, item) => {
							return `<a href="${_url(`/${item.getSlug()}/${this.country.slug}`)}" class="{class}">${_(item.name)}</a>`;
						},
						
						onToggleSelect: (key, item, component) => {
							this.getComponent('dropdown').close();
						}
					});
				}
			},
			
			tabs: {
				active: App.hasQuery('tab') ? 
					App.getQuery('tab') : 'chart',
				
				eventExtra: {
					_replaceState: true
				},
				
				items: {
					chart: {
						value: 'Chart',
						href: () => {
							var url = new URL(window.location);
								url.searchParams.set('tab', 'chart');
							
							return '?' + url.searchParams;
						}
					},
					
					info: {
						value: 'Info',
						href: () => {
							var url = new URL(window.location);
								url.searchParams.set('tab', 'info');
								url.searchParams.delete('selected');
							
							return '?' + url.searchParams;
						}
					},
					
					//historicalData: 'Historical Data'
				},
				
				onSelect: (key) => {
					this.getComponent('pages').change(key);
				}
			},	
			
			pages: {
				active: App.hasQuery('tab') ? 
					App.getQuery('tab') : 'chart',	
				
				pages: {
					chart: {
						title: () => `<h2>${this.country.name} Chart</h2>`,
						content: () => this.getChart()
					},
					
					info: {
						//title: () => `<h2>Info</h2>`,
						content: () => new Info({
							category: this.category
						})
					},
				}
			}
		});
	}

	getTemplate() {
		return `<div class="content country">
			<div class="header">
				<Dropdown id="dropdown" src="dropdown" />
				
				{{this.country.alpha_2_code ?
					\`<span class="fflag fflag-{{@@this.country.alpha_2_code}} ff-lg ff-app"></span>\` : ''}}
	
				<h1>{{@this.country.name}} {{@this.category.name}}</h1>
			</div>

			<div class="info">${this.getInfo()}</div>
			
			<Tabs id="tabs" src="tabs" />
			<Pages id="pages" src="pages" />
		</div>`;
	}
	
	getChart() {
		var getKeys = (ids) => {
			return this.category.categories.length ? 
				ids.map(id => this.category.idTokey(id)).filter(value => !!value) : ['0'];
		}
		
		return new MultiSeriesChart({
			structure: {
				active:	getKeys(this.getSelected()),
				
				openIfHasActiveChildren: true,
				
				items: this.category.categories.length ? 
					this.category.categories : [this.category],
							
				isOpenable: item => {
					return item.categories.length > 0; 
				},
									
				getItems: item => {
					return item.categories.length ? item.categories : null;
				},
				
				buildItem: function(key, item, level, component) {
					return `<a class="{class} level${level} ${level > 0 ? `{{this.isActive('${key}') ? 'text-primary-1' : 'text-primary-2'}}` : ''}">
						${level > 0 || !item.categories.length ? `<span class="series-color" 
							style="background-color: {{this.isActive('${key}') ? '${component.assignColor(`${key}`)}' : '#e0e0e0'}};"></span>` : ''} 
									
						${_(item.name)}
					</a>`;
				},
				
				onToggleSelect: (key, item, component) => {
					var selected = Object.values(component.active)
						.map(value => value.category_id).join('.');
					
					App.setQuery('selected', selected);
					
					var a = this.getComponent('tabs').querySelector('[data-key="chart"] > a');
					
					var params = new URLSearchParams(a.getAttribute('href'));
					if (selected)
						params.set('selected', selected);
					else
						params.delete('selected');
					
					a.href = '?' + params;
				}
			},
			
			onCreate: (component) => {
				for (var active of getKeys(this.getSelected())) {
					component.addSeries(active);
				}
			},
			
			getSeriesOptions: (key, item) => {
				var name = item.getNameAsArray();
				if (name.length > 1) name.shift();
				
				var _this = this;
				
				return {                        
					name: name.join(' / '),
					tooltip: {
						pointFormatter: function() {
							var ratio = _this.getAdjustmentRatio(item.category_id);	
						
							var value = ratio ? this.y * ratio : this.y;
								
							return `<span style="color:${this.series.color}">&#9679;</span>  ${this.series.name}: 
								<b>${Util.formatNumber(value)} ${item.measure_unit ? `${item.measure_unit.symbol}` : ''}</b><br/>`;	
						}
					}
				};
			},

			getFetcher: (key, item) => {
				return App.getApi('stats').get('categories')
					.getCountryEntries(this.country.country_id, item.category_id)	
					.then(response => {
						var ratio = this.getAdjustmentRatio(item.category_id);	
						if (ratio) {
							for (var value of response.content) {
								value[1] /= ratio;
							}
						}
						
						return response.content;
					});
			},
						
			chart: {
				options: App.getConfig('stats').lineChartOptions
			}
		});
	}

	getSelected() {
		var selected = {
			1: [4, 9, 7], // Oil
			3: [], // Population
			10: [27, 28], // Gas
			11: [34, 35], // Coal
			12: [39, 43] // Electricity
		}[this.category.category_id];
		
		if (App.hasQuery('subcategory'))
			selected.push(App.getQuery('subcategory'));	
		
		return App.hasQuery('selected') ? 
			App.getQuery('selected').split('.') : selected;
	}
	
	getInfo() {
		var subcategory = null;
		if (App.hasQuery('subcategory')) {
			subcategory = this.getCategory(parseInt(App.getQuery('subcategory')));
			
			if (subcategory && subcategory.hasCategories()) subcategory = null
		}

		// Oil
		if (this.category.category_id == 1) {
			return this.getCategoryWithReservesInfo(this.getCategory(7), this.getCategory(4),
				this.getCategory(9), subcategory);
		}
		
		// Gas
		else if (this.category.category_id == 10) {
			return this.getCategoryWithReservesInfo(this.getCategory(33), this.getCategory(27),
				this.getCategory(28), subcategory);
		}
		
		// Coal
		else if (this.category.category_id == 11) {
			return this.getCategoryWithReservesInfo(this.getCategory(38), this.getCategory(34),
				this.getCategory(35), subcategory);
		}
		
		// Electricity
		else if (this.category.category_id == 12) {
			var consumption = this.getCategory(39);
			var generation = this.getCategory(43);
			
			if ([consumption, generation].includes(subcategory)) subcategory = null;
				
			return `<p>${this.buildRow(consumption)}</p><p>${this.buildRow(generation)}</p>
				${subcategory ? `<p>${this.buildRow(subcategory)}</p>` : ''}`;
		}
		
		// Population
		else if (this.category.category_id == 3) {
			return `<b>@{this.category.name}:</b> @{Util.formatNumber(this.category.value)}, 
				world share @{Util.formatNumber(this.category.world_share)}%.`;
		}
	}
	
	buildRow(category) {
		var name = category.getNameAsArray();
		name.shift();

		return `<b>${_(name.join(' / '))}:</b> ${_(Util.formatNumber(category.value))} ${_(category.measure_unit.name.toLowerCase())}, 
			world share ${_(Util.formatNumber(category.world_share))}%.`; 
	}
	
	getCategoryWithReservesInfo(reserves, production, consumption, subcategory) {
		if ([reserves, production, consumption].includes(subcategory)) subcategory = null;
			
		var depletion = () => {
			switch(this.category.category_id) {
				case 1:
					return reserves.value / (production.value * 365);
				
				case 10:
					return reserves.value * 1000000000000 / production.value;
						
				case 11:
					return reserves.value / production.value;
					
				default:
					throw `Unknown category.`;
			} 
		};
			
		return `<p>${this.buildRow(reserves)}</p>  
			<p>${this.buildRow(production)}</p>  
				<p style="text-indent: 32px;">
					- at current production, the reserves will be exhausted in ${_(Util.formatNumber(depletion()))} years.
				</p>
			<p>${this.buildRow(consumption)}</p> 
			${subcategory ? `<p>${this.buildRow(subcategory)}</p>` : ''}`;
	}
	
	getAdjustmentRatio(categoryId) {	
		switch(categoryId) {
			// Oil (Reserves)
			case 7:
				return this.getCategory(7).value / this.getCategory(4).value;	
			
			// Gas (Reserves)
			case 33:
				return this.getCategory(33).value / this.getCategory(27).value;
						
			// Coal (Reserves)
			case 38:
				return this.getCategory(38).value / this.getCategory(34).value;
				
			// Electricity (Capacity)
			case 42:
				return this.getCategory(42).value / this.getCategory(43).value;
				
			// Nuclear (Capacity)
			case 45:
				return this.getCategory(45).value / this.getCategory(46).value;
				
			// Fossil fuels (Capacity)
			case 48:
				return this.getCategory(48).value / this.getCategory(49).value;
				
			// Renewables (Capacity)
			case 51:
				return this.getCategory(51).value / this.getCategory(52).value;
				
			// Hydroelectricity (Capacity)
			case 54:
				return this.getCategory(54).value / this.getCategory(55).value;
				
			// Solar (Capacity)
			case 57:
				return this.getCategory(57).value / this.getCategory(58).value;
				
			// Wind (Capacity)
			case 60:
				return this.getCategory(60).value / this.getCategory(61).value;
				
			default:
				return null;
		} 
	}
	
	getCategory(categoryId) {
		return this.category.getCategory(categoryId);
	}
}
/** themes/default/modules/stats/views/components/peakChart/PeakChart.js */


 class PeakChart extends AggregateChart {

	//_category;

	constructor(values) {		
		values = Object.assign({}, values);
		
		values.buildInfo = () => {	
			return `<h1>Peak Oil Chart</h1>
				<div class="info {{this.isFetching() && this.getUpdateCount() ? '_overlay' : ''}}">
					<select onChange="this.eventHandlers.onCategoryChange(event)" class="category" 
						style="display: {{this.getUpdateCount() ? 'inline-block' : 'none'}}">
						${this.categories.map((category, index) => {
							return `<option value="${_(_(category.category_id))}" 
								selected="{{this.category.category_id == ${_(_(category.category_id))} ? 1 : 0}}">${_(category.name)}</option>`;
						}).join('')}
					</select>
					
					<ul>
						<li>	    
							<div class="title">Current Value</div>
							<div class="tooltip" data-tooltip="{{@this.category.measure_unit.name}}">
								{{this.hasValues() ? 
									\`{{@this.formatNumber(this.currentValue[1])}} {{@this.category.measure_unit.symbol}}\` : 
									(!this.getUpdateCount() ? '<div class="placeholder"></div>' : '-')
								}}
							</div>
							<div class="text-primary-3">
								{{this.hasValues() ? 
									_(this.formatDate(this.currentValue[0])) : 
									(!this.getUpdateCount() ? '<div class="placeholder"></div>' : '-')
								}}
							</div>
						</li>
						
						<li>
							<div class="title">Peak</div>
							<div class="tooltip" data-tooltip="{{@this.category.measure_unit.name}}">
								{{this.hasValues() ? 
									\`{{@this.formatNumber(this.peakValue[1])}} {{@this.category.measure_unit.symbol}}\` : 
									(!this.getUpdateCount() ? '<div class="placeholder"></div>' : '-')
								}}
							</div>
							<div class="text-primary-3">
								{{this.hasValues() ? 
									_(this.formatDate(this.peakValue[0])) : 
									(!this.getUpdateCount() ? '<div class="placeholder"></div>' : '-')
								}}
							</div>
						</li>
					
						<li class="decline">
							<ul>
								<li>
									<div class="title">Total Decline</div>
									<div class="font-weight-bold">
										{{this.hasValues() ? 
											this.formatNumber(this.getDeclinePercentage().toFixed(2)) + '%' : 
											(!this.getUpdateCount() ? '<div class="placeholder"></div>' : '-')
										}}
									</div>
									<div class="text-primary-3 tooltip" data-tooltip="{{@this.category.measure_unit.name}}">
										{{this.hasValues() ? 
											\`{{@this.formatNumber(this.getDecline())}} {{@this.category.measure_unit.symbol}}\` : 
											(!this.getUpdateCount() ? '<div class="placeholder"></div>' : '-')
										}}
									</div>
								</li>
								
								<li>
									<div class="title">Average Decline Per Year</div>
									<div class="font-weight-bold">
										{{this.hasValues() ? 
											this.formatNumber(this.getDeclinePerYearPercentage().toFixed(2)) + '%' : 
											(!this.getUpdateCount() ? '<div class="placeholder"></div>' : '-')
										}}
									</div>
								</li>
							</ul>
						</li>
					</ul>
				</div>`;	
		};
		
		values.selector = {
			includedListTitle: 'Included Countries',
			excludedListTitle: 'Excluded Countries',
			
			buildItem: (index, values) => {
				return `<li data-index="${index}" class="selectable">
					<div class="country">
						<span class="fflag fflag-${_(_(values.country.code))} ff-md ff-app"></span>
						<span>${_(values.country.name)}</span>
					</div>
					<div class="value">
						${_(Util.formatNumber(values.value))} ${_(this.category.measure_unit.symbol)}
					</div>
					<div class="change text-primary-3 tooltip" data-tooltip="Ten year change">
						${'y10' in values.changes ? _(Util.formatNumber(values.changes.y10.percentage)) + ' %' : '-'}
					</div>
				</li>`;	
			},
			
			onChange: selector => {	
				App.setQuery('excluded', 
					selector.excluded.map(value => value.country.country_id).join('.'));
			}
		};

		super(values);
	}
	
	setDefaults() {
		super.setDefaults();
		
		this.set({
			categories: [],
			
			category: null,
			
			classes: 'peak-chart content',
			
			markPeakValue: true,
	
			getFetcher: (selector) => {
				return App.getApi('stats').get('categories')
					.getGroupedEntries(this.category.category_id, selector.excluded.map(value => value.country.country_id))	
					.then(response => response.content);
			},
				
			getSeriesOptions: () => {
				return {                     
					name: 'Quantity',
					showInLegend: false,
					dataGrouping: {
						enabled: false
					},
					tooltip: {
						valueSuffix: ` ${this.category.measure_unit.symbol}`
					}
				};
			},
				
			chart: {
				options: App.getConfig('stats').lineChartOptions,
			}
		});
	}
	
	eventHandlers = {
		onCategoryChange: (event) => {
			this.category = event.target.value;
			App.setQuery('category', event.target.value)
				.removeQuery('excluded');
			
			this.getParent().getComponent('task').execute((result, component) => {
				this.getComponent('selector').setValues(result.content);	
				this.getParent().select('chart');
			});
			
			this.getParent().select('task');
		}
	};
	
	set category(id) {
		for (var category of this.categories) {
			if (id == category.category_id)
				this._category = category;
		}
	}

	get category() {
		return this._category ? this._category : this.categories[0];
	}
	
	formatDate(timestamp) {
		return new Date(timestamp).toLocaleString([], {year:'numeric', month:'short'});
	}
}
/** themes/default/modules/stats/views/components/main/Main.js */


 class MainComponent extends Component {
	
	countries = {};

	setDefaults() {
		super.setDefaults();
		
		var europe = [182, 83, 234, 76, 110, 209, 232, 177, 181, 156, 21, 58, 86, 178, 214, 101, 20, 14, 197, 215, 34, 60, 
			75, 202, 166, 107, 54, 145, 28, 2, 129, 164, 203, 123, 69, 130, 137, 85, 148, 102, 5, 146, 128, 193];
	
		var eu = [14, 21, 34, 54, 58, 60, 69, 75, 76, 83, 86, 101, 107, 110, 123, 129, 
			130, 137, 156, 177, 178, 181, 202, 203, 209, 214, 57, 166, 215, 234];
		
		this.set({
			cards: [
				{
					title: 'Oil production plateau',
					subtitle: 'World without United States, Canada and Irak',
					href: 'peak-oil-chart',
					category: 14,
					excluded : [236, 40, 106]
				},
				{
					title: 'Seneca Cliff',
					subtitle: 'World without United States, Saudi Arabia, Russia, Canada, China, Irak, UAE, Kuwait, Qatar, Brazil, Kazakhstan',
					href: 'peak-oil-chart',
					category: 14,
					excluded: [236, 40, 106, 31, 45, 182, 115, 233, 120, 180, 195]	
				},
				
				{
					title: 'European Union oil production',
					href: 'peak-oil-chart',
					category: 14,
					countries: eu
				},
				{
					title: 'European Union oil consumption',
					category: 9,
					countries: eu
				},
				{
					title: 'OPEC oil production',
					href: 'peak-oil-chart',
					category: 4,
					countries: [195, 106, 233, 105, 120, 3, 161, 127, 6, 240, 51, 80, 67, 50]	
				},
				{
					title: 'OPEC oil consumption',
					category: 9,
					countries: [195, 106, 233, 105, 120, 3, 161, 127, 6, 240, 51, 80, 67, 50]	
				},
				{
					title: 'OPEC oil reserves',
					category: 7,
					countries: [195, 106, 233, 105, 120, 3, 161, 127, 6, 240, 51, 80, 67, 50]	
				},
				{
					title: 'Gas production plateau',
					subtitle: 'World without United States, Russia, Iran, China, Australia',
					category: 27,
					excluded: [236, 182, 105, 45, 13]
				},
				{
					title: 'European Union gas production',
					category: 27,	
					countries: eu
				},
				{
					title: 'European Union gas consumption',
					category: 28,
					countries: eu
				},
				{
					title: 'European Union gas reserves',
					category: 33,
					countries: eu
				},
				{
					title: 'Electricity / Fossil fuels / Generation plateau',
					subtitle: 'World without China and India',
					category: 49,
					excluded: [103, 45]
				}
			],
			
			card: () => this.getChartCard(this.cards.shift())
		});
	}
	
	getTemplate() {
		return `<div class="content main">
			<div class="cards">
				${new Array(this.cards.length).fill('<Component src="card" />').join('')}
			</div>	
		</div>`;	
	}
	
	getExcludedCountries(includedCountries) {
		var excluded = [];
		for (var country of App.getModule('stats').get('countries')) {	
			if (!includedCountries.includes(country.country_id))
				excluded.push(country.country_id);
		}
		
		return excluded;
	}
	
	getChartCard(values) {
		var category = App.getModule('stats').get('categories').getCategory(values.category);
				
		var excluded = values.excluded ? values.excluded : this.getExcludedCountries(values.countries);
	
		values.href = values.href ? 
			values.href + '?excluded=' + excluded.join('.') :
			_(category.getSlug(), '[^\\w/-]+') + '?tab=chart&excluded=' + excluded.join('.');
				
		values.getSeriesOptions = () => {
			return {                        
				tooltip: {
					pointFormatter: function() {
						return `<b>${_(Util.formatNumber(this.y))} 
								${category.measure_unit ? `${_(category.measure_unit.symbol)}` : ''} 
							</b>`;	
					}
				},
				
				lineWidth: 3,
			};	
		};
			
		values.getFetcher = () => App.getApi('stats').get('categories')
			.getGroupedEntries(category.category_id, excluded)
			.then(response => [
				response.content, 
				response.content.length ? response.content[response.content.length - 1] : null
			]);
			
		values.displayCurrentValue = (currentValue) => {
			return `<div class="current-value">
				<div class="value">
					${_(Util.formatNumber(currentValue[1]))} ${category.measure_unit ? `${_(category.measure_unit.symbol)}` : ''}
				</div>	
				<div class="date text-primary-2">
					${new Date(currentValue[0]).toLocaleString([], {year:'numeric', month:'short'})}
				</div>
			</div>`;
		};
		
		values.chart = {
			options: Object.assign({}, App.getConfig('stats').lineChartOptions, {
				chart: {
					type: 'line'
				},
				yAxis: {                
					visible: false
				}
			})
		};
					
		return new ChartCard(values);
	}
}
/** themes/default/modules/stats/views/components/donate/Donate.js */


 class Donate extends Component {
	
	setDefaults() {
		super.setDefaults();
		
		this.set({
			items: {}
		});
	}
	
	getTemplate() {
		return `<div class="content donate">
			<h1>Donations</h1>
			<p>
				All donations are appreciated and help us continue to provide valuable and updated information about global energy.
			</p>
			<ul>${this.buildList()}</ul>
		</div>`;	
	}

	buildList() {
		var result = '';
		for (var [key, item] of Object.entries(this.items)) {
			if (item.symbol) {
				var value = `<img src="${_(item.image, '[^\\w/:.-]+')}" width="24px" height="24px" />
					
					<span class="name">${_(item.name)}</span> <span class="qrcode">${_(item.address)}</span>
					
					<div class="buttons">
						<button type="button" class="image-button icon-content-copy tooltip" data-tooltip="Copy Address" data-key="${_(_(key))}" 
							onclick="this.eventHandlers.copyAddress(event)" onmouseleave="this.eventHandlers.restoreTooltip(event)"></button>
							
						<button type="button" class="image-button icon-qr-code tooltip" data-tooltip="Click to view QR Code" 
							data-key="${_(_(key))}" onclick="this.eventHandlers.openDialog(event)"></button>
					</div>`;
			}
			else {
				var value = `<a href="${_(item.address, '[^\\w/:.?=-]+')}" target="_blank">
						<img src="${_(item.image, '[^\\w/:.-]+')}" width="24px" height="24px" /> ${_(item.title)}
					</a>`;
			}
			
			result += `<li>${value}</li>`;
		}
		
		return result;
	}

	eventHandlers = {
		copyAddress: (event) => {
			navigator.clipboard.writeText(this.items[event.target.dataset.key].address); 
			
			event.target.dataset.tooltip = 'Copied';
			
			event.target.classList.replace('icon-content-copy', 'icon-done');
			setTimeout(() => {
				event.target.classList.replace('icon-done', 'icon-content-copy');
			}, 1000);
		},
		
		restoreTooltip: (event) => {
			event.target.dataset.tooltip = 'Copy Address';
		},
		
		openDialog: (event) => {
			var item = this.items[event.target.dataset.key];
			
			var dialog = new Dialog({
				title: 'Address QR Code',
				content: `<div>
						<img class="qrcode" src="${_(item.qrcode, '[^\\w/:.-]+')}" width="240px" height="240px" />
					</div>
					<div class="address">${_(item.address)}</div>`,
				classes: 'donate qrcode'
			});
			
			dialog.attachTo(document.querySelector('body'));	
		}
	};

	setItems(items) {
		this.items = items;	
		
		return this;
	}
}
/** themes/default/modules/stats/controllers/Main.js */var MainView = MainComponent;







 class Main extends Controller {

	actionMain() {
		this.setTitle('Peak Oil Chart');

		var layout = this.getLayout('stats.common').setContent(new MainView())
			.setStickyFooterEnabled(true);

		layout.getHeader().clearActive();
		
		this.changeLayout(layout.update());
	}
	
	actionCategoryOrCountry(id) {
		var getCountryBySlug = (countries, slug) => {
			for (var country of countries) {
				if (country.slug == slug) 
					return country;
			}
		};
			
		var slug = this.route.slug.split('/');
			
		var country = getCountryBySlug(
			this.getModule('stats').get('countries'), slug[slug.length - 1]);
			
		if (country) slug.pop();
			
		var category = this.getModule('stats').get('categories').getCategoryBySlug(slug);
		
		if (category) {
			if (country) 
				this.actionCountry(country, category, id);
			else if (!category.hasCategories())
				this.actionCategory(category, id);
			else
				this.loadRoute('main.errors.notFound');
		}
		else
			this.loadRoute('main.errors.notFound');		
	}

	actionCategory(category, id) {
		this.setTitle(category.getName());

		var layout = this.getLayout('stats.common').setContent(new CategoryComponent(category))
			.setStickyFooterEnabled(false);
		
		layout.getHeader().setActive(
			this.getModule('stats').get('categories').idTokey(category.category_id));
		
		this.changeLayout(layout.update());
	}
	
	actionCountry(country, category, id) {
		this.setTitle(`${country.name} ${category.name}`);

		var task = new Task({
			task: (component) => {
				return this.getApi('stats').get('categories')
					.getCountryValues(country.country_id, category.category_id).fetch();
			},
						
			onSuccess: (result, component) => {									
				if (this.isChangeLayoutAllowed(id)) {		
					var content = new Country({				  
						country: country, 
						category: result.content
					});
						
					this.changeLayout(this.getLayout('stats.common')
						.setContent(content).update());
				}
			}
		});

		var layout = this.getLayout('stats.common').setContent(task)
			.setStickyFooterEnabled(true);
		
		layout.getHeader().setActive(
			this.getModule('stats').get('categories').idTokey(category.category_id));
		
		this.changeLayout(layout.update());
	}
	
	actionPeakOilChart(id) {
		this.setTitle('Peak Oil Chart');
		
		var layout = this.getLayout('stats.common').setContent(this.getTaskPeakChartSwitch())
			.setStickyFooterEnabled(true);

		layout.getHeader().clearActive();
		
		this.changeLayout(layout.update());
	}
	
	getTaskPeakChartSwitch() {
		return new Switch({
			selected: 'task',
			components: {
				task: new Task({
					task: (component) => {
						return this.getApi('stats').get('categories')
							.getLatestEntries(component.getParent().getComponent('chart').category.category_id)
							.fetch();	
					},
								
					onSuccess: {
						handler: (result, component) => {
							var chart = component.getParent().getComponent('chart');
							
							chart.selector.values = result.content;
							
							if (App.hasQuery('excluded')) {
								var excluded = App.getQuery('excluded').split('.');
									
								chart.selector.excluded = result.content.filter(
									value => excluded.includes(value.country.country_id.toString()));
							}
							
							component.getParent().select('chart');	
						},
						
						removeAfterUse: true
					}
				}),
				
				chart: new PeakChart({
					categories: [
						{category_id: 4, measure_unit: {symbol: 'BPD', name: 'Barrels per day'}, name: 'Crude oil including lease condensate'},
						{category_id: 14, measure_unit: {symbol: 'BPD', name: 'Barrels per day'}, name: 'Total petroleum and other liquids'},
						{category_id: 16, measure_unit: {symbol: 'BPD', name: 'Barrels per day'}, name: 'Crude oil, NGPL, and other liquids'}
					],
					
					category: App.hasQuery('category') ? 
						App.getQuery('category') : 16
				})
			}				   
		});
	}
	
	actionDonate() {
		this.setTitle('Donate');

		var layout = this.getLayout('stats.common')
			.setContent(
				new Donate().setItems(App.getConfig('stats').donate)
			)
			.setStickyFooterEnabled(true);
		
		layout.getHeader().clearActive();
		
		this.changeLayout(layout.update());
	}
}
/** themes/default/modules/stats/views/components/header/Header.js */


 class Header extends Component {
	
	setDefaults() {
		super.setDefaults();
		
		this.set({
			search: {
				getFetcher: () => {
					return App.getApi('stats').get('countries').getList()
						.then(response => response.content);
				},
	
				filter: (value, constraint) => {
					return value.name.toLowerCase().includes(constraint)
						|| value.alpha_2_code.toLowerCase().includes(constraint)
						|| value.alpha_3_code.toLowerCase().includes(constraint);
				},
		
				buildItem: (index, value) => {
					return `<li data-index="${index}" class="selectable">
							<a href="${_url(`/oil/${value.slug}`)}"> 
								<span class="fflag fflag-${_(_(value.alpha_2_code))} ff-md ff-app"></span>
								<span>${_(value.name)}</span>
							</a>
						</li>`;	
				},
		
				onSelect: (index, value) => {}
			},
	
			nav: {
				structure: {
					isOpenable: item => {
						return item.hasCategories(); 
					},
					
					getItems: item => {
						return item.hasCategories() ? item.getCategories() : null;
					},
					
					buildItem: (key, item) => {
						return `<a ${!item.hasCategories() ? `href="${_url(`/${item.getSlug()}`)}"` : ''} class="{class}">${_(item.name)}</a>`;
					},

					closeOnOutsideClick: () => {
						return window.innerWidth > 768;
					}
				},
				
				onSelect: (key) => {}
			}
		});
	}
	
	getTemplate() {
		return `<div class="header">
			<button type="button" class="image-button hamburger" onclick="this.getComponent('nav').open()"></button>	
			<div class="logo">
				<a href="${_url('/')}">PeakOilChart</a>
			</div>
			<Nav id="nav" src="nav" />
			<Search id="search" src="search" />
  			<div class="donate">
				<ul>
					<li><button class="outline-button" type="button" onclick="this.eventHandlers.handleDonations()">Donate</button></li>
				</ul>
			</div>
		</div>`;	
	}
	
	setItems(items) {
		this.nav.structure.items = items;
		
		return this;
	}
	
	setActive(key) {	
		if (this.isCreated())
			this.getComponent('nav').setActive(key).deepUpdate();
		else
			this.nav.structure.active = [key];
			
		return this;
	}	
	
	clearActive() {
		if (this.isCreated())
			this.getComponent('nav').clearActive().deepUpdate();
			
		return this;
	}
	
	eventHandlers = {
		handleDonations: () => {		
			App.getInstance().loadRoute('stats.main.donate');
		}
	};
}
/** themes/default/modules/stats/views/layouts/common/Common.js */



 class Common extends Layout {

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
/** themes/default/modules/stats/views/components/nav/Nav.js */


 class Nav extends Component {

	constructor(values) {
		values = Object.assign({}, values);
		values.structure.onSelect = key => {
			this._close();
			this.onSelect(key);
		};
			
		values.structure.floatation = true;
			
		super(values);
	}

	setDefaults() {
		super.setDefaults();
		
		this.set({
			opened: false,
			structure: {},
			onSelect: key => {}
		});
	}
	
	/* In order not to change the style of the buttons in css file, the component can be made resize aware and when the page size changes, 
		update the component and change the button class underline or non underline (if page size is less than 768px). */
	getTemplate() {
		return `<div class="nav {{this.isOpen() ? 'opened' : ''}}">
			<div class="content">
				<button type="button" class="image-button close" onclick="this.close()"></button>
				<Structure id="structure" src="structure" />
			</div>
					
			<div class="overlay" onclick="this.close()"></div>
		</div>`;	
	}
	
	isOpen() {
		return this.opened;
	}
	
	open() {
		this.opened = true;
		this.update();
	}
	
	close() {
		this.getComponent('structure').close();
		this._close();
	}
	
	_close() {
		this.opened = false;
		this.update();
	}
	
	setActive(key) {
		this.getComponent('structure').setActive(key);

		return this;
	}
	
	clearActive() {
		this.getComponent('structure').clearActive();
			
		return this;
	}
}
/** themes/default/modules/stats/views/components/sparkline/Sparkline.js */


 class Sparkline extends Component {

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
/** themes/default/modules/stats/views/components/footer/Footer.js */


 class Footer extends Component {
	
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
/** themes/default/modules/stats/settings/config.js */


var _709d11f81dc48f6c =  {
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
/** themes/default/modules/stats/models/categories/AbstractCategoryList.js */

 class AbstractCategoryList {
	
	categories = [];
	
	setCategories(categories) {}
	
	getCategory(id) {
		return this.getCategories([id]).shift();
	}
	
	getCategories(ids) {
		if (!ids) return this.categories;
		
		var result = [];
		for (var category of this.categories) {
			if (ids.includes(category.category_id))
				result.push(category);
			
			result = result.concat(category.getCategories(ids));
		}
		
		return result;
	}	
	
	hasCategories() {
		return !!this.categories.length;
	}
		
	getCategoryBySlug(slug) {
		var slugs = !Array.isArray(slug) ? slug.split('/') : [...slug];
		var slug = slugs.shift();
		for (var category of this.categories) {
			if (category.slug == slug)
				return slugs.length ? category.getCategoryBySlug(slugs) : category;
		}
	}
	
	idTokey(id) {
		for (var i = 0; i < this.categories.length; i++) {
			if (this.categories[i].category_id == id) return `${i}`;
			
			var key = this.categories[i].idTokey(id);
			
			if (key) return `${i}.${key}`;
		}
	}	
}	
/** themes/default/modules/stats/models/categories/Category.js */



 class Category extends AbstractCategoryList {
	
	category_id;
	name;
	measure_unit;
	updated_at;
	slug;
	parent;
	
	constructor(values) {		
		super();
		
		for (var [key, value] of Object.entries(values)) {
			var method = 'set' + Util.capitalizeFirstLetter(key);
			if (method in this) 
				this[method](value);
			else
				this[key] = value;	
		}
	}

	setCategories(categories) {
		for (var category of categories) {
			this.categories.push(
				new this.constructor(category).setParent(this));
		}
		
		return this;
	}
	
	setParent(parent) {
		this.parent = parent;
		
		return this;
	}

	hasParent() {
		return this.parent !== undefined;
	}
	
	getParent() {
		return this.parent;
	}

	getSlug() {
		return this.parent ? `${this.parent.getSlug()}/${this.slug}` : this.slug;
	}

	getRoot() {
		return this.hasParent() ? this.parent.getRoot() : this;
	}	

	getName() {
		return this.parent ? `${this.parent.getName()} / ${this.name}` : this.name;
	}
	
	getNameAsArray() {
		var result = this.parent ? this.parent.getNameAsArray() : [];
		result.push(this.name);
		
		return result;
	}
}
/** themes/default/modules/stats/models/categories/Categories.js */



 class Categories extends AbstractCategoryList {
	
	constructor(categories) {	
		super();
		
		if (categories)
			this.setCategories(categories);
	}
	
	setCategories(categories) {
		for (var category of categories) {
			this.categories.push(new Category(category));
		}
		
		return this;
	}

	toArray() {
		return this.categories;
	}	
}
/** themes/default/modules/stats/library/api/Categories.js */var CategoryList = Categories;




 class CategoriesApi extends AbstractApi { 
	
	getList() {
		return this.getFetcher(_url(`/api/categories/list`))
			.then(response => { 
				response.content = new CategoryList(response.content)
				
				return response;	  
			});
	}
	
	getLatestEntries(categoryId) {
		return this.getFetcher(_url(`/api/categories/${categoryId}/latest-entries`));
	}
	
	getGroupedEntries(categoryId, excludedCountries) {
		return this.getFetcher(_url(`/api/categories/${categoryId}/grouped-entries?` + new URLSearchParams({
   				'excludedCountries': excludedCountries
			})));
	}
	
	getSparklines(categoryId) {
		return this.getFetcher(_url(`/api/categories/${categoryId}/sparklines`));
	}
	
	getCountryEntries(countryId, categoryId) {
		return this.getFetcher(_url(`/api/categories/${categoryId}/entries/${countryId}`));
	}
	
	getCountryValues(countryId, categoryId) {
		return this.getFetcher(_url(`/api/categories/${categoryId}/country-values/${countryId}`))
			.then(response => { 
				response.content = new Category(response.content);
				
				return response;	  
			});
	}
}
/** themes/default/modules/stats/library/api/Countries.js */


 class Countries extends AbstractApi { 

	getList() {
		return this.getFetcher(_url(`/api/countries/list`));
	}
}
/** themes/default/modules/stats/library/api/Main.js */


 class MainApi extends AbstractApi { 	

	getConfig() {
		return this.getFetcher(_url(`/api/stats/config`));
	}

	getMeasureUnits() {
		return this.getFetcher(_url(`/api/measure-units`));
	}
}
/** themes/default/modules/stats/settings/resources.js */var config = _709d11f81dc48f6c;







var _2948a818b63a9111 =  new Resources()
	.set('config', config)
	
	.set('dependencies', {
		config: {
			check: () => 'donate' in App.getConfig('stats'),
			fetch: () => App.getApi('stats').get('main').getConfig().fetch(),
			store: (result) => Object.assign(App.getConfig('stats'), result.content)
		},
			
		categories: {
			check: () => App.getModule('stats').has('categories'),
			fetch: () => App.getApi('stats').get('categories').getList().fetch(),
			store: (result) => App.getModule('stats').set('categories', result.content)
		},
			
		countries: {
			check: () => App.getModule('stats').has('countries'),
			fetch: () => App.getApi('stats').get('countries').getList().fetch(),
			store: (result) => App.getModule('stats').set('countries', result.content)
		},

		measureUnits: {
			check: () => App.getModule('stats').has('measureUnits'),
			fetch: () => App.getApi('stats').get('main').getMeasureUnits().fetch(),
			store: (result) => App.getModule('stats').set('measureUnits', result.content)
		}
	})
	
	.set('api', () => {
		return new Map().set('main', new MainApi())
			.set('categories', new CategoriesApi())
			.set('countries', new Countries());
	});
/** themes/default/modules/stats/settings/routes.js */


var _64498f9a232a0563 =  {
	main: {
		controller: 'main',
		routable: false,
		routes: {
			peakOilChart: {
				path: '/peak-oil-chart',
				action: 'peakOilChart'
			},
			
			donate: {
				path: '/donate',
				action: 'donate',
			},
			
			categoryOrCountry: {
				path: '/:slug',
				models: {
					slug: '[\\w\\-/]+'
				},
				action: 'categoryOrCountry',
				events: {
					dependencies: {
						handler: [new Events(App.getInstance()), 'dependencies'],
						values: ['stats.config', 'stats.categories', 'stats.countries']
					}	
				}
			}
		}
	}
};
/** themes/default/modules/stats/initialize.js */var resources = _2948a818b63a9111;var routes = _64498f9a232a0563;





 function initialize() {
	App.get('modules').set('stats', resources);
	
	App.get('router').setRoute('stats', {
		module: 'stats',
		routable: false,
		events: {
			dependencies: {
				handler: [new Events(App.getInstance()), 'dependencies'],
				values: ['stats.config', 'stats.categories']
			}
		},
		routes: routes
	});
	
	App.get('layoutManager').setLayout('stats.common', () => {
		var layout = new Common({
			footer: {
				source: App.getConfig('stats').source	
			}						
		});
			
		layout.getHeader().setItems(
			App.getModule('stats').get('categories').toArray());
		
		return layout;
	});
}
/** themes/default/modules/stats/export.js */

// Controllers




// Views










// Initialize


export {Main,Common,Category,Country,Nav,PeakChart,Sparkline,Footer,initialize};