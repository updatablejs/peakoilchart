<?php

// Files

require('../ujb/src/functions/common.php');

// require('library/ujb/functions/common.php'); // todo probleme pe server

require('library/functions.php');


// Errors

error_reporting(E_ALL);
set_error_handler('errorHandler');
set_exception_handler('exceptionHandler');


// Timezone

date_default_timezone_set('UTC');
mb_internal_encoding('UTF-8');


// Initialize

use library\App,
	ujb\common\Util, 
	ujb\common\Chronometer,
	ujb\events\Events;

try {
	App::getInstance()->setResources(
		require('settings/resources.php'));


	App::getModules();


	$route = App::getRoute();
	if (!$route) {
		App::getTheme()->setFilePath('resources/main.php')
			->display();
		
		exit;
	}

	$controller = $route->controller;
	if (!Util::isAbsolutePath($controller)) {
		if (!Util::isPath($controller)) 
			$controller = ucfirst($controller);
		
		$controller = 'modules\\' . $route->module . '\controllers\\' . $controller;
	}
	
	$controller = new $controller(App::getInstance());
	
	
	$action = 'action' . ucfirst($route->action);
	
	
	$response = $controller->$action();
	
	if (is_null($response))
		$response = $controller->getResponse();

	$response->send();
	
	
}
catch (\Exception $e) {
	throw new \Exception($e);
}


// todo pe server exista o problema cu gruparea coloanelor
// App::getDatabase()->query("SET SESSION sql_mode = 'TRADITIONAL'");





