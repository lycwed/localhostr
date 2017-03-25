<?php

function getLanIpAddr() {
  $lanIpAddr = null;
  exec("ifconfig en1 inet", $output);

  foreach ($output as $value) {
    if (strpos($value, 'inet') !== false) {
      preg_match('/[(0-9.)]+/', $value, $matches);
      $lanIpAddr = count($matches) ? $matches[0] : null;
    }
  }
  return $lanIpAddr;
}

define('ROOT_DIR', __DIR__);
define('IP_ADDR', getLanIpAddr());
if (is_dir(ROOT_DIR . '/LOCALHOSTR')) {
    define('APP_FOLDER', 'LOCALHOSTR');
} else {
    define('APP_FOLDER', '.');
}

define('LOCALHOSTR', realpath(ROOT_DIR . '/' . APP_FOLDER));

require LOCALHOSTR . '/core/HostR.php';
require LOCALHOSTR . '/core/HostRAPI.php';

$hostR = new HostR(LOCALHOSTR . '/config.json');

if ($hostR->isService('phpinfos')) {
    phpinfo();

} else if ($hostR->isService()) {
    $hostRAPI = new HostRAPI($hostR);
    return $hostRAPI->getResponse();

} else {
    $hostR->render(LOCALHOSTR . '/templates/index.phtml');
}

exit;
