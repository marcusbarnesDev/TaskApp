const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Database Connected!');
  } catch (err) {
    console.log(`Database Connection Error: ${err}`);
  }
};

module.exports = connectDB;
