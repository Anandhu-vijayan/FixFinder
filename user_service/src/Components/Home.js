import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import L from "leaflet";
import "leaflet-control-geocoder"; // Import leaflet control geocoder
import Header from "./Header";

const Home = () => {
    const [date, setDate] = useState(new Date());
    const [selectedService, setSelectedService] = useState("");
    const [location, setLocation] = useState(""); // Location input state
    const [markerPosition, setMarkerPosition] = useState([51.505, -0.09]); // Default position
    const [searchResults, setSearchResults] = useState([]); // Store search results

    // Services list for dropdown
    const services = ["Plumber", "Electrician", "Carpenter", "Painter"];

    // Handle location search and suggestions
    const handleSearchLocation = (e) => {
        const searchText = e.target.value;
        setLocation(searchText); // Update input field value

        if (searchText.length > 2) {
            const geocoder = L.Control.Geocoder.nominatim(); // Geocoder instance
            geocoder.geocode(searchText, (results) => {
                if (results && results.length > 0) {
                    setSearchResults(results); // Set results for suggestions
                } else {
                    setSearchResults([]); // Clear suggestions if no results
                }
            });
        } else {
            setSearchResults([]); // Clear suggestions if input is too short
        }
    };

    // Handle selecting a location from suggestions
    const handleSelectLocation = (lat, lng, name) => {
        setMarkerPosition([lat, lng]); // Update the marker position
        setLocation(name); // Update location input
        setSearchResults([]); // Clear suggestions after selection
    };

    // Custom Map hook to interact with the map
    const MapHandler = () => {
        const map = useMap(); // Access the map instance via React-Leaflet

        useEffect(() => {
            if (markerPosition) {
                map.setView(markerPosition, 13); // Set map view when marker position changes
            }
        }, [map]);

        return null;
    };

    return (
        <div>
            <Header />
            <div className="flex">
                {/* Left Container - Form */}
                <div className="w-1/3 p-4 bg-gray-100">
                    <h2 className="text-xl font-bold">Select Service & Date</h2>

                    {/* Dropdown for selecting service */}
                    <div className="my-4">
                        <label className="block text-gray-700">Service</label>
                        <select
                            value={selectedService}
                            onChange={(e) => setSelectedService(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded"
                        >
                            <option value="">Select a service</option>
                            {services.map((service, index) => (
                                <option key={index} value={service}>
                                    {service}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Datepicker for selecting date */}
                    <div className="my-4">
                        <label className="block text-gray-700">Select Date</label>
                        <DatePicker
                            selected={date}
                            onChange={(date) => setDate(date)}
                            className="w-full p-2 border border-gray-300 rounded"
                        />
                    </div>

                    {/* Location input field with autocomplete suggestions */}
                    <div className="my-4">
                        <label className="block text-gray-700">Enter Location</label>
                        <input
                            type="text"
                            value={location}
                            onChange={handleSearchLocation}
                            placeholder="Search for location"
                            className="w-full p-2 border border-gray-300 rounded"
                        />
                        {searchResults.length > 0 && (
                            <ul className="mt-2 bg-white border rounded-md max-h-40 overflow-auto">
                                {searchResults.map((result, index) => (
                                    <li
                                        key={index}
                                        onClick={() =>
                                            handleSelectLocation(
                                                result.center.lat,
                                                result.center.lng,
                                                result.name
                                            )
                                        }
                                        className="p-2 cursor-pointer hover:bg-gray-200"
                                    >
                                        {result.name}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Right Container - Map */}
                <div className="w-2/3 h-screen">
                    <MapContainer
                        center={markerPosition}
                        zoom={13}
                        style={{ height: "100%", width: "100%" }}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        <Marker position={markerPosition}>
                            <Popup>
                                <span>Service Location: {selectedService}</span>
                            </Popup>
                        </Marker>
                        <MapHandler /> {/* Use custom hook to sync map with state */}
                    </MapContainer>
                </div>
            </div>
        </div >
    );
};

export default Home;
