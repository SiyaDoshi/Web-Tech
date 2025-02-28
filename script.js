document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById("searchInput");
    const searchIcon = document.getElementById("searchIcon");
    const clearIcon = document.getElementById("clearIcon");
    const loading = document.getElementById("loading");

    // Hide loading GIF initially
    loading.style.display = "none";

    function performSearch() {
        if (!searchInput.checkValidity()) {
            searchInput.reportValidity();
            return;
        }

        const query = searchInput.value.trim();
        console.log(`Searching for: ${query}`);  // Debugging log

        loading.style.display = "block";

        fetch(`/search?q=${encodeURIComponent(query)}`)
            .then(response => response.json())
            .then(() => {
                loading.style.display = "none";
            })
            .catch(error => {
                loading.style.display = "none";
                console.error("Error fetching search results:", error);
            });
    }

    // Search on clicking search icon
    searchIcon.addEventListener("click", performSearch);

    // Search on pressing Enter
    searchInput.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            performSearch();
        }
    });

    // Clear input field when clicking the clear icon
    clearIcon.addEventListener("click", function () {
        searchInput.value = "";
    });
});


