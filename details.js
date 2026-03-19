/**
 * 1. URL Parameter Parsing:
 * Extract the country name from the URL string (e.g., details.html?name=Germany).
 */
const params = new URLSearchParams(window.location.search);
const countryName = params.get("name");

/**
 * 2. Main Data Fetching:
 * Fetches specific country details based on the name parameter.
 */
async function getCountryDetails() {
    try {
        if (!countryName) throw new Error("Country name not found in URL");

        let response = await fetch(`https://restcountries.com/v3.1/name/${countryName}?fullText=true`);
        let data = await response.json();
        let country = data[0]; 
        
        // Render the UI and initialize Dark Mode
        await renderDetails(country);
        setupDarkMode();
    } catch (error) {
        console.error("Error fetching country details:", error);
        document.getElementById("container").innerHTML = `<p class="error-msg">Country details could not be loaded.</p>`;
    }
}      

/**
 * 3. UI Rendering:
 * Injects the country's information into the DOM.
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

    // Handle Border Countries Rendering
    const borderWrapper = document.getElementById("borders-container");
    if (country.borders && country.borders.length > 0) {
        const bordersElement = await fetchBorderCountries(country.borders);
        borderWrapper.appendChild(bordersElement);
    } else {
        borderWrapper.innerHTML = "<span>None</span>";
    }
}

/**
 * 4. Border Countries Logic:
 * Converts border codes (e.g., FRA) into clickable common names.
 */
async function fetchBorderCountries(border_codes) {
    let fragment = document.createDocumentFragment();

    try {
        const codesString = border_codes.join(",");
        let response = await fetch(`https://restcountries.com/v3.1/alpha?codes=${codesString}`);
        let countriesData = await response.json();

        countriesData.forEach(borderInfo => {
            let borderDiv = document.createElement("div");
            borderDiv.classList.add("countrydiv");
            borderDiv.innerHTML = `<p class="country">${borderInfo.name.common}</p>`;
            
            // Navigate to the border country's detail page
            borderDiv.onclick = () => {
                window.location.href = `details.html?name=${encodeURIComponent(borderInfo.name.common)}`;
            };

            fragment.appendChild(borderDiv);
        });
    } catch (error) {
        console.error("Error fetching border names:", error);
    }

    return fragment;
}

/**
 * 5. Theme Toggling:
 * Synchronizes Dark/Light mode within the details page.
 */
function setupDarkMode() {
    const modeBtn = document.getElementById("mode");
    const icon = document.querySelector(".switchmode i");

    modeBtn.addEventListener("click", () => {
        const isDark = document.body.classList.toggle("dark-mode");
        
        modeBtn.innerText = isDark ? "Light Mode" : "Dark Mode";
        if (isDark) {
            icon.classList.replace("fa-regular", "fa-solid");
        } else {
            icon.classList.replace("fa-solid", "fa-regular");
        }
    });
}

/**
 * Helper Functions:
 * Safely extract nested data from the API response.
 */
function getLanguages(country) { 
    return country.languages ? Object.values(country.languages).join(", ") : "N/A"; 
}

function getTopLevelDomain(country) { 
    return country.tld ? country.tld[0] : "N/A"; 
}

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

// Initial execution
getCountryDetails();