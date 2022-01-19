const request = require('supertest');
const app = require('../app');
const Task = require('../models/task');
const { 
    userOneFixture,
    userTwoFixture,
    taskOne,
    setupDatabase
} = require('../jest/db');

beforeEach(setupDatabase)

test("Should create a task for user", async () => {
    const response = await request(app)
        .post("/tasks")
        .set("Authorization", `Bearer ${userOneFixture.tokens[0].token}`)
        .send({
            description: "From my test"
        })
        .expect(201);

    const task = await Task.findById(response.body._id);
    expect(task).not.toBeNull();
    expect(task.completed).toEqual(false);
});

test("Should request tasks only for one user", async () => {
    const response = await request(app)
        .get("/tasks")
        .set("Authorization", `Bearer ${userOneFixture.tokens[0].token}`)
        .send()
        .expect(200);

    expect(response.body.length).toEqual(2);
});

test("Should not delete a task if user is not the owner of it", async () => {
    const response = await request(app)
        .delete(`/tasks/${taskOne._id}`)
        .set("Authorization", `Bearer ${userTwoFixture.tokens[0].token}`)
        .send()
        .expect(404);
    
    const taskFromDb = Task.findById(taskOne._id);
    expect(taskFromDb).not.toBeNull();
});

/**
 * TODO: Extra tests to be written
 * 
 * Should not create task with invalid description/completed
 * Should not update task with invalid description/completed
 * Should delete user task
 * Should not delete task if unauthenticated
 * Should not update other users task
 * Should fetch user task by id
 * Should not fetch user task by id if unauthenticated
 * Should not fetch other users task by id
 * Should fetch only completed tasks
 * Should fetch only incomplete tasks
 * Should sort tasks by description/completed/createdAt/updatedAt
 * Should fetch page of tasks
 * 
 */