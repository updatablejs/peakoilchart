<?php

namespace modules\stats\models\mappers;

use ujb\database\orm\mapper\Mapper,
	ujb\common\Util,
	library\App;

class Entries extends Mapper {

	public function getCategoryLatestEntries($categoryId) {	
		$population = $this->getMapper('latest_entries')->getCategoryLatestEntries(3)->fetchAll();
		$total = $this->getMapper('latest_entries')->getCategoryTotal($categoryId);
		$capacity = $this->getCapacity($categoryId);
		
		return $this->prepare(
			'SELECT t1.country_id, t1.category_id, t1.value, t1.date_updated,
			
					countries.country_id, countries.name, countries.slug, countries.alpha_2_code AS code,
			
					t2.value, TIMESTAMPDIFF(YEAR, t2.date, t1.date_updated) AS years, 
				
					ROUND(((t1.value - t2.value) * 100 / t2.value), 1) AS percentage
		
				FROM latest_entries AS t1
				
    	
				LEFT JOIN (SELECT country_id, AVG(value) AS value, date FROM entries 
						WHERE category_id = ?
						GROUP BY country_id, YEAR(date)) AS t2
        	
					ON t1.country_id = t2.country_id AND TIMESTAMPDIFF(YEAR, t2.date, t1.date_updated) IN (1, 10)
		
		
				LEFT JOIN countries ON t1.country_id = countries.country_id
		
	
				WHERE t1.category_id = ?
	
				ORDER BY t1.value DESC'
			)
			
			->setParams([$categoryId, $categoryId])
			
			->setAssembler([
				'structure' => ['t1.countries(country)', 't1.t2*(changes)'],
				
				'groups' => [
					't2' => function($values) {
						return 'y' . $values['years'];
					}
				],
				
				'interceptors' => function($values) use ($population, $total, $capacity) {
					unset($values['country_id']);
					
					/*if (!isset($values['country']))
						$values['country'] = [];*/
						
					$values['per_capita'] = isset($population[$values['country']['country_id']]) ?
						Util::gracefulRound($values['value'] / $population[$values['country']['country_id']]['value'], 4, 16) : null;
						
					$values['world_share'] = Util::gracefulRound($values['value'] * 100 / $total, 1, 6);
					
					if (isset($capacity) && isset($capacity[$values['country']['country_id']])) 
						$values['per_capacity'] = round($values['value'] / $capacity[$values['country']['country_id']]['value'], 2);
				
					return $values;
				}
			])
			
			->setMetadata([
				9 => ['table' => 't2'],
				10 => ['table' => 't2']
			])
			
			->setValidity(App::getConfig()->get('validity'))
			
			->execute();
	}
	
	protected function getCapacity($categoryId) {
		$categories = [
			43 => 42, 
			46 => 45,  
			49 => 48, 
			52 => 51, 
			55 => 54, 
			58 => 57, 
			61 => 60
		];
		
		return isset($categories[$categoryId]) ? 
			$this->getMapper('latest_entries')->getCategoryLatestEntries($categories[$categoryId])->fetchAll() : null;
	}
	
	public function getCategorySparklines($categoryId) {
		return $this->prepare(
			'SELECT country_id, AVG(value) AS value, date FROM entries 
				WHERE category_id = ?
				GROUP BY country_id, YEAR(date), FLOOR(MONTH(date)/4)
				ORDER BY date ASC'
			)
			->setParam($categoryId)
			->setAssembler([
				'groups' => ['country_id', true],

				'interceptors' => function($values) {
					$date = new \DateTime($values['date']);
		
					return [$date->getTimestamp(), $values['value']];
				}
			])
			->setValidity(App::getConfig()->get('validity'))
			->execute();
	}

	public function getCategoryGroupedEntries($categoryId, array $excludedCountries = null) {
		$sql = $this->getSql(
			'SELECT date, SUM(value) AS value 
				FROM entries WHERE {where}
				GROUP BY YEAR(date), MONTH(date)'
			)
			->where('category_id = ?', $categoryId);	
			
		if ($excludedCountries)
			$sql->where('country_id NOT IN (?)', $excludedCountries);
			
		return $sql->prepare()
			->setAssembler([
				'interceptors' => function($values) {
					$date = new \DateTime($values['date']);
		
					return [$date->getTimestamp() * 1000, round($values['value'], 2)];
				}
			])
			->setValidity(App::getConfig()->get('validity'))
			->execute();	
	}

	public function getCountryCategoryEntries($countryId, $categoryId, $assembler = null) {	
		if (!$assembler) {
			$assembler = [
				'interceptors' => function($values) {
					$date = new \DateTime($values['date']);
		
					return [$date->getTimestamp() * 1000, $values['value']];
				}
			];
		}
		
		return $this->prepare(
			'SELECT * FROM entries 
				WHERE category_id = ? AND country_id = ? 
				ORDER BY date ASC'
			)
			->setParams([$categoryId, $countryId])	
			->setAssembler($assembler)
			->setValidity(App::getConfig()->get('validity'))
			->execute();	
	}
	
	public function getCountryCategoriesValues($countryId, array $categoryIds) {	
		$population = $this->getMapper('latest_entries')->getCountryPopulation($countryId);
		
		$rank = $this->getMapper('latest_entries')
			->getCountryCategoriesRank($countryId, $categoryIds)->fetchAll();
		
		$total = $this->getMapper('latest_entries')
			->getCategoryTotals($categoryIds)->fetchAll();
		
		return $this->getSql(
			'SELECT t1.category_id, t1.value, t1.date_updated,
					
					t2.value, TIMESTAMPDIFF(YEAR, t2.date, t1.date_updated) AS years,
				
					ROUND(((t1.value - t2.value) * 100 / t2.value), 1) AS percentage
					

				FROM latest_entries AS t1
				
 
				LEFT JOIN (SELECT country_id, category_id, AVG(value) AS value, date FROM entries 
						WHERE country_id = ? AND category_id IN (?)
           				GROUP BY category_id, YEAR(date)) AS t2
        	
					ON t1.category_id = t2.category_id AND TIMESTAMPDIFF(YEAR, t2.date, t1.date_updated) IN (1, 10)
				
				
				WHERE t1.country_id = ? AND t1.category_id IN (?)'
			)
			
			->setParams([
				$countryId, $categoryIds, $countryId, $categoryIds
			])
			
			->prepare()
			
			->setAssembler([
				'structure' => ['t1.t2*(changes)'],
					
				'groups' => [
					'main' => 'category_id',
					
					't2' => function($values) {
						return 'y' . $values['years'];
					}
				],
				
				'interceptors' => function($values) use ($population, $rank, $total) {
					if (isset($values['changes']['y1']))
						$values['y1'] = $values['changes']['y1']['percentage'];
					
					if (isset($values['changes']['y10']))
						$values['y10'] = $values['changes']['y10']['percentage'];

					unset($values['changes']);
					
					$values['per_capita'] = Util::gracefulRound($values['value'] / $population, 4, 16);
					
					$values['world_share'] = Util::gracefulRound($values['value'] * 100 / $total[$values['category_id']], 1, 6);
					
					if (isset($rank[$values['category_id']]))
						$values['rank'] = $rank[$values['category_id']];
						
					return $values;
				}
			])
			
			->setMetadata([
				4 => ['table' => 't2'],
				5 => ['table' => 't2']
			])
			
			->setValidity(App::getConfig()->get('validity'))
			
			->execute();
	}
}
