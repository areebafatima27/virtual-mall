"use client";
import React, { useState } from "react";
import { BsSearch } from "react-icons/bs";
import { FiHeart } from "react-icons/fi";
import { MdOutlineShoppingBag } from "react-icons/md";
import { BiUser } from "react-icons/bi";
import { useRouter } from "next/navigation";
import { collection, query, where, getDocs, limit } from "firebase/firestore"; // Import 'limit' here
import { db } from "app/lib/firebase"; // Ensure the path is correct for your Firebase setup
import ProductCard from "@/components/ui/productCard"; // Import the ProductCard component

const HeaderMain = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState(""); // State for search term
  const [products, setProducts] = useState([]); // State for search results
  const [suggestions, setSuggestions] = useState([]); // State for autocomplete suggestions
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0); // State for active suggestion index

  // Function to handle input changes for autocomplete
  const handleAutocomplete = async (e) => {
    const value = e.target.value.toLowerCase(); // Convert input to lowercase
    setSearchTerm(value); // Update the search term

    // If the input has 3 or more characters, fetch suggestions from Firestore
    if (value.length >= 3) {
      try {
        const productsRef = collection(db, "products");

        // Query to search products based on name starting with the input
        const q = query(
          productsRef,
          where("name", ">=", value), // Starts with input value (in lowercase)
          where("name", "<=", value + "\uf8ff"), // Prefix matching
          limit(10) // Limit the number of suggestions to 10
        );

        const querySnapshot = await getDocs(q);
        const suggestionsList = querySnapshot.docs.map(
          (doc) => doc.data().name
        ); // Map to product names
        setSuggestions(suggestionsList); // Set suggestions to state
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      }
    } else {
      setSuggestions([]); // Clear suggestions if input is less than 3 characters
    }
  };

  // Function to handle search form submission
  const handleSearch = async (e) => {
    e.preventDefault();

    if (!searchTerm) return;

    try {
      const productsRef = collection(db, "products");
      const q = query(
        productsRef,
        where("name", ">=", searchTerm),
        where("name", "<=", searchTerm + "\uf8ff")
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.log("No products found!");
      }

      const searchResults = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setProducts(searchResults); // Set search results to state
      setSuggestions([]); // Clear suggestions after search
    } catch (error) {
      console.error("Error searching products:", error);
    }
  };

  // Function to handle suggestion selection
  const handleSuggestionSelect = (suggestion) => {
    setSearchTerm(suggestion); // Set the search term to the selected suggestion
    handleSearch({ preventDefault: () => {} }); // Trigger the search
    setSuggestions([]); // Clear suggestions after selection
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      setActiveSuggestionIndex((prevIndex) =>
        Math.min(prevIndex + 1, suggestions.length - 1)
      );
    } else if (e.key === "ArrowUp") {
      setActiveSuggestionIndex((prevIndex) => Math.max(prevIndex - 1, 0));
    } else if (e.key === "Enter") {
      handleSuggestionSelect(suggestions[activeSuggestionIndex]);
    }
  };

  return (
    <div className="border-b border-gray-200 py-6 bg-gradient-to-r from-blue-200 to-purple-300">
      <div className="container sm:flex justify-evenly items-center">
        <div className="font-bold text-4xl text-center pr-3 pb-2 sm:pb-0 text-blackish">
          <img
            src="/logo1.png"
            alt="Logo"
            className="center rounded-full pl-2"
            style={{ width: "150px", height: "150px" }}
          />
        </div>

        <div className="w-full sm:w-[300px] md:w-[70%] pl-2 pr-4 relative">
          <form onSubmit={handleSearch}>
            <input
              className="border-gray-200 border p-2 px-4 pr-4 rounded-lg w-full focus:ring-2 focus:ring-purple-500 transition-all"
              type="text"
              placeholder="Enter any product name..."
              value={searchTerm}
              onChange={handleAutocomplete} // Trigger autocomplete when input changes
              onKeyDown={handleKeyDown} // Handle keyboard navigation
            />
            <button type="submit">
              <BsSearch
                className="absolute right-0 top-0 mr-8 mt-3 text-gray-400"
                size={20}
              />
            </button>
          </form>

          {/* Render suggestions if available */}
          {suggestions.length > 0 && (
            <div className="absolute w-full bg-white border mt-2 rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className={`px-4 py-2 cursor-pointer hover:bg-gray-200 ${
                    index === activeSuggestionIndex ? "bg-purple-100" : ""
                  }`}
                  onClick={() => handleSuggestionSelect(suggestion)} // Select suggestion
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Render Search Results */}
      <div className="container py-4">
        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} /> // Use ProductCard here
            ))}
          </div>
        ) : (
          searchTerm && <p>No products found for &quot;{searchTerm}&quot;.</p>
        )}
      </div>
    </div>
  );
};

export default HeaderMain;
