<?php
// This file is not part of the Express server, but is meant to be uploaded on an Apache server where the uploaded order
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
$file_name = "orders/Ordine_$order_name.pdf";
$file_path = realpath($file_name);

if (str_starts_with($file_path, "orders/") && file_exists($file_path)) {
//     header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
//     header("Cache-Control: post-check=0, pre-check=0", false);
//     header("Pragma: no-cache");

    header("Content-Type: application/pdf");
    header("Content-Length: " . filesize($file_path));
    readfile($file_path);
}
exit;
