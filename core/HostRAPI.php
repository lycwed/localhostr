<?php

class HostRAPI
{
    private $endpoint = '';
    private $method = null;
    private $verb = array();
    private $data = array();
    private $request = array();
    private $response = null;
    private $model = null;
    private $methods = array('DELETE', 'POST', 'GET', 'PUT');
    private $status = array(
        200 => "OK",
        404 => "Not Found",
        405 => "Method Not Allowed",
        500 => "Internal Server Error"
    );

    private function response($data, $code = 200, $status = null)
    {
        $status = ($status === null) ? $this->status[500] : $status;

        if (array_key_exists($code, $this->status)) {
            $status = $this->status[$code];
        }

        header("Access-Control-Allow-Orgin: *");
        header("Access-Control-Allow-Methods: *");
        header("Content-Type: application/json");
        header("HTTP/1.1 $code $status");

        echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
        exit;
    }

    private function send()
    {
        if ($this->data !== null) {
            return $this->model->update($this->endpoint, $this->data);
        }
    }

    public function __construct($model, $isRewriteUrl = false)
    {
        $this->model = $model;

        if (! filter_input(INPUT_SERVER, 'HTTP_ORIGIN')) {
          $_SERVER["HTTP_ORIGIN"] = filter_input(INPUT_SERVER, 'SERVER_NAME');
        }

        if ($isRewriteUrl) {
            $this->request = explode('/', rtrim(filter_input(INPUT_SERVER, 'SCRIPT_NAME'), '/'));
            $this->endpoint = array_shift($this->request);
        } else {
            list($path, $query) = array_values(parse_url(filter_input(INPUT_SERVER, 'REQUEST_URI')));
            parse_str($query, $this->request);

            if (isset($this->request['service'])) {
                $this->endpoint = $this->request['service'];
            }
        }

        if (! is_numeric(key($this->request))) {
            $this->verb = array_diff_key($this->request, array_flip(array('service')));
        }

        $this->method = filter_input(INPUT_SERVER, 'REQUEST_METHOD');
        if (in_array($this->method, $this->methods)) {
            $xHttpMethod = filter_input(INPUT_SERVER, 'HTTP_X_HTTP_METHOD');

            if ($this->method === 'POST' && $xHttpMethod) {
                if ($xHttpMethod === 'DELETE') {
                    $this->method = 'DELETE';

                } else if ($xHttpMethod === 'PUT') {
                    $this->method = 'PUT';

                } else {
                    throw new Exception("Unexpected Header");
                }
            }

            switch ($this->method)
            {
                case 'DELETE':
                case 'POST':
                    $this->data = filter_input_array(INPUT_POST);
                    break;

                case 'PUT':
                    $this->data = json_decode(file_get_contents("php://input"), true);
                    break;
            }
        }
    }

    public function getResponse()
    {
        $code = 200;
        $status = null;
        $service = array(
            'method' => $this->method,
            'service' => $this->endpoint,
            'request' => $this->request,
            'data' => $this->data,
        );

        if ($this->method === null) {
            $service['status'] = 'failed';
            $service['response'] = null;
            $status = "Invalid Method";
            $code = 405;

        } else if (! $this->model->hasService($this->endpoint)) {
            $service['status'] = 'failed';
            $service['response'] = null;
            $status = "No Endpoint: {$this->endpoint}";
            $code = 404;

        } else {
            $content = $this->model->get($this->endpoint, $this->request);
            $service['response'] = $content;

            if (! empty($this->data) && ! $this->send()) {
                $service['status'] = 'failed';
                $status = "Unable to update data of {$this->endpoint}";
                $code = 423;

            } else {
                $service['status'] = 'success';
            }
        }

        $this->response($service, $code, $status);
    }
}
