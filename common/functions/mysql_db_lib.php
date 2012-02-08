<?php
require_once( '../php/firephp/fb.php' );
require_once( "../php/db_config.php" );

$con = mysql_connect( DB_HOST, DB_USER, DB_PASSWORD );

if( !$con ) {
    die( "Not connected : " . mysql_error() );
}

$db_selected = mysql_select_db( DB_DATABASE, $con );
if( !$db_selected ) {
    die( "Can't use " . DB_DATABASE . " : " . mysql_error() );
}

function query_array( $query, &$count )
{
    global $con;

    //fb( $query, '$query' );

    $result = mysql_query( $query );

    if( !$result )
    {
        $message  = "Invalid query: " . mysql_error() . "\n";
        $message .= "Whole query: " . $query;
        die( $message );
    }

    $retval = array();

    while( $row = mysql_fetch_array( $result ) ) {
        array_push( $retval, $row );
    }

    $count = mysql_num_rows( $result );

    //fb( $retval, '$retval' );

    return $retval;
}
function query_assoc( $query, &$count )
{
    global $con;

    //fb( $query, '$query' );

    $result = mysql_query( $query );

    if( !$result )
    {
        $message  = "Invalid query: " . mysql_error() . "\n";
        $message .= "Whole query: " . $query;
        die( $message );
    }

    $retval = array();

    while( $row = mysql_fetch_assoc( $result ) ) {
        array_push( $retval, $row );
    }

    $count = mysql_num_rows( $result );

    //fb( $retval, '$retval' );

    return $retval;
}

function get_field_names( $table_name )
{
    $query = "select * from $table_name";

    $result = mysql_query( $query );

    $num_fields = mysql_num_fields( $result );

    $retval = array();

    for( $i = 0; $i < $num_fields; $i ++ ) {
        array_push( $retval, mysql_field_name( $result, $i ) );
    }

    return $retval;
}

function get_last_id()
{
    $retval = mysql_insert_id();

    return $retval;
}

function get_last_db_error()
{
    global $con;

    $retval = mysql_error( $con );

    return $retval;
}

function db_escape( $value )
{
    $retval = mysql_real_escape_string( $value );

    return $retval;
}

function db_prep_positive_real( $value, $zero_ok )
{
    if(
        is_null ($value ) ||
        !is_numeric( $value)  ||
        $value == ""
    ) {
        return 'null';
    }
    if( $value < 0 ) {
        return 'null';
    }
    if( $value == 0 && !$zero_ok ) {
        return 'null';
    }

    return ( real ) $value;
}

function db_prep_positive_int( $value, $zero_ok = false )
{
    if(
        is_null( $value ) ||
        !is_numeric( $value ) ||
        $value == ""
    ) {
        return 'null';
    }
    if( $value < 0 ) {
        return 'null';
    }
    if( $value == 0 && !$zero_ok ) {
        return 'null';
    }

    return $value;
}

function db_prep_int( $value, $zero_ok = false )
{
    if(
        is_null( $value ) ||
        !is_numeric( $value ) ||
        $value == ""
    ) {
        return 'null';
    }
    if( $value == 0 && !$zero_ok ) {
        return 'null';
    }

    return ( int ) $value;
}


function db_prep_real( $value, $zero_ok = false )
{
    if(
        is_null ($value ) ||
        !is_numeric( $value ) ||
        $value == ""
    ) {
        return 'null';
    }
    if( $value == 0 && !$zerk_ok ) {
        return 'null';
    }

    return ( real ) $value;
}

function db_prep_string( $value )
{
    if(
        is_null( $value ) ||
        preg_match( '/^\s+$/', $value ) ||
        $value == ''
    ) {
        return 'null';
    }

    return "'$value'";
}

function db_prep_boolean( $value, $null_allowed = true )
{
    if(
        is_null( $value ) ||
        $value == "" ||
        $value === -1
    ) {
        if( $null_allowed ) {
            return 'null';
        }
        else {
            return 'false';
        }
    }
    else {
        if(
            $value == '1' ||
            $value == 't' ||
            $value == 'true'
        ) {
            return 'true';
        }
        else {
            return 'false';
        }
    }

    return $value;
}

function db_prep_timestamp( $time )
{
	if(
		!is_null( $time ) &&
		$time != '' &&
		!is_numeric( $time )
	) {
		$result = db_prep_string( db_escape( $time ) );
		$result = strtotime( str_replace( "'", '', $result ) );
		$result = " to_timestamp( $result ) ";
	}
    else if( is_numeric( $time ) ) {
		$result = db_prep_int( $time, true );
		$result = " to_timestamp( $time ) ";
	}
	else {
		$result = 'null ';
	}

	return $result;
}
?>
