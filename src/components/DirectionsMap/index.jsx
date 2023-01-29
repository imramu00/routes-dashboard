import React from 'react'
import L from 'leaflet'
import { MapContainer, TileLayer, Marker, FeatureGroup, Polyline, Popup } from 'react-leaflet'

const MapComponent = ({ source, destination, waypoints = [] }) => {
  const position = [source.lat, source.lon]
  const points = [source, ...waypoints, destination].map(({ lat, lon }) => [lat, lon])
  const customMarkerUserPos = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.5.1/dist/images/marker-icon.png',
    iconSize: [15, 20],
    iconAnchor: [5, 20],
    popupAnchor: [2, -40],
  })

  return (
    <MapContainer
      center={position}
      zoom={6}
      style={{
        height: '400px',
        width: '400px',
      }}
    >
      <TileLayer
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      />
      <FeatureGroup>
        {points?.map((mark, i) => (
          <Marker
            key={i}
            position={mark}
            icon={customMarkerUserPos}
          >
            <Popup>Stop {mark[2]}</Popup>
          </Marker>
        ))}

        <Polyline
          pathOptions={{ color: '#' + Math.random().toString(16).substr(-6) }}
          positions={points}
        />
      </FeatureGroup>
      <Polyline
        color={'purple'}
        positions={points}
      />
    </MapContainer>
  )
}

export default MapComponent

// import { useRef } from 'react'
// import { useEffect } from 'react'
// import tt from '@tomtom-international/web-sdk-maps'
// import mapServices from '@tomtom-international/web-sdk-services'
// import '@tomtom-international/web-sdk-maps/dist/maps.css'

// const popupOffsets = {
//   top: [0, 0],
//   bottom: [0, -50],
//   left: [25, -35],
//   right: [-25, -35],
// }
// const TOM_TOM_KEY = '0eS00aDhAUGAhfYTZ0Wif4oA1aZcI0o2'

// const MapComponent = ({ source, destination, waypoints = [] }) => {
//   const mapElement = useRef()

//   const mapZoom = 3

//   useEffect(() => {
//     let map = tt.map({
//       key: TOM_TOM_KEY,
//       container: mapElement.current,
//       center: [source.lat, source.lon],
//       zoom: mapZoom,
//       stylesVisibility: {
//         trafficIncidents: true,
//         trafficFlow: true,
//       },
//     })

//     const locations = [source.lon + ',' + source.lat]
//     waypoints?.forEach(stop => locations.push(stop.lon + ',' + stop.lat))
//     locations.push(destination.lon + ',' + destination.lat)

//     mapServices.services
//       .calculateRoute({
//         key: TOM_TOM_KEY,
//         locations: locations.join(':'),
//       })
//       .then(function (response) {
//         var geojson = response.toGeoJson()
//         map.on('style.load', function () {
//           map.addLayer({
//             id: 'route',
//             type: 'line',
//             source: {
//               type: 'geojson',
//               data: geojson,
//             },
//             paint: {
//               'line-color': '#00d7ff',
//               'line-width': 2,
//             },
//           })
//           var bounds = new tt.LngLatBounds()
//           geojson.features[0].geometry.coordinates.forEach(point => bounds.extend(tt.LngLat.convert(point)))
//           map.fitBounds(bounds, { padding: 20 })
//         })
//       })

//     waypoints.forEach(stop => {
//       let marker = new tt.Marker({
//         draggable: false,
//       })
//         .setLngLat([stop.lon, stop.lat])
//         .addTo(map)
//       let popup = new tt.Popup({ offset: popupOffsets }).setHTML(stop.value)
//       marker.setPopup(popup)
//     })

//     return () => map.remove()
//   }, [source, destination, waypoints])

//   return (
//     <div
//       ref={mapElement}
//       className='mapDiv'
//     />
//   )
// }

// export default MapComponent
