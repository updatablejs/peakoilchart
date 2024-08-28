<?php

namespace library;

use ujb\common\AbstractApp;

class App extends AbstractApp {

	public static function getConfig($module = null) {
		return $module ? static::getModule($module)->get('config') : static::getInstance()->get('config');
	}
	
	public static function isEnvironment(...$environment) {
		return in_array(static::getConfig()->get('environment'), $environment);
	}
}
