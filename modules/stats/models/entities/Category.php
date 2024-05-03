<?php

namespace modules\stats\models\entities;

use ujb\database\orm\entity\Entity;

class Category extends Entity {

	public function getFullName() {
		return $this->has('parent') ? 
			$this->get('parent')->getFullName() . ' / ' . $this->name : $this->name;
	}

	public function getFullSlug() {
		return $this->has('parent') ? 
				$this->get('parent')->getFullSlug() . '/' . $this->slug : $this->slug;
	}
}
