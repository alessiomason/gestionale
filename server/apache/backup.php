<?php
// This file is not part of the Express server, but is meant to be uploaded on an Apache server where the backups are stored.

$upload_dir = "backups/";

// delete backup files older than 90 days
$expiry_time = 90 * 24 * 60 * 60;   // 90 days
if ($handle = opendir($upload_dir)) {
    while (($file = readdir($handle)) !== false) {
        if ($file == "." || $file == ".." || is_dir($dir . "/" . $file)) {
            continue;
        }

        if ((time() - filemtime($dir . "/" . $file)) > ($expiry_time)) {
            unlink($dir . "/" . $file);
        }
    }
    
    closedir($handle);
}

// save the new backup file
if (!isset($_FILES["backupFile"])) {
    http_response_code(422);
    return;
}

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
