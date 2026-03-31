/**
 * Handles the theme switching logic (Light/Dark mode)
 * and persists the choice in localStorage.
 */
function handleTheme() {
    const body = document.body;
    const modeBtn = document.getElementById("mode");
    const icon = document.querySelector(".switchmode i");

    // Updates the visual elements (classes, text, and icons) based on the theme
    function updateUI(isDark) {
        if (isDark) {
            body.classList.add("dark-mode");
            if (modeBtn) modeBtn.innerText = "Light Mode";
            if (icon) icon.classList.replace("fa-regular", "fa-solid");
        } else {
            body.classList.remove("dark-mode");
            if (modeBtn) modeBtn.innerText = "Dark Mode";
            if (icon) icon.classList.replace("fa-solid", "fa-regular");
        }
    }

    // Initialize the theme based on stored preferences in the browser
    const isDarkStored = localStorage.getItem("theme") === "dark";
    updateUI(isDarkStored);

    // Event listener for the toggle button to switch modes manually
    if (modeBtn) {
        modeBtn.addEventListener("click", () => {
            const currentlyDark = body.classList.toggle("dark-mode");
            localStorage.setItem("theme", currentlyDark ? "dark" : "light");
            updateUI(currentlyDark);
        });
    }

    // Synchronize theme changes across different browser tabs/windows
    window.addEventListener('storage', (e) => {
        if (e.key === 'theme') {
            updateUI(e.newValue === "dark");
        }
    });
}

// Execute theme handler
handleTheme();

// Extract the country name from the URL query parameters
const params = new URLSearchParams(window.location.search);
const countryName = params.get("name");

/**
 * Fetches specific country data from the REST Countries API
 * based on the name provided in the URL.
 */
async function getCountryDetails() {
    try {
        if (!countryName) throw new Error("Country name not found");

        let response = await fetch(`https://restcountries.com/v3.1/name/${countryName}?fullText=true`);
        let data = await response.json();
        let country = data[0]; 
        
        // Pass the fetched data to the rendering function
        renderDetails(country);
    } catch (error) {
        console.error("Error:", error);
        document.getElementById("container").innerHTML = `<p>Error loading data.</p>`;
    }
}

/**
 * Injects the country's information and flag into the HTML container.
 */
async function renderDetails(country) {
    const container = document.getElementById("container");
    
    container.innerHTML = `
        <div class="details-card">
            <img class="COimg" src="${country.flags.svg}" alt="${country.name.common} flag"/>
            <div class="info-wrapper"> 
                <h1 class="name">${country.name.common}</h1>
                <div class="stats-grid"> 
                    <div class="col-1">
                        <p><span class="COname">Native Name:</span> ${getNativeName(country)}</p>
                        <p><span class="COname">Population:</span> ${country.population.toLocaleString()}</p>
                        <p><span class="COname">Region:</span> ${country.region}</p>
                        <p><span class="COname">Sub Region:</span> ${country.subregion || 'N/A'}</p>
                        <p><span class="COname">Capital:</span> ${country.capital ? country.capital[0] : "N/A"}</p>
                    </div>
                    <div class="col-2">
                        <p><span class="COname">Top Level Domain: </span>${getTopLevelDomain(country)}</p>
                        <p><span class="COname">Currencies:</span> ${getCurrency(country)}</p>
                        <p><span class="COname">Languages:</span> ${getLanguages(country)}</p>
                    </div>
                </div>
                <div class="border-section">
                    <p class="COname">Border Countries:</p>
                    <div id="borders-container"></div>
                </div>
            </div>
        </div>
    `;

    // Handle fetching and displaying bordering countries tags
    const borderWrapper = document.getElementById("borders-container");
    if (country.borders && country.borders.length > 0) {
        const bordersElement = await fetchBorderCountries(country.borders);
        borderWrapper.appendChild(bordersElement);
    } else {
        borderWrapper.innerHTML = "<span>None</span>";
    }
}

/**
 * Fetches names of bordering countries using their alpha codes
 * and creates clickable elements for navigation.
 */
async function fetchBorderCountries(border_codes) {
    let fragment = document.createDocumentFragment();
    const codesString = border_codes.join(",");
    let response = await fetch(`https://restcountries.com/v3.1/alpha?codes=${codesString}`);
    let countriesData = await response.json();

    countriesData.forEach(borderInfo => {
        let borderDiv = document.createElement("div");
        borderDiv.classList.add("countrydiv");
        borderDiv.innerHTML = `<p class="country">${borderInfo.name.common}</p>`;
        // Navigate to the details page of the clicked border country
        borderDiv.onclick = () => {
            window.location.href = `details.html?name=${encodeURIComponent(borderInfo.name.common)}`;
        };
        fragment.appendChild(borderDiv);
    });
    return fragment;
}

// Helper functions to parse nested or complex API data into readable strings
function getLanguages(country) { return country.languages ? Object.values(country.languages).join(", ") : "N/A"; }
function getTopLevelDomain(country) { return country.tld ? country.tld[0] : "N/A"; }
function getCurrency(country) {
    if (!country.currencies) return "N/A";
    let key = Object.keys(country.currencies)[0];
    return country.currencies[key].name;
}
function getNativeName(country) {
    if (!country.name.nativeName) return country.name.common;
    let key = Object.keys(country.name.nativeName)[0];
    return country.name.nativeName[key].common;
}

// Initiate the data fetching process on page load
getCountryDetails();