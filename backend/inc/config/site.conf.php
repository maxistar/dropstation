<?php


if (isset($_SERVER['SERVER_NAME'])){
    switch($_SERVER['SERVER_NAME']){
        case 'dropstation.x.maxistar.me':
            include 'site.live.conf.php';
            break;
        default:
            include 'site.dev.conf.php';
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
