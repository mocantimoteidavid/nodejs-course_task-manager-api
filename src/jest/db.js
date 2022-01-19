const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/user');
const Task = require('../models/task');


const userOneId = new mongoose.Types.ObjectId();
const userOneFixture = {
    _id: userOneId,
    name: "Mike",
    email: "test_mike@gmail.com",
    password: "PassForMike",
    tokens: [{
        token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET)
    }]
}

const userTwoId = new mongoose.Types.ObjectId();
const userTwoFixture = {
    _id: userTwoId,
    name: "Timotei",
    email: "testtimotei@gmail.com",
    password: "PassForTimis",
    tokens: [{
        token: jwt.sign({ _id: userTwoId }, process.env.JWT_SECRET)
    }]
}

const taskOne = {
    _id: new mongoose.Types.ObjectId(),
    description: "example task description",
    completed: false,
    owner: userOneFixture._id
}

const taskTwo = {
    _id: new mongoose.Types.ObjectId(),
    description: "example task two description",
    completed: false,
    owner: userOneFixture._id
}

const taskThree = {
    _id: new mongoose.Types.ObjectId(),
    description: "example task three description",
    completed: false,
    owner: userTwoFixture._id
}

const setupDatabase = async () => {
    await User.deleteMany();
    await Task.deleteMany();
    await new User(userOneFixture).save();
    await new User(userTwoFixture).save();
    await new Task(taskOne).save();
    await new Task(taskTwo).save();
    await new Task(taskThree).save();
}

module.exports = { userOneId, userOneFixture, userTwoFixture, taskOne, taskTwo, taskThree, setupDatabase }