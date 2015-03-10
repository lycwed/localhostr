<?php

define('ROOT_DIR', __DIR__);
define('IP_ADDR', gethostbyname(trim(`hostname`)));
if (is_dir(ROOT_DIR . '/LOCALHOSTR')) {
    define('APP_FOLDER', 'LOCALHOSTR');
} else {
    define('APP_FOLDER', '.');
}

define('LOCALHOSTR', ROOT_DIR . '/' . APP_FOLDER);

require LOCALHOSTR . '/core/HostR.php';
require LOCALHOSTR . '/core/HostRAPI.php';

$hostR = new HostR(LOCALHOSTR . '/config.json');

if (filter_input(INPUT_SERVER, 'QUERY_STRING') !== '') {
    $hostRAPI = new HostRAPI($hostR);
    return $hostRAPI->getResponse();
} else {
    $hostR->render(LOCALHOSTR . '/templates/index.phtml');
}