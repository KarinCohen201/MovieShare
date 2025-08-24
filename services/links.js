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
    const result = await Link.aggregate([
      { $group: { _id: "$imdbID", count: { $sum: 1 } } },

      // starting from the most popular
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);
    return result;
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
