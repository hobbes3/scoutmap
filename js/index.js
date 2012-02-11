if( typeof console === 'undefined' )
{
    console =
    {
        log:  function() {},
        warn: function() {},
        info: function() {}
    };
}

var MAP;

var MARKERS = new Array();

var MY_LOCATION = null;

var INFO_WINDOW_Z = 0;

function initialize()
{
    console.info( 'initialize()' );

    map_div         = document.getElementById( 'map'         );
    my_location_div = document.getElementById( 'my_location' );

    var options =
    {
        center    : new google.maps.LatLng( 40, -99 ),
        zoom      : 5,
        minZoom   : 5,
        mapTypeId : google.maps.MapTypeId.ROADMAP
    };

    MAP = new google.maps.Map( map_div, options );

    var my_location_text = document.createElement( 'div' );
    my_location_text.id = 'my_location_text';
    my_location_text.innerHTML = 'My Location';

    var my_location_box = document.createElement( 'div' );
    my_location_box.id = 'my_location_box';
    my_location_box.title = 'Click here to get your location.';

    my_location_box.appendChild( my_location_text );

    google.maps.event.addDomListener( my_location_box, 'click', function() {
        set_my_location();
    } );

    MAP.controls[ google.maps.ControlPosition.TOP_RIGHT ].push( my_location_box );

    send_get_business_list();
};

function send_get_business_list()
{
    console.info( 'send_get_business_list()' );

    var url = 'common/ajax/get_business_search_results.php';

    var options = {
        //city         : 'atlanta',
        //neighborhood : 'buckhead',
        columns      : [ 'business', 'name', 'latitude', 'longitude' ]
    };

    $.get( url, options, receive_get_business_list );

    function receive_get_business_list( doc, text_status )
    {
        console.info( 'receive_get_business_list()' );
        //console.info( 'receive_get_business_list( doc = ', doc, ', text_status = ', text_status, ' )' );

        var marker_array = new Array();

        var i;
        for( i in doc )
        {
            var business = doc[ i ];

            //console.info( 'i = ', i, ': business = ', business );

            var latitude  = parseFloat( business[ 'latitude'  ] );
            var longitude = parseFloat( business[ 'longitude' ] );

            //console.log( 'latitude',  latitude  );
            //console.log( 'longitude', longitude );

            var marker = new google.maps.Marker( {
                position  : new google.maps.LatLng( latitude, longitude ),
                title     : business[ 'name' ],
                animation : google.maps.Animation.DROP
            } );

            marker.id = parseInt( business[ 'business' ] );

            google.maps.event.addListener( marker, 'click', open_close_info_window );

            MARKERS.push( marker );
        }

        var options = {
            averageCenter  : true,
            gridSize       : 40,
            maxZoom        : 16,
            imagePath      : 'common/images/m',
            imageExtension : 'png'
        };

        var marker_cluster = new MarkerClusterer( MAP, MARKERS, options );

        marker_cluster.setCalculator
        (
            function( markers, numStyles ) {
                var index = 0;
                var count = markers.length.toString();

                if     ( count < 5  ) index = 1;
                else if( count < 20 ) index = 2;
                else if( count < 40 ) index = 3;
                else if( count < 80 ) index = 4;
                else                  index = 5;

                return {
                    text  : count,
                    index : index
                };
            }
        );
    };
};

function open_close_info_window()
{
    console.info( "open_close_info_window()" );

    marker = this;

    if( marker.info_window )
    {
        if( marker.info_window.getMap() ) {
            marker.info_window.close();
        }
        else {
            marker.info_window.zIndex = INFO_WINDOW_Z;
            INFO_WINDOW_Z ++;

            marker.info_window.open( MAP, marker );
        }
        return;
    }

    var deal_title = document.createElement( 'div' );
    deal_title.id        = 'deal_title';
    deal_title.innerHTML = 'Loading...';

    var deal_image = document.createElement( 'img' );
    deal_image.id  = 'deal_image';
    deal_image.src = "common/images/big_spinning_wheel_centered.gif";

    var deal_description = document.createElement( 'div' );
    deal_description.id = 'deal_description';

    var warp_content = document.createElement( 'div' );
    warp_content.id = 'warp_content';

    warp_content.appendChild( deal_image       );
    warp_content.appendChild( deal_description );

    var content_div = document.createElement( 'div' );

    content_div.appendChild( deal_title   );
    content_div.appendChild( warp_content );

    var info_window = new google.maps.InfoWindow( {
        content : content_div,
        zIndex  : INFO_WINDOW_Z
    } );

    console.log( 'marker', marker );

    marker.info_window = info_window;

    marker.info_window.open( MAP, marker );

    var business = marker.id;

    var url = 'common/ajax/get_business_search_results.php';

    var options = {
        business : business,
        columns  : [ 'name', 'address', 'city', 'state', 'zip_code', 'phone', 'url' ]
    };

    $.get( url, options, receive_get_business );

    function receive_get_business( doc, text_status )
    {
        console.info( 'receive_get_business()' );

        business_doc = doc[ 0 ];

        var url = 'common/ajax/get_deal_search_results.php';

        var options = {
            business : business,
            columns  : [ 'url', 'image_url', 'expiration', 'percent_discount', 'claimed', 'fine_print' ]
        };

        $.get( url, options, receive_get_deal );

        function receive_get_deal( doc, text_status )
        {
            console.info( 'receive_get_deal()' );

            deal_doc = doc[ 0 ];

            deal_title.innerHTML = deal_doc[ 'percent_discount' ] + "% off " + business_doc[ 'name' ] + "<br />";

            deal_image.src = deal_doc[ 'image_url' ];

            var content_left   = document.createElement( 'div' );
            var content_right  = document.createElement( 'div' );
            var content_bottom = document.createElement( 'div' );

            content_left  .style.cssFloat     = 'left';
            content_right .style.cssFloat     = 'right';
            content_right .style.paddingRight = '40px';
            content_bottom.style.clear        = 'both';

            var plain_phone = business_doc[ 'phone' ];

            var m = plain_phone.match( /(\d{3})(\d{3})(\d{4})/ );

            var formatted_phone = '(' + m[ 1 ] + ') ' + m[ 2 ] + '-' + m[ 3 ];

            content_string  = business_doc[ 'address' ] + "<br />";
            content_string += business_doc[ 'city' ] + ", " + business_doc[ 'state' ] + " " + business_doc[ 'zip_code' ] + "<br />";
            //content_string += "<a href = 'tel : " + plain_phone + "'>" + formatted_phone + "</a><br />";
            content_string += formatted_phone + "<br />";

            content_left.innerHTML = content_string;

            content_string  = "<a href = '" + business_doc[ 'url' ] + "' target = '_blank'>Business page</a><br />";
            content_string += "<a href = 'http://scoutmob.com" + deal_doc[ 'url' ] + "' target = '_blank'>Scoutmob page</a><br />";
            //content_string += "Expires on " + deal_doc[ 'expiration' ] + ".<br />";
            content_string += deal_doc[ 'claimed' ] + " claimed.<br />";

            content_right.innerHTML = content_string;

            content_string = "<br />" + deal_doc[ 'fine_print' ];

            content_bottom.innerHTML = content_string;

            deal_description.appendChild( content_left   );
            deal_description.appendChild( content_right  );
            deal_description.appendChild( content_bottom );

            $( warp_content ).hover( function() {
                $( deal_description ).fadeIn( 'fast' );
            }, function() {
                $( deal_description ).fadeOut( 'fast' );
            } );

        };
    };
};

function add_business_marker( business )
{

};

function set_my_location()
{
    console.info( 'set_my_location()' );


    if( MY_LOCATION == null )
    {
        console.log( 'MY_LOCATION is null' );

        var marker_image = new google.maps.MarkerImage(
            '//maps.gstatic.com/mapfiles/mobile/mobileimgs2.png',
            new google.maps.Size ( 22, 22 ),
            new google.maps.Point( 0 , 18 ),
            new google.maps.Point( 11, 11 )
        );

        MY_LOCATION = new google.maps.Marker( {
            clickable : true,
            icon      : marker_image,
            shadow    : null,
            zIndex    : 999,
            map       : MAP
        } );
    }

    if( navigator.geolocation ) {
        navigator.geolocation.getCurrentPosition( function( pos ) {
            var latitude  = pos.coords.latitude;
            var longitude = pos.coords.longitude;

            console.log( 'latitude' , latitude  );
            console.log( 'longitude', longitude );
            var me = new google.maps.LatLng( latitude, longitude );
            MY_LOCATION.setPosition( me );

            MAP.setCenter( me );
            MAP.setZoom( 15 );
        }, function( error ) {
            alert( "Error getting your current location." );
        } )
    }
    else {
        alert( "Your browser doesn't support current location." );
    }
}
