<?php

namespace modules\stats\models\mappers;

use ujb\database\orm\mapper\Mapper, 	
	library\App;

class Categories extends Mapper {

	public function getCategoryBySlugs(array $slugs) {
		foreach ($slugs as $slug) {
			if (isset($category)) {
				$category = $this->getOneByConditions([
					'slug' => $slug,
					'parent_id' => $category->category_id]);
			}
			else 
				$category = $this->getOneByConditions(['slug' => $slug]);
			
			if (!$category) return null;
			
			if (isset($parent))
				$category->parent = $parent;
			
			$parent = $category;
		}
		
		return isset($category) ? $category : null;
	}
	
	public function getCategories() {
		$interceptor = function($values) {
			unset($values['measure_unit_id']);
						
			return $values;
		};
		
		return $this->prepare(
			'SELECT * FROM categories 
				LEFT JOIN measure_units ON categories.measure_unit_id = measure_units.measure_unit_id'
			)
			->setAssembler([
				'structure' => ['categories.measure_units(measure_unit)'],
			
				'groups' => [
					'main' => 'category_id',
				],
				
				'interceptors' => [
					'main' => $interceptor,
					'measure_units' => $interceptor
				]
			])
			->setValidity(App::getConfig()->get('validity'))
			->execute();
	}
}
