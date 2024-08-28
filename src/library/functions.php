<?php

use library\App;

spl_autoload_register(function ($class) {
	// todo probleme pe server
	/*$file = preg_replace('/^ujb/', 'library/ujb', $class) . '.php';


	if (preg_match('/^ujb/', $class)) {
		printr($class, $file);
		exit;
	}
	*/
	$file = preg_replace('/^ujb/', '../ujb/src', $class) . '.php';



	require str_replace('\\', '/', $file);
});

function __($value) {
	return App::getLocale()->translate($value);
}

function _url($url) {
	return rtrim(App::getConfig()->get('sitePath'), '/') . '/' . ltrim($url, '/');
}

function errorHandler($severity, $message, $file, $line) {
    throw new \ErrorException($message, 0, $severity, $file, $line);
}

function exceptionHandler($exception) {
	echo 'Uncaught exception:<br>';
	echo 'Message: '.$exception->getMessage().'<br>';
	echo 'Code: '.$exception->getCode().'<br>';
	echo 'File: '.$exception->getFile().'<br>';
	echo 'Line: '.$exception->getLine().'<br>';
	//printr($exception->getTrace());
	echo '<br><br><br>' . nl2br($exception->__toString());
}
