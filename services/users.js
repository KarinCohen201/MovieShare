const User = require("../models/User");
const moment = require("moment");
const jwt = require('jsonwebtoken')
const totalUsers = async (limit) => {
  try {
    const users = await User.countDocuments();

    return users;
  } catch (error) {
    console.log(error);
    return false;
  }
};

const usersJoinStats = async () => {
  const oneWeekAgo = moment().subtract(1, "week").startOf("day").toDate(); // Start of the past week
  try {
    const usersJoined = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: oneWeekAgo }, // Only users created in the past week
        },
      },
      {
        $project: {
          day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, // Convert createdAt to YYYY-MM-DD format
        },
      },
      {
        $group: {
          _id: "$day", // Group by day
          count: { $sum: 1 }, // Count users per day
        },
      },
      {
        $sort: { _id: 1 }, // Sort by day (ascending order)
      },
    ]);
    return usersJoined
  } catch (error) {
    console.log(error);
    return false;
  }
};

function generateAccessToken(username, email) {
  return jwt.sign(username, process.env.TOKEN_SECRET, { expiresIn: '6000s' });
}

module.exports = {
  totalUsers,
  usersJoinStats,
  generateAccessToken,
};
