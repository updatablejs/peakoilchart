
import {App, Component, MultiSeriesChart, Util, Structure, _url, _} from '../../../import.js';
import {Info} from './info/Info.js';

export class Country extends Component {
	
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
