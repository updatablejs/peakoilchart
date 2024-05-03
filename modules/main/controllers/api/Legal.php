<?php

namespace modules\main\controllers\api;

use library\Controller;

class Legal extends Controller {

	public function actionPrivacyPolicy() {
		$this->setContentType('text/plain')
			->setContent('modules/main/lang/' . $this->route->lang . '/legal/privacyPolicy.html');	
	}

	public function actionTermsAndConditions() {
		$this->setContentType('text/plain')
			->setContent('modules/main/lang/' . $this->route->lang . '/legal/termsAndConditions.html');	
	}
}
