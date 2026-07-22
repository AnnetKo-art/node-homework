
function errorHandler(err, req, res, next) {
  res.status(500).json({
    //Before AI Reviewer check
    //message: "Something went wrong.",
    
    //After correction:
    error: "Internal Server Error",
  });
}

module.exports = errorHandler;