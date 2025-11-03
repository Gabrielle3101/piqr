const randomFoods = [
    "pasta", "salad", "burger", "rice", "pizza", "chicken", 
    "fish", "noodles", "dessert", "soup"
  ];
  
  export async function fetchRecipes(query) {
    try {
      const response = await fetch(`http://localhost:5000/api/recipes?q=${query}`);
      if (!response.ok) throw new Error("Network response was not ok");
      return await response.json();
    } catch (error) {
      console.error("Error fetching recipes:", error);
      throw error;
    }
  }
  
  export async function fetchRandomRecipe() {
    const randomQuery = randomFoods[Math.floor(Math.random() * randomFoods.length)];
    const response = await fetch(`http://localhost:5000/api/recipes?q=${randomQuery}`);
    if (!response.ok) throw new Error("Network response was not ok");
    const data = await response.json();
  
    const hits = data.hits || [];
    return hits.length > 0 ? hits[Math.floor(Math.random() * hits.length)] : null;
  }
  