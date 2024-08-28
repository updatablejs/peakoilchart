<?php

namespace modules\stats\controllers\import;

use library\Controller, 
	ujb\common\Util,
	modules\stats\library\importer\Eia as Importer;

// https://www.eia.gov/opendata/v1/bulkfiles.php
class Eia extends Controller {

	protected $source = '../source.o/09/INTL.txt';
	protected $latestEntries = [];
	protected $dateUpdated = [];
	protected $insertedEntriesCount = [];
	protected $saveEnabled = false;

	public function actionImport() {
		ini_set('max_execution_time', '300');
		
		$countries = $this->getMapper('countries')->getSelector()
			->setAssembler(['groups' => 'alpha_3_code'])->fetchAll();
			
		$categories = $this->getCategories();
		
		$unknownCodes = [];
		$importer = new Importer($this->source, array_keys($categories));
		foreach ($importer as $item) {
			if (preg_match('/-WP[0-9]+-/', $item['series_id']) 
				|| preg_match('/\bopec\b/i', $item['name'])) continue;
			
			[$categoryId, $measureUnit] = $categories[$item['geoset_id']];
			
			if (!isset($countries[strtoupper($item['geography'])])) {
				$unknownCodes[$categoryId][] = $item['geography'];
				continue;
			}

			$countryId = $countries[strtoupper($item['geography'])]['country_id'];
			
			$currentEntries = $this->getEntries($countryId, $categoryId);

			$entries = [];
			foreach (array_reverse($item['data']) as [$date, $value]) {
				if (!is_numeric($value) || empty($value)) continue;
				
				if (!$value = round($this->convert($value, $measureUnit), 4)) continue;
				
				$date = $this->formatDate($date);
				
				$entry = [
					'category_id' => $categoryId,
					'country_id' => $countryId,
					'value' => $value,
					'date' => $date
				];
				
				$key = $categoryId . '/' . $countryId . '/' . $date;
				
				if (isset($currentEntries[$key]) && bccomp($currentEntries[$key], $value, 4) == 0) continue;
				
				$entries[] = $entry;
			}
			
			if ($entries) {
				if ($this->saveEnabled)
					$this->getMapper('entries')->insert($entries, ['value']);
				
				$this->dateUpdated[$categoryId] = [
					'category_id' => $categoryId,
					'updated_at' => (new \DateTime())->format('Y-m-d')
				];
				
				$this->insertedEntriesCount[$categoryId][$countryId] = count($entries);
				
				if (!isset($currentEntries[$key]) || bccomp($currentEntries[$key], $entry['value'], 4) != 0)
					$this->setLatestEntry($entry);	
			}
		}

		if ($this->saveEnabled) {
			$this->getMapper('latest_entries')->insert($this->latestEntries, ['value']);
			$this->getMapper('categories')->insert(array_values($this->dateUpdated), ['updated_at']);
		}
		
		$this->set([
			'insertedEntries' => $this->insertedEntriesCount,
			'latestEntries' => count($this->latestEntries),
			'unknownCodes' => $unknownCodes
		]);
	}
	
	protected function setLatestEntry($entry) {
		$entry['updated_at'] = $entry['date'];
		unset($entry['date']);
				
		$this->latestEntries[] = $entry;	
	}
	
	protected function getCategories() {	
		/*return [
			'INTL.57-1-TBPD.A' => [4, 'TBPD'], 
			'INTL.53-1-TBPD.A' => [14, 'TBPD'],
			'INTL.55-1-TBPD.A' => [16, 'TBPD']
		];*/
		
		return [
			// Population
			
			'INTL.4702-33-THP.A' => [3, 'THP'],
		
					
			// Oil
			
			// Crude oil including lease condensate
			// 'INTL.57-1-TBPD.A' => [4, 'TBPD'], // Production, Annual (adauga prima data)
			'INTL.57-1-TBPD.M' => [4, 'TBPD'], // Production, Monthly
			'INTL.57-3-TBPD.A' => [5, 'TBPD'], // Imports
			'INTL.57-4-TBPD.A' => [6, 'TBPD'], // Exports
			'INTL.57-6-BB.A' => [7, 'BB'], // Reserves (billion barrels)
			
			// Petroleum and other liquids
			'INTL.5-2-TBPD.A' => [9, 'TBPD'], // Consumption
			
			// Total petroleum and other liquids
			// 'INTL.53-1-TBPD.A' => [14, 'TBPD'], // Production, Annual (adauga prima data)
			'INTL.53-1-TBPD.M' => [14, 'TBPD'], // Production, Monthly
			
			// Crude oil, NGPL, and other liquids 
			// 'INTL.55-1-TBPD.A' => [16, 'TBPD'], // Production, Annual (adauga prima data)
			'INTL.55-1-TBPD.M' => [16, 'TBPD'], // Production, Monthly
			
			// Refined petroleum products 	
			'INTL.54-1-TBPD.A' => [18, 'TBPD'], // Production
			'INTL.54-2-TBPD.A' => [19, 'TBPD'], // Consumption
			
			// Motor gasoline
			'INTL.62-1-TBPD.A' => [21, 'TBPD'], // Production
			'INTL.62-2-TBPD.A' => [22, 'TBPD'], // Consumption
			
			// Jet fuel
			'INTL.63-1-TBPD.A' => [24, 'TBPD'], // Production
			'INTL.63-2-TBPD.A' => [25, 'TBPD'], // Consumption
			
			
			// Gas
			
			// Dry natural gas (billion cubic meters)
			'INTL.26-1-BCM.A' => [27, 'BCM'], // Production
			'INTL.26-2-BCM.A' => [28, 'BCM'], // Consumption
			'INTL.26-3-BCM.A' => [29, 'BCM'], // Imports
			'INTL.26-4-BCM.A' => [30, 'BCM'], // Exports
			
			// Gross natural gas
			'INTL.3-6-TCF.A' => [33, 'TCF'], // Reserves (trillion cubic feet)
			
			
			// Coal
			
			'INTL.7-1-MT.A' => [34, 'MT'], // Production (1000 metric tons) 
			'INTL.7-2-MT.A' => [35, 'MT'], // Consumption (1000 metric tons) 
			'INTL.7-3-MT.A' => [36, 'MT'], // Imports (1000 metric tons) 
			'INTL.7-4-MT.A' => [37, 'MT'], // Exports (1000 metric tons) 
			'INTL.7-6-MST.A' => [38, 'MST'], // Reserves (million short tons) 
			
			
			// Electricity
			
			'INTL.2-2-BKWH.A' => [39, 'BKWH'], // Consumption (billion kilowatthours) 
			'INTL.2-3-BKWH.A' => [40, 'BKWH'], // Imports (billion kilowatthours) 
			'INTL.2-4-BKWH.A' => [41, 'BKWH'], // Exports (billion kilowatthours) 
			'INTL.2-7-MK.A' => [42, 'MK'], // Capacity (million kilowatts) 
			'INTL.2-12-BKWH.A' => [43, 'BKWH'], // Generation (billion kilowatthours) 
			
			// Nuclear
			'INTL.27-7-MK.A' => [45, 'MK'], // Capacity (million kilowatts) 
			'INTL.27-12-BKWH.A' => [46, 'BKWH'], // Generation (billion kilowatthours) 
			
			// Fossil fuels
			'INTL.28-7-MK.A' => [48, 'MK'], // Capacity (million kilowatts) 
			'INTL.28-12-BKWH.A' => [49, 'BKWH'], // Generation (billion kilowatthours) 
			
			// Renewables
			'INTL.29-7-MK.A' => [51, 'MK'], // Capacity (million kilowatts) 
			'INTL.29-12-BKWH.A' => [52, 'BKWH'], // Generation (billion kilowatthours) 
			
			// Hydroelectricity
			'INTL.33-7-MK.A' => [54, 'MK'], // Capacity (million kilowatts) 
			'INTL.33-12-BKWH.A' => [55, 'BKWH'], // Generation (billion kilowatthours) 
			
			// Solar
			'INTL.116-7-MK.A' => [57, 'MK'], // Capacity (million kilowatts) 
			'INTL.116-12-BKWH.A' => [58, 'BKWH'], // Generation (billion kilowatthours) 
			
			// Wind
			'INTL.37-7-MK.A' => [60, 'MK'], // Capacity (million kilowatts) 
			'INTL.37-12-BKWH.A' => [61, 'BKWH'] // Generation (billion kilowatthours) 
		];
	}
	
	protected function formatDate($date) {
		if (!preg_match('~^(\d{4})(\d{2})?$~', $date, $matches)) 
			throw new \Exception('Error date ' . $date);
	
		$y = $matches[1];
		$m = isset($matches[2]) ? $matches[2] : '01';
		
		return $y . '-' . $m . '-01';
	}
	
	protected function getEntries($countryId, $categoryId) {	
		return $this->getMapper('entries')->getCountryCategoryEntries($countryId, $categoryId, [
				'groups' => function($values) {
					return $values['category_id'] . '/' . $values['country_id'] . '/' . $values['date'];
				},
				
				'interceptors' => function($values) {
					return $values['value'];
				}
			])
			->fetchAll();
	}
	
	protected function convert($value, $measureUnit) {
		switch ($measureUnit) {
			 // Thousand barrels per day
			case 'TBPD':
				return $value * 1000;
			
			// Billion barrels
			case 'BB': 
				return $value * 1000000000;
				
			// Billion cubic meters
			case 'BCM': 
				return $value * 1000000000;
				
			// Trillion cubic feet
			case 'TCF': 
				return $value * 0.028317;
				
			// 1000 Metric tons
			case 'MT': 
				return $value * 1000;
				
			// Million short tons
			case 'MST': 
				return $value * 1000000 * 0.90718474;
				
			// Billion kilowatthours
			case 'BKWH': 
				return $value * 1000000;
				
			// Million kilowatts
			case 'MK': 
				return $value * 1000;
			
			// People in thousands
			case 'THP': 
				return $value * 1000;

			default:
				throw new \Exception('Unknown measure unit ' . $measureUnit);
		}
	}
}
