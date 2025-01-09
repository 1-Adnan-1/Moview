const API_KEY = "3fd2be6f0c70a2a598f084ddfb75487c";
const IMG_PATH = "https://image.tmdb.org/t/p/w1280";
const SEARCH_API =
  "https://api.themoviedb.org/3/search/movie?api_key=" + API_KEY + "&query=";
const API_URL =
  "https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=" +
  API_KEY +
  "&page=1";

// DOM elemanları
const form = document.getElementById("form");
const search = document.getElementById("search");
const main = document.getElementById("main");
const categorySelect = document.getElementById("category-select");

let selectedCategory = null; // Seçilen kategori

// Popup DOM elemanları
const movieDetailPopup = document.getElementById("movie-detail-popup");
const closeBtn = document.getElementById("close-btn");

// Kategorileri alıyoruz
async function getCategories() {
  const res = await fetch(
    `https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}`
  );
  const data = await res.json();
  populateCategorySelect(data.genres);
}

// Kategorileri Select kutusuna ekliyoruz
function populateCategorySelect(categories) {
  categories.forEach((category) => {
    const optionEl = document.createElement("option");
    optionEl.value = category.id;
    optionEl.textContent = category.name;
    categorySelect.appendChild(optionEl);
  });
}

// Kategori seçildiğinde, seçilen kategoriye ait filmleri alıyoruz
categorySelect.addEventListener("change", (e) => {
  selectedCategory = e.target.value;
  if (selectedCategory) {
    getMoviesByCategory(selectedCategory);
  } else {
    getMovies(API_URL); // Tüm filmleri göster
  }
});

// Kategorilere göre filmleri alıyoruz
async function getMoviesByCategory(categoryId) {
  const url = `https://api.themoviedb.org/3/discover/movie?with_genres=${categoryId}&sort_by=popularity.desc&api_key=${API_KEY}&page=1`;
  getMovies(url);
}

// API'den filmleri alıyoruz
async function getMovies(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch: ${res.status}`);
    }
    const data = await res.json();
    showMovies(data.results);
  } catch (error) {
    console.error("Error fetching movies:", error);
  }
}

// Filmleri gösteriyoruz
function showMovies(movies) {
  main.innerHTML = "";

  if (!movies || movies.length === 0) {
    main.innerHTML = "<h2>No movies found</h2>";
    return;
  }

  movies.forEach((movie) => {
    const { id, title, poster_path, vote_average, overview } = movie;

    const movieEl = document.createElement("div");
    movieEl.classList.add("movie");

    movieEl.innerHTML = `
      <img
        src="${
          poster_path
            ? IMG_PATH + poster_path
            : "https://via.placeholder.com/300x450?text=No+Image"
        }"
        alt="${title}"
      />
      <div class="movie-info">
        <h3>${title}</h3>
        <span class="${getClassByRate(vote_average)}">${vote_average}</span>
      </div>
      <div class="overview">
        <h3>${title} <small> Overview </small> </h3>
        <p>${overview}</p>
      </div>
    `;

    // Film tıklandığında detaylarını göster
    movieEl.addEventListener("click", () => {
      showMovieDetails(movie);
    });

    main.appendChild(movieEl);
  });
}

// Oyuncu puanına göre renk sınıfını döndürüyoruz
function getClassByRate(vote) {
  if (vote >= 8) {
    return "green";
  } else if (vote >= 5) {
    return "orange";
  } else {
    return "red";
  }
}

// Form submit event
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const searchTerm = search.value.trim();
  if (searchTerm && searchTerm !== "") {
    getMovies(SEARCH_API + encodeURIComponent(searchTerm));
    search.value = "";
  } else {
    window.location.reload();
  }
});

// Sayfa yüklendiğinde tüm filmler
getMovies(API_URL);

// Başlangıçta kategoriler
getCategories();

// Film detaylarını popup'a yerleştiren fonksiyon
function showMovieDetails(movie) {
  const {
    title,
    overview,
    release_date,
    original_language,
    vote_average,
    poster_path,
  } = movie;

  // Film başlığı ve açıklama
  document.getElementById("movie-title").textContent = title;
  document.getElementById("movie-overview").textContent = overview;
  document.getElementById("movie-release-date").textContent = release_date;
  document.getElementById("movie-language").textContent = original_language;
  document.getElementById("movie-rating").textContent = vote_average;

  // Film posteri
  const moviePoster = document.getElementById("movie-poster");
  moviePoster.src = poster_path
    ? IMG_PATH + poster_path
    : "https://via.placeholder.com/200x300?text=No+Image";

  // Popup'ı sağdan göster
  movieDetailPopup.style.display = "block";
  movieDetailPopup.style.right = "0";
  document.body.style.overflow = "hidden";
}

// Popup'ı kapatma
closeBtn.addEventListener("click", () => {
  movieDetailPopup.style.display = "none";
  movieDetailPopup.style.right = "-400px";
  document.body.style.overflow = "auto";
});
