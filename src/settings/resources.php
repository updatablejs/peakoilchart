<?php

use library\App,
	ujb\resources\Resources,
	ujb\router\Router,
	ujb\router\valuesContainer\valuesContainerFactory\AbstractValuesContainerFactory,
	ujb\router\valuesContainer\AbstractValuesContainer,
	ujb\common\Chronometer,
	ujb\common\Locale,
	ujb\database\Database,
	ujb\database\adapters\pdo\Driver,
	ujb\cache\FileCache,
	ujb\database\orm\Orm,
	ujb\http\RequestFactory,
	ujb\collection\ArrayMap,
	ujb\fileIterator\FileIteratorInterface,
	ujb\fileIterator\FileIteratorFactory,
	ujb\mvc\builder\ThemeBuilder,
	ujb\mvc\Theme;

return (new Resources())->set('chronometer', new Chronometer())
	
	->set('config', function() {
		return new ArrayMap(require('settings/config.php'));
	})
	
	->set('modules', function() {		
		$modules = new ArrayMap();
		foreach (new \DirectoryIterator('modules') as $file) {			
    		if (!$file->isDir() || $file->isDot()) continue;

			$modules->set($file->getFilename(), file_exists('modules/' . $file->getFilename() . '/settings/resources.php') ?
				require('modules/' . $file->getFilename() . '/settings/resources.php') : new Resources());
			
			if (file_exists('modules/' . $file->getFilename() . '/settings/routes.php')) {
				$this->router->setRoute($file->getFilename(), [
					'module' => $file->getFilename(),
					'routable' => false,
					'routes' => require('modules/' . $file->getFilename() . '/settings/routes.php')
				]);
			}

			if (file_exists('modules/' . $file->getFilename() . '/settings/schema.php')) {
				$this->schema->setTables(
					require('modules/' . $file->getFilename() . '/settings/schema.php'));
			}

			if (file_exists('modules/' . $file->getFilename() . '/lang/' . $this->config->get('lang') . '.php')) {
				$this->locale->setTranslations(
					require('modules/' . $file->getFilename() . '/lang/' . $this->config->get('lang') . '.php'));
			}
		}
		
		return $modules;
	})
	
	->set('module', function($name) {
		return $this->modules->get($name);
	}, false)
	
	->set('locale', function() {
		return (new Locale())->setTranslations(require('resources/lang/' . $this->config->get('lang') . '.php'));
	})


	// Http
	
	->set('request', function() {
		return RequestFactory::create()->setSitePath(
			$this->config->get('sitePath'));
	})
	
	->set('cookies', 'ujb\http\response\cookies\Cookies')
	
	->set('headers', 'ujb\http\response\Headers')
	
	
	// Orm
	
	->set('database', function() {		
		$driver = new Driver($this->config->get('database'));
		
		return (new Database($driver))
			->setCache(new FileCache('resources/temp/cache'));
	})
	
	->set('schema', 'ujb\database\orm\schema\Schema')
	
	->set('orm', function() {
		return new Orm($this->database, $this->schema);
	})
	
	
	// Router
	
	->set('router', function() {
		$valuesContainerFactory = new class() extends AbstractValuesContainerFactory {
		
			public function create(array $values = null) {
				return new class($values) extends AbstractValuesContainer {
				
					public function setEvents(array $events) {
						$this->values['events'] = $events;
					}
				}; 
			}
		};
		
		return (new Router())->setValuesContainerFactory($valuesContainerFactory);
	})
	
	->set('route', function() {
		return $this->router->match($this->request);
	})
	
	
	// Theme

	->set('themeBuilder', function() {
		if (!$theme = $this->config->get('theme')) 
			throw new \Exception('Theme is missing from config.');
		
		$values = require('themes/development/' . $theme . '/resources/builder.php');
		if (!($values['source'] instanceof FileIteratorInterface)) 
			$values['source'] = FileIteratorFactory::create($values);
		
		return new ThemeBuilder($values);
	})

	->set('theme', function() {
		if (!$theme = $this->config->get('theme')) 
			throw new \Exception('Theme is missing from config.');
			
		if (App::isEnvironment('production'))
			$this->themeBuilder->buildIfNeeded();
		else
			$theme = 'development/' . $theme;
			
		$themeUrl = '/themes/' . $theme;
		if ($sitePath = $this->config->get('sitePath'))
			$themeUrl = $sitePath . $themeUrl;
		
		return (new Theme())->setThemePath('themes/' . $theme)
			->setThemeUrl($themeUrl)
			->setSiteUrl($sitePath)
			->setBuilder($this->themeBuilder);
	});
