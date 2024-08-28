<?php

use library\App,
	ujb\mvc\builder\builders\handlers\Helper;

return (function() {

	$css = function($source, $to) {
		return [
			'type' => 'css',
			'source' => $source,
			'to' => $to
		];
	};

	$source = 'themes/development/default';
	$to = 'themes/default';

	return [
		'source' => $source,
		'to' => $to,
		'deletionConstraint' => $to,
		'fileConstraint' => function($file) use ($source) {
			$exclude = [$source . '/resources/builder.php', 
				$source . '/library/vendor/updatableJs/updatableJs.js', 
				$source . '/library/vendor/views/views.js'];
			
			return !in_array((string) $file, $exclude);
		},
		
		'builders' => [
			
			// UpdatableJs
			
			[
				'source' => '../updatableJs/src',
				'to' => $to . '/library/vendor/updatableJs/updatableJs.js',	
				'exporters' => ['../updatableJs/src/export.js']
			],
			
			
			// Views
		
			$css('../views/src', $to . '/library/vendor/views/views.css'), 
			
			[
				'source' => '../views/src',
				'to' => $to . '/library/vendor/views/views.js',
				'exporters' => ['../views/src/export.js']
			],
			
			
			// App
			
			[
				'source' => $to . '/resources',
				'to' => $to . '/resources/css/app.css',
				'type' => 'css',
				
				'order' => [
					'up' => [
						$to . '/resources/css/normalize.css', 
						$to . '/resources/css/common.css', 
						$to . '/resources/css/style.css', 
						$to . '/resources/css/icons.css', 
						$to . '/resources/css/flags/flags.css'
					]
				]
			],
			
			
			/** 
			 * Modules
			 */
			
			// Main

			$css($to . '/modules/main', $to . '/modules/main/resources/css/main.css'), 
			
			[
				'source' => $to . '/modules/main',
				'to' => $to . '/modules/main/main.js',	
				'exporters' => [$to . '/modules/main/export.js']
			],
			
			
			// Stats		
			
			$css($to . '/modules/stats', $to . '/modules/stats/resources/css/stats.css'), 
			
			[
				'source' => $to . '/modules/stats',
				'to' => $to . '/modules/stats/stats.js',
				'exporters' => [$to . '/modules/stats/export.js']
			]
		]
	];
	
})();
