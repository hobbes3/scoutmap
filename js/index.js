if( typeof console === 'undefined' )
{
    console =
    {
        log:  function() {},
        warn: function() {},
        info: function() {}
    }
}

var MAP_CANVAS

function initialize()
{
    console.info( 'initialize()' )

    MAP_CANVAS = document.getElementById( 'map_canvas' )

    console.log( 'MAP_CANVAS', MAP_CANVAS )

    var myOptions = {
        center    : new google.maps.LatLng( -34.397, 150.644 ),
        zoom      : 8,
        mapTypeId : google.maps.MapTypeId.ROADMAP
    }

    var map = new google.maps.Map( MAP_CANVAS, myOptions )

    console.log( 'map', map )
}
