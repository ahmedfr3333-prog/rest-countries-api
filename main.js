/**
 * Global variable to store the original dataset after the initial safety filter.
 */
let allCountries = []; 

/**
 * 1. Fetching Data: Retrieves country information from the REST API.
 * Uses specific fields to optimize performance.
 * @returns {Promise<Array>} Array of country objects.
 */
async function data() {
    try {
        let response = await fetch('https://restcountries.com/v3.1/all?fields=name,capital,population,flags,continents');
        if (!response.ok) throw new Error("Failed to fetch data");
        return await response.json();
    } catch (error) {
        console.error("Fetch Error:", error);
    }
}

/**
 * 2. Initial Filter: Removes specific entries for safety or project requirements.
 * @param {Array} my_array - The raw data from API.
 */
function filter1(my_array) {
    const bannedList = ["israel"];
    return my_array.filter(country => 
        !bannedList.includes(country.name.common.toLowerCase())
    );
}

/**
 * 3. Render Cards: Dynamically creates and injects HTML cards into the DOM.
 * Includes lazy loading for flags and navigation logic.
 * @param {Array} my_array - Countries to display.
 */
function creat_cards(my_array) {
    const container = document.querySelector(".grid-container");
    container.innerHTML = ""; // Clear existing content

    my_array.forEach(country => {
        const card = document.createElement("div");
        card.classList.add("card_one");
        
        card.innerHTML = `
            <img class="COimg" src="${country.flags.svg}" alt="${country.name.common} flag" loading="lazy"/>
            <p class="COname">${country.name.common}</p>
            <p><span>Population:</span> ${country.population.toLocaleString()}</p>
            <p><span>Region:</span> ${country.continents[0]}</p>
            <p><span>Capital:</span> ${country.capital ? country.capital[0] : "N/A"}</p>
        `;
        
        // Navigate to details page on click using query parameters
        card.addEventListener("click", () => {
            window.location.href = `details.html?name=${encodeURIComponent(country.name.common)}`;
        });
        
        container.appendChild(card);
    });
}

/**
 * 4. Continent Filter: Filters displayed countries based on dropdown selection.
 * Handles the logic for matching continents from the stored array.
 */
function regionfilter() {
    const regionSelect = document.getElementById("region");

    regionSelect.addEventListener("change", (e) => {
        const selectedRegion = e.target.value.trim().toLowerCase();
        
        // Return all countries if no specific region is selected
        const filtered = (selectedRegion === "" || selectedRegion.includes("filter")) 
            ? allCountries 
            : allCountries.filter(country => {
                if (country.continents && country.continents.length > 0) {
                    const countryContinent = country.continents[0].toLowerCase();
                    return countryContinent.includes(selectedRegion) || selectedRegion.includes(countryContinent);
                }
                return false;
            });

        creat_cards(filtered);
    });
}

/**
 * 5. Search Logic: Filters countries based on real-time text input.
 * Performs a case-insensitive search on the country common name.
 */
function setupSearch() {
    const searchInput = document.querySelector('.search');

    searchInput.addEventListener('input', (e) => {
        const searchValue = e.target.value.toLowerCase();
        const filtered = allCountries.filter(country => 
            country.name.common.toLowerCase().includes(searchValue)
        );
        creat_cards(filtered);
    });
}

/**
 * 6. Dark Mode Logic: Toggles between Light and Dark themes.
 * Syncs the theme state across multiple tabs using the storage event.
 */
function setupDarkMode() {
    const modeBtn = document.getElementById("mode");
    const icon = document.querySelector(".switchmode i");

    // Applies styles, text, and icons based on the stored theme value
    function applyTheme() {
        const currentTheme = localStorage.getItem("theme");
        if (currentTheme === "dark") {
            document.body.classList.add("dark-mode");
            if (modeBtn) modeBtn.innerText = "Light Mode";
            if (icon) icon.classList.replace("fa-regular", "fa-solid");
        } else {
            document.body.classList.remove("dark-mode");
            if (modeBtn) modeBtn.innerText = "Dark Mode";
            if (icon) icon.classList.replace("fa-solid", "fa-regular");
        }
    }

    // 1. Initial application of the theme when the page loads
    applyTheme();

    // 2. Toggle theme state on button click and persist in localStorage
    if (modeBtn) {
        modeBtn.addEventListener("click", () => {
            const isDarkMode = document.body.classList.toggle("dark-mode");
            localStorage.setItem("theme", isDarkMode ? "dark" : "light");
            applyTheme(); // Immediate UI update
        });
    }

    // 3. Listener to sync theme changes across other open browser tabs
    window.addEventListener('storage', (e) => {
        if (e.key === 'theme') {
            applyTheme(); 
        }
    });
}

/**
 * Application Entry Point: Initializes data fetching and sets up event listeners.
 */
async function setupApp() {
    const rawData = await data();
    if (rawData) {
        allCountries = filter1(rawData); // Store safety-filtered data globally
        creat_cards(allCountries);       // Initial UI render
        setupSearch();                   // Enable search functionality
        regionfilter();                  // Enable continent filtering
        setupDarkMode();                 // Initialize theme settings
    }
}

// Start the Application execution
setupApp();