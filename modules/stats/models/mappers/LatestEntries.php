<?php

namespace modules\stats\models\mappers;

use ujb\database\orm\mapper\Mapper,
	library\App;

class LatestEntries extends Mapper {

	public function getCountryPopulation($countryId) {	
		$result = $this->getOneByConditions([
			'category_id' => 3,
			'country_id' => $countryId,
		], App::getConfig()->get('validity'));
		
		return $result ? $result['value'] : null;
	}
	
	public function getCategoryTotal($categoryId) {
		return $this->prepare(
				'SELECT SUM(value) FROM latest_entries WHERE category_id = ?'	
			)
			->setParam($categoryId)
			->setValidity(App::getConfig()->get('validity'))
			->execute()
			->fetchColumn(0);
	}
	
	public function getCategoryTotals(array $categoryIds) {
		return $this->getSql(
				'SELECT category_id, SUM(value) as total FROM latest_entries 
					WHERE category_id IN (?)
   				 	GROUP BY category_id;'	
			)
			->setParam($categoryIds)
			->prepare()
			->setAssembler([
				'groups' => 'category_id',
				
				'interceptors' => function($values) {
					return $values['total'];
				}
			])
			->setValidity(App::getConfig()->get('validity'))
			->execute();
	}
	
	public function getCountryCategoriesRank($countryId, array $categoryIds) {
		return $this->getSql(
			'SELECT *, COUNT(*) AS rank FROM 
				
				(SELECT t1.category_id FROM latest_entries AS t1
    
   					LEFT JOIN latest_entries AS t2 
    					ON t1.category_id = t2.category_id AND t1.value <= t2.value
    
    				WHERE t1.country_id = ? AND t1.category_id IN (?)
    
				) AS t3
  
  				GROUP BY t3.category_id'
			)
			->setParams([
				$countryId, $categoryIds
			])
			->prepare()
			->setAssembler([
				'groups' => 'category_id',
				
				'interceptors' => function($values) {
					return $values['rank'];
				}
			])
			->setValidity(App::getConfig()->get('validity'))
			->execute();
	}
	
	public function getCategoryLatestEntries($categoryId) {
		return $this->prepare(
			'SELECT country_id, value, date_updated FROM latest_entries 
				WHERE category_id = ?'
			)
			->setParam($categoryId)
			->setAssembler([
				'groups' => 'country_id'
			])
			->setValidity(App::getConfig()->get('validity'))
			->execute();
	}
}
