<?php
// This file is not part of the React client, but is meant to be uploaded on an Apache server where the uploaded order
// files are stored.

$allowed_host = "https://gestionale.tlftechnology.it";

header("Access-Control-Allow-Origin: $allowed_host");

if (
    !isset($_SERVER["HTTP_REFERER"]) ||
    parse_url($_SERVER["HTTP_REFERER"])["host"] !== parse_url($allowed_host)["host"] ||
    !isset($_GET["orderName"])
) {
    http_response_code(401);
    return;
}

$order_name = $_GET["orderName"];
$filename = "orders/Ordine_$order_name.pdf";

if (file_exists($filename)) {
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Cache-Control: post-check=0, pre-check=0', false);
    header('Pragma: no-cache');

    header('Content-Type: application/pdf');
    header('Content-Length: ' . filesize($filename));
    readfile($filename);
}
exit;
