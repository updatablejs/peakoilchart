
import {App, Component, Util, _url, _} from '../../../import.js';

export class Header extends Component {
	
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
