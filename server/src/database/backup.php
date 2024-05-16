<?php
// This file is not part of the Express server, but is meant to be uploaded on an Apache server where the backups are stored.

$allowed_host = "https://gestionale.tlftechnology.it";

header("Access-Control-Allow-Origin: $allowed_host");

if (!isset($_SERVER["HTTP_REFERER"]) || parse_url($_SERVER["HTTP_REFERER"])["host"] !== parse_url($allowed_host)["host"]) {
    http_response_code(401);
    return;
}

if (!isset($_FILES["backupFile"])) {
    http_response_code(422);
    return;
}

$upload_dir = "backups/";
$file_name = basename($_FILES["backupFile"]["name"]);
$file_extension = pathinfo($_FILES["backupFile"]["name"], PATHINFO_EXTENSION);

if (strtolower($file_extension) !== "sql") {
    http_response_code(422);
    return;
}

if (!move_uploaded_file($_FILES["backupFile"]["tmp_name"], $upload_dir . $file_name)) {
    http_response_code(422);
    return;
}

http_response_code(200);
exit;
