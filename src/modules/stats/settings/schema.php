<?php

return [
	'categories' => [
		'fields' => ['category_id', 'parent_id', 'name', 'description', 'slug', 'updated_at'],
		'primaryKey' => 'category_id',
		'mapper' => 'modules\stats\models\mappers\Categories', 
		'entity' => 'modules\stats\models\entities\Category',
		'joins' => [
			'categories' => [ 
				'table' => 'categories',
				'type' => 'otm',
				'on' => [
					'internal' => 'category_id',
					'external' => 'parent_id',
				]
			],
			
			'parent' => [
				'table' => 'categories',
				'refer' => 'categories'
			]
		]
	],

	'measure_units' => [
		'fields' => ['measure_unit_id', 'symbol', 'name'],
		'primaryKey' => 'measure_unit_id',
		'mapper' => 'modules\stats\models\mappers\MeasureUnits', 
		'entity' => 'modules\stats\models\entities\MeasureUnit',
	],
	
	'countries' => [
		'fields' => ['country_id', 'name', 'slug', 'alpha_2_code', 'alpha_3_code', 'numeric_code'],
		'primaryKey' => 'country_id',
		'mapper' => 'modules\stats\models\mappers\Countries', 
		'entity' => 'modules\stats\models\entities\Country',
	],

	'entries' => [
		'fields' => ['entry_id', 'category_id', 'country_id', 'value', 'date'],
		'primaryKey' => 'entry_id',
		'mapper' => 'modules\stats\models\mappers\Entries', 
		'entity' => 'modules\stats\models\entities\Entry',
	],
	
	'latest_entries' => [
		'fields' => ['category_id', 'country_id', 'value', 'updated_at'],
		'primaryKey' => ['category_id', 'country_id'],
		'mapper' => 'modules\stats\models\mappers\LatestEntries', 
		'entity' => 'modules\stats\models\entities\LatestEntry',
	]
];
