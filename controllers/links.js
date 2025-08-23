const Link = require("../models/Link");
const axios = require("axios"); 
const getReviewsByMovieId = require("../utils/reviews");
const parseExcelFile = require("../utils/parse-excel-file")

const API_KEY_OMDb = process.env.API_KEY_OMDb;
const BASE_URL_OMDb = process.env.BASE_URL_OMDb;


exports.addLink = async (req, res) => {
    try {
        const { username, email } = req.user
        const { imdbID, urlName, url, description, linkType } = req.body;
        const newLink = new Link({ username, email, imdbID, urlName, url, description, linkType });
        await newLink.save();
        res.status(201).json({ message: "Link added successfully", link: newLink });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



exports.getAllLinks = async (req, res) => {
    try {
        const { email } = req.user
        const { imdbID } = req.query;
         
        if (!imdbID || !email) {
            return res.status(400).json({ error: "Missing required query parameters." });
        }

        const publicLinks = await Link.find({ imdbID, linkType: "public" }).lean().exec();
        const privateLinks = await Link.find({ imdbID, linkType: "private", email }).lean().exec();
        const reviews = await getReviewsByMovieId(imdbID)
  
        const allLinks = [...publicLinks, ...privateLinks];
        const addReviewsToLinks = allLinks.map((link) => {
            console.log(link._id)
            const getReviews = reviews.filter((review) => review.linkId === link._id.toString())
            return {
                ...link,
                reviews: getReviews
            }
        })

        res.json(addReviewsToLinks);
    } catch (error) {
        console.error("Error fetching movie links:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.updateLink = async (req, res) => {
    try {
        const { linkId, urlName, url, description, linkType } = req.body;

        if (!linkId || !urlName || !url || !description || !linkType) {
            return res.status(400).json({ error: "Missing required parameters." });
        }
     
        const updatedLink = await Link.findByIdAndUpdate(linkId, {
            urlName,
            url,
            description,
            linkType
        }, { new: true });

        if (!updatedLink) {
            return res.status(404).json({ error: "Link not found." });
        }

        res.json({ message: "Link updated successfully", link: updatedLink });
    } catch (error) {
        console.error("Error updating link:", error);
        res.status(500).json({ error: error.message });
    }
};




exports.deleteLink = async (req, res) => {
    try {
        const { linkId } = req.body; 
    
        if (!linkId) {
            return res.status(400).json({ error: "Missing required parameter (linkId)." });
        }

        const deletedLink = await Link.findByIdAndDelete(linkId);

        if (!deletedLink) {
            return res.status(404).json({ error: "Link not found." });
        }

        res.json({ message: "Link deleted successfully." });
    } catch (error) {
        console.error("Error deleting link:", error);
        res.status(500).json({ error: error.message });
    }
};


exports.addRating = async (req, res) => {
    try {
        const { linkId, user, score } = req.body;

     
        if (!linkId || !user || !score || score < 1 || score > 10) {
            return res.status(400).json({ message: "Invalid input" });
        }

     
        const link = await Link.findById(linkId);
        if (!link) {
            return res.status(404).json({ message: "Link not found" });
        }

        const existingRating = link.ratings.find(rating => rating.user === user);
        if (existingRating) {
            existingRating.score = score;
        } else {
            link.ratings.push({ user, score });
        }

        link.averageRating = link.ratings.reduce((acc, r) => acc + r.score, 0) / link.ratings.length;

        await link.save();
        res.status(200).json({ message: "Rating updated", averageRating: link.averageRating });

    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};



exports.getPublicLinks = async (req, res) => {
    try {
        const { movieId } = req.params
        const query = { linkType : "public"}

        if(movieId){
            query['imdbID'] = movieId
        }

        const publicLinks = await Link.aggregate([
            { $match: query }, 
            { 
                $sort: { averageRating: -1 } 
            },
            { 
                $group: {
                    _id: "$imdbID", 
                    imdbID: { $first: "$imdbID" },
                    url: { $first: "$url" },
                    urlName: { $first: "$urlName" },
                    averageRating: { $first: "$averageRating" }
                }
            }
        ]);


    
        if (!publicLinks || publicLinks.length === 0) {
            return res.status(404).json({ message: "No public links found." });
        }

       
        const moviesData = await Promise.all(publicLinks.map(async (link) => {
            let movieTitle = "Unknown Title";
            let moviePoster = "default_poster.png";

            try {
                const apiUrl = `${BASE_URL_OMDb}?i=${link.imdbID}&apikey=${API_KEY_OMDb}`;
                const movieData = await axios.get(apiUrl);

                if (movieData.data.Response === "True") {
                    movieTitle = movieData.data.Title || movieTitle;
                    moviePoster = movieData.data.Poster !== "N/A" ? movieData.data.Poster : moviePoster;
                }
            } catch (error) {
                console.error(`Failed to fetch data for IMDb ID: ${link.imdbID}`, error.message);
            }

            return {
                imdbID: link.imdbID,
                movieTitle,
                moviePoster,
                url: link.url,
                urlName: link.urlName,
                averageRating: link.averageRating || "No Ratings"
            };
        }));

        const reviews = await getReviewsByMovieId()
        res.status(200).json(moviesData);
    } catch (error) {
        console.error("Error fetching public links:", error.message);
        res.status(500).json({ error: error.message });
    }
};


exports.loadLinksFromFile = async (req, res) => {
    const { file } = req
    const { username, email } = req.user
    const { imdbID } = JSON.parse(req.body.data)

    const links = await parseExcelFile(file.filename)
    const linksWithDetails = links.map((link) => ({
        ...link,
        imdbID,
        email,
        username,
        linkType: link.linkType || "public",
        description: link.description || " ",
    }))
    
    await Link.insertMany(linksWithDetails) 

    res.json({success: true})
}
