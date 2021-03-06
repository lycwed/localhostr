<?php

class HostR
{
    private $httpHost = null;
    private $scriptUrl = null;
    private $rootDocument = null;
    private $search = array();
    private $projects = array();
    private $installer = array();
    private $configFile = null;
    private $services = array(
        'search' => 'application/json',
        'installer' => 'application/json',
        'projects' => 'application/json',
        'phpinfo' => 'text/html',
    );
    private $filesType = array(
        'doc-text' => array('txt', 'rtf', 'md'),
        'file-video' => array('avi', 'flv', 'mkv', 'mov', 'mpeg', 'mpg', 'mp4', 'm4v', 'wmv'),
        'file-audio' => array('mp2', 'mp3', 'm3u', 'wma'),
        'file-word' => array('doc', 'docx'),
        'file-excel' => array('xls', 'xlsx'),
        'file-powerpoint' => array('pps', 'ppsx'),
        'file-pdf' => array('pdf'),
        'file-image' => array('gif', 'jpg', 'jpeg', 'pdf', 'png', 'psd'),
        'file-archive' => array('deb', 'dmg', 'gz', 'rar', 'zip', '7z'),
        'file-code' => array('html', 'rtf', 'xml', 'xhtml', 'js', 'css', 'saas', 'scss', 'php', 'sql', 'svg', 'json'),
    );

    private function isAssoc(array $data)
    {
        return array_diff_key($data, array_keys(array_keys($data)));
    }

    private function mergeData(array $serviceData, array $data)
    {
        foreach ($serviceData as $key => $value) {
            if (isset($data[$key])) {
                if (is_array($value) && $this->isAssoc($value)) {
                    $serviceData[$key] = $this->mergeData($value, $data[$key]);
                } else {
                    $serviceData[$key] = $data[$key];
                }
            }
        }
        return $serviceData;
    }

    private function getType($file)
    {
        $type = 'doc';
        $extension = pathinfo($file, PATHINFO_EXTENSION);
        foreach ($this->filesType as $type => $extensions) {
            if (in_array($extension, $extensions)) {
                return $type;
            }
        }
        return $type;
    }

    public function research($directory, $search, array $params = array())
    {
        $strposMethod = $params['caseSensitive'] ? 'strpos' : 'stripos';

        foreach (scandir($directory) as $filename) {

            $matched = $strposMethod($filename, $search);

            if ($filename === '.'
                || $filename === '..'
                || $filename === '.DS_Store') {
                continue;
            }

            $path = $directory . '/' . $filename;

            if (is_dir($path)) {
                $file = pathinfo($filename, PATHINFO_FILENAME);
                if (!$params['onlyFiles'] && $matched !== false && (($matched === 0 && $params['start'])
                    || $matched >= 0)) {
                    $this->search[] = array(
                        "type" => "folder",
                        "name" => $file,
                        "path" => urlencode(str_replace($this->rootDocument . '/', '', $path)),
                        "size" => count(scandir($path)),
                    );
                }
                $this->research($path, $search, $params);

            } else {
                if (!$params['onlyFolders'] && $matched !== false && (($matched === 0 && $params['start'])
                    || $matched >= 0)) {
                    $this->search[] = array(
                        "type" => $this->getType($filename),
                        "name" => $filename,
                        "url" => 'http://' . $this->httpHost . '/' . str_replace($this->rootDocument . '/', '', $path),
                        "size" => filesize($path),
                        "fullname" => $filename,
                    );
                }
            }
        }
    }

    private function getCount($directory)
    {
        $count = 0;
        foreach (scandir($directory) as $filename) {

            if ($filename === '.'
                || $filename === '..'
                || $filename === '.DS_Store') {
                continue;
            }

            $count++;
        }
        return $count;
    }

    private function getItems($directory)
    {
        $items = array();

        foreach (scandir($directory) as $filename) {

            if ($filename === '.'
                || $filename === '..'
                || $filename === '.DS_Store') {
                continue;
            }

            if (in_array($filename, $this->installer["app"]["ignores"])
                && $this->rootDocument === $directory) {
                continue;
            }

            $path = $directory . '/' . $filename;

            if (is_file($path)) {
                $items[] = array(
                    "type" => $this->getType($filename),
                    "name" => $filename,
                    "url" => 'http://' . $this->httpHost . '/' . str_replace($this->rootDocument . '/', '', $path),
                    "size" => filesize($path),
                    "fullname" => $filename,
                );
            } else {
                $file = pathinfo($filename, PATHINFO_FILENAME);
                $items[] = array(
                    "type" => "folder",
                    "name" => ($file === '') ? $filename : $file,
                    "path" => urlencode(str_replace($this->rootDocument . '/', '', $path)),
                    "size" => $this->getCount($path),
                );

            }
        }

        return $items;
    }

    private function install()
    {
        $indexFile = LOCALHOSTR . '/index.php';
        $destFile = dirname(LOCALHOSTR) . '/index.php';

        if (is_readable($indexFile) && !is_readable($destFile) && copy($indexFile, $destFile)) {
            $this->installer["app"]["path"] = $this->rootDocument;
            $this->installer["app"]["installed"] = true;
            $this->installer["app"]["php_infos_url"] = $this->getPhpInfosUrl();
            $this->update('installer', $this->installer);

            if (unlink($indexFile)) {
                header('Location: http://' . $this->httpHost);
                exit;
            }
        }
    }

    public function __construct($configFile)
    {
        ob_start();
        phpinfo();
        $phpinfo = ob_get_contents();
        ob_end_clean();

        $this->phpinfo = $phpinfo;

        $this->httpHost = filter_input(INPUT_SERVER, 'HTTP_HOST');
        $this->scriptUrl = 'http://' . $this->httpHost . filter_input(INPUT_SERVER, 'REQUEST_URI');
        $this->rootDocument = filter_input(INPUT_SERVER, 'DOCUMENT_ROOT');

        if (is_readable($configFile)) {
            $this->configFile = $configFile;
            $json = file_get_contents($configFile);
            $this->installer = json_decode($json, true);
            if (!$this->installer["app"]["installed"]) {
                $this->install();
            }
        }
    }

    public function getPhpInfosUrl()
    {
        $query = http_build_query(array(
            'service' => 'phpinfos',
        ));
        return 'http://' . $this->httpHost . '?' . $query;
    }

    public function hasService($service)
    {
        return array_key_exists($service, $this->services);
    }

    public function isService($service = null)
    {
        $queryStr = filter_input(INPUT_SERVER, 'QUERY_STRING');

        if (!empty($queryStr)) {
            if ($service) {
                parse_str($queryStr, $queries);
                return $queries['service'] === $service;
            } else {
                return true;
            }
        }
        return false;
    }

    public function get($service, array $options = array())
    {
        if ($service === 'projects') {
            $path = $this->installer["app"]["path"];
            if (isset($options['path']) && !empty($options['path'])) {
                $path .= '/' . urldecode($options['path']);
            }

            $items = $this->getItems($path);
            $types = array();
            foreach ($items as $key => $item) {
                $types[$key] = $item['type'];
            }

            array_multisort($types, SORT_DESC, $items);
            $this->projects = $items;
        }

        if ($service === 'search') {
            $this->search = array();
            if (isset($options['path']) && isset($options['value'])) {
                $path = $this->rootDocument;
                if ($options['path'] !== '') {
                    $path .= '/' . $options['path'];
                }
                $searchParams = array(
                    'start' => (int) $options['start'],
                    'caseSensitive' => (int) $options['case'],
                    'onlyFolders' => (int) $options['folders'],
                    'onlyFiles' => (int) $options['files'],
                );
                $this->research($path, $options['value'], $searchParams);
            }
            $types = array();
            foreach ($this->search as $key => $item) {
                $types[$key] = $item['type'];
            }
            array_multisort($types, SORT_DESC, $this->search);
        }

        return $this->hasService($service) ? $this->$service : array();
    }

    public function update($service, array $data)
    {
        if ($this->hasService($service)
            && $this->services[$service] === 'application/json'
            && is_array($this->$service)
            && is_array($data)) {
            $serviceData = $this->$service;
            $data = $this->mergeData($serviceData, $data);
            $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);

            if (file_put_contents($this->configFile, $json)) {
                $this->$service = $data;
                return true;
            }
        }
        return false;
    }

    public function getScriptUrl()
    {
        return $this->scriptUrl;
    }

    public function render($templatePath)
    {
        include $templatePath;
    }
}
