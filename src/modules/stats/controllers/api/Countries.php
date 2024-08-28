<?php

namespace modules\stats\controllers\api;

use library\Controller;

class Countries extends Controller {

	public function actionList() {
		$this->setValues($this->getMapper('countries')->get());
	}
}
