<?php
require_once( '../php/firephp/fb.php' );
require_once( '../functions/db_lib.php' );

$business     = null;
$name         = null;
$neighborhood = null;
$address      = null;
$city         = null;
$zip_code     = null;
$state        = null;
$latitude     = null;
$longitude    = null;
$phone        = null;
$url          = null;
$yelp_url     = null;
$columns      = null;

if(
    isset( $_REQUEST[ 'business' ] ) &&
    $_REQUEST[ 'business' ] != '' &&
    is_numeric( $_REQUEST[ 'business' ] ) &&
    $_REQUEST[ 'business' ] >= 0
) {
    $business = $_REQUEST[ 'business' ];
}

if(
    isset( $_REQUEST[ 'name' ] ) &&
    $_REQUEST[ 'name' ] != ''
) {
    $name = $_REQUEST[ 'name' ];
}

if(
    isset( $_REQUEST[ 'neighborhood' ] ) &&
    $_REQUEST[ 'neighborhood' ] != ''
) {
    $neighborhood = $_REQUEST[ 'neighborhood' ];
}

if(
    isset( $_REQUEST[ 'address' ] ) &&
    $_REQUEST[ 'address' ] != ''
) {
    $address = $_REQUEST[ 'address' ];
}

if(
    isset( $_REQUEST[ 'city' ] ) &&
    $_REQUEST[ 'city' ] != ''
) {
    $city = $_REQUEST[ 'city' ];
}

if(
    isset( $_REQUEST[ 'state' ] ) &&
    $_REQUEST[ 'state' ] != ''
) {
    $state = $_REQUEST[ 'state' ];
}

if(
    isset( $_REQUEST[ 'zip_code' ] ) &&
    $_REQUEST[ 'zip_code' ] != '' &&
    is_numeric( $_REQUEST[ 'zip_code' ] ) &&
    $_REQUEST[ 'zip_code' ] >= 0
) {
    $zip_code = $_REQUEST[ 'zip_code' ];
}

if(
    isset( $_REQUEST[ 'latitude' ] ) &&
    $_REQUEST[ 'latitude' ] != ''
) {
    $latitude = $_REQUEST[ 'latitude' ];
}

if(
    isset( $_REQUEST[ 'longitude' ] ) &&
    $_REQUEST[ 'longitude' ] != ''
) {
    $longitude = $_REQUEST[ 'longitude' ];
}

if(
    isset( $_REQUEST[ 'phone' ] ) &&
    $_REQUEST[ 'phone' ] != '' &&
    is_numeric( $_REQUEST[ 'phone' ] ) &&
    $_REQUEST[ 'phone' ] >= 0
) {
    $phone = $_REQUEST[ 'phone' ];
}

if(
    isset( $_REQUEST[ 'url' ] ) &&
    $_REQUEST[ 'url' ] != ''
) {
    $longitude = $_REQUEST[ 'url' ];
}

if(
    isset( $_REQUEST[ 'yelp_url' ] ) &&
    $_REQUEST[ 'yelp_url' ] != ''
) {
    $longitude = $_REQUEST[ 'yelp_url' ];
}

if(
    isset( $_REQUEST[ 'columns' ] ) &&
    $_REQUEST[ 'columns' ] != ''
) {
    $columns = $_REQUEST[ 'columns' ];
}

fb( $business, '$business (ajax)' );

$businesses = search_business(
    $business,
    $name,
    $neighborhood,
    $address,
    $city,
    $state,
    $zip_code,
    $latitude,
    $longitude,
    $phone,
    $url,
    $yelp_url,
    $columns,
    $count
);

//fb( $businesses, '$businesses' );

header( 'content-type:application/json' );

echo( json_encode( $businesses ) );
?>
