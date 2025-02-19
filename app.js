// API Key and Base URL for OMDB API
const apiKey = "ac5b9b92";
const baseUrl = "https://www.omdbapi.com/";
const MAX_RESULTS = 10;

// DOM elements for interaction and display
const elements = {
    errorMessage: document.getElementById("error-message"),
    errorText: document.getElementById("error-text"),
    resultsContainer: document.getElementById("results-container"),
    genreSelect: document.getElementById("genre-select"),
    genreButton: document.getElementById("genre-button"),
    searchButton: document.getElementById("search-button"),
    movieInput: document.getElementById("movie-input"),
    detailsContent: document.getElementById("details-content"),
    movieDetails: document.getElementById("movie-details"),
    closeDetailsButton: document.getElementById("close-details"),
    favoritesList: document.getElementById("favorites-list")
};

// Cache to store fetched data and reduce API requests
const cache = new Map();

// Toggles the visibility of error messages
const toggleError = (message = '') => {
    elements.errorMessage.classList.toggle("hidden", !message);
    elements.errorText.textContent = message;
};

// Fetches data from the API with caching and error handling
const fetchData = async (url) => {
    if (cache.has(url)) return cache.get(url); // Return cached data if available
    try {
        const response = await fetch(url);
        
        // Handle HTTP status errors
        if (!response.ok) {
            switch (response.status) {
                case 404:
                    throw new Error("404: Movie not found");
                case 401:
                    throw new Error("401: API key error");
                case 500:
                    throw new Error("500: Internal server error");
                case 429:
                    throw new Error("429: Too many requests, please try again later");
                default:
                    throw new Error(`Unexpected error: ${response.status} ${response.statusText}`);
            }
        }
        
        const data = await response.json();

        if (data.Response === "False") throw new Error(data.Error || "No data found");
        cache.set(url, data);
        return data;
    } catch (error) {
        toggleError(`${error.message}. Please try again.`);
        return null;
    }
};

// Fetches movies by search query
const fetchMovies = async (query) => {
    if (!query) {
        toggleError("Please enter a movie title.");
        return [];
    }
    const data = await fetchData(`${baseUrl}?apikey=${apiKey}&s=${query}`);
    return data?.Search?.slice(0, MAX_RESULTS) || [];
};

// Fetches a default list of movies
const fetchDefaultMovies = async () => {
    const defaultMovies = ["Avatar", "Inception", "Interstellar", "Titanic", "The Dark Knight", "Gladiator", "The Matrix", "The Godfather", "Pulp Fiction", "The Holiday"];
    const moviePromises = defaultMovies.map(movie => fetchData(`${baseUrl}?apikey=${apiKey}&t=${movie}`));
    const movieResults = await Promise.all(moviePromises);
    return movieResults.filter(movie => movie && movie.Response !== "False").slice(0, MAX_RESULTS);
};

// Fetches movies by genre
const fetchMoviesByGenre = async (genre) => {
    const data = await fetchData(`${baseUrl}?apikey=${apiKey}&s=${genre}`);
    return data?.Response === "True" ? data.Search.slice(0, MAX_RESULTS) : [];
};

// Creates a movie card element
const createMovieCard = (movie) => {
    const movieCard = document.createElement("div");
    movieCard.classList.add("movie-card");
    movieCard.dataset.id = movie.imdbID;

    const favoriteButton = document.createElement("button");
    const isFavorite = getFavoriteMovies().some(fav => fav.id === movie.imdbID);
    favoriteButton.classList.add("favorite-button");
    favoriteButton.textContent = isFavorite ? "Added" : "Add to Favorites";
    favoriteButton.style.backgroundColor = isFavorite ? "#ff9900" : "#ffcc00";
    favoriteButton.addEventListener("click", (e) => toggleFavorite(e, movie, favoriteButton));

    // Set movie card content
    movieCard.innerHTML = `
        <img src="${movie.Poster !== "N/A" ? movie.Poster : "placeholder.jpg"}" alt="Poster of ${movie.Title}" />
        <h3>${movie.Title}</h3>
        <p>Year: ${movie.Year}</p>
    `;
    movieCard.appendChild(favoriteButton);
    return movieCard;
};

// Displays movies in the results container
const displayMovies = (movies) => {
    toggleError(); 
    elements.resultsContainer.innerHTML = '';
    if (movies.length === 0) {
        toggleError("No movies found. Please try a different search.");
    } else {
        movies.forEach(movie => {
            const movieCard = createMovieCard(movie);
            movieCard.addEventListener("click", () => showMovieDetails(movie.imdbID));
            elements.resultsContainer.appendChild(movieCard);
        });
    }
};

// Fetches and displays movie details
const showMovieDetails = async (imdbID) => {
    const movieDetails = await fetchData(`${baseUrl}?apikey=${apiKey}&i=${imdbID}`);
    if (movieDetails) {
        elements.detailsContent.innerHTML = `
            <h2>${movieDetails.Title} (${movieDetails.Year})</h2>
            <img src="${movieDetails.Poster}" alt="Poster of ${movieDetails.Title}" />
            <p><strong>Genre:</strong> ${movieDetails.Genre}</p>
            <p><strong>Director:</strong> ${movieDetails.Director}</p>
            <p><strong>Actors:</strong> ${movieDetails.Actors}</p>
            <p><strong>Plot:</strong> ${movieDetails.Plot}</p>
            <p><strong>IMDB Rating:</strong> ${movieDetails.imdbRating}</p>
        `;
        elements.movieDetails.classList.remove("hidden");
    }
};

// LocalStorage-based favorite management
const favoriteStorage = {
    get: () => JSON.parse(localStorage.getItem("favoriteMovies") || "[]"),
    save: (movies) => localStorage.setItem("favoriteMovies", JSON.stringify(movies))
};

// Retrieves favorite movies from local storage
const getFavoriteMovies = () => favoriteStorage.get();

// Saves favorite movies to local storage
const saveFavoriteMovies = (movies) => favoriteStorage.save(movies);

// Displays the favorite movies list
const displayFavoriteMovies = () => {
    const favorites = getFavoriteMovies();
    elements.favoritesList.innerHTML = favorites.length ? '' : "<p class='favorites-empty'>No favorite movies found. Start adding some!</p>";
    favorites.forEach(movie => {
        const card = document.createElement("div");
        card.classList.add("movie-card");
        card.innerHTML = `
            <img src="${movie.poster}" alt="Poster of ${movie.title}" />
            <h3>${movie.title}</h3>
            <button class="remove-favorite-button" data-id="${movie.id}">Remove from Favorites</button>
        `;
        card.querySelector(".remove-favorite-button").addEventListener("click", () => {
            updateFavoriteMovies(movie.id, null, null, 'remove');
            displayFavoriteMovies();
        });
        elements.favoritesList.appendChild(card);
    });
};

// Adds or removes a movie from favorites
const toggleFavorite = (event, movie, favoriteButton) => {
    event.stopPropagation();
    const isFavorite = getFavoriteMovies().some(fav => fav.id === movie.imdbID);
    const action = isFavorite ? 'remove' : 'add';
    updateFavoriteMovies(movie.imdbID, movie.Title, movie.Poster, action);
    favoriteButton.textContent = isFavorite ? "Add to Favorites" : "Added";
    favoriteButton.style.backgroundColor = isFavorite ? "#ffcc00" : "#ff9900";
    // Update aria-label for accessibility
    favoriteButton.setAttribute("aria-label", isFavorite ? "Add to favorites" : "Remove from favorites");
    displayFavoriteMovies();
};

// Updates the favorite movies list in local storage
const updateFavoriteMovies = (id, title, poster, action) => {
    const favorites = getFavoriteMovies();
    const index = favorites.findIndex(movie => movie.id === id);
    if (action === 'add' && index === -1) {
        favorites.push({ id, title, poster });
    }
    if (action === 'remove' && index !== -1) {
        favorites.splice(index, 1);
        const favoriteButton = document.querySelector(`.movie-card[data-id="${id}"] .favorite-button`);
        if (favoriteButton) {
            favoriteButton.textContent = "Add to Favorites";
            favoriteButton.style.backgroundColor = "#ffcc00";
        }
    }
    saveFavoriteMovies(favorites);
};

// Event Listeners for buttons
elements.searchButton.addEventListener("click", async () => {
    const query = elements.movieInput.value.trim();
    query ? displayMovies(await fetchMovies(query)) : toggleError("Please enter a movie title.");
});


elements.genreSelect.addEventListener("change", async () => {
    const genre = elements.genreSelect.value;
    genre ? displayMovies(await fetchMoviesByGenre(genre)) : toggleError("Please select a genre.");
})

elements.closeDetailsButton.addEventListener("click", () => {
    elements.movieDetails.classList.add("hidden");
});

// Initial setup of the application
const init = async () => {
    const defaultMovies = await fetchDefaultMovies();
    displayMovies(defaultMovies);
    displayFavoriteMovies();
};

init(); // Start the application
