const watchlistInput = document.getElementById("watchlist");
const randomizeBtn = document.getElementById("randomize");
const chosenMovieHtml = document.querySelector('.chosen-movie');
const file = watchlistInput.files[0];
const movies = document.querySelector(".movies");
const apiKey = "352cf3b3";
const url = `http://www.omdbapi.com?apikey=${apiKey}`;
const errorLbl = document.querySelector('.error-lbl');
let watchlistJson;

errorLbl.textContent = "";

randomizeBtn.addEventListener("click", () => {
  randomizeWatchlist()
});

const fetchMovieData = async (movieName) => {
  try { 
    const res = await fetch(`${url}&t=${movieName}`);
    const movie = await res.json();
    return movie;
  } catch (error) {
    console.error(error);
  }

  return;
};

watchlistInput.addEventListener("change", function (event) {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = function (e) {
    const csvContent = e.target.result;
    const jsonResult = csvToJson(csvContent);
    if (jsonResult) {
      handleJsonResult(jsonResult);
    }
  };

  reader.readAsText(file);
});

async function handleJsonResult(jsonResult) {
  watchlistJson = jsonResult;
  for (const m of jsonResult) {
    let movie = await fetchMovieData(m.name);
    let title = m.name;
    let letterboxdLink = m.letterboxduri;
    let poster;
    let year;

    if (movie.Poster) {
      poster = movie.Poster;
    } else {
      poster = "https://eapp.org/wp-content/uploads/2018/05/poster_placeholder.jpg";
    }

    if (movie.Year) {
      year = movie.Year;
    } else {
      year = "-";
    }

    const query = `
    <div class="movie-container">
      <a href=${letterboxdLink}>
        <img src="${poster}" alt="POSTER" class="movie-poster">
      </a>

      <a href=${letterboxdLink} class="movie-title">
        ${
          title
        } <span class="movie-year">(${year})</span>
      </a>
    </div>`;

    movies.innerHTML += query;
  }
}

async function randomizeWatchlist() {
  let chosenMovie;
  let movie;
  if (watchlistJson) {
    const max = watchlistJson.length;
    chosenMovie = watchlistJson[Math.floor(Math.random() * max)];
    movie = await fetchMovieData(chosenMovie.name);
    console.log(chosenMovie);

    chosenMovieHtml.innerHTML = `
    <div class="chosen-movie-container">
      <a href=${chosenMovie.letterboxduri}>
        <img src="${movie.Poster}" alt="POSTER" class="movie-poster">
      </a>

      <a href=${chosenMovie.letterboxduri} class="movie-title">
        ${
          chosenMovie.name
        } <span class="movie-year">(${movie.Year})</span>
      </a>
    </div>
    `;

    errorLbl.textContent = "";
  } else {
    errorLbl.textContent = "Please Input your watchlists file!";
  }
}

function csvToJson(csv) {
  const lines = csv.trim().split("\n");
  const headers = lines[0].split(",").map((h) => h.toLowerCase().replace(" ", ""));
  // Validate the CSV for Watchlists only
  if (JSON.stringify(headers) != JSON.stringify(["date", "name", "year", "letterboxduri\r"])) {
    errorLbl.textContent = "Please add a valid watchlist CSV file!";
    return;
  }

  return lines.slice(1).map((line) => {
    const values = line.split(",");
    const obj = {};
    headers.forEach((header, index) => {
      obj[header.trim()] = values[index].trim();
    });
    return obj;
  });
}
