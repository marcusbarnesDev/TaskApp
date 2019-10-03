const jwt = require('jsonwebtoken');
const User = require('../model/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({
      _id: decoded._id,
      'tokens.token': token
    });
    if (!user) {
      throw new Error();
    } else {
      req.token = token;
      req.user = user;
    }
    next();
  } catch (err) {
    res.status(401).send({ Error: 'Please Authenticate' });
  }
};

module.exports = auth;
