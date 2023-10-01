<?php
namespace etherra;

define('_SITE_ROOT',dirname(dirname(__FILE__)).'/');
define('_APP_ROOT',_SITE_ROOT.'inc/');
define('_INC_ROOT',_SITE_ROOT.'inc/');
define('_CONFIG_ROOT',_INC_ROOT.'config/');
define('_CACHE_ROOT',_INC_ROOT.'cache/');

include __DIR__.'/../vendor/autoload.php';


date_default_timezone_set('GMT');
//timezone

function conf($value) {
    return Config::get($value);
}

function l($value) {
    return $value;
}

