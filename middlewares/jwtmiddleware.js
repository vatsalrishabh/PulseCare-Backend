const { verifyJwtToken } = require('../service/auth');

const jwtMiddleware = async (req, res, next) => {
  const token = req.headers['authorization'];  //regardless of fronend it takes lowercase 
    console.log(token);

  // Check if token is provided
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    // Verify the token using the verifyJwtToken function
    const decoded = await verifyJwtToken(token);
    console.log(decoded);

    if (decoded) {
      // Token is valid, proceed to next middleware or route handler
      req.user = decoded; // Attach user data to the request object
      console.log(req.user);
      next();
    } else {
      // Invalid token
      return res.status(401).json({ message: 'Invalid token' });
    }
  } catch (error) {
    // Error during verification, usually token is expired or malformed
    return res.status(401).json({ message: 'Failed to authenticate token' });
  }
};

module.exports = {
  jwtMiddleware,
};


//this jwtMiddleware function return true or false when JWT is verifed also it contains username/userid which is used to fetch data.