# Movie-search-app
Examination: Individual Project: “FilmSamlaren” Brief Description FilmSamlaren is a movie app where users can search for movies, view details about movies, filter movies by genre, and save their favorite movies. All movie data is fetched from the OMDb API, and the app provides a user-friendly and responsive design.

Link to Figma Sketch https://www.figma.com/design/9NXxo86Y0NkjLaipsaYyid/Examination-FilmSamlaren?node-id=9-2&t=O5lGbTEf9W6Igwlf-0

How to Run Locally

Clone this repository:
Open the project in Visual Studio Code.
Start the server with live server:
Right-click on index.html and choose Open with Live Server.
How to Navigate/Use the Application

Search for Movies:

Use the search field to type a movie title and click the search button to display search results.
View Movie Details:

Click on a movie from the search results to view details about the movie, such as genre, director, actors, and a brief summary of the plot.
Filter Movies by Genre:

Choose a genre from the dropdown menu and click the filter button to display movies within the selected genre.
Add to Favorites:

Click the favorite button to add a movie to your favorites list.
View Favorites:

Click on the favorites list to view all the movies you have saved as favorites.
Remove from Favorites:

Click the "Remove from Favorites" button to remove a movie from your favorites list.
Requirements Fulfillment

JSON

The application uses the JSON format to fetch and display movie data from the OMDb API. JSON responses are used to show movies, their details, and other attributes like ratings, actors, and director.

HTTP/HTTPS

The application makes HTTP requests to the OMDb API via HTTPS to fetch movie data. Data is fetched based on search parameters such as movie title and IMDb ID.

Asynchrony

The application uses async/await to handle asynchronous HTTP requests. This allows the user interface to update dynamically without reloading the page, providing a smoother user experience.

UX/UI and WCAG

The user interface is responsive and easy to use. Features like the search field, genre filter, and favorites list make the app intuitive. I have implemented color contrasts and semantic HTML elements to follow WCAG guidelines, ensuring good accessibility for all users.

API Information

API: OMDb API (The Open Movie Database)
API Key: ac5b9b92
API URL/endpoint:
For searching movies: https://www.omdbapi.com/?s=<query>&apikey=<API-Key>
For fetching details of a specific movie: https://www.omdbapi.com/?i=<imdbID>&apikey=<API-Key>
Parameters

s=: The movie title to search for movies.
i=: The IMDb ID to fetch details about a specific movie.