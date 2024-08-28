<?php

namespace library;

use ujb\mvc\AbstractController, 
	ujb\inputControl\InputControl,
	ujb\http\response\Response,
	ujb\http\Redirect,
	ujb\common\Util,
	library\App;

class Controller extends AbstractController {

	public $app;
	public $response;
	
	public function __construct(App $app = null) {
		$this->app = $app ? $app : App::getInstance();

		$this->response = (new Response())->setSuccess(true);
	}
	
	public function getResponse() {
		return $this->response;
	}
	
	public function set($key, $value = null) {
		return $this->response->set($key, $value);
	}
	
	public function setValues(iterable $values) {
		return $this->response->set($values);
	}
	
	public function setContent($content) {
		return $this->response->setContent($content);
	}
	
	public function setFile($file) {
		if (!Util::isAbsolutePath($file))
			$file = 'modules/' . $this->route->module . '/' . $file;

		$this->theme->setFilePath($file);
		
		$this->response->setTheme($this->theme);

		return $this->response;
	}

	public function setContentType($value) {
		return $this->response->setContentType($value);
	}

	public function getEntity($table, $values = null) {
		if ($values instanceof InputControl)
			$values = $values->getValues();
		
		return $this->orm->getEntity($table, $values);
	}
	
	public function getMapper($table) {
		return $this->orm->getMapper($table);
	}

	public function getSelector($table) {
		return $this->getMapper($table)->getSelector();
	}

    public function __get($name) {
		return $this->app->get($name);
    }


	// Request
	
	public function hasPost(...$keys) {
		return $this->request->hasPost(...$keys);	
	}
	
	public function getPost($keys = null, $default = null) {
		return $this->request->getPost($keys, $default);
	}
	
	public function hasQuery(...$keys) {
		return $this->request->hasQuery(...$keys);		
	}
	
	public function getQuery($keys = null, $default = null) {
		return $this->request->getQuery($keys, $default);
	}
}
