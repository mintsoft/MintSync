<?php

/**
  Class to wrap up some REST orientated things,

  based on code from:
  http://www.gen-x-design.com/archives/create-a-rest-api-with-php/
 */
class restTools
{

	private $additionalHeaders;
	private $debugHeaderCount;

	/**
	 * @var array Static list of HTTP Status Codes
	 */
	public static $HTTPCodes = array(
		'CONTINUE' => 100,
		'SWITCHING_PROTOCOLS' => 101,
		'OK' => 200,
		'CREATED' => 201,
		'ACCEPTED' => 202,
		'NON-AUTHORITATIVE_INFORMATION' => 203,
		'NO_CONTENT' => 204,
		'RESET_CONTENT' => 205,
		'PARTIAL_CONTENT' => 206,
		'MULTIPLE_CHOICES' => 300,
		'MOVED_PERMANENTLY' => 301,
		'FOUND' => 302,
		'SEE_OTHER' => 303,
		'NOT_MODIFIED' => 304,
		'USE_PROXY' => 305,
		'TEMPORARY_REDIRECT' => 307,
		'BAD_REQUEST' => 400,
		'UNAUTHORIZED' => 401,
		'PAYMENT_REQUIRED' => 402,
		'FORBIDDEN' => 403,
		'NOT_FOUND' => 404,
		'METHOD_NOT_ALLOWED' => 405,
		'NOT_ACCEPTABLE' => 406,
		'PROXY_AUTHENTICATION_REQUIRED' => 407,
		'REQUEST_TIMEOUT' => 408,
		'CONFLICT' => 409,
		'GONE' => 410,
		'LENGTH_REQUIRED' => 411,
		'PRECONDITION_FAILED' => 412,
		'REQUEST_ENTITY_TOO_LARGE' => 413,
		'REQUEST-URI_TOO_LONG' => 414,
		'UNSUPPORTED_MEDIA_TYPE' => 415,
		'REQUESTED_RANGE_NOT_SATISFIABLE' => 416,
		'EXPECTATION_FAILED' => 417,
		'INTERNAL_SERVER_ERROR' => 500,
		'NOT_IMPLEMENTED' => 501,
		'BAD_GATEWAY' => 502,
		'SERVICE_UNAVAILABLE' => 503,
		'GATEWAY_TIMEOUT' => 504,
		'HTTP_VERSION_NOT_SUPPORTED' => 505
	);

	/**
	 * @var array Static list of HTTP messages indexed by status code
	 */
	public static $HTTP_Messages = array(
		100 => 'Continue',
		101 => 'Switching Protocols',
		200 => 'OK',
		201 => 'Created',
		202 => 'Accepted',
		203 => 'Non-Authoritative Information',
		204 => 'No Content',
		205 => 'Reset Content',
		206 => 'Partial Content',
		300 => 'Multiple Choices',
		301 => 'Moved Permanently',
		302 => 'Found',
		303 => 'See Other',
		304 => 'Not Modified',
		305 => 'Use Proxy',
		306 => '(Unused)',
		307 => 'Temporary Redirect',
		400 => 'Bad Request',
		401 => 'Unauthorized',
		402 => 'Payment Required',
		403 => 'Forbidden',
		404 => 'Not Found',
		405 => 'Method Not Allowed',
		406 => 'Not Acceptable',
		407 => 'Proxy Authentication Required',
		408 => 'Request Timeout',
		409 => 'Conflict',
		410 => 'Gone',
		411 => 'Length Required',
		412 => 'Precondition Failed',
		413 => 'Request Entity Too Large',
		414 => 'Request-URI Too Long',
		415 => 'Unsupported Media Type',
		416 => 'Requested Range Not Satisfiable',
		417 => 'Expectation Failed',
		500 => 'Internal Server Error',
		501 => 'Not Implemented',
		502 => 'Bad Gateway',
		503 => 'Service Unavailable',
		504 => 'Gateway Timeout',
		505 => 'HTTP Version Not Supported'
	);

	public function __construct()
	{
		$this->additionalHeaders = array();
		$this->debugHeaderCount = 0;
	}

	/**
	 * Adds an HTTP header to the final response
	 * 
	 * @param string $newHeader an HTTP Header
	 */
	public function addHeader($newHeader)
	{
		$this->additionalHeaders[] = $newHeader;
	}

	/**
	 * Adds a variable to special debug headers
	 * @param type $str
	 */
	public function addDebugHeader($str)
	{
		$this->additionalHeaders[] = "X-MS-Debug:{$this->debugHeaderCount} {$str}";
		$this->debugHeaderCount++;
	}

	/**
	 * Sends the REST response to the client/browser and halts execution
	 * 
	 * @param mixed $body The body of the request to send, if a string 
	 *  it will be sent as is, if an object it will be encoded as JSON
	 * @param integer $status optional HTTP Status Code
	 * @param string $content_type optional Content-Type
	 */
	public function sendResponse($body, $status = 200, $content_type = 'application/json')
	{
		$status_header = 'HTTP/1.1 ' . $status . ' ' . restTools::getStatusCodeMessage($status);

		// set the status
		header($status_header);
		// set the content type
		header('Content-type: ' . $content_type);

		foreach ($this->additionalHeaders as $thisHeader)
		{
			header($thisHeader);
		}

		if (is_string($body))
			echo $body;
		else
			echo json_encode($body);

		exit;
	}

	/**
	 * getStatusCodeMessage, returns the associated message for an 
	 *  HTTP status code
	 * @param integer $status
	 * @return string HTTP description
	 */
	public static function getStatusCodeMessage($status)
	{
		return (isset(restTools::$HTTPCodes[$status])) ? restTools::$HTTPCodes[$status] : '';
	}

}

?>