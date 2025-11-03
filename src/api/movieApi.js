const randomGenres = [
    "action", "comedy", "drama", "thriller", "romance",
    "animation", "horror", "sci-fi", "fantasy", "adventure"
  ];
  
  export async function fetchMovies(query) {
    try {
      const response = await fetch(`http://localhost:5000/api/movies?q=${query}`);
      if (!response.ok) throw new Error("Network response was not ok");
      return await response.json();
    } catch (error) {
      console.error("Error fetching movies:", error);
      throw error;
    }
  }
  
  export async function fetchRandomMovie() {
    const randomQuery = randomGenres[Math.floor(Math.random() * randomGenres.length)];
    const response = await fetch(`http://localhost:5000/api/movies?q=${randomQuery}`);
    if (!response.ok) throw new Error("Network response was not ok");
    const data = await response.json();
  
    const results = data.results || [];
    return results.length > 0 ? results[Math.floor(Math.random() * results.length)] : null;
  }
  