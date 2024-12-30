import React, { useState, useRef, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";

// Fallback default icon for Leaflet
const createDefaultIcon = () => {
  return L.icon({
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    shadowSize: [41, 41],
  });
};

const ServiceLocationApp = () => {
  const [selectedService, setSelectedService] = useState("");
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [location, setLocation] = useState(null); // Initially no selected location
  const mapRef = useRef(null);

  const LOCATIONIQ_API_KEY = "pk.17a9b3ccce81c30ec3c70598dfe10beb";

  const INDIA_COORDINATES = { lat: 20.5937, lon: 78.9629 }; // Default to India's center

  // Handle location input changes
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

  // Handle location suggestion selection
  const handleSuggestionSelect = (suggestion) => {
    const lat = parseFloat(suggestion.lat);
    const lon = parseFloat(suggestion.lon);
    setLocation({ lat, lon }); // Update state with selected coordinates
    setQuery(suggestion.display_name); // Update input value
    setSuggestions([]); // Clear suggestions

    // Center and zoom the map to the selected coordinates
    console.log(mapRef.current);
    if (mapRef.current) {
      mapRef.current.setView([lat, lon], 13); // Set zoom to level 13
    }
  };

  // Zoom to location whenever `location` state changes
  useEffect(() => {
    if (location && mapRef.current) {
      mapRef.current.setView([location.lat, location.lon], 13); // Zoom to selected location
    }
  }, [location]); // Trigger effect whenever location changes

  return (
    <div className="flex flex-col lg:flex-row h-screen">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/3 p-6 bg-gray-100">
        <h2 className="text-xl font-bold mb-4">Find Your Service</h2>

        {/* Dropdown for selecting service */}
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

        {/* Location autocomplete */}
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

        {/* Display selected lat/lon */}
        <div className="mt-4 p-2 bg-gray-200 rounded">
          <h3 className="text-gray-700 font-semibold">Selected Location:</h3>
          {location ? (
            <>
              <p className="text-sm text-gray-600">Latitude: {location.lat}</p>
              <p className="text-sm text-gray-600">Longitude: {location.lon}</p>
            </>
          ) : (
            <p className="text-sm text-gray-600">Default location: India</p>
          )}
        </div>
      </div>

      {/* Right Side - Map */}
      <div className="w-full lg:w-2/3 h-96 lg:h-full">
        <MapContainer
          center={location ? [location.lat, location.lon] : [INDIA_COORDINATES.lat, INDIA_COORDINATES.lon]} // Center on India by default
          zoom={location ? 13 : 5} // Default zoom level 5 for India
          style={{ height: "100%", width: "100%" }}
          whenCreated={(mapInstance) => (mapRef.current = mapInstance)}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {(location || INDIA_COORDINATES) && (
            <Marker
              position={location ? [location.lat, location.lon] : [INDIA_COORDINATES.lat, INDIA_COORDINATES.lon]}
              icon={createDefaultIcon()}
            >
              <Popup>
                <span>{location ? selectedService || "Searched Location" : "Default Location: India"}</span>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default ServiceLocationApp;
