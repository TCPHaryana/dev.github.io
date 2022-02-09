Leaflet.Locate

https://github.com/domoritz/leaflet-locatecontrol
Add the following snippet to your map initialization:
This snippet adds the control to the map. You can pass also pass a configuration.

L.control.locate().addTo(map);
Possible options
The locate controls inherits options from Leaflet Controls.

To customize the control, pass an object with your custom options to the locate control.

L.control.locate(OPTIONS).addTo(map);
Possible options are listed in the following table. More details are in the code.

Option	Type	Description	Default
position	string	Position of the control	topleft
layer	ILayer	The layer that the user's location should be drawn on.	a new layer
setView	boolean or string	Set the map view (zoom and pan) to the user's location as it updates. Options are false, 'once', 'always', 'untilPan', or 'untilPanOrZoom'	'untilPanOrZoom'
flyTo	boolean	Smooth pan and zoom to the location of the marker. Only works in Leaflet 1.0+.	false
keepCurrentZoomLevel	boolean	Only pan when setting the view.	false
initialZoomLevel	false or integer	After activating the plugin by clicking on the icon, zoom to the selected zoom level, even when keepCurrentZoomLevel is true. Set to false to disable this feature.	false
clickBehavior	object	What to do when the user clicks on the control. Has three options inView, inViewNotFollowing and outOfView. Possible values are stop and setView, or the name of a behaviour to inherit from.	{inView: 'stop', outOfView: 'setView', inViewNotFollowing: 'inView'}
returnToPrevBounds	boolean	If set, save the map bounds just before centering to the user's location. When control is disabled, set the view back to the bounds that were saved.	false
cacheLocation	boolean	Keep a cache of the location after the user deactivates the control. If set to false, the user has to wait until the locate API returns a new location before they see where they are again.	true
showCompass	boolean	Show the compass bearing on top of the location marker	true
drawCircle	boolean	If set, a circle that shows the location accuracy is drawn.	true
drawMarker	boolean	If set, the marker at the users' location is drawn.	true
markerClass	class	The class to be used to create the marker.	LocationMarker
compassClass	class	The class to be used to create the marker.	CompassMarker
circleStyle	Path options	Accuracy circle style properties.	see code
markerStyle	Path options	Inner marker style properties. Only works if your marker class supports setStyle.	see code
compassStyle	Path options	Triangle compass heading marker style properties. Only works if your marker class supports setStyle.	see code
followCircleStyle	Path options	Changes to the accuracy circle while following. Only need to provide changes.	{}
followMarkerStyle	Path options	Changes to the inner marker while following. Only need to provide changes.	{}
followCompassStyle	Path options	Changes to the compass marker while following. Only need to provide changes.	{}
icon	string	The CSS class for the icon.	leaflet-control-locate-location-arrow
iconLoading	string	The CSS class for the icon while loading.	leaflet-control-locate-spinner
iconElementTag	string	The element to be created for icons.	span
circlePadding	array	Padding around the accuracy circle.	[0, 0]
createButtonCallback	function	This callback can be used in case you would like to override button creation behavior.	see code
getLocationBounds	function	This callback can be used to override the viewport tracking behavior.	see code
onLocationError	function	This even is called when the user's location is outside the bounds set on the map.	see code
onLocationOutsideMapBounds	function	Use metric units.	see code
showPopup	boolean	Display a pop-up when the user click on the inner marker.	true
strings	object	Strings used in the control. Options are title, text, metersUnit, feetUnit, popup and outsideMapBoundsMsg	see code
strings.popup	string or function	The string shown as popup. May contain the placeholders {distance} and {unit}. If this option is specified as function, it will be executed with a single parameter {distance, unit} and expected to return a string.	see code
locateOptions	Locate options	The default options passed to leaflets locate method.	see code
For example, to customize the position and the title, you could write

var lc = L.control.locate({
    position: 'topright',
    strings: {
        title: "Show me where I am, yo!"
    }
}).addTo(map);