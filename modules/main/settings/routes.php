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
						'path' => 'config',
						'action' => 'config'
					]
				]
			],
			
			'legal' => [
				'path' => ':lang/legal',
				'models' => ['lang' => '[a-z]+'],
				'controller' => 'api\Legal',
				'routable' => false,
				'routes' => [
					'privacyPolicy' => [
						'path' => 'privacy-policy',
						'action' => 'privacyPolicy'
					],
					
					'termsAndConditions' => [
						'path' => 'terms-and-conditions',
						'action' => 'termsAndConditions'
					]
				]
			]
		]
	]
];
