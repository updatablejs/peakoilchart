
import {App, Controller, AggregateChart, Switch, Task} from '../import.js';
import {Category} from '../views/components/category/Category.js';
import {Country} from '../views/components/country/Country.js';
import {PeakChart} from '../views/components/peakChart/PeakChart.js';
import {Main as MainView} from '../views/components/main/Main.js';
import {Donate} from '../views/components/donate/Donate.js';

export class Main extends Controller {

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

		var layout = this.getLayout('stats.common').setContent(new Category(category))
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
