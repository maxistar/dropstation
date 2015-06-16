<?php

$data = array(
    'site.dbtype' => 'MySqli',
    'site.dbname' => 'polivalka',
    'site.dbuser' => 'polivalka',
    'site.dbpassword' => 'polivalka345'
);
self::set($data);

// grant all on polivalka.* to 'polivalka'@'localhost' identified by 'polivalka345'