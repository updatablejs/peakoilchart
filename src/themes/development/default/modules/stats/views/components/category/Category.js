
import {App, Component, Switch, AggregateChart, Task, Util, _} from '../../../import.js';
import {EntriesTable} from './entriesTable/EntriesTable.js';

export class Category extends Component {
	
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
