# Movie-search-app
Examination: Individuellt Projekt: “FilmSamlaren”

README.md:
Kortfattad beskrivning av projektet och hur man kör igång det lokalt.

Länk till din Figma-skiss:
 https://www.figma.com/design/9NXxo86Y0NkjLaipsaYyid/Examination-FilmSamlaren?node-id=0-1&p=f&t=9Bo4P2lZK6Ekal18-0

Kortfattad förklaring av hur du uppfyllt JSON-, HTTP/HTTPS-, asynkronitets- och UX/UI-kraven.

JSON: Applikationen använder JSON-formatet för att hämta och visa filmdata från OMDb API.

HTTP/HTTPS: Applikationen gör HTTP-förfrågningar till OMDb API via HTTPS.

Asynkronitet: Applikationen använder async/await för att hantera asynkrona HTTP-förfrågningar och uppdatera användargränssnittet dynamiskt utan att ladda om sidan.

UX/UI: Användargränssnittet är responsivt och lättanvänt med funktioner som sökfält, genrefilter och en favoritlista. 
Jag har följt UX/UI-principer för att säkerställa en enkel och intuitiv användarupplevelse.


Beskriv hur du hämtar data från API:et (Vilket API? URL/enpoint, parametrar, API nyckel?).
Hämtning av data från API:et
API: OMDb API (The Open Movie Database)
API URL/enpoint: https://www.omdbapi.com/

Parametrar:
apikey=<API_KEY>: Din API-nyckel.
s=<query>: Filmnamnet för att söka efter filmer.
i=<imdbID>: IMDb ID för att hämta detaljer om en specifik film.
API-nyckel: Jag använder en API-nyckel som jag fått från OMDb API. Nyckeln bör hållas hemlig och kan sättas i en miljöfil eller direkt i koden.


Hur man navigerar/använder applikationen.
1.Sök efter filmer: Använd sökfältet för att skriva in ett filmtitel och tryck på sökknappen för att visa sökresultat.

2.Visa filmens detaljer: Klicka på en film från sökresultaten för att visa detaljer om filmen, såsom genre, regissör, skådespelare och en sammanfattning av handlingen.

3.Filtrera filmer efter genre: Välj en genre från rullgardinsmenyn och klicka på filterknappen för att visa filmer inom den valda genren.

4.Lägg till i favoriter: Klicka på favoritknappen för att lägga till en film till favoritlistan.

5.Visa favoriter: Klicka på favoritlistan för att visa alla filmer som du har sparat som favoriter.

6.Ta bort från favoriter: Klicka på "Ta bort från favoriter"-knappen för att ta bort en film från favoritlistan.


