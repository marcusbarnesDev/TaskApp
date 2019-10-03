const express = require('express');
const User = require('../model/User');
const auth = require('../middleware/auth');
const multer = require('multer');
const sharp = require('sharp');
const { welcomeEmail, cancelEmail } = require('../emails/account');

const Router = new express.Router();
// Add New User
Router.post('/user', async (req, res) => {
  const newUser = new User(req.body);
  try {
    const user = await newUser.save();
    const token = await user.auth();
    res.status(201).send({ user, token });
    welcomeEmail(user.email, user.name);
  } catch (err) {
    res.status(400).send({ Error: err });
  }
});
// Get All Users
Router.get('/user/me', auth, async (req, res) => {
  res.send(req.user);
});

// Update A User
Router.patch('/user/me', auth, async (req, res) => {
  const userUpdates = Object.keys(req.body);
  const validUpdates = ['name', 'email', 'password', 'age'];
  const isValidUpdate = userUpdates.every(update =>
    validUpdates.includes(update)
  );
  if (!isValidUpdate) {
    return res.status(400).send({ Error: 'Invalid Update!' });
  } else {
    try {
      userUpdates.forEach(update => {
        req.user[update] = req.body[update];
      });
      await req.user.save();
      res.status(200).send(req.user);
    } catch (err) {
      res.status(500).send({ Error: err });
    }
  }
});
// Delete A User
Router.delete('/user/me', auth, async (req, res) => {
  try {
    cancelEmail(req.user.email, req.user.name);
    await req.user.remove();
    res.send(req.user);
  } catch (error) {
    res.status(400).send({ Error: error });
  }
});
// Login A User
Router.post('/user/login', async (req, res) => {
  try {
    const user = await User.Login(req.body.email, req.body.password);
    const token = await user.auth();
    res.send({ user, token });
  } catch (err) {
    res.status(500).send({ Error: 'Invalid Login' });
  }
});
// Logout A User
Router.post('/user/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(token => {
      return token.token !== req.token;
    });
    await req.user.save();

    res.send('Logged Out');
  } catch (err) {
    res.status(500).send();
  }
});
// Logout all sessions
Router.post('/user/logout/all', auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();

    res.send('Logged Out');
  } catch (err) {
    res.status(500).send();
  }
});
// User Profile Pic
const upload = multer({
  limits: 1000000,
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Please use an image'));
    }
    cb(undefined, true);
  }
});
Router.post(
  '/user/me/avatar',
  auth,
  upload.single('avatars'),
  async (req, res) => {
    try {
      const buffer = await sharp(req.file.buffer)
        .resize({ width: 250, height: 250 })
        .png()
        .toBuffer();
      req.user.avatar = buffer;
      await req.user.save();
      res.send();
    } catch (err) {
      res.status(400).send({ Error: err.message });
    }
  },
  (err, req, res, next) => {
    res.status(400).send({ Error: err.message });
  }
);
Router.delete('/user/me/avatar', auth, async (req, res) => {
  req.user.avatar = undefined;
  try {
    await req.user.save();
    res.send();
  } catch (err) {
    res.status(500).send();
  }
});
Router.get('/user/:id/avatar', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user.avatar || !user) {
      throw new Error();
    }
    res.set('Content-Type', 'image/png');
    res.send(user.avatar);
  } catch (err) {
    res.status(404).send('Avatar not found');
  }
});
module.exports = Router;
