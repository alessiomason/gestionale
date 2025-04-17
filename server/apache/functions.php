<?php

namespace Functions;

function checkOrigin() {
    $allowed_host = "https://gestionale.technomake.it";

    header("Access-Control-Allow-Origin: $allowed_host");

    if (!isset($_SERVER["HTTP_ORIGIN"]) || parse_url($_SERVER["HTTP_ORIGIN"])["host"] !== parse_url($allowed_host)["host"]) {
        http_response_code(401);
        return 401;
    }

    return 200;
}
