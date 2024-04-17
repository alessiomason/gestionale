<?php
// This file is not part of the Express server, but is meant to be uploaded on a Apache server where the backup are stored

if (!isset($_FILES["backupFile"])) {
	http_response_code(422);
	return;
}

$fileName = basename($_FILES["backupFile"]["name"]);

if (!move_uploaded_file($_FILES["backupFile"]["tmp_name"], $fileName)) {
	http_response_code(422);
	return;
}

http_response_code(200);
