<?php

namespace modules\stats\library\importer;

class Eia implements \Iterator {

	public $file;
	public $setIds = [];
	
	protected $current;
	protected $key = 0;
	
	protected $resource;
	
	public function __construct(string $file, array $setIds) {
		$this->file = $file;
		$this->setIds = $setIds;
	}
	
	public function getResource() {
		if (!$this->resource)
			$this->resource = fopen($this->file, 'r');
		
		return $this->resource;
	}
	
	
	// Iterator
	
	public function read() {
		while (!feof($this->getResource())) {
			$raw = fgets($this->getResource());
		
			$series = json_decode($raw, true);
	
			if (!isset($series['geography']) || !isset($series['geoset_id']) 
				|| !in_array($series['geoset_id'],  $this->setIds, true)) continue;

			return $series;
		}
	}
	
	public function rewind() {
		$this->current = $this->read();
		$this->key = 0;
	}
	
	public function next() {
		$this->current = $this->read();
		$this->key++;
	}
	
    public function valid() {
		return $this->current;	
    }

	public function current() {
		return $this->current;
	}
	
	public function key() {
		return $this->key;
	}
}
