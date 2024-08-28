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
					'address' => '1HDVZkMztinum7SbsNmjimkx1jF6LAfgn',
					'qrcode' => _url('/themes/' . $theme . '/modules/stats/resources/images/donate/codes/btc.png')
				],
				
				'ethereum' => [
					'name' => 'Ethereum',
					'symbol' => 'eth',
					'image' => _url('/themes/' . $theme . '/modules/stats/resources/images/donate/images/eth.png'),
					'address' => '0x524c2BD72Be78dBe9f16A6F00a8F94f630be563F',
					'qrcode' => _url('/themes/' . $theme . '/modules/stats/resources/images/donate/codes/eth.png')
				],
				
				/*'monero' => [
					'name' => 'Monero',
					'symbol' => 'xmr',
					'image' => _url('/themes/' . $theme . '/modules/stats/resources/images/donate/images/xmr.png'),
					'address' => '',
					'qrcode' => _url('/themes/' . $theme . '/modules/stats/resources/images/donate/codes/xmr.png')
				]*/
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
