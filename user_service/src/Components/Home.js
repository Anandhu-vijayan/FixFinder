import React, { useState, useRef, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";

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
  const [selectedLocation, setSelectedLocation] = useState(null); // Location selected from suggestions
  const [isMapReady, setIsMapReady] = useState(false); // Flag to check if the map is initialized
  const mapRef = useRef(null);
  const LOCATIONIQ_API_KEY = "pk.17a9b3ccce81c30ec3c70598dfe10beb"; // Replace with your actual API key
  const INDIA_COORDINATES = { lat: 20.5937, lon: 78.9629 };

  // Fetch location suggestions based on user input
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

  // Handle selection of a suggestion
  const handleSuggestionSelect = (suggestion) => {
    const lat = parseFloat(suggestion.lat);
    const lon = parseFloat(suggestion.lon);
    setSelectedLocation({ lat, lon });
    setQuery(suggestion.display_name);
    setSuggestions([]);
    console.log("Location selected:", { lat, lon });
  };

  // Update the map to the selected location when the Search button is clicked
  const handleSearch = () => {
    if (mapRef.current && selectedLocation) {
      const zoomLevel = 13; // Desired zoom level
      mapRef.current.flyTo([selectedLocation.lat, selectedLocation.lon], zoomLevel);
      console.log("Map flew to:", selectedLocation);
    } else {
      alert("Please select a valid location before searching!");
    }
  };

  // Trigger the map control (flyTo) once the map is ready
  useEffect(() => {
    if (mapRef.current && selectedLocation && isMapReady) {
      mapRef.current.flyTo([selectedLocation.lat, selectedLocation.lon], 13);
    }
  }, [selectedLocation, isMapReady]); // Re-run whenever selectedLocation or isMapReady changes

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

        {/* Search button */}
        <button
          onClick={handleSearch}
          className="w-full bg-blue-500 text-white p-2 rounded mt-2"
          disabled={!selectedLocation} // Disable the button if no location is selected
        >
          Search
        </button>

        <div className="mt-4 p-2 bg-gray-200 rounded">
          <h3 className="text-gray-700 font-semibold">Selected Location:</h3>
          {selectedLocation ? (
            <>
              <p className="text-sm text-gray-600">Latitude: {selectedLocation.lat}</p>
              <p className="text-sm text-gray-600">Longitude: {selectedLocation.lon}</p>
            </>
          ) : (
            <p className="text-sm text-gray-600">Default location: India</p>
          )}
        </div>
      </div>

      <div className="w-full lg:w-2/3 h-96 lg:h-full">
        <MapContainer
          center={INDIA_COORDINATES}
          zoom={13} // Set the initial zoom level
          style={{ height: "100%", width: "100%" }}
          whenCreated={(mapInstance) => {
            mapRef.current = mapInstance;
            setIsMapReady(true); // Set map as ready once it's created
            console.log("Map instance created:", mapRef.current);
          }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          <Marker
            position={
              selectedLocation
                ? [selectedLocation.lat, selectedLocation.lon]
                : INDIA_COORDINATES
            }
            icon={createDefaultIcon()}
          >
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
