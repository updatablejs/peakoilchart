<?php

return [
	'api' => [
		'path' => '/api',
		'routable' => false,
		'routes' => [
			'main' => [
				'controller' => 'api\Main',	
				'routable' => false,
				'routes' => [
					'config' => [
						'path' => 'stats/config', // I use "stats/" to differentiate from main module.
						'action' => 'config'
					],
					
					'measureUnits' => [
						'path' => 'measure-units',
						'action' => 'measureUnits'
					]
				]
			],

			'categories' => [
				'path' => 'categories',
				'controller' => 'api\Categories',	
				'routable' => false,
				'routes' => [
					'list' => [
						'path' => 'list',
						'action' => 'list'
					],
					
					'latestEntries' => [
						'path' => ':categoryId/latest-entries',
						'models' => ['categoryId' => '[0-9]+'],
						'action' => 'latestEntries'
					],
					
					'groupedEntries' => [
						'path' => ':categoryId/grouped-entries',
						'models' => ['categoryId' => '[0-9]+'],
						'action' => 'groupedEntries'
					],
					
					'sparklines' => [
						'path' => ':categoryId/sparklines',
						'models' => ['categoryId' => '[0-9]+'],
						'action' => 'sparklines'
					],
					
					'countryEntries' => [
						'path' => ':categoryId/entries/:countryId',
						'models' => [
							'categoryId' => '[0-9]+', 
							'countryId' => '[0-9]+'
						],
						'action' => 'countryEntries'
					],
					
					'countryValues' => [
						'path' => ':categoryId/country-values/:countryId',
						'models' => [
							'categoryId' => '[0-9]+',
							'countryId' => '[0-9]+'
						],
						'action' => 'countryValues'
					]
				]
			],
			
			'countries' => [
				'path' => 'countries',
				'controller' => 'api\Countries',	
				'routable' => false,
				'routes' => [
					'list' => [
						'path' => 'list',
						'action' => 'list'
					]
				]
			]
		]
	],

	'import' => [
		'path' => '/import',
		'routable' => false,	
		'routes' => [
			'eia' => [
				'path' => 'eia',
				'controller' => 'import\Eia',
				'action' => 'import'
			]
		]
	]
];
