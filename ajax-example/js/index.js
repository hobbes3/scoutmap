if( typeof console === 'undefined' )
{
    console =
    {
        log:  function() {},
        warn: function() {},
        info: function() {}
    }
}

var THEAD_HEADER
var TBODY_BODY

function initialize()
{
    console.info( 'initialize()' )

    THEAD_HEADER = document.getElementById( 'thead_header' )
    TBODY_BODY   = document.getElementById( 'tbody_body'   )

    console.log( 'TBODY_BODY', TBODY_BODY )

    send_get_field_list()
}

function send_get_field_list()
{
    console.info( 'send_get_field_list()' )

    var url = '../common/ajax/get_field_list.php'
    var map = {
        table_name : 'tb_business'
    }

    $.get( url, map, receive_get_field_list )

    function receive_get_field_list( doc, textStatus )
    {
        console.info( 'receive_get_field_list( doc = ', doc, ', textStatus = ', textStatus, ' )' )

        var tr_header = document.createElement( 'tr' )

        var i
        for( i in doc )
        {
            var th_field = document.createElement( 'th' )

            //console.log( 'doc[ ' + i + ' ]', doc[ i ] )

            th_field.appendChild( document.createTextNode( doc[ i ] ) )

            tr_header.appendChild( th_field )
        }

        THEAD_HEADER.appendChild( tr_header )

        send_get_business_list()
    }
}

function send_get_business_list()
{
    console.info( 'send_get_business_list()' )

    var url = '../common/ajax/get_business_search_results.php'
    var map = {
        city : 'atlanta'
    }

    $.get( url, map, receive_get_business_list )

    function receive_get_business_list( doc, textStatus )
    {
        console.info( 'receive_get_business_list( doc = ', doc, ', textStatus = ', textStatus, ' )' )

        var i
        for( i in doc )
        {
            var tr_row = document.createElement( 'tr' )
            var business = doc[ i ]

            var j
            for( j in business )
            {
                var td_value = document.createElement( 'td' )

                td_value.appendChild( document.createTextNode( business[ j ] ) )

                tr_row.appendChild( td_value )
            }

            TBODY_BODY.appendChild( tr_row )
        }

    }
}
