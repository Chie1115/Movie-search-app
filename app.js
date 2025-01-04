const apiKey = "7dfbc4ab";
const baseUrl = "https://www.omdbapi.com/";
const MAX_RESULTS = 10;

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

const cache = new Map();

// Utility Functions
const toggleError = (message = '') => {
    elements.errorMessage.classList.toggle("hidden", !message);
    elements.errorText.textContent = message;
};

const fetchData = async (url) => {
    if (cache.has(url)) return cache.get(url);
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (!response.ok || data.Response === "False") throw new Error(data.Error || "No data found");
        cache.set(url, data);
        return data;
    } catch (error) {
        toggleError(`${error.message}. Please try again.`);
        return null;
    }
};

// Fetch Functions
const fetchMovies = async (query) => {
    if (!query) {
        toggleError("Please enter a movie title.");
        return [];
    }
    const data = await fetchData(`${baseUrl}?apikey=${apiKey}&s=${query}`);
    return data?.Search?.slice(0, MAX_RESULTS) || [];
};

const fetchDefaultMovies = async () => {
    const defaultMovies = ["Avatar", "Inception", "Interstellar", "Titanic", "The Dark Knight", "Gladiator", "The Matrix", "The Godfather", "Pulp Fiction", "The Holiday"];
    const moviePromises = defaultMovies.map(movie => fetchData(`${baseUrl}?apikey=${apiKey}&t=${movie}`));
    const movieResults = await Promise.all(moviePromises);
    return movieResults.filter(movie => movie && movie.Response !== "False").slice(0, MAX_RESULTS);
};

const fetchMoviesByGenre = async (genre) => {
    const data = await fetchData(`${baseUrl}?apikey=${apiKey}&s=${genre}`);
    return data?.Response === "True" ? data.Search.slice(0, MAX_RESULTS) : [];
};

// DOM Manipulation
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

    movieCard.innerHTML = `
        <img src="${movie.Poster !== "N/A" ? movie.Poster : "placeholder.jpg"}" alt="Poster of ${movie.Title}" />
        <h3>${movie.Title}</h3>
        <p>Year: ${movie.Year}</p>
    `;
    movieCard.appendChild(favoriteButton);
    return movieCard;
};

const displayMovies = (movies) => {
    toggleError();
    elements.resultsContainer.innerHTML = '';
    movies.forEach(movie => {
        const movieCard = createMovieCard(movie);
        movieCard.addEventListener("click", () => showMovieDetails(movie.imdbID));
        elements.resultsContainer.appendChild(movieCard);
    });
};

const showMovieDetails = async (imdbID) => {
    const movieDetails = await fetchData(`${baseUrl}?apikey=${apiKey}&i=${imdbID}`);
    if (movieDetails) {
        elements.detailsContent.innerHTML = `
            <h2>${movieDetails.Title} (${movieDetails.Year})</h2>
            <img src="${movieDetails.Poster}" alt="${movieDetails.Title}" />
            <p><strong>Genre:</strong> ${movieDetails.Genre}</p>
            <p><strong>Director:</strong> ${movieDetails.Director}</p>
            <p><strong>Actors:</strong> ${movieDetails.Actors}</p>
            <p><strong>Plot:</strong> ${movieDetails.Plot}</p>
            <p><strong>IMDB Rating:</strong> ${movieDetails.imdbRating}</p>
        `;
        elements.movieDetails.classList.remove("hidden");
    }
};

// Favorite Management
const favoriteStorage = {
    get: () => JSON.parse(localStorage.getItem("favoriteMovies") || "[]"),
    save: (movies) => localStorage.setItem("favoriteMovies", JSON.stringify(movies))
};

const getFavoriteMovies = () => favoriteStorage.get();

const saveFavoriteMovies = (movies) => favoriteStorage.save(movies);

const displayFavoriteMovies = () => {
    const favorites = getFavoriteMovies();
    elements.favoritesList.innerHTML = favorites.length ? '' : "<p class='favorites-empty'>No favorite movies found. Start adding some!</p>";
    favorites.forEach(movie => {
        const card = document.createElement("div");
        card.classList.add("movie-card");
        card.innerHTML = `
            <img src="${movie.poster}" alt="${movie.title}" />
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

const toggleFavorite = (event, movie, favoriteButton) => {
    event.stopPropagation();
    const isFavorite = getFavoriteMovies().some(fav => fav.id === movie.imdbID);
    const action = isFavorite ? 'remove' : 'add';
    updateFavoriteMovies(movie.imdbID, movie.Title, movie.Poster, action);
    favoriteButton.textContent = isFavorite ? "Add to Favorites" : "Added";
    favoriteButton.style.backgroundColor = isFavorite ? "#ffcc00" : "#ff9900";
    displayFavoriteMovies();
};

const updateFavoriteMovies = (id, title, poster, action) => {
    const favorites = getFavoriteMovies();
    const index = favorites.findIndex(movie => movie.id === id);
    if (action === 'add' && index === -1) {
        favorites.push({ id, title, poster });
    }
    if (action === 'remove' && index !== -1) {
        favorites.splice(index, 1);
        // 対応するボタンの状態を更新
        const favoriteButton = document.querySelector(`.movie-card[data-id="${id}"] .favorite-button`);
        if (favoriteButton) {
            favoriteButton.textContent = "Add to Favorites";
            favoriteButton.style.backgroundColor = "#ffcc00";
        }
    }
    saveFavoriteMovies(favorites);
};

// Event Listeners
elements.searchButton.addEventListener("click", async () => {
    const query = elements.movieInput.value.trim();
    query ? displayMovies(await fetchMovies(query)) : toggleError("Please enter a movie title.");
});

elements.genreButton.addEventListener("click", async () => {
    const genre = elements.genreSelect.value;
    genre ? displayMovies(await fetchMoviesByGenre(genre)) : toggleError("Please select a genre.");
});

elements.closeDetailsButton.addEventListener("click", () => {
    elements.movieDetails.classList.add("hidden");
});

// Initialization
const init = async () => {
    const defaultMovies = await fetchDefaultMovies();
    displayMovies(defaultMovies);
    displayFavoriteMovies();
};

init();
