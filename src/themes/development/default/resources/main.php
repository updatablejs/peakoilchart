<?php 

use library\App,
	ujb\mvc\builder\builders\Css;
	
	

/*
// de sters
$style = [];
foreach ($this->getBuilder()->getBuilders() as $builder) {
	if (!($builder instanceof Css)) continue;
	
	//printr($builder->getSource());
	
	$s = $builder->getSource();
	if ($s instanceof \ujb\fileIterator\OrderedFileIterator) {
		printr($s);
		
		foreach ($s as $file) {
			printr($file);
			exit;
		}
	}
	
	
	
	
	/*foreach ($builder->getSource() as $file) {
		printr($file);
		//$style[] = $file->getPathname();
	}
}

printr($style);
exit;
*/
	
	
	
	
/**
 * Style
 */


 // todo

use ujb\fileIterator\FileIteratorFactory, 
	ujb\common\ArrayUtil;

$source = FileIteratorFactory::create([
	'source' => '../views',
	'fileConstraint' => '/\.css$/i',
]);



$style = [];
foreach ($source as $file) {
	//printr($file); exit;
	
	$style[] = str_replace('../', 'http://localhost/o/', $file->getPathname());
}


$source = FileIteratorFactory::create([
	'source' => $this->getThemePath(),
	'fileConstraint' => '/\.css$/i'
]);

$source = ArrayUtil::moveValuesUp($source, [	
	$this->getThemePath() . '/resources/css/normalize.css', 
	$this->getThemePath() . '/resources/css/common.css', 
	$this->getThemePath() . '/resources/css/style.css', 
	$this->getThemePath() . '/resources/css/icons.css', 
	$this->getThemePath() . '/resources/css/flags/flags.css'
]);


//printr($source); exit;

$style = isset($style) ? 
	array_merge((array) $style, $source) : $source;





/**
 * Script
 */

if (!isset($scripts)) $scripts = [];

$scripts = array_merge($scripts, [
	['source' => 'initialize.js', 
		'type' => 'module'],
	
	['source' => 'library/vendor/jquery/jquery.js', 
		'extra' => 'defer'],
		
	['source' => 'library/vendor/polyfill/polyfill.js', 
		'extra' => 'defer'],
		
	['source' => 'library/vendor/sparkline/sparkline.js', 
		'extra' => 'defer'],
	
	['source' => 'library/vendor/highcharts/highstock.js', 
		'extra' => 'defer'],
		
	['source' => 'library/vendor/highcharts/exporting.js', 
		'extra' => 'defer'],
		
	['source' => 'library/vendor/highcharts/annotations.js', 
		'extra' => 'defer']
]); 

?>
<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title><?php if (isset($title)) echo $title; ?></title>

<?php if (isset($description)) { 
	echo '<meta name="description" content="' . $description . '">';
} ?>

<?php if (isset($keywords)) { 
	echo '<meta name="keywords" content="' . $keywords . '">';
}  ?>

<meta name="robots" content="index,follow"/>

<?php if (isset($canonicalUrl)) {
	echo '<link rel="canonical" href="' . $canonicalUrl . '" />';
} ?>

<?php if (isset($style)) {
	foreach ((array) $style as $file) {
		if (!preg_match('~^(http|/)~i', $file)) {
			$file = $this->getThemeUrl(
				preg_replace('/^' . preg_quote($this->getThemePath(), '/')  . '/', '', $file)
			);
		}
		
		echo '<link rel="stylesheet" href="' . $file . '">
		';
	}
} 
?>

<?php if (isset($scripts)) {
	foreach ((array) $scripts as $script) {
		if (!is_array($script))
			$script = ['source' => $script];
		
		if (!preg_match('~^(http|/)~i', $script['source']))
			$script['source'] = $this->getThemeUrl($script['source']);
		
		echo '<script type="' . (isset($script['type']) ? $script['type'] : 'text/javascript') . '" 
			src="' . $script['source'] . '"' . (isset($script['extra']) ? ' ' . $script['extra'] : '') . '></script>
		';
	}
} ?>

<?php if (isset($vars)) {
	echo '<script>';
	foreach ($vars as $key => $value)
		echo 'var ' . $key . ' = ' . json_encode($value) . ';';
	echo '</script>';
} ?>
</head>
<body></body>
</html>