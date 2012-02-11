<?php
require_once( '../php/firephp/fb.php' );
require_once( '../functions/db_lib.php' );

$deal             = null;
$url              = null;
$image_url        = null;
$business         = null;
$expiration       = null;
$percent_discount = null;
$max_discount     = null;
$one_per          = null;
$claimed          = null;
$city             = null;
$fine_print       = null;
$columns          = null;

if(
    isset( $_REQUEST[ 'deal' ] ) &&
    $_REQUEST[ 'deal' ] != '' &&
    is_numeric( $_REQUEST[ 'deal' ] ) &&
    $_REQUEST[ 'deal' ] >= 0
) {
    $deal = $_REQUEST[ 'deal' ];
}

if(
    isset( $_REQUEST[ 'url' ] ) &&
    $_REQUEST[ 'url' ] != ''
) {
    $url = $_REQUEST[ 'url' ];
}

if(
    isset( $_REQUEST[ 'iamge_url' ] ) &&
    $_REQUEST[ 'iamge_url' ] != ''
) {
    $iamge_url = $_REQUEST[ 'iamge_url' ];
}

if(
    isset( $_REQUEST[ 'business' ] ) &&
    $_REQUEST[ 'business' ] != '' &&
    is_numeric( $_REQUEST[ 'business' ] ) &&
    $_REQUEST[ 'business' ] >= 0
) {
    $business = $_REQUEST[ 'business' ];
}

if(
    isset( $_REQUEST[ 'expiration' ] ) &&
    $_REQUEST[ 'expiration' ] != ''
) {
    $expiration = $_REQUEST[ 'expiration' ];
}

if(
    isset( $_REQUEST[ 'percent_discount' ] ) &&
    $_REQUEST[ 'percent_discount' ] != '' &&
    is_numeric( $_REQUEST[ 'percent_discount' ] ) &&
    $_REQUEST[ 'percent_discount' ] >= 0
) {
    $percent_discount = $_REQUEST[ 'percent_discount' ];
}

if(
    isset( $_REQUEST[ 'max_discount' ] ) &&
    $_REQUEST[ 'max_discount' ] != '' &&
    is_numeric( $_REQUEST[ 'max_discount' ] ) &&
    $_REQUEST[ 'max_discount' ] >= 0
) {
    $max_discount = $_REQUEST[ 'max_discount' ];
}

if(
    isset( $_REQUEST[ 'one_per' ] ) &&
    $_REQUEST[ 'one_per' ] != ''
) {
    $one_per = $_REQUEST[ 'one_per' ];
}

if(
    isset( $_REQUEST[ 'claimed' ] ) &&
    $_REQUEST[ 'claimed' ] != '' &&
    is_numeric( $_REQUEST[ 'claimed' ] ) &&
    $_REQUEST[ 'claimed' ] >= 0
) {
    $claimed = $_REQUEST[ 'claimed' ];
}

if(
    isset( $_REQUEST[ 'city' ] ) &&
    $_REQUEST[ 'city' ] != ''
) {
    $city = $_REQUEST[ 'city' ];
}

if(
    isset( $_REQUEST[ 'fine_print' ] ) &&
    $_REQUEST[ 'fine_print' ] != ''
) {
    $fine_print = $_REQUEST[ 'fine_print' ];
}

if(
    isset( $_REQUEST[ 'columns' ] ) &&
    $_REQUEST[ 'columns' ] != ''
) {
    $columns = $_REQUEST[ 'columns' ];
}

$deals = search_deal(
    $deal,
    $url,
    $image_url,
    $business,
    $expiration,
    $percent_discount,
    $max_discount,
    $one_per,
    $claimed,
    $city,
    $fine_print,
    $columns,
    $count
);

header( 'content-type:application/json' );

echo( json_encode( $deals ) );
?>
