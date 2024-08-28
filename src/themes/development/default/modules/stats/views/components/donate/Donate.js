
import {App, Component, Dialog, ChartCard, Util, _url, _} from '../../../import.js';

export class Donate extends Component {
	
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
