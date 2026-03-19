/**
 * Global variable to store the original dataset after the initial safety filter.
 */
let allCountries = []; 

/**
 * 1. Fetching Data: Retrieves country information from the REST API.
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
 * 2. Initial Filter: Removes specific entries for safety or requirements.
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
        
        // Navigate to details page on click
        card.addEventListener("click", () => {
            window.location.href = `details.html?name=${encodeURIComponent(country.name.common)}`;
        });
        
        container.appendChild(card);
    });
}

/**
 * 4. Continent Filter: Filters displayed countries based on dropdown selection.
 */
function regionfilter() {
    const regionSelect = document.getElementById("region");

    regionSelect.addEventListener("change", (e) => {
        const selectedRegion = e.target.value.trim().toLowerCase();
        
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
 */

function setupDarkMode() {
    const modeBtn = document.getElementById("mode");
    const icon = document.querySelector(".switchmode i");

    // 1. تحقق من الحالة المحفوظة فور تحميل الصفحة
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
        document.body.classList.add("dark-mode");
        updateUI(true); // دالة مساعدة لتحديث شكل الزر
    }

    modeBtn.addEventListener("click", () => {
        const isDarkMode = document.body.classList.toggle("dark-mode");

        // 2. حفظ الحالة الجديدة في localStorage
        localStorage.setItem("theme", isDarkMode ? "dark" : "light");

        updateUI(isDarkMode);
    });

    // دالة داخلية لتحديث النص والأيقونة منعاً للتكرار
    function updateUI(isDarkMode) {
        modeBtn.innerText = isDarkMode ? "Light Mode" : "Dark Mode";
        if (isDarkMode) {
            icon.classList.replace("fa-regular", "fa-solid");
        } else {
            icon.classList.replace("fa-solid", "fa-regular");
        }
    }
}
/**
 * Application Entry Point: Initializes data fetching and event listeners.
 */
async function setupApp() {
    const rawData = await data();
    if (rawData) {
        allCountries = filter1(rawData); 
        creat_cards(allCountries);
        setupSearch();
        regionfilter();
        setupDarkMode();
    }
}

// Start the Application
setupApp();