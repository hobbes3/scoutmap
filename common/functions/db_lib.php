<?php
require_once( '../php/firephp/fb.php' );
require_once( 'mysql_db_lib.php' );

function get_business( $business )
{
	$business = db_prep_positive_int( $business );

    $retval = null;

    if( strcmp( $business, 'null' ) ) {
        $query = "select * from tb_business where buiness = $business";

        $retval = query_assoc( $query, $rows );
    }

    return $retval;
}

function search_business(
    $business,
    $name,
    $neighborhood,
    $address,
    $city,
    $zip_code,
    $columns,
    &$count = -1
) {
    fb( $columns, '$columns' );

    $query = "select ";

    if( is_null( $columns ) ) {
        $query .= "*";
    }
    else {
        $query .= db_escape( implode( ',', $columns ) );
    }

    $query .= " from tb_business where true ";

	$business = db_prep_positive_int( $business );

    $name         = db_prep_string( db_escape( $name         ) );
    $neighborhood = db_prep_string( db_escape( $neighborhood ) );
    $address      = db_prep_string( db_escape( $address      ) );
    $city         = db_prep_string( db_escape( $city         ) );

    $zip_code = db_prep_positive_int( $zip_code );

    fb( $city, '$city' );

    if( strcmp( $business, 'null' ) ) {
        $query .= "and business = $business ";
    }
    if( strcmp( $name, 'null' ) ) {
        $query .= "and name regexp $name ";
    }
    if( strcmp( $neighborhood, 'null' ) ) {
        $query .= "and neighborhood regexp $neighborhood ";
    }
    if( strcmp( $address, 'null' ) ) {
        $query .= "and address regexp $address ";
    }
    if( strcmp( $city, 'null' ) ) {
        $query .= "and city regexp $city ";
    }
    if( strcmp( $zip_code, 'null' ) ) {
        $query .= "and zip_code = $zip_code ";
    }

    fb( $query, '$query' );

    $retval = query_assoc( $query, $count );

    return $retval;

    //fb( $retval, '$retval search_business' );
    //fb( $count, '$count' );
}
