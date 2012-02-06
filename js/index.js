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

var MY_LOCATION = null

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

    var homeControlDiv = document.createElement( 'div' )
    var homeControl = new HomeControl( homeControlDiv, MAP )

    homeControlDiv.index = 1
    MAP.controls[ google.maps.ControlPosition.TOP_RIGHT ].push( homeControlDiv )

    send_get_business_list()
}

function send_get_business_list()
{
    console.info( 'send_get_business_list()' )

    var url = 'common/ajax/get_business_search_results.php'

    var options = {
        columns : [ 'business', 'latitude', 'longitude' ]
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

            marker.id = parseInt( business[ 'business' ] )

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
            averageCenter  : true,
            gridSize       : 40,
            maxZoom        : 16,
            imagePath      : 'common/images/m',
            imageExtension : 'png'
        }

        var marker_cluster = new MarkerClusterer( MAP, MARKERS, options )

        marker_cluster.setCalculator
        (
            function( markers, numStyles ) {
                var index = 0
                var count = markers.length.toString()

                if     ( count < 5  ) index = 1
                else if( count < 20 ) index = 2
                else if( count < 40 ) index = 3
                else if( count < 80 ) index = 4
                else                  index = 5

                return {
                    text  : count,
                    index : index
                }
            }
        )

        console.log( marker_cluster.getCalculator() )
    }
}

function add_business_marker( business )
{

}

function HomeControl(controlDiv, map) {
    controlDiv.style.padding = '5px'

    var controlUI = document.createElement( 'div' )
    controlUI.style.backgroundColor = 'white'
    controlUI.style.borderStyle     = 'solid'
    controlUI.style.borderWidth     = '2px'
    controlUI.style.cursor          = 'pointer'
    controlUI.style.textAlign       = 'center'
    controlUI.title                 = 'Click here to get your location.'
    controlDiv.appendChild( controlUI )

    var controlText = document.createElement( 'div' )
    controlText.style.fontFamily   = 'arial, sans-serif'
    controlText.style.fontSize     = '12px'
    controlText.style.paddingLeft  = '4px'
    controlText.style.paddingRight = '4px'
    controlText.innerHTML          = 'My Location'
    controlUI.appendChild( controlText )

    google.maps.event.addDomListener( controlUI, 'click', function() {
        set_my_location()
    } )
}

function set_my_location()
{
    console.info( 'set_my_location()' )


    if( MY_LOCATION == null )
    {
        console.log( 'MY_LOCATION is null' )

        MY_LOCATION = new google.maps.Marker( {
            clickable : true,
            icon      : new google.maps.MarkerImage(
                            '//maps.gstatic.com/mapfiles/mobile/mobileimgs2.png',
                            new google.maps.Size ( 22, 22 ),
                            new google.maps.Point( 0 , 18 ),
                            new google.maps.Point( 11, 11 )
                        ),
            shadow    : null,
            zIndex    : 999,
            map       : MAP
        } )
    }

    if( navigator.geolocation ) {
        navigator.geolocation.getCurrentPosition( function( pos ) {
            var latitude  = pos.coords.latitude
            var longitude = pos.coords.longitude

            console.log( 'latitude' , latitude  )
            console.log( 'longitude', longitude )
            var me = new google.maps.LatLng( latitude, longitude )
            MY_LOCATION.setPosition( me )

            MAP.setCenter( me )
            MAP.setZoom( 15 )
        }, function( error ) {
            alert( "Error getting your current location." )
        } )
    }
    else {
        alert( "Your browser doesn't support current location." )
    }
}
