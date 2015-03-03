<?php

require 'core/HostR.php';
require 'core/HostRAPI.php';

$hostR = new HostR(__DIR__ . '/config.json');

if (filter_input(INPUT_SERVER, 'QUERY_STRING') !== '') {
    $hostRAPI = new HostRAPI($hostR);
    return $hostRAPI->getResponse();
} else {
    $hostR->render('templates/index.phtml');
}
