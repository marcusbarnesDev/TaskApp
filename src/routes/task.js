const express = require('express');
const Task = require('../model/Task');
const auth = require('../middleware/auth');
const Router = new express.Router();

// Add New Task
Router.post('/task', auth, async (req, res) => {
  // const newTask = new Task(req.body);

  const task = new Task({
    ...req.body,
    owner: req.user._id
  });
  try {
    await task.save();
    res.status(201).send(task);
  } catch (err) {
    res.status(400).send({ Error: err });
  }
});
// Get All Tasks
Router.get('/task', auth, async (req, res) => {
  const match = {};
  const sort = {};
  if (req.query.completed) {
    match.completed = req.query.completed === 'true';
  }
  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(':');
    sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
  }
  try {
    await req.user
      .populate({
        path: 'tasks',
        match,
        options: {
          limit: parseInt(req.query.limit),
          skip: parseInt(req.query.skip),
          sort
        }
      })
      .execPopulate();
    res.status(200).send(req.user.tasks);
  } catch (err) {
    res.status(500).send({ Error: 'Internal Error ' });
  }
});
// Get A Task By Id
Router.get('/task/:id', auth, async (req, res) => {
  const _id = req.params.id;
  try {
    const task = await Task.findOne({ _id, owner: req.user._id });
    if (!task) {
      res.status(404).send({ Error: 'Task Not Found!' });
    } else {
      res.status(200).send(task);
    }
  } catch (err) {
    res.status(400).send({ Error: err });
  }
});
// Update A Task
Router.patch('/task/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const validupdates = ['description', 'completed'];
  const isValidUpdate = updates.every(update => validupdates.includes(update));
  const _id = req.params.id;

  if (!isValidUpdate) {
    return res.status(400).send({ Error: 'Invalid Update!' });
  } else {
    try {
      const task = await Task.findOne({ _id, owner: req.user._id });
      if (!task) {
        return res.status(404).send({ Error: 'Task Not Found!' });
      } else {
        updates.forEach(update => {
          task[update] = req.body[update];
        });
        const updateTask = await task.save();
        res.send(updateTask);
      }
    } catch (err) {
      res.status(400).send({ Error: 'Task Not Found' });
    }
  }
});
// Delete A Task
Router.delete('/task/:id', auth, async (req, res) => {
  const _id = req.params.id;
  try {
    const deleteTask = await Task.findOneAndDelete({
      _id,
      owner: req.user._id
    });
    if (!deleteTask) {
      return res.status(404).send({ Error: 'Task Not Found' });
    } else {
      res.status(200).send({ taskDeleted: deleteTask });
    }
  } catch (error) {
    res.status(400).send({ Error: error });
  }
});

module.exports = Router;
