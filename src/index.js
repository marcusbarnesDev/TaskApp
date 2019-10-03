const express = require('express');
const connectDB = require('./db/mongoose');
const app = express();
const userRouter = require('./routes/user');
const taskRouter = require('./routes/task');

connectDB();
const port = process.env.PORT;

app.use(express.json({ extended: false }));
app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => console.log('Server is up! PORT: ' + port));
