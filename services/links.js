const Link = require("../models/Link");

const totalLinks = async (limit) => {
  try {
    const totalLinks = await Link.countDocuments();

    return totalLinks;
  } catch (error) {
    console.log(error);
    return false;
  }
};

const mostLinkedMovie = async () => {
  try {
    return Link.aggregate([
      { $group: { _id: "$imdbID", totalLinks: { $sum: 1 } } }, // Group by movie title & count links
      { $sort: { totalLinks: -1 } }, // Sort in descending order
      { $limit: 1 }, // Get the top result
    ]);
  } catch (error) {
    console.log(error);
    return false;
  }
};

const totalDistinctLinks = async (field, limit) => {
  try {

    const links = await Link.distinct(field).then(users => users.length);

    return links;

  } catch (error) {
    console.log(error)
    return false;
    
  }
};

module.exports = {
  totalLinks,
  mostLinkedMovie,
  totalDistinctLinks,
};
