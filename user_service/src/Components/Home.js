import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet-control-geocoder"; // Import Geocoder plugin
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import "@fortawesome/fontawesome-free/css/all.css";

// Add FontAwesome icons to the library
library.add(fas);

// Create a custom Font Awesome icon
const createFontAwesomeIcon = () => {
  const iconHtml = `<i class="fas fa-location-dot" style="color: red; font-size: 24px;"></i>`;
  return L.divIcon({
    html: iconHtml,
    className: "custom-marker",
    iconSize: [24, 24],
    iconAnchor: [12, 24], // Adjust anchor point for positioning
    popupAnchor: [0, -20], // Position of the popup relative to the icon
  });
};

// Add Geocoder control to the map
const GeocoderControl = ({ map, setMarkerPosition }) => {
  useEffect(() => {
    if (!map) return;

    const geocoder = L.Control.geocoder({
      defaultMarkGeocode: false,
    })
      .on("markgeocode", function (e) {
        const { center } = e.geocode;
        map.setView(center, 13); // Center the map on the searched location
        setMarkerPosition([center.lat, center.lng]); // Update marker position
      })
      .addTo(map);

    return () => map.removeControl(geocoder); // Cleanup the Geocoder on unmount
  }, [map, setMarkerPosition]);

  return null; // This is a control, so it doesn't render anything in the React tree
};

const ServiceLocationApp = () => {
  const [selectedService, setSelectedService] = useState("");
  const [location, setLocation] = useState("");
  const [markerPosition, setMarkerPosition] = useState([51.505, -0.09]);
  const mapRef = useRef(null);

  const handleLocationSearch = () => {
    if (!mapRef.current) return;

    const geocoder = L.Control.Geocoder.nominatim();
    geocoder.geocode(location, (results) => {
      if (results.length > 0) {
        const { center } = results[0];
        setMarkerPosition([center.lat, center.lng]); // Update marker position
        mapRef.current.setView(center, 13); // Center the map
      } else {
        alert("Location not found. Please try again.");
      }
    });
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/3 p-6 bg-gray-100">
        <h2 className="text-xl font-bold mb-4">Find Your Service</h2>

        {/* Dropdown for services */}
        <div className="mb-4">
          <label htmlFor="service" className="block text-gray-700 mb-2">
            Select Service
          </label>
          <select
            id="service"
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="">Choose a service</option>
            <option value="Plumber">Plumber</option>
            <option value="Electrician">Electrician</option>
            <option value="Carpenter">Carpenter</option>
            <option value="Painter">Painter</option>
          </select>
        </div>

        {/* Location input */}
        <div className="mb-4">
          <label htmlFor="location" className="block text-gray-700 mb-2">
            Enter Location
          </label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Search for location"
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        {/* Search Button */}
        <button
          className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={handleLocationSearch}
        >
          Search
        </button>
      </div>

      {/* Right Side - Map */}
      <div className="w-full lg:w-2/3 h-96 lg:h-full">
        <MapContainer
          center={markerPosition}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          whenCreated={(mapInstance) => (mapRef.current = mapInstance)} // Store map instance
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={markerPosition} icon={createFontAwesomeIcon()}>
            <Popup>
              <span>{selectedService || "Searched Location"}</span>
            </Popup>
          </Marker>
          <GeocoderControl map={mapRef.current} setMarkerPosition={setMarkerPosition} />
        </MapContainer>
      </div>
    </div>
  );
};

export default ServiceLocationApp;
