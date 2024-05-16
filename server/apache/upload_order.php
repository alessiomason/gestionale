<?php
// This file is not part of the React client, but is meant to be uploaded on an Apache server where the uploaded order
// files are stored.

require_once("./functions.php");

use function Functions\checkOrigin;

if (checkOrigin() !== 200) {
    return;
}

if (!isset($_FILES["orderFile"])) {
    http_response_code(422);
    return;
}

$upload_dir = "orders/";
$file_name = basename($_FILES["orderFile"]["name"]);
$file_extension = pathinfo($_FILES["orderFile"]["name"], PATHINFO_EXTENSION);

if (strtolower($file_extension) !== "pdf") {
    http_response_code(422);
    return;
}

if (!move_uploaded_file($_FILES["orderFile"]["tmp_name"], $upload_dir . $file_name)) {
    http_response_code(422);
    return;
}

http_response_code(200);
exit;
