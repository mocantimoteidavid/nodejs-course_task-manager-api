const express = require('express');
const Task = require('../models/task');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

router.get('/tasks', authMiddleware, async (req, res) => {
    const filters = {};
    const sort = {};

    if (req.query.completed) {
        filters.completed = req.query.completed === "true"
    }

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(":");
        sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
    }

    try {
        const tasks = await Task.find({ 
            owner: req.user._id, 
            ...filters
        }, 
        null, 
        { 
            limit: parseInt(req.query.limit), 
            skip: parseInt(req.query.skip),
            sort
        }
        );
        res.status(200).send(tasks);
    } catch (e) {
        res.status(500).send();
    }
})

router.get('/tasks/:id', authMiddleware, async (req, res) => {
    const _id = req.params.id;
    if (!_id) {
        return res.status(400).send("Id is required");
    }

    try {
        const task = await Task.findOne({ _id, owner: req.user._id })

        if (!task) {
            return res.status(404).send("Task was not found");
        }

        res.send(task);
    } catch (e) {
        res.status(500).send();
    }
})

router.patch('/tasks/:id', authMiddleware, async (req, res) => {
    const _id = req.params.id;
    if (!_id) {
        return res.status(400).send("Id is required");
    }

    const _body = req.body;
    if (!_body) {
        return res.status(400).send("Body is required");
    }

    const intendedUpdates = Object.keys(req.body);
    const allowedPropertiesToUpdates = ['completed', 'description'];
    const isValidOperation = intendedUpdates.every((update) => 
        allowedPropertiesToUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates' });
    }

    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id});

        if (!task) {
            return res.status(404).send()
        }

        intendedUpdates.forEach((update) => task[update] = _body[update]);
        await task.save();

        res.send(task);
    } catch (e) {
        res.status(400).send(e);
    }
})

router.delete('/tasks/:id', authMiddleware, async (req, res) => {
    const _id = req.params.id;
    if (!_id) {
        return res.status(400).send("Id is required");
    }

    try {
        const task = await Task.findOneAndDelete({ _id, owner: req.user._id });

        if (!task) {
            return res.status(404).send();
        }

        res.send(task);
    } catch (e) {
        res.status(500).send(e);
    }
})

router.post('/tasks', authMiddleware, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })

    try {
        await task.save();
        res.status(201).send(task);
    } catch (e) {
        res.status(500).send(e);
    }
})

module.exports = router;