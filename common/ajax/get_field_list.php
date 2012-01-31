<?php
require_once( '../php/firephp/fb.php' );
require_once( '../functions/db_lib.php' );

$table_name = null;

if(
    isset( $_REQUEST[ 'table_name' ] ) &&
    $_REQUEST[ 'table_name' ] != ''
) {
    $table_name = $_REQUEST[ 'table_name' ];
}

fb( $table_name, '$table_name' );

$field_names = get_field_names( $table_name );

fb( $field_names, '$field_names' );

header( 'content-type:application/json' );

echo( json_encode( $field_names ) );
?>
