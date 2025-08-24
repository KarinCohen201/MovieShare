const API_KEY_OMDb = "13a68afd";
const BASE_URL = "https://www.omdbapi.com/";


class Movie {
    constructor(id, title, year, genre, director, plot, imdbid, poster, actors, rating) {
        this.id = id;         
        this.title = title;   
        this.year = year;       
        this.genre = genre || ""; 
        this.director = director || ""; 
        this.plot = plot || ""; 
        this.imdbid = imdbid;   
        this.poster = poster; 
        this.actors = actors;
        this.rating = rating;
        this.links = [];       
    }

    addLink(name, url, description) {
        this.links.push({ name, url, description });
    }
    
    removeLink(name) {
        this.links = this.links.filter(link => link.name !== name);
    }
}


class MovieAPI {
    static async fetchMovies(query) {
        const response = await fetch(`${BASE_URL}?apikey=${API_KEY_OMDb}&s=${query}`);
        const data = await response.json();
        if (data.Response === "True") {
            let moviesListFound = data.Search;
            return moviesListFound.map(movie => new Movie(
                movie.imdbID,    
                movie.Title,     
                movie.Year,       
                "",              
                "",               
                "",             
                movie.imdbID,     
                movie.Poster,      
                movie.Actors,
                movie.imdbRating
            ));
        }
        return []; 
    }

    // Fetches detailed information about a movie by its IMDb ID and returns a Movie object or null if not found
    static async fetchMoviesDetails(imdbid) {
        try {
            const response = await fetch(`${BASE_URL}?apikey=${API_KEY_OMDb}&i=${imdbid}`);
            const data = await response.json();

            if (data.Response === "True") {
                return new Movie(
                    data.imdbID,    
                    data.Title,      
                    data.Year,       
                    data.Genre,      
                    data.Director,   
                    data.Plot,      
                    data.imdbID,     
                    data.Poster,     
                    data.Actors,
                    data.imdbRating
                );
            } else {
                return;
            }
        } catch (error) {
            return;
        }
    }


    static RenderMoviesCard(movies, container) {
        movies.forEach(movie => {
            const card = `
            <div class="col-md-3 mb-4">
              <div class="card" style="width: 18rem;">
                <img src="${movie.poster}" class="card-img-top" alt="${movie.title}">
                <div class="card-body">
                  <h5 class="card-title">${movie.title}</h5>
                  <p class="card-text">${movie.year}</p>
                  <button onclick="handleMovieDetails('${movie.imdbid}')" class="btn btn-primary">Details</button>
                </div>
              </div>
            </div>
          `;

            container.insertAdjacentHTML('beforeend', card);
        });
    }

}


function handleMovieDetails(imdbid) {
    const storedQuery = sessionStorage.getItem("searchQuery"); 
    const url = storedQuery
        ? `/details?imdbid=${imdbid}&query=${encodeURIComponent(storedQuery)}`
        : `/details?imdbid=${imdbid}`;
    window.location.href = url;
}


