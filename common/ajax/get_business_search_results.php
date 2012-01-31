<?php
require_once( '../php/firephp/fb.php' );
require_once( '../functions/db_lib.php' );

$business     = null;
$name         = null;
$neighborhood = null;
$address      = null;
$city         = null;
$zip_code     = null;

if(
    isset( $_REQUEST[ 'business' ] ) &&
    $_REQUEST[ 'business' ] != '' &&
    is_numeric( $_REQUEST[ 'business' ] ) &&
    $_REQUEST[ 'business' ] >= 0
) {
    $business = $_REQUEST['business'];
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
    isset( $_REQUEST[ 'zip_code' ] ) &&
    $_REQUEST[ 'zip_code' ] != '' &&
    is_numeric( $_REQUEST[ 'zip_code' ] ) &&
    $_REQUEST[ 'zip_code' ] >= 0
) {
    $zip_code = $_REQUEST[ 'zip_code'];
}

$businesses = search_business(
    $business,
    $name,
    $neighborhood,
    $address,
    $city,
    $zip_code,
    $count
);

//fb( $businesses, '$businesses' );

header( 'content-type:application/json' );

echo( json_encode( $businesses ) );
?>
