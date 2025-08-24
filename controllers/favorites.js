const Favorite = require("../models/Favorite");

const addFavorite = async (req, res) => {
  try {
    const { imdbID, username, title, year, poster, rating} = req.body;
    const { email } = req.user;

    if (!imdbID || !email || !username) {
      return res
        .status(400)
        .json({ message: "Missing imdbID, email, or username" });
    }

    const newFavorite = new Favorite({
      imdbID,
      email,
      username,
      title,
      year,
      poster,
      rating,
    });
    await newFavorite.save();

    res.status(201).json({ message: "Added to favorites!" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const removeFavorite = async (req, res) => {
  try {
    const { imdbID } = req.body;
    const { email } = req.user;

    if (!imdbID || !email) {
      return res.status(400).json({ message: "Missing imdbID or email" });
    }

    // Check if the movie exists in the favorites collection for the user
    const favorite = await Favorite.findOneAndDelete({ imdbID, email });

    if (!favorite) {
      return res.status(404).json({ message: "Movie not found in favorites" });
    }

    res.status(200).json({ message: "Removed from favorites!" });
  } catch (error) {
    console.error("Error removing favorite:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

const isFavorite = async (req, res) => {
  try {
    const { email } = req.user;
    const { imdbID } = req.query;
    
    if (!email || !imdbID) {
      return res.status(400).json({ message: "Missing email or imdbID" });
    }

    const favorite = await Favorite.findOne({ email, imdbID });

    res.json({ isFavorite: !!favorite }); //if movie is in favorites, return true, else return false
  } catch (error) {
    console.error("Error checking favorite status:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

const getFavorites = async (req, res) => {
  const { email } = req.user;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const favorites = await Favorite.find({ email });
    res.json(favorites);
  } catch (error) {
    console.error("Error fetching favorites:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = {
  addFavorite,
  removeFavorite,
  isFavorite,
  getFavorites,
};
