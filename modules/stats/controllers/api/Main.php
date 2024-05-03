<?php

namespace modules\stats\controllers\api;

use library\Controller, 
	library\App;

class Main extends Controller {

	public function actionConfig() {
		$theme = App::isEnvironment('production') ? 
			App::getConfig()->get('theme') : 'development/' . App::getConfig()->get('theme');
		
		$this->setValues([
			'donate' => [
				'paypal' => [
					'title' => 'Donate with PayPal',
					'image' => _url('/themes/' . $theme . '/modules/stats/resources/images/donate/images/paypal.png'),
					'address' => 'https://www.paypal.com/donate/?hosted_button_id=M9R9Y3DMARFRN',
				],
				
				'buymeacoffee' => [
					'title' => 'Buy me a coffee',
					'image' => _url('/themes/' . $theme . '/modules/stats/resources/images/donate/images/buymeacoffee.png'),
					'address' => 'https://www.buymeacoffee.com/peakoilchart',
				],
				
				'bitcoin' => [
					'name' => 'Bitcoin',
					'symbol' => 'btc',
					'image' => _url('/themes/' . $theme . '/modules/stats/resources/images/donate/images/btc.png'),
					'address' => '1ABjN3cc7YX8o5GqAFvFsaTyULVT4JVXB1',
					'qrcode' => _url('/themes/' . $theme . '/modules/stats/resources/images/donate/codes/btc.png')
				],
				
				'ethereum' => [
					'name' => 'Ethereum',
					'symbol' => 'eth',
					'image' => _url('/themes/' . $theme . '/modules/stats/resources/images/donate/images/eth.png'),
					'address' => '0x68Cd9BD156CEa650421892061D1c0cF0B108BE33',
					'qrcode' => _url('/themes/' . $theme . '/modules/stats/resources/images/donate/codes/eth.png')
				],
				
				'monero' => [
					'name' => 'Monero',
					'symbol' => 'xmr',
					'image' => _url('/themes/' . $theme . '/modules/stats/resources/images/donate/images/xmr.png'),
					'address' => '4AmpvdouX9XE2QuoP5euZUWYfcZufiM7pTP1Fs7FUt5ySGNpWbxrEoVjpPMcmX9zE9a766XxfQiiqYRwFbunCuCz1JrL6VH',
					'qrcode' => _url('/themes/' . $theme . '/modules/stats/resources/images/donate/codes/xmr.png')
				]
			],
			
			'source' => 'https://github.com/updatablejs/peakoilchart'
		]);	
	}

	public function actionMeasureUnits() {
		$this->setValues(
			$this->getMapper('measure_units')->getSelector()
				->setAssembler([
					'groups' => 'symbol',
					'interceptors' => function($values) {
						unset($values['measure_unit_id']);
							
						return $values;
					}
				])
				->fetchAll()
		);	
	}
}
