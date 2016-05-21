<?
include '../../../inc/site.php';


//send to server
//{'04ABC20A':'OK','04ABC20B':'Error'}
//response from server
//{'04ABC20A':0,'04ABC20B':40}

$w = new \dropstation\WateringV2();
$w->show();