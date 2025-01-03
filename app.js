const apiKey = "7dfbc4ab";
const baseUrl = "https://www.omdbapi.com/";
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
const MAX_RESULTS = 10;

const toggleError = (message = '') => {
    elements.errorText.textContent = message;
    elements.errorMessage.classList.toggle("hidden", !message);
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
        toggleError(error.message);
        return null;
    }
};

const fetchMovies = async (query) => {
    if (!query) {
        toggleError("Please enter a movie title.");
        return [];
    }
    const data = await fetchData(`${baseUrl}?apikey=${apiKey}&s=${query}`);
    return data?.Search?.slice(0, MAX_RESULTS) || [];
};

const fetchDefaultMovies = async () => {
    const defaultMovies = ["Holiday", "Avatar", "Inception", "Interstellar", "Titanic"];
    const movieResponses = await Promise.all(defaultMovies.map(fetchMovies));
    return movieResponses.flat().slice(0, MAX_RESULTS);
};

const createMovieCard = (movie) => {
    const movieCard = document.createElement("div");
    movieCard.classList.add("movie-card");
    movieCard.dataset.id = movie.imdbID;
    const favoriteButton = createFavoriteButton(movie);
    movieCard.innerHTML = `
        <img src="${movie.Poster !== "N/A" ? movie.Poster : "placeholder.jpg"}" alt="Poster of ${movie.Title}" />
        <h3>${movie.Title}</h3>
        <p>Year: ${movie.Year}</p>
    `;
    movieCard.appendChild(favoriteButton);
    return movieCard;
};

const createFavoriteButton = (movie) => {
    const isFavorite = getFavoriteMovies().some(favMovie => favMovie.id === movie.imdbID);
    const favoriteButton = document.createElement("button");
    favoriteButton.classList.add("favorite-button");
    favoriteButton.textContent = isFavorite ? "Added" : "Add to Favorites";
    favoriteButton.style.backgroundColor = isFavorite ? "#ff9900" : "#ffcc00";
    favoriteButton.addEventListener("click", (event) => toggleFavorite(event, movie, favoriteButton));
    return favoriteButton;
};

const toggleFavorite = (event, movie, favoriteButton) => {
    event.stopPropagation();
    const isFavorite = getFavoriteMovies().some(favMovie => favMovie.id === movie.imdbID);
    const action = isFavorite ? 'remove' : 'add';
    updateFavoriteMovies(movie.imdbID, movie.Title, movie.Poster, action);
    favoriteButton.textContent = isFavorite ? "Add to Favorites" : "Added";
    favoriteButton.style.backgroundColor = isFavorite ? "#ffcc00" : "#ff9900";
    displayFavoriteMovies();
    updateFavoriteButtons();
};

const fetchMoviesByGenre = async (genre) => {
    const data = await fetchData(`${baseUrl}?apikey=${apiKey}&s=&type=movie`);
    if (data?.Response === "True") {
        const filteredMovies = await Promise.all(data.Search.map(async (movie) => {
            const movieDetails = await fetchData(`${baseUrl}?apikey=${apiKey}&i=${movie.imdbID}`);
            return movieDetails?.Genre.includes(genre) ? movie : null;
        }));
        return filteredMovies.filter(Boolean).slice(0, MAX_RESULTS);
    }
    return [];
};

elements.genreButton.addEventListener("click", async () => {
    const selectedGenre = elements.genreSelect.value;
    if (selectedGenre) {
        const movies = await fetchMoviesByGenre(selectedGenre);
        movies.length ? displayMovies(movies) : toggleError(`No movies found for the genre "${selectedGenre}".`);
    } else {
        toggleError("Please select a genre.");
    }
});

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
    const movieDetailsData = await fetchData(`${baseUrl}?apikey=${apiKey}&i=${imdbID}`);
    if (movieDetailsData) {
        elements.detailsContent.innerHTML = `
            <h2>${movieDetailsData.Title} (${movieDetailsData.Year})</h2>
            <img src="${movieDetailsData.Poster}" alt="${movieDetailsData.Title}" />
            <p><strong>Genre:</strong> ${movieDetailsData.Genre}</p>
            <p><strong>Director:</strong> ${movieDetailsData.Director}</p>
            <p><strong>Actors:</strong> ${movieDetailsData.Actors}</p>
            <p><strong>Plot:</strong> ${movieDetailsData.Plot}</p>
            <p><strong>IMDB Rating:</strong> ${movieDetailsData.imdbRating}</p>
        `;
        elements.movieDetails.classList.remove("hidden");
    }
};

elements.closeDetailsButton.addEventListener("click", () => elements.movieDetails.classList.add("hidden"));

elements.searchButton.addEventListener("click", async () => {
    const movieTitle = elements.movieInput.value.trim();
    movieTitle ? displayMovies(await fetchMovies(movieTitle)) : toggleError("Please enter a movie title.");
});

const favoriteStorage = {
    get: () => JSON.parse(localStorage.getItem("favoriteMovies") || "[]"),
    save: (movies) => localStorage.setItem("favoriteMovies", JSON.stringify(movies))
};

const getFavoriteMovies = () => favoriteStorage.get();

const saveFavoriteMovies = (movies) => favoriteStorage.save(movies);

const displayFavoriteMovies = () => {
    const favoriteMovies = getFavoriteMovies();
    elements.favoritesList.innerHTML = favoriteMovies.length ? '' : "<p class='favorites-empty'>No favorite movies found. Start adding some!</p>";
    favoriteMovies.forEach(movie => {
        const favoriteCard = document.createElement("div");
        favoriteCard.classList.add("movie-card");
        favoriteCard.innerHTML = `
            <img src="${movie.poster !== "N/A" ? movie.poster : "placeholder.jpg"}" alt="${movie.title}" />
            <h3>${movie.title}</h3>
            <button class="remove-favorite-button" data-id="${movie.id}">Remove from Favorites</button>
        `;
        favoriteCard.querySelector(".remove-favorite-button").addEventListener("click", () => {
            removeFromFavorite(movie.id);
            displayFavoriteMovies();
            updateFavoriteButtons();
        });
        elements.favoritesList.appendChild(favoriteCard);
    });
};

const saveAsFavorite = (id, title, poster) => updateFavoriteMovies(id, title, poster, 'add');
const removeFromFavorite = (id) => updateFavoriteMovies(id, null, null, 'remove');

const updateFavoriteMovies = (id, title, poster, action) => {
    const favoriteMovies = getFavoriteMovies();
    const movieIndex = favoriteMovies.findIndex(movie => movie.id === id);
    if (action === 'add' && movieIndex === -1) favoriteMovies.push({ id, title, poster });
    else if (action === 'remove' && movieIndex !== -1) favoriteMovies.splice(movieIndex, 1);
    saveFavoriteMovies(favoriteMovies);
};

const updateFavoriteButtons = () => {
    document.querySelectorAll(".movie-card").forEach(card => {
        const movieId = card.dataset.id;
        const favoriteButton = card.querySelector(".favorite-button");
        const isFavorite = getFavoriteMovies().some(favMovie => favMovie.id === movieId);
        favoriteButton.textContent = isFavorite ? "Added" : "Add to Favorites";
        favoriteButton.style.backgroundColor = isFavorite ? "#ff9900" : "#ffcc00";
    });
};

const init = async () => {
    const defaultMovies = await fetchDefaultMovies();
    displayMovies(defaultMovies);
    displayFavoriteMovies();
};

init();
