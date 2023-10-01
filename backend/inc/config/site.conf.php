<?php


if (isset($_SERVER['SERVER_NAME'])){
    switch($_SERVER['SERVER_NAME']){
        case 'dropstation.procyon':
            include 'site.dev.conf.php';
            break;
        default:
            include 'site.live.conf.php';
    }
}
else {
    if (etherra\Config::get('env') == 'phpunit') {
        include 'site.unittest.conf.php';
    }
    else {
        include 'site.dev.conf.php';
    }
}
