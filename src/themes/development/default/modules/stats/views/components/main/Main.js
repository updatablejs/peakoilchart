
import {App, Component, ChartCard, Util, _url, _} from '../../../import.js';

export class Main extends Component {
	
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
