import React, { useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";

// Create a custom Font Awesome icon
const createFontAwesomeIcon = () => {
  const iconHtml = `<i class="fas fa-location-dot" style="color: red; font-size: 24px;"></i>`;
  return L.divIcon({
    html: iconHtml,
    className: "custom-marker",
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -20],
  });
};

const ServiceLocationApp = () => {
  const [selectedService, setSelectedService] = useState("");
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [markerPosition, setMarkerPosition] = useState([51.505, -0.09]);
  const mapRef = useRef(null);

  const LOCATIONIQ_API_KEY = "pk.17a9b3ccce81c30ec3c70598dfe10beb";

  const handleInputChange = async (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.length > 2) {
      try {
        const response = await axios.get(
          `https://api.locationiq.com/v1/autocomplete.php`,
          {
            params: {
              key: LOCATIONIQ_API_KEY,
              q: value,
              limit: 5,
              dedupe: 1,
            },
          }
        );
        setSuggestions(response.data);
      } catch (error) {
        console.error("Error fetching location suggestions:", error);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionSelect = (suggestion) => {
    const lat = parseFloat(suggestion.lat);
    const lon = parseFloat(suggestion.lon);

    setMarkerPosition([lat, lon]);
    setQuery(suggestion.display_name);
    setSuggestions([]);

    // Ensure mapRef.current is valid
    if (mapRef.current) {
      mapRef.current.setView([lat, lon], 13);
    } else {
      console.warn("Map reference is not available.");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen">
      <div className="w-full lg:w-1/3 p-6 bg-gray-100">
        <h2 className="text-xl font-bold mb-4">Find Your Service</h2>

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

        <div className="mb-4">
          <label htmlFor="location" className="block text-gray-700 mb-2">
            Enter Location
          </label>
          <input
            type="text"
            id="location"
            value={query}
            onChange={handleInputChange}
            placeholder="Search for a location"
            className="w-full p-2 border border-gray-300 rounded"
          />
          {suggestions.length > 0 && (
            <ul className="border border-gray-300 mt-2 bg-white rounded shadow-md max-h-40 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleSuggestionSelect(suggestion)}
                >
                  {suggestion.display_name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="w-full lg:w-2/3 h-96 lg:h-full">
        <MapContainer
          center={markerPosition}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          whenCreated={(mapInstance) => (mapRef.current = mapInstance)}
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
        </MapContainer>
      </div>
    </div>
  );
};

export default ServiceLocationApp;
