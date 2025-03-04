document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById("searchInput");
    const searchIcon = document.getElementById("searchIcon");
    const clearIcon = document.getElementById("clearIcon");
    const loading = document.getElementById("loading");
    const resultsContainer = document.getElementById("results");
    const detailsContainer = document.getElementById("artist-details");
    const noResultsMessage = document.getElementById("noResults");

    let selectedCard = null; 

    loading.style.display = "none";
    noResultsMessage.style.display = "none";

    function performSearch() {
        const query = searchInput.value.trim();
        if (!query) return;  
    
       
        detailsContainer.innerHTML = "";  
        loading.style.display = "block";  
    
        fetch(`/search?q=${encodeURIComponent(query)}`)
            .then(response => response.json())
            .then(data => {
                loading.style.display = "none";  
                resultsContainer.innerHTML = "";  
                displayResults(data); 
            })
            .catch(error => {
                loading.style.display = "none"; 
                console.error("Error fetching search results:", error);
                resultsContainer.innerHTML = "<p>No results found.</p>";
            });
    }
    

    
    searchIcon.addEventListener("click", performSearch);
    searchInput.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            performSearch();
        }
    });

    
    clearIcon.addEventListener("click", function () {
        searchInput.value = "";
        resultsContainer.innerHTML = "";
        detailsContainer.innerHTML = "";  
        noResultsMessage.style.display = "none";
    });

    function displayResults(data) {
        resultsContainer.innerHTML = "";  

        if (data.length === 0) {
            noResultsMessage.style.display = "block";
            return;
        } else {
            noResultsMessage.style.display = "none";
        }

        const container = document.createElement("div");
        container.classList.add("card-container");

        data.forEach(artist => {
            const card = document.createElement("div");
            card.classList.add("artist-card");
            card.dataset.artistId = artist.id;

            const img = document.createElement("img");
            img.src = artist.image.includes("missing_image.png") ? "/static/images/artsy_logo.svg" : artist.image;
            img.alt = artist.name;
            img.classList.add("artist-image");

            const name = document.createElement("p");
            name.textContent = artist.name;
            name.classList.add("artist-name");

            card.appendChild(img);
            card.appendChild(name);
            container.appendChild(card);

           
            card.addEventListener("click", function () {
                if (selectedCard) {
                    selectedCard.classList.remove("selected");  
                }
                selectedCard = card;
                selectedCard.classList.add("selected");

                fetchArtistDetails(artist.id);
            });
        });

        resultsContainer.appendChild(container);
    }

    function fetchArtistDetails(artistId) {
       
        detailsContainer.innerHTML = "";
        loading.style.display = "block";

        fetch(`/artist/${artistId}`)
            .then(response => response.json())
            .then(data => {
                loading.style.display = "none"; 
                displayArtistDetails(data);
            })
            .catch(error => {
                loading.style.display = "none"; 
                console.error("Error fetching artist details:", error);
                detailsContainer.innerHTML = "<p>Could not load artist details.</p>";
            });
    }

    function displayArtistDetails(data) {
        detailsContainer.innerHTML = "";

        if (!data) {
            detailsContainer.style.display = "none";
            return;
        }

        const name = data.name || "Unknown Artist";
        const birthYear = data.birthday ? data.birthday : "";
        const deathYear = data.deathday ? data.deathday : "";

        let dateInfo = "";
        if (birthYear && deathYear) {
            dateInfo = ` (${birthYear} - ${deathYear})`;  
        } else if (birthYear) {
            dateInfo = ` (${birthYear} - )`;  
        } else if (deathYear) {
            dateInfo = ` ( - ${deathYear})`;  
        } else {
            dateInfo = " (-)";  
        }

        const nationality = data.nationality ? `<p id="artist-nationality">${data.nationality}</p>` : "";
        const biography = data.biography ? `<p id="artist-biography">${data.biography}</p>` : "";

        detailsContainer.innerHTML = `
            <div class="artist-name">
                <h2 id="artist-name">${name}${dateInfo}</h2>
            </div>
            <div class="artist-nationality">
                ${nationality}
            </div>
            <div id="artist-biography-container">
                ${biography}
            </div>
        `;

        detailsContainer.style.display = "block";
    }
});







    










        













