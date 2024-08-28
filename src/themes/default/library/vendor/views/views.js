import {Component,Updatable,Events,Util,_,___} from '../updatableJs/updatableJs.js';
			/** ../views/src/import.js */


/** ../views/src/chart/aggregateChart/AggregateChart.js */


 class AggregateChart extends Component {
	
	timeoutId;
	
	constructor(values) {		
		values = Object.assign({}, values);
		
		var onChange = values.selector ? values.selector.onChange : null;
		values.selector = Object.assign({}, values.selector);
		values.selector.onChange = selector => {
			if (onChange)
				onChange(selector);
				
			this.onChange();
		}
	
		super(values);
	}

	setDefaults() {
		super.setDefaults();
		
		this.set({
			currentValue: null,
			peakValue: null,	
			buildInfo: () => {},
			formatNumber: (number) => {
				return Util.formatNumber(number);
			},
			selector: {},
			getFetcher: (selector) => {},
			getSeriesOptions: () => {},
			markPeakValue: false,
			chart: {},
			classes: null
		});
	}
	
	getTemplate() {
		return `<div class="aggregate-chart ${this.classes ? this.classes : ''}">
			<div class="header">
				${this.buildInfo()}
			</div>
			<div class="content">
				<Chart id="chart" src="chart" />
				<Selector id="selector" src="selector" />
			</div>
		</div>`;
	}
	
	onCreate() {
		this.onChange();
		super.onCreate();
	}
	
	onChange() {
		this.components.get('chart')
			.setOverlayEnabled(true)
			.setLoaderEnabled(true)
			.removeError()
			.update();
		
		if (!this.isFetching())
			this.setFetching(true).update();
			
		clearTimeout(this.timeoutId);
					
		this.timeoutId = setTimeout(() => {
			var timeoutId = this.timeoutId;
		
			this.getFetcher(this.components.get('selector')).then(response => {
				if (timeoutId == this.timeoutId) {
					[this.currentValue, this.peakValue] = this.prepareValues(response);
					
					this.components.get('chart').removeSeries();
					if (response.length) {
						this.components.get('chart').addSeries(
							Object.assign({}, this.getSeriesOptions(), {
								data: response
							})
						);
					}
					
					this.components.get('chart')
						.setOverlayEnabled(false)
						.setLoaderEnabled(false)
						.update();
						
					this.setFetching(false).update();
				}
			})
			.catch(error => {	   
				if (timeoutId == this.timeoutId) {
					this.components.get('chart')
						.setLoaderEnabled(false)
						.setError('Fetching data error.')
						.update();
					
					this.setFetching(false).update();
				}
			})
			.fetch();
		}, 1000);
	}
	
	prepareValues(values) {
		var e;
		var currentValue = values.length ? values[values.length - 1] : undefined;
		var peakValue;
		for (var i = 0; i < values.length; i++) {
			if (!peakValue || peakValue[1] < values[i][1]) {
				peakValue = values[i];
				e = i;
			}
		}

		if (this.markPeakValue && peakValue) {
			values[e] = {
				y: peakValue[1], 
				x: peakValue[0], 
				marker: {fillColor: '#d50000', radius: 4, enabled: true}
			};
		}
		
		return [currentValue, peakValue, values]
	}
	
	hasValues() {
		return this.currentValue && this.peakValue;	
	}

	getDeclinePercentage() {
		return (this.peakValue[1] - this.currentValue[1]) * 100 / this.peakValue[1];
	}
	
	getDecline() {
		return this.peakValue[1] - this.currentValue[1];
	}
	
	getDeclinePerYearPercentage() {
		var years = new Date(this.currentValue[0]).getFullYear() - new Date(this.peakValue[0]).getFullYear();

		return years ? this.getDeclinePercentage() / years : this.getDeclinePercentage();
	}
}
/** ../views/src/chart/Chart.js */


 class Chart extends Component {
	
	_chart;
	
	get chart() {
		if (!this._chart) 
			this._chart = Highcharts.chart(this.querySelector('.content'), this.options);
		
		return this._chart;
	}
	
	setDefaults() {
		this.set({
			options: {},
			overlayEnabled: false,
			loaderEnabled: false,
			error: null
		});
	}
	
	getTemplate() {
		return `<div class="chart {{this.isOverlayEnabled() ? '_overlay' : ''}} 
			{{this.isLoaderEnabled() ? '_loader' : ''}}">
			
			<div class="content" style="display: {{this._chart && this.hasVisibleSeries() ? 'block' : 'none'}}"></div>
			
			{{if (this.error) 
			 	\`<div class="error">{{@this.error}}</div>\`;
			
			else if (!this.isLoaderEnabled() && (!this._chart || !this.hasVisibleSeries()))
				\`<div class="message">No data.</div>\`;}}
		</div>`;
	}

	isInitialized() {
		return !!this._chart;
	}
	
	removeSeries(id) {
		if (id !== undefined) {
			var series = this.chart.get(id);
			if (series) 
				series.remove();
		}
		else {
			while(this.chart.series.length > 0)
				this.chart.series[0].remove();
		}

		return this;
	}
		
	addSeries(series) {
		this.chart.addSeries(series);
		
		return this;
	}

	showSeries(id) {
		var series = this.chart.get(id);
		if (series) 
			series.show();
		
		return this;
	}

	hideSeries(id) {
		var series = this.chart.get(id);
		if (series) 
			series.hide();
		
		return this;
	}
	
	hasSeries(id) {
		return this._chart ? (id ? !!this.chart.get(id) : !!this.chart.series.length) : false;
	}
	
	hasVisibleSeries() {	
		for (var series of this.chart.series) {
    		if (series.visible) 
				return true;
		}
		
		return false;
	}
	
	setOverlayEnabled(value) {
		this.overlayEnabled = value;
		
		return this;
	}
	
	isOverlayEnabled() {
		return this.overlayEnabled;
	}

	setLoaderEnabled(value) {
		this.loaderEnabled = value;
		
		return this;
	}

	isLoaderEnabled() {
		return this.loaderEnabled;
	}
	
	setError(error) {
		this.error = error;
		
		return this;
	}
	
	removeError() {
		return this.setError(null);
	}
	
	hasError() {
		return !!this.error;
	}
}
/** ../views/src/chart/chartCard/ChartCard.js */


 class ChartCard extends Component {
	
	setDefaults() {
		super.setDefaults();
		
		this.set({
			title: null,
			subtitle: null,
			href: null, // It will not be sanitized.
			currentValue: null,
			displayCurrentValue: (currentValue) => {},
			getFetcher: () => {},
			getSeriesOptions: () => {},			
			chart: {}
		});
	}
	
	onCreate() {
		this.components.get('chart')
			.setOverlayEnabled(true).setLoaderEnabled(true).update();
			
		this.getFetcher().then(response => {
			this.update({currentValue: response[1]});

			this.components.get('chart').addSeries(
				Object.assign({}, this.getSeriesOptions(), {
					data: response[0]
				})
			); 
				
			this.components.get('chart')
				.setOverlayEnabled(false)
				.setLoaderEnabled(false)
				.update();
		})
		.catch(error => {	   
			this.components.get('chart')
				.setOverlayEnabled(false)
				.setLoaderEnabled(false)
				.setError('Fetching data error.')
				.update();
		})
		.fetch();
		
		super.onCreate();
	}
	
	getTemplate() {
		return `<div class="card chart-card">
			{{if (this.currentValue) this.displayCurrentValue(this.currentValue)}}
			
			<Chart id="chart" src="chart" />
			<div class="details">
				<a href="${this.href}">
					<h3 class="title">${_(this.title)}</h3>
					${this.subtitle ? `<div class="subtitle">${_(this.subtitle)}</div>` : ''}
				</a>
			</div>
		</div>`;	
	}
}
/** ../views/src/chart/multiSeriesChart/MultiSeriesChart.js */


 class MultiSeriesChart extends Component {
	
	assignedColors = {};
	requests = [];

	constructor(values) {		
		values = Object.assign({}, values);
		
		values.structure = Object.assign({
			multiSelect: true,
			closeOnSelect: false,
			closeOnDeselect: false,
			closeSiblingsOnOpen: false,
			closeOnOutsideClick: false,	
		}, values.structure);
		
		var buildItem = values.structure.buildItem;
		values.structure.buildItem = (key, item, level) => {
			return buildItem(key, item, level, this);	
		};
		
		values.structure.onSelect = (key, item) => {
			this._addSeries(key, item);
		};
			
		values.structure.onDeselect = (key, item) => {
			if (!this.hasVisibleRequests())
				this.components.get('chart').setOverlayEnabled(false).setLoaderEnabled(false);
				
			this.components.get('chart').hideSeries(key).removeError().update();
		};

		super(values);
	}

	setDefaults() {
		super.setDefaults();
		
		this.set({
			structure: {},
			getSeriesOptions: function(key, item) {},
			getFetcher: function(key, item) {},
			colors: ['#7cb5ec', '#434348', '#90ed7d', '#f7a35c', '#8085e9', '#f15c80', '#e4d354', '#2b908f', '#f45b5b', '#91e8e1'],
			chart: {}
		});
	}
	
	getTemplate() {
		return `<div class="multi-series-chart">
			<Chart id="chart" src="chart" />
			<Structure id="structure" src="structure" />
		</div>`;
	}
	
	assignColor(key) {
		if (this.colors.current === undefined)
			this.colors.current = 0;
		else
			this.colors.current++;
			
		if (this.colors.current >= this.colors.length) 
			this.colors.current = 0;
			
		this.assignedColors[key] = this.colors[this.colors.current];

		return this.assignedColors[key];
	}
	
	addSeries(key) {
		this._addSeries(key, this.getComponent('structure').getItem(key));
		
		return this;
	}
	
	hasVisibleRequests() {
		return !!this.requests.filter(value => this.components.get('structure').isActive(value)).length;
	}
	
	_addSeries(key, item) {
		var chart = this.components.get('chart');
		
		if (chart.hasSeries(key)) {
			if (!this.hasVisibleRequests()) 
				chart.setOverlayEnabled(false);
			
			chart.showSeries(key).removeError().update();
			
			return;	
		}
		
		chart.setOverlayEnabled(true).setLoaderEnabled(true).removeError().update();
		
		if (!this.requests.includes(key)) {
			this.requests.push(key);
			
			this.getFetcher(key, item).then(response => {
				if (response.length) {
					chart.addSeries(
						Object.assign({}, this.getSeriesOptions(key, item), {
							id: key,
							color: this.assignedColors[key],
							visible: this.components.get('structure').isActive(key) ? true : false,
							data: response
						})
					);	
				}
			})
			.catch(error => {	   
				if (this.components.get('structure').isActive(key)) {
					chart.setError('Fetching data error.');
					this.components.get('structure').deselectSilent(key);
				}
			})
			.finally(() => {
				this.requests = this.requests.filter(value => value !== key);

				if (!this.hasVisibleRequests()) {
					chart.setLoaderEnabled(false);
					
					if (!chart.hasError())
						chart.setOverlayEnabled(false);
				}
				
				chart.update();
			})
			.fetch();	
		}
	}
}
/** ../views/src/dialog/Dialog.js */


 class Dialog extends Component {
	
	setDefaults() {
		super.setDefaults();
		
		this.set({
			title: null,
			content: null,
			classes: null,
			fixed: true,
			closeOnOutsideClick: true
		});
	}
	
	getTemplate() {
		return `<div class="overlay ${this.fixed ? 'fixed' : ''}" 
			${this.closeOnOutsideClick ? 'onclick="this.eventHandlers.close(event)"' : ''}>
			<div class="dialog ${this.classes ? this.classes : ''}">
				<div class="header">
					<button type="button" class="image-button close" onclick="this.eventHandlers.close(event)"></button>	
					{{if (this.title)
						\`<h2 class="title">{{@this.title}}</h2>\`
					}}
				</div>
				<div class="content">{{this.content}}</div>
				<div class="footer"></div>
			</div>
		</div>`;	
	}
	
	eventHandlers = {
		close: (event) => {
			if (event.target && (event.target.classList.contains('close') || event.target.classList.contains('overlay'))) {
				this.close();	
			}
			
			event.stopPropagation();
		}
	};

	close() {
		this.detach();

		return this;
	}
}
/** ../views/src/outsideClickAware/OutsideClickAware.js */


 class OutsideClickAware extends Component {
	
	outsideClickHandler;
	outsideClickHandlerRegistered;
	 
	setDefaults() {
		super.setDefaults();
		
		this.set({
			outsideClickAwareEnabled: true,
		});
	}
	
	setOutsideClickAwareEnabled(value) {
		this.outsideClickAwareEnabled = value;
	}
	
	isOutsideClickAwareEnabled() {
		return Util.getValue(this.outsideClickAwareEnabled, this);
	}
	
	registerOutsideClickHandler() {
		if (!this.outsideClickHandlerRegistered) {
			document.addEventListener('click', this.getOutsideClickHandler());	
			this.outsideClickHandlerRegistered = true;
		}
		
		return this;
	}
	
	unregisterOutsideClickHandler() {
		if (this.outsideClickHandlerRegistered) {
			document.removeEventListener('click', this.getOutsideClickHandler());
			this.outsideClickHandlerRegistered = false;
		}
		
		return this;
	}

	getOutsideClickHandler() {
		if (!this.outsideClickHandler) {
			this.outsideClickHandler = (event) => {
				var element = event.target.closest('.outside-click-aware');
				
				if (this.isOutsideClickAwareEnabled() && (!element || element != this.element)) {
					this.onOutsideClick();
				}
			};
		}
		
		return this.outsideClickHandler;
	}
	
	onOutsideClick() {
		if ('onOutsideClick' in this.callbacks)
			this.callbacks.onOutsideClick(this);
	}
}
/** ../views/src/openable/Openable.js */


 class Openable extends OutsideClickAware {

	setDefaults() {
		super.setDefaults();
		
		this.set({
			opened: false	
		});
	}
	
	onOutsideClick() {
		this.close();
	}
	
	setOpen(value) {
		this.opened = value;
	}

	isOpen() {
		return this.opened;
	}
	
	open() {
		this.setOpen(true);
		if (this.isOutsideClickAwareEnabled())
			this.registerOutsideClickHandler();

		this.update();
	}
	
	close() {
		this.setOpen(false);
		this.unregisterOutsideClickHandler();
		this.update();
	}
	
	toggleVisibility() {
		return this.isOpen() ? this.close() : this.open();
	}
}
/** ../views/src/dropdown/Dropdown.js */



 class Dropdown extends Openable {
	
	setDefaults() {
		super.setDefaults();
		
		this.set({
			hoverable: true,
			content: null,
			button: (component) => `<button type="button" class="image-button icon-more-horiz" 
				onclick="this.toggleVisibility()"></button>`
		});
	}
	
	getTemplate() {
		return `<div class="dropdown ${this.isOutsideClickAwareEnabled() ? 'outside-click-aware' : ''}
			${this.hoverable ? 'hoverable' : ''} {{this.isOpen() ? 'opened' : ''}}" onmouseleave="this.addHoverableClass()">
    		
			${this.button()}

			<div class="content">
				{{this.getContent()}}	
			</div>
		</div>`;
	}
	
	getContent() {
		return !this.isCreated() ? Util.getValue(this.content) : Updatable.noChange;
	}
	
	isHoverable() {
		return this.hoverable;
	}
	
	addHoverableClass() {
		if (this.isHoverable())
			this.element.classList.add('hoverable');
	}
			
	close() {
		super.close();
		
		this.element.classList.remove('hoverable');
	}
	
	onOutsideClick() {
		super.close();
	}
}
/** ../views/src/expandable/Expandable.js */


 class Expandable extends Component {

	setDefaults() {
		super.setDefaults();
		
		this.set({
			expanded: false,
			gradientEnabled: true,
			content: null // (component) => {}
		});
	}

	getTemplate() {
		return `<div class="expandable {{this.isExpanded() ? 'expanded' : ''}}">
			<div class="content {{this.isExpandable() && !this.isExpanded() && this.isGradientEnabled() ? 'gradient' : ''}}">
				{{?Util.getValue(this.content, this)}}
			</div>
			<button class="outline-image-button {{this.isExpanded() ? 'icon-expand-less' : 'icon-expand-more'}}" 
				style="display: {{this.isExpandable() ? 'block' : 'none'}}" type="button" onclick="this.toggle()"></button>
		</div>`;
	}
	
	expand() {
		this.expanded = true;

		this.update();
		
		return this;
	}
	
	collapse() {
		this.expanded = false;

		this.update();
		
		return this;
	}
	
	toggle() {
		return this.expanded ? this.collapse() : this.expand();
	}
	
	isExpanded() {
		return this.expanded;	
	}
	
	isExpandable() {
		return !!this.querySelector('.content .more');
	}
	
	isGradientEnabled() {
		return this.gradientEnabled;	
	}
}
/** ../views/src/structure/Structure.js */



 class Structure extends OutsideClickAware { 
	
	constructor(values) {	
		super(values);
		
		var set = (keys, property) => {
			this[property] = {};
			
			for (var key of Array.isArray(keys) ? keys : [keys]) {
				this[property][key] = this.getItem(key);
			}
		};
		
		if (values.active)
			set(values.active, 'active');
		
		if (values.open)
			set(values.open, 'open');
	}

	setDefaults() {
		super.setDefaults();
		
		this.set({
			open: {},
			active: {},
			items: { 
				/*key: { // The key will not be sanitized.
					value: '',
					href: '', // It will not be sanitized.
					image: '', // It will not be sanitized.
					items: {}
				}*/
			},
			eventExtra: null,
			
			isOpenable: item => {
				return Util.isObject(item) && 'items' in item;
			},
			
			getItems: item => { 
				return Util.isObject(item) && 'items' in item ? item.items : null;
			},
			
			buildItem: (key, item, level) => {
				return `<a ${Util.isObject(item) && 'href' in item ? `href="${Util.getValue(item.href)}"` : ''}  class="{class}">
					${Util.isObject(item) && 'image' in item ? `<img src="${item.image}" />` : ''} 
					${_(Util.isObject(item) && 'value' in item ? item.value : item)}	
				</a>`;
			},
			
			/*hasCustomContent(item) {},
			getCustomContent(item) {},*/
			
			classes: null,
			
			closeSiblingsOnOpen: true,
			
			//closeSiblingsDescendantsOnOpen: true,
			
			closeOnSelect: true,
			
			closeOnDeselect: true,
			
			openIfHasActiveChildren: false,
			
			multiSelect: false,
			
			floatation: false,
			
			onSelect: (key, item, component) => {},
			
			onDeselect: (key, item, component) => {},
			
			onToggleSelect: (key, item, component) => {},
			
			closeOnOutsideClick: true
		});
	}
	
	getTemplate() {
		return `<div class="structure ${this.isOutsideClickAwareEnabled() ? 'outside-click-aware' : ''} 
			${this.floatation ? 'floatation' : ''} ${this.classes ? _(_(this.classes)) : ''}">
				<ul onclick="this.eventHandlers.select(event)">${this.buildItems(this.items)}</ul>
				{{if (this.isFetching()) '<div class="loader"></div>'}}
			</div>`;
	}
	
	buildItems(items, parentKey, level) {
		parentKey = parentKey || '';
		level = level || 0;
		
		var result = '';
		for (var [key, item] of Object.entries(items)) {
			if (parentKey)
				key = `${parentKey}.${key}`;
			
			if (this.isOpenIfHasActiveChildrenEnabled() && this.hasActiveChildren(key)) {
				this.open[key] = item;
			}	
			
			var _class = `{{this.isActive('${key}') || this.hasActiveChildren('${key}') ? 'active' : ''}} button 
				${this.isOpenable(item) ? `image-right {{this.isOpen('${key}') ? 'icon-expand-less' : 'icon-expand-more'}}` : ''}`;
			
			var _item = this.buildItem(key, item, level)
				.replace(/\{class\}/, _class);

			result += `<li class="item" data-key="${key}">
					${_item}
					${this.isOpenable(item) ? 
						`<ul class="content ${level > 0 && this.floatation ? 'top right-outside' : ''}" 
							style="display: {{this.isOpen('${key}') ? 'block' : 'none'}}">
								${this.buildItems(this.getItems(item), key, level + 1)}
						</ul>` : ''} 
				</li>`;	
		}
		
		return result;
	}
	
	eventHandlers = {
		select: (event) => {
			var li = event.target.closest('li');
			if (li) {
				if (this.eventExtra) {
					for (var [key, value] of Object.entries(this.eventExtra)) {
						event[key] = value;
					}
				}

				var item = this.getItem(li.dataset.key);
				if (this.isOpenable(item)) 
					this.toggleVisibility(li.dataset.key);
				else 
					this.toggleSelect(li.dataset.key);
			}
		}
	};

	getItem(key) {
		var result;
		var items = this.items;
		for (var key of key.split('.')) {
			if (!items || !(key in items)) return null;

			result = items[key];
			
			items = this.getItems(result);	
		}

		return result;
	}
	
	setActive(key) {
		if (!this.multiSelect)
			this.active = {};
				
		this.active[key] = this.getItem(key);
		
		return this;
	}
	
	clearActive() {
		this.active = {};
				
		return this;
	}
	
	// Same name with open property.
	_open(key) {
		if (this.isCloseSiblingsOnOpenEnabled()) {			
			this.open = Object.fromEntries(
    			Object.entries(this.open).filter(entry => 
					entry[0].replace(/[^\.]+$/, '') != key.replace(/[^\.]+$/, '')) 
			);
		}
		
		this.open[key] = this.getItem(key);
		
		if (this.isOutsideClickAwareEnabled() && key.indexOf('.') == -1)
			this.registerOutsideClickHandler();
		
		this.update();
		
		return this;
	}
	
	close(key) {
		if (key)
			delete this.open[key];
		else
			this.open = {};
		
		if (!key || key.indexOf('.') == -1)
			this.unregisterOutsideClickHandler();
		
		this.update();
		
		return this;
	}

	toggleVisibility(key) {
		return this.isOpen(key) ? this.close(key) : this._open(key);
	}

	select(key) {		
		this.setActive(key);

		if (this.isCloseOnSelectEnabled())
			this.close();
		else
			this.update();
			
		this.onSelect(key, this.getItem(key), this);
		this.onToggleSelect(key, this.getItem(key), this);

		return this;
	}
	
	deselect(key) {
		return this._deselect(key, false);
	}
	
	deselectSilent(key) {
		return this._deselect(key, true);
	}
	
	_deselect(key, silent) {
		delete this.active[key]
		
		if (this.isCloseOnDeselectEnabled())
			this.close();
		else
			this.update();
		
		if (!silent) {
			this.onDeselect(key, this.getItem(key), this);
			this.onToggleSelect(key, this.getItem(key), this);
		}
		
		return this;
	}
	
	toggleSelect(key) {
		return this.isActive(key) ? this.deselect(key) : this.select(key);
	}
	
	isOpen(key) {
		return key in this.open;
	}

	isActive(key) {
		return key in this.active;
	}
	
	hasActiveChildren(key) {
		for (var active of Object.keys(this.active)) {
			if (active.indexOf(key + '.') == 0)	return true;
		}

		return false;
	}

	onOutsideClick() {		
		if (Util.getValue(this.closeOnOutsideClick, this))
			this.close();		
	}
	
	isCloseOnSelectEnabled() {
		return typeof this.closeOnSelect == 'function' ? 
			this.closeOnSelect() : this.closeOnSelect;
	}
	
	isCloseOnDeselectEnabled() {
		return typeof this.closeOnDeselect == 'function' ? 
			this.closeOnDeselect() : this.closeOnDeselect;
	}
	
	isCloseSiblingsOnOpenEnabled() {
		return typeof this.closeSiblingsOnOpen == 'function' ? 
			this.closeSiblingsOnOpen() : this.closeSiblingsOnOpen;
	}
	
	isOpenIfHasActiveChildrenEnabled() {
		return typeof this.openIfHasActiveChildren == 'function' ? 
			this.openIfHasActiveChildren() : this.openIfHasActiveChildren;
	}
	
	/*// todo
	onUpdate() {
		if (!this.floatation) return;
		
		//console.log('bo!');	
		for (var element of this.querySelectorAll('.structure > li > ul.content')) {
			//console.log(element);
			
			var rect = element.getBoundingClientRect();
			//console.log(rect);
			
			
			if (rect.right > window.innerWidth)
				element.style.left = `-${rect.right - window.innerWidth + 20}px`; 
		}
		

		for (var element of this.querySelectorAll('.structure > li li ul.content')) {
			//console.log(element);
			
			var rect = element.getBoundingClientRect();
			
			if (rect.right > window.innerWidth)
				element.style.left = `-${rect.right - window.innerWidth + 20}px`; 
		}
		
		super.onUpdate();
	}*/
}
/** ../views/src/selector/Selector.js */

	
 class Selector extends Component {

	setDefaults() {		
		this.set({
			values: [],
			excluded: [],
			includedListTitle: 'Included',
			excludedListTitle: 'Excluded',
			buildItem: (index, values) => {},
			onChange: (selector) => {},
		});
	}
	
	getTemplate() {
		return `<div class="selector {{!this.hasValues() ? '_overlay _loader' : ''}}">
			<div class="included">
				<h3>@{this.includedListTitle}</h3>
				<button class="button" type="button" onclick="this.excludeAll()"
					style="display: {{this.values.length - this.excluded.length > 1 ? 'block' : 'none'}}">
						Exclude All ({{this.values.length - this.excluded.length}})</button> 
						
				<ul onclick="this.eventHandlers.exclude(event)">{{this.buildIncludedList()}}</ul>
				<div class="message" 
					style="display: {{this.values.length - this.excluded.length == 0 ? 'block' : 'none'}}">Empty</div>
			</div>
  
			<div class="excluded">
				<h3>@{this.excludedListTitle}</h3>
				<button class="button" type="button" onclick="this.includeAll()"
					style="display: {{this.excluded.length > 1 ? 'block' : 'none'}}">
						Include All ({{this.excluded.length}})</button> 
				
				<ul onclick="this.eventHandlers.include(event)">{{this.buildExcludedList()}}</ul>
				<div class="message" 
					style="display: {{this.excluded.length == 0 ? 'block' : 'none'}}">Empty</div>
			</div>
		</div>`;
	}
	
	buildIncludedList() {
		return this.values.map((value, index) => {
			return !this.excluded.includes(value) ?
				this.buildItem(index, value) : '';
		}).join('');
	}
	
	buildExcludedList() {
		return this.excluded.map((value, index) => {
			return this.buildItem(index, value);
		}).join('');
	}
	
	eventHandlers = {
		include: (event) => {
			var li = event.target.closest('li');
			if (li)
				this.include(li.dataset.index);						
		},

		exclude: (event) => {
			var li = event.target.closest('li');
			if (li)
				this.exclude(li.dataset.index);					
		}
	};
	
	excludeAll() {
		for (var value of this.values) {
			if (!this.excluded.includes(value))
				this.excluded.push(value);
		}
		
		this.update();
		
		this.onChange(this);
	}
	
	includeAll() {
		this.excluded = [];
		this.update();
		this.onChange(this);
	}
	
	include(index) {
		this.excluded.splice(index, 1);
		this.update();
		this.onChange(this);
	}
	
	exclude(index) {
		this.excluded.push(this.values[index]);
		this.update();	
		this.onChange(this);
	}
	
	hasValues() {
		return this.values.length > 0;
	}
	
	setValues(values) {
		this.values = values;
		this.excluded = [];
		this.update();
		this.onChange(this);
		
		return this;
	}
	
	getExcluded() {
		return this.excluded;
	}
	
	getExcludedCount() {
		return this.excluded.length;
	}
	
	getIncludedCount() {
		return this.values.length - this.excluded.length;
	}
}
/** ../views/src/search/Search.js */


 class Search extends Openable {
	
	setDefaults() {
		super.setDefaults();
		
		this.set({
			values: [],
			displayedValues: [],
			constraint: '',	
			error: null,
			filter: (value, constraint) => {},
			buildItem: (index, value) => {},
			onSelect: (index, value) => {},
			getFetcher: () => {}
		});
	}
	
	getTemplate() {
		return `<div class="search outside-click-aware {{this.isOpen() ? 'opened' : ''}}">
			<div class="form-grup">
				<input type="submit" class="image-button icon-search" onclick="this.open()" value="">
				<input type="text" placeholder="Search" oninput="this.eventHandlers.filter(event)">
				<button type="button" class="image-button close" onclick="this.close()"></button>	
			</div>
			<div class="content">
				{{if (this.isFetching()) 
			 		\`<div class="loader"></div>\`;}}
				
				<ul onclick="this.eventHandlers.select(event)" 
					style="display: {{this.displayedValues.length ? 'block' : 'none'}}">{{this.populate()}}</ul>
				
				{{if (this.error) 
			 		\`<div class="error">{{@this.error}}</div>\`;}}
			</div>
		</div>`;
	}
	
	populate() {
		return this.displayedValues.map((value, index) => {
			return this.buildItem(index, value);
		}).join('');
	}
	
	eventHandlers = {
		filter: (event) => {
			this.constraint = event.target.value.toLowerCase().trim();
			if (this.hasValues()) {
				this.doFilter().update();
			}
			else if (!this.isFetching()) {
				this.fetchValues();
			}
		},

		select: (event) => {
			event.preventDefault();
			var li = event.target.closest('li');
			if (li) {
				var index = li.dataset.index;
				this.onSelect(index, this.displayedValues[index]);
				this.close();
			}
		}
	};

	close() {
		this.constraint = '';
		this.displayedValues = [];
		this.removeError();
		super.close();
	}
	
	doFilter() {
		this.displayedValues = this.constraint.length ? 
			this.values.filter(value => this.filter(value, this.constraint)).slice(0, 100) : [];
		
		return this;
	}
	
	hasValues() {
		return this.values.length > 0;
	}
	
	setError(error) {
		this.error = error;
		
		return this;
	}
	
	removeError() {
		return this.setError(null);
	}
	
	fetchValues() {
		this.setFetching(true).removeError().update();
		
		this.getFetcher().then(values => { 
			this.values = values;
				
			if (this.isOpen())
				this.doFilter();
		})
		.catch(error => {	   
			if (this.isOpen()) 
				this.setError('Fetching data error.');  
		})
		.finally(() => {
			this.setFetching(false);
			if (this.isOpen()) 
				this.update();
		})
		.fetch();
	}
}
/** ../views/src/table/Table.js */


 class Table extends Component {
	
	intersectionObserver;

	setDefaults() {
		super.setDefaults();
		
		this.set({
			values: [],
			sortingDetails: {},
			intersectionObserverEnabled: false,
			intersectionObserver: {
				root: null,
				rootMargin: '0px',
				threshold: 1.0
			}
		});
	}

	onCreate() {
		this.setupRows();
		super.onCreate();
	}

	onUpdate() {
		this.setupRows();
		super.onUpdate();
	}

	setValues(values) {
		this.values = values;
		
		return this;
	}

	hasValues() {
		return this.values.length > 0;
	}

	
	// Sort
	
	isSortedBy(key) {
		return this.sortingDetails.sortBy == key;
	}
	
	getSortOrder() {
		return this.sortingDetails.sortOrder;
	}
	
	sortBy(key) {
		var sortOrder = this.isSortedBy(key) ? 
			(this.sortingDetails.sortOrder == 'asc' ? 'desc' : 'asc') : 'desc';

		this.sortingDetails = {
			'sortBy': key,
			'sortOrder': sortOrder};
		
		this.sortValues(key, sortOrder);	
		this.update();
	}
	
	sortValues(sortBy, sortOrder) {}
	
	
	// IntersectionObserver
	
	setIntersectionObserverEnabled(value) {
		this.intersectionObserverEnabled = !!value;
		
		return this;
	}
	
	isIntersectionObserverEnabled() {
		return this.intersectionObserverEnabled;
	}
	
	setupRows() {
		if (this.isIntersectionObserverEnabled()) {
			this.intersectionObserver = null;
				
			this.querySelectorAll('tr').forEach(element => {
				if (element.parentNode.tagName.toLowerCase() != 'thead')
					this.getIntersectionObserver().observe(element)
			});	
		}
	}
	
	getIntersectionObserver() {
		if (!this.intersectionObserver)
			this.initIntersectionObserver();
		
		return this.intersectionObserver;
	}
	
	initIntersectionObserver() {		
		this.intersectionObserver = new IntersectionObserver(
			this.getIntersectionObserverCallback(), this.intersectionObserver);
	}
	
	getIntersectionObserverCallback() {}
}
/** ../views/src/tabs/Tabs.js */


 class Tabs extends Structure {

	setDefaults() {
		super.setDefaults();
		
		this.set({
			classes: 'tabs',
			floatation: true
		});
	}
}
/** ../views/src/tabs/pages/Pages.js */


 class Pages extends Component {
	
	//generated;
	
	setDefaults() {
		super.setDefaults();
		
		this.setSettersEnabled(true);
		
		this.set({
			active: null,
			pages: {},
			onChange: function(key) {}
		});		
	}
	
	getTemplate() {
		var pages = '';
		for (var key of Object.keys(this.pages)) {	
			pages += `<div class="page" style="display: {{this.isActive('${_(_(key))}') ? 'block' : 'none'}}">
					{{this.getContent('${_(_(key))}')}}
				</div>`;		
		}

		return `<div class="pages">${pages}</div>`;
	}

	getContent(key) {
		if (this.getGenerated().has(key)) 
			return Updatable.noChange;
			
		if (!this.isActive(key)) return '';

		var content = typeof this.pages[key].content == 'function' ?  
			this.pages[key].content() : this.pages[key].content;
		
		if ('title' in this.pages[key]) {	
			var title = typeof this.pages[key].title == 'function' ? 
				this.pages[key].title() : this.pages[key].title;
			
			content = [title, content]
		}
		
		this.getGenerated().add(key);

		return content;
	}
	
	isActive(key) {
		return this.active == key;
	}
	
	change(key) {
		if (!this.isActive(key)) {
			var previous = this.active;
			this.active = key;
			this.update();	
			this.onChange(key, this);
	
			if (previous && 'onInactive' in this.pages[previous])
				this.pages[previous].onInactive(this);
			
			if ('onActive' in this.pages[key])
				this.pages[key].onActive(this);
		}
	}
	
	getGenerated() {
		if (!this.generated)
			this.generated = new Set();
		
		return this.generated;
	}
	
	setPages(pages) {
		if (!this.pages) this.pages = {};
		
		for (var key of Object.keys(pages)) {
			this.setPage(key, pages[key]);
		}
		
		return this;
	}
	
	setPage(key, page) {
		if (page instanceof Object && 'content' in page) {
			this.pages[key] = page;
		}
		else {
			this.pages[key] = {
				content: page
			};
		}
					
		this.getGenerated().delete(key);
		
		return this;
	}	
	
	getPage(key) {
		return this.pages[key];
	}	
}
/** ../views/src/task/Task.js */


 class Task extends Component {

	static states = ['execute', 'success', 'fail'];
	state;
	result;
	error;
	// https://stackoverflow.com/questions/55479511/access-javascript-class-property-in-parent-class
	//events;
	
	setDefaults() {
		super.setDefaults();
		
		this.set({	
			task: async (component) => {},
			
			executeOnCreate: true,
			
			displayError: false,
			
			messages: {
				success: 'Task completed.',
				fail: 'An error occurred.'
			},
			
			/*onSuccess: (result, component) => {},
			onFail: (error, component) => {},
			onComplete: (component) => {},*/
			
			buildContent: (component) => {
				return `<p style="display: {{!this.isExecuting() ? 'block' : 'none'}}">
					{{switch(this.state) {
						case 'success':
							this.messages.success;
							break;
						 
						case 'fail':
							\`{{this.messages.fail}} {{this.displayError ? \`({{this.error}})\` : ''}}\`;
							break;
					}}}
					</p>
			
					<button class="button" type="button" onclick="this.execute()" 
						style="display: {{!this.isExecuting() && !this.isSuccessful() ? 'inline-block' : 'none'}}">
						{{switch(this.state) {
							case 'fail':
								'Retry';
								break;
							
							default:
								'Execute'
						}}}
					</button>`;
			}
		});
		
		this.events = new Events(); 
		var _this = this;
		function defineSetter(property) {
			Object.defineProperty(_this, property, {
				set(handler) {
					_this.events.setHandlers({
						[property.toLowerCase().replace(/^on/, '')]: handler
					});
				}
			});
		}
		
		defineSetter('onSuccess');
		defineSetter('onFail');
		defineSetter('onComplete');
	}
	
	getTemplate() {
		return `<div class="task {{this.isExecuting() ? '_loader' : ''}}">
			${this.buildContent(this)}
		</div>`;
	}
	
	onCreate() {
		if (this.executeOnCreate)
			this.execute();
			
		super.onCreate();
	}
	
	setState(state) {
		this.state = state;
		
		return this;	
	}
	
	setResult(result) {
		this.result = result;
		
		return this;	
	}
	
	setError(error) {
		this.error = error;
		
		return this;	
	}

	execute(onSuccess, onFail, onComplete) {
		//console.log(this);
		
		this.events.setSingleUseHandler('success', onSuccess);
		this.events.setSingleUseHandler('fail', onFail);
		this.events.setSingleUseHandler('complete', onComplete);
		
		if (!this.isExecuting()) {
			this.setState('execute').update();
			
			this.task(this).catch(error => {  
				this.setState('fail').setError(error).update();
				this.events.trigger('fail', error, this);
			})
			.then(result => {						 
				if (result) {
					this.setState('success').setResult(result).update();
					this.events.trigger('success', result, this);
				}
			})
			.finally(() => {	
				this.events.trigger('complete', this);
			});	
		}
		
		return this;
	}
	
	// async/await version.
	/*async execute(onSuccess, onFail, onComplete) {
		this.events.setSingleUseHandler('success', onSuccess);
		this.events.setSingleUseHandler('fail', onFail);
		this.events.setSingleUseHandler('complete', onComplete);
		
		if (!this.isExecuting()) {
			this.setState('execute').update();
			
			try {
				var result = await this.task(this);
			} 
			catch(error) {
				this.setState('fail').setError(error).update();
				this.events.trigger('fail', error, this);
				
				return;
			}

			this.setState('success').setResult(result).update();
			this.events.trigger('success', result, this);

			this.events.trigger('complete', this);
		}
	}*/
	
	isExecuting() {
		return this.state == 'execute';
	}

	isSuccessful() {
		return this.state == 'success';
	}
	
	isFailed() {
		return this.state == 'fail';
	}
	
	isComplete() {
		return this.state == 'success' || this.state == 'fail';
	}
}
/** ../views/src/export.js */















export {Dropdown,Structure,Selector,Search,Table,Tabs,Pages,Chart,MultiSeriesChart,AggregateChart,ChartCard,Task,Dialog,Expandable};