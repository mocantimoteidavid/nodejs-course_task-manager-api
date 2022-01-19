const request = require('supertest');
const app = require('../app');
const User = require('../models/user');

const { userOneId, userOneFixture, setupDatabase } = require('../jest/db');

beforeEach(setupDatabase)

test("Should signup a new user", async () => {
    await request(app).post("/users").send({
        name: "Timotei Testing",
        email: "test0001@gmail.com",
        password: "MyPass007toGo"
    }).expect(201);
});

test("Should login existing user", async () => {
    const response = await request(app).post("/users/login").send({
        email: userOneFixture.email,
        password: userOneFixture.password
    }).expect(200);

    const user = await User.findById(userOneId);

    expect(response.body.token).toEqual(user.tokens[1].token);
});

test("Should not login nonexisting user", async () => {
    await request(app).post("/users/login").send({
        email: "nonExistentUser@gmail.com",
        password: "badPasswordString"
    }).expect(400);
});

test("Should get profile for user", async () => {
    await request(app)
        .get("/users/me")
        .set("Authorization", `Bearer ${userOneFixture.tokens[0].token}`)
        .send()
        .expect(200);
});

test("Should not get profile for unauthenticated user", async () => {
    await request(app)
        .get("/users/me")
        .send()
        .expect(401);
});

test("Should delete user when authenticated", async () => {
    await request(app)
        .delete("/users/me")
        .set("Authorization", `Bearer ${userOneFixture.tokens[0].token}`)
        .send()
        .expect(200);

    const user = await User.findById(userOneId);
    expect(user).toBeNull();
});

test("Should not delete user when unauthenticated", async () => {
    await request(app)
        .delete("/users/me")
        .send()
        .expect(401);
});

test("Should upload avatar image", async () => {
    await request(app)
        .post("/users/me/avatar")
        .set("Authorization", `Bearer ${userOneFixture.tokens[0].token}`)
        .attach("avatar", "src/routers/__testdata__/profile-pic.jpg")
        .expect(200);
    
    const user = await User.findById(userOneId);
    expect(user.avatar).toEqual(expect.any(Buffer));
});

test("Should update valid user fields", async () => {
    await request(app)
        .patch("/users/me")
        .set("Authorization", `Bearer ${userOneFixture.tokens[0].token}`)
        .send({
            "name": "Jess"
        })
        .expect(200);

    const user = await User.findById(userOneId);
    expect(user.name).toEqual("Jess");
});

test("Should not update invalid user fields", async () => {
    await request(app)
        .patch("/users/me")
        .set("Authorization", `Bearer ${userOneFixture.tokens[0].token}`)
        .send({
            "location": "Philadelphia"
        })
        .expect(400);
});

/**
 * TODO: Extra tests to be written
 * 
 * Should not signup user with invalid name/email/password
 * Should not update user if unauthenticated
 * Should not update user with invalid name/email/password
 * Should not delete user if unauthenticated
 * 
 */