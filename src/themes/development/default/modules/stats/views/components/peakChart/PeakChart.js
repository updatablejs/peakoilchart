
import {App, AggregateChart, Util, _} from '../../../import.js';

export class PeakChart extends AggregateChart {

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
