if( typeof console === 'undefined' )
{
    console =
    {
        log:  function() {},
        warn: function() {},
        info: function() {}
    }
}

var MAP_DIV
var MAP

var MARKERS = new Array()

var INFO_WINDOW_Z = 0

function initialize()
{
    console.info( 'initialize()' )

    MAP_DIV = document.getElementById( 'map' )

    var options =
    {
        center    : new google.maps.LatLng( 40, -99 ),
        zoom      : 5,
        minZoom   : 5,
        mapTypeId : google.maps.MapTypeId.ROADMAP
    }

    MAP = new google.maps.Map( MAP_DIV, options )

    var dragStartCenter;

    google.maps.event.addListener( MAP, 'dragstart', function() {
        dragStartCenter = MAP.getCenter()
    } )

    google.maps.event.addListener( MAP, 'dragend', function() {
        if( mapBounds.contains( MAP.getCenter() ) ) return
        map.setCenter( MAP.dragStartCenter )
    } )


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

        /*
        var i = 0
        var interval = setInterval( function() {
            MARKERS[ i ].setMap( MAP )
            i ++
            if( i >= MARKERS.length ) clearInterval( interval )
        }, 100 )
        */
    }
}

function add_business_marker( business )
{

}
