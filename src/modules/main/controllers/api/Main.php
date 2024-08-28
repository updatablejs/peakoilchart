<?php

namespace modules\main\controllers\api;

use library\Controller;

class Main extends Controller {

	public function actionConfig() {
		$this->setValues([
			'contact' => [
				'email' => [
					'value' => 'peakoilchart@protonmail.com',
					'icon' => 'icon-mail'
				],
				
				'github' => [
					'value' => 'Github',
					'href' => 'https://github.com/updatablejs/peakoilchart',
					'icon' => 'icon-github'
				]
			]
		]);	
	}
}
