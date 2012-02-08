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
    $state,
    $zip_code,
    $latitude,
    $longitude,
    $phone,
    $url,
    $yelp_url,
    $columns,
    &$count = -1
) {
    $query = "select ";

    if( is_null( $columns ) ) {
        $query .= "*";
    }
    else {
        $query .= db_escape( implode( ',', $columns ) );
    }

    $query .= " from tb_business where true ";

	$business = db_prep_positive_int( $business );
	$zip_code = db_prep_positive_int( $zip_code );
	$phone    = db_prep_positive_int( $phone    );

    fb( $business, '$business (after db_prep)' );

    $latitude  = db_prep_real( $latitude  );
    $longitude = db_prep_real( $longitude );

    $name         = db_prep_string( db_escape( $name         ) );
    $neighborhood = db_prep_string( db_escape( $neighborhood ) );
    $address      = db_prep_string( db_escape( $address      ) );
    $city         = db_prep_string( db_escape( $city         ) );
    $state        = db_prep_string( db_escape( $state        ) );
    $url          = db_prep_string( db_escape( $url          ) );
    $yelp_url     = db_prep_string( db_escape( $yelp_url     ) );

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
    if( strcmp( $state, 'null' ) ) {
        $query .= "and state = $state ";
    }
    if( strcmp( $zip_code, 'null' ) ) {
        $query .= "and zip_code = $zip_code ";
    }
    if( strcmp( $latitude, 'null' ) ) {
        $query .= "and latitude = $latitude ";
    }
    if( strcmp( $longitude, 'null' ) ) {
        $query .= "and longitude = $longitude ";
    }
    if( strcmp( $phone, 'null' ) ) {
        $query .= "and phone = $phone ";
    }
    if( strcmp( $url, 'null' ) ) {
        $query .= "and url = $url ";
    }
    if( strcmp( $yelp_url, 'null' ) ) {
        $query .= "and yelp_url = $yelp_url ";
    }

    fb( $query, '$query' );

    $retval = query_assoc( $query, $count );

    return $retval;

    //fb( $retval, '$retval search_business' );
    //fb( $count, '$count' );
}

function search_deal(
    $deal,
    $url,
    $business,
    $expiration,
    $percent_discount,
    $max_discount,
    $one_per,
    $claimed,
    $city,
    $fine_print,
    $columns,
    &$count
) {
    $query = "select ";

    if( is_null( $columns ) ) {
        $query .= "*";
    }
    else {
        $query .= db_escape( implode( ',', $columns ) );
    }

    $query .= " from tb_deal where true ";

	$deal             = db_prep_positive_int( $deal             );
	$business         = db_prep_positive_int( $business         );
	$percent_discount = db_prep_positive_int( $percent_discount );
	$max_discount     = db_prep_positive_int( $max_discount     );
    $claimed          = db_prep_positive_int( $claimed          );

    $url        = db_prep_string( db_escape( $url        ) );
    $expiration = db_prep_string( db_escape( $expiration ) );
    $one_per    = db_prep_string( db_escape( $one_per    ) );
    $city       = db_prep_string( db_escape( $city       ) );
    $fine_print = db_prep_string( db_escape( $fine_print ) );

    fb( $city, '$city' );

    if( strcmp( $deal, 'null' ) ) {
        $query .= "and deal = $deal ";
    }
    if( strcmp( $url, 'null' ) ) {
        $query .= "and url = $url ";
    }
    if( strcmp( $business, 'null' ) ) {
        $query .= "and business = $business ";
    }
    if( strcmp( $expiration, 'null' ) ) {
        $query .= "and expiration = $expiration ";
    }
    if( strcmp( $percent_discount, 'null' ) ) {
        $query .= "and percent_discount = $percent_discount ";
    }
    if( strcmp( $max_discount, 'null' ) ) {
        $query .= "and max_discount >= $max_discount ";
    }
    if( strcmp( $one_per, 'null' ) ) {
        $query .= "and one_per = $one_per ";
    }
    if( strcmp( $claimed, 'null' ) ) {
        $query .= "and claimed >= $claimed ";
    }
    if( strcmp( $city, 'null' ) ) {
        $query .= "and city = $city ";
    }
    if( strcmp( $fine_print, 'null' ) ) {
        $query .= "and fine_print regexp $fine_print ";
    }

    fb( $query, '$query' );

    $retval = query_assoc( $query, $count );

    return $retval;

    //fb( $retval, '$retval search_deal' );
    //fb( $count, '$count' );
}
