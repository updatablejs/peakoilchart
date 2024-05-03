<?php

namespace modules\stats\controllers\api;

use library\Controller;

class Categories extends Controller {

	public function actionLatestEntries() {
		$this->setValues(
			$this->getMapper('entries')->getCategoryLatestEntries($this->route->categoryId));
	}
	
	public function actionGroupedEntries() {
		$excludedCountries = $this->hasQuery('excludedCountries') ? 
			explode(',', $this->getQuery('excludedCountries')) : null;
		
		$this->setValues(
			$this->getMapper('entries')->getCategoryGroupedEntries($this->route->categoryId, $excludedCountries));
	}
	
	public function actionSparklines() {
		$this->setValues(
			$this->getMapper('entries')->getCategorySparklines($this->route->categoryId));
	}
	
	public function actionCountryEntries() {
		$this->setValues(
			$this->getMapper('entries')->getCountryCategoryEntries($this->route->countryId, $this->route->categoryId));
	}
	
	public function actionList() {
		$this->setValues(array_values($this->_actionList()));
	}

	public function _actionList() {
		$categories = $this->getMapper('categories')
			->getCategories()->fetchAll();
		
		$result = [];
		foreach ($categories as $id => &$category) {
			if ($category['parent_id'])
				$categories[$category['parent_id']]['categories'][] = &$category;
			else
				$result[$id] = &$category;
		}
	
		return $result;
	}
	
	public function actionCountryValues() {
		$categories = $this->_actionList();
		if (!isset($categories[$this->route->categoryId])) {
			return $this->response->setSuccess(false)
				->setMessage('Unknown category.');
		}
		
		$category = $categories[$this->route->categoryId];

		$getIds = function($category) use (&$getIds) {
			$ids = [];
			if (isset($category['categories'])) {				
				foreach ($category['categories'] as $c) {
					if (isset($c['categories']))
						$ids = array_merge($ids, $getIds($c));
					else
						$ids[] = $c['category_id'];
				}
			}
			else
				$ids[] = $category['category_id'];

			return $ids;	
		};
		
		$values = $this->getMapper('entries')->getCountryCategoriesValues(
			$this->route->countryId, $getIds($category))->fetchAll();
	
		$merge = function(&$category) use (&$merge, $values) {
			if (isset($category['categories'])) {
				foreach ($category['categories'] as &$c) {
					$merge($c);
				}
			}
			elseif (isset($values[$category['category_id']])) {
				$category = array_merge($category, $values[$category['category_id']]);
			}
			
			return $category;	
		};
		
		$this->setValues($merge($category));
	}
}
