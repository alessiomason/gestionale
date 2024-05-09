<?php
// This file is not part of the React client, but is meant to be uploaded on an Apache server where the uploaded order
// files are stored.

header("Access-Control-Allow-Origin: http://localhost:3000");

if (!isset($_FILES["orderFile"])) {
    http_response_code(422);
    return;
}

$uploadDir = "orders/";
$fileName = basename($_FILES["orderFile"]["name"]);

if (!move_uploaded_file($_FILES["orderFile"]["tmp_name"], $uploadDir . $fileName)) {
    http_response_code(422);
    return;
}

http_response_code(200);
