if( typeof console === 'undefined' )
{
    console =
    {
        log:  function() {},
        warn: function() {},
        info: function() {}
    }
}

var MAP

var MARKERS = new Array()

var INFO_WINDOW_Z = 0

function initialize()
{
    console.info( 'initialize()' )

    map_div         = document.getElementById( 'map'         )
    my_location_div = document.getElementById( 'my_location' )

    var options =
    {
        center    : new google.maps.LatLng( 40, -99 ),
        zoom      : 5,
        minZoom   : 5,
        mapTypeId : google.maps.MapTypeId.ROADMAP
    }

    MAP = new google.maps.Map( map_div, options )

    google.maps.event.addDomListener( my_location_div, 'click', set_my_location() );

    send_get_business_list()
}

function send_get_business_list()
{
    console.info( 'send_get_business_list()' )

    var url = 'common/ajax/get_business_search_results.php'
    var options = {
        //city : 'atlanta'
    }

    $.get( url, options, receive_get_business_list )

    function receive_get_business_list( doc, textStatus )
    {
        console.info( 'receive_get_business_list()' )
        //console.info( 'receive_get_business_list( doc = ', doc, ', textStatus = ', textStatus, ' )' )

        var marker_array = new Array()

        var i
        for( i in doc )
        {
            var business = doc[ i ]

            //console.info( 'i = ', i, ': business = ', business )

            var latitude  = parseFloat( business[ 'latitude'  ] )
            var longitude = parseFloat( business[ 'longitude' ] )

            //console.log( 'latitude',  latitude  )
            //console.log( 'longitude', longitude )

            var marker = new google.maps.Marker( {
                position  : new google.maps.LatLng( latitude, longitude ),
                animation : google.maps.Animation.DROP
            } )

            marker.id = i

            var contentString

            contentString  = "<div style = 'width : 300'>"
            contentString += "<strong>" + business[ 'name' ] + "</strong><br />"
            contentString += business[ 'address' ] + "<br />"
            contentString += business[ 'city' ] + ", " + business[ 'state' ] + " " + business[ 'zip_code' ]
            contentString += "</div>"

            var info_window = new google.maps.InfoWindow( {
                content : contentString
            } )

            marker.info_window = info_window

            google.maps.event.addListener( marker, 'click', function() {
                console.log( 'this', this )

                // Make sure whatever clicked info window is always on top.
                this.info_window.zIndex = INFO_WINDOW_Z
                INFO_WINDOW_Z ++

                this.info_window.open( MAP, this )
            } )

            MARKERS.push( marker )
        }

        var options = {
            averageCenter : true,
            gridSize      : 30,
            maxZoom       : 16
        }

        var marker_cluster = new MarkerClusterer( MAP, MARKERS, options );
    }
}

function add_business_marker( business )
{

}

function set_my_location()
{
    var my_location = new google.maps.Marker( {
        clickable : true,
        icon      : new google.maps.MarkerImage(
                        '//maps.gstatic.com/mapfiles/mobile/mobileimgs2.png',
                        new google.maps.Size( 22, 22 ),
                        new google.maps.Point( 0, 18 ),
                        new google.maps.Point( 11, 11 )
                    ),
        shadow    : null,
        zIndex    : 999,
        map       : MAP
    } );

    if( navigator.geolocation ) {
        navigator.geolocation.getCurrentPosition( function( pos ) {
            var latitude  = pos.coords.latitude
            var longitude = pos.coords.longitude

            console.log( 'latitude' , latitude  )
            console.log( 'longitude', longitude )
            var me = new google.maps.LatLng( latitude, longitude )
            my_location.setPosition( me )

            MAP.setCenter( me )
            MAP.setZoom( 5 )
        }, function( error ) {
            alert( "Error getting your current location." )
        } )
    }
    else {
        alert( "Your browser doesn't support current location." )
    }
}
