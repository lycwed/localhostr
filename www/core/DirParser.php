<?php

class DirParser
{
    private $data = array();
    private $config = null;

    public function __construct($file)
    {
        if (is_readable($file)) {
            $this->config = json_decode(file_get_contents($file));

            if ($this->config->path !== '') {
                $this->data = array(
                    "name" => pathinfo($this->config->path, PATHINFO_FILENAME),
                    "type" => "folder",
                    "path" => $this->config->path,
                    "items" => $this->getItems($this->config->path)
                );
            }
        }
    }

    public function getItems($directory)
    {
        $items = array();

        if (file_exists($directory)) {

            foreach (scandir($directory) as $filename) {

                if (! $filename || current($filename) == '.'
                    || in_array($filename, $this->config->ignores)) {
                    continue;
                }

                $path = $directory . '/' . $filename;
                $params = array(
                    "name" => pathinfo($filename, PATHINFO_FILENAME),
                    "path" => $path,
                );

                if (is_dir($path)) {
                    $params["type"] = "folder";
                    $params["items"] = $this->getItems($path);

                } else {
                    $params["type"] = $items;
                    $params["size"] = filesize($item);
                    $params["fullname"] = $filename;
                }

                $items[] = $params;
            }
        }

        return $items;
    }

    public function render()
    {
        if ($this->data ) {
            // header('Content-type: application/json');

            echo json_encode(
                array_merge($this->config['extra'], $this->data),
                JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES
            );
        }
    }
}
