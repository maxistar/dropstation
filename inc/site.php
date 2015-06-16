<?php
namespace etherra;

include __DIR__.'/../vendor/autoload.php';

define('_SITE_ROOT',dirname(dirname(__FILE__)).'/');
define('_INC_ROOT',_SITE_ROOT.'inc/');
define('_CONFIG_ROOT',_INC_ROOT.'config/');
define('_CACHE_ROOT',_INC_ROOT.'cache/');

date_default_timezone_set('GMT');
//timezone

function conf($value) {
    return Config::get($value);
}