const request = require('supertest');
const app = require('./../app');
const {Todo} = require('./../db/models/todo');
const {User} = require('./../db/models/user');
const {ObjectID} = require('mongodb');
const {todos, populateTodos, users, populateUsers} = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {
    it('should create a new todo', done => {
        var text = 'Test todo text';
        request(app)
            .post('/todos')
            .send({text})
            .then((response) => {
                expect(response.status).toBe(200);
                expect(response.body.text).toBe(text);
                return Todo.find({text});
            })
            .then((todos) => {
                expect(todos.length).toBe(1);
                expect(todos[0].text).toBe(text);
                done();
            })
            .catch(e => done(e));
    });

    it('should not create todo with invalid body data', done => {
        request(app)
            .post('/todos')
            .send()
            .then((response) => {
                expect(response.status).toBe(400);
                return Todo.find();
            })
            .then((todos) => {
                expect(todos.length).toBe(2);
                done();
            })
            .catch(e => done(e));
    });
});

describe('GET /todos', () => {
    it('should get all todos', (done) => {
        request(app)
            .get('/todos')
            .then(response => {
                expect(response.status).toBe(200);
                expect(response.body.todos.length).toBe(2);
                done();
            })
            .catch(e => done(e));
    });
});

describe('GET /todos/:id', () => {
    it('should return todo doc', (done) => {
        request(app)
            .get(`/todos/${todos[0]._id.toHexString()}`)
            .then((response) => {
                expect(response.status).toBe(200);
                expect(response.body.todo.text).toBe(todos[0].text);
                done();
            })
            .catch(e => done(e));
    });

    it('should return 404 if todo not found', (done) => {
        request(app)
            .get(`/todos/${new ObjectID().toHexString()}`)
            .then((response) => {
                expect(response.status).toBe(404);
                done()
            })
            .catch(e => done(e));
    });

    it('should return 404 if invalid obj id', (done) => {
        request(app)
            .get('/todos/123')
            .then((response) => {
                expect(response.status).toBe(404);
                done()
            })
            .catch(e => done(e));
    });
});

describe('DELETE /todos/:id', () => {
    it('should remove a todo', (done) => {
        request(app)
            .delete(`/todos/${todos[0]._id.toHexString()}`)
            .then((response) => {
                expect(response.status).toBe(200);
                expect(response.body.todo.text).toBe(todos[0].text);
                done();
            })
            .catch(e => done(e));
    });

    it('should return 404 if todo not found', (done) => {
        request(app)
            .delete(`/todos/${new ObjectID().toHexString()}`)
            .then((response) => {
                expect(response.status).toBe(404);
                done()
            })
            .catch(e => done(e));
    });

    it('should return 404 if invalid obj id', (done) => {
        request(app)
            .delete('/todos/123')
            .then((response) => {
                expect(response.status).toBe(404);
                done()
            })
            .catch(e => done(e));
    });
});

describe('PATCH /todos/:id', () => {
    it('should update a todo', (done) => {
        var text = 'New text';
        request(app)
            .patch(`/todos/${todos[0]._id.toHexString()}`)
            .send({
                completed: true,
                text
            })
            .then((response) => {
                expect(response.status).toBe(200);
                expect(response.body.todo.text).toBe(text);
                expect(response.body.todo.completed).toBe(true);
                expect(typeof response.body.todo.completedAt).toBe('number');
                done();
            })
            .catch(e => done(e));
    });

    it('should clear completedAt when todo is not completed', (done) => {
        var text = 'New text';
        request(app)
            .patch(`/todos/${todos[0]._id.toHexString()}`)
            .send({
                completed: false,
                text
            })
            .then((response) => {
                expect(response.status).toBe(200);
                expect(response.body.todo.text).toBe(text);
                expect(response.body.todo.completed).toBeFalsy();
                expect(response.body.todo.completedAt).toBeNull();
                done();
            })
            .catch(e => done(e));
    });
})

describe('GET /users/me', () => {
    it('should return user if authenticated', (done) => {
        request(app)
            .get('/users/me')
            .set('x-auth', users[0].tokens[0].token)
            .then((response) => {
                expect(response.status).toBe(200);
                expect(response.body._id).toBe(users[0]._id.toHexString());
                expect(response.body.email).toBe(users[0].email);
                done();
            })
            .catch(e => done(e));
    });

    it('should return 401 if not authenticated', (done) => {
        request(app)
            .get('/users/me')
            .then((response) => {
                expect(response.status).toBe(401);
                done();
            })
            .catch(e => done(e));
    });
});

describe('POST /users', () => {
    it('should create a user', (done) => {
        var email = 'example@example.com';
        var password = '123abc';

        request(app)
            .post('/users')
            .send({email, password})
            .then((response) => {
                expect(response.status).toBe(200);
                expect(response.headers['x-auth']).not.toBeNull();
                expect(response.body._id).not.toBeNull();
                expect(response.body.email).not.toBeNull();
                return User.findOne({email});
            })
            .then((user) => {
                expect(user).not.toBeNull();
                expect(user.password).not.toBe(password);
                done();
            })
            .catch(e => done(e));
    });

    it('should return validation errors if request invalid', (done) => {
        var email = 'example';
        var password = '123';

        request(app)
            .post('/users')
            .send({email, password})
            .then((response) => {
                expect(response.status).toBe(400);
                done();
            })
            .catch(e => done(e));
    });

    it('should not create user if email in use', (done) => {
        var email = users[0].email;
        var password = '123abc';

        request(app)
            .post('/users')
            .send({email, password})
            .then((response) => {
                expect(response.status).toBe(400);
                done();
            })
            .catch(e => done(e));
    });
});

describe('POST /users/login', () => {
    it('should login user and return auth token', (done) => {
        request(app)
            .post('/users/login')
            .send({
                email: users[1].email,
                password: users[1].password
            })
            .then((response) => {
                expect(response.status).toBe(200);
                expect(response.headers['x-auth']).not.toBeNull();
                return User.findById(users[1]._id).then((user) => {
                    expect(user.tokens[0].access).toBe('auth');
                    expect(user.tokens[0].token).toBe(response.headers['x-auth']);
                    done();
                });
            })
            .catch(e => done(e));
    });

    it('should not login user and return auth token', (done) => {
        request(app)
            .post('/users/login')
            .send({
                email: users[1].email,
                password: 'wrongPassword'
            })
            .then((response) => {
                expect(response.status).toBe(400);
                expect(response.headers['x-auth']).toBeUndefined();
                return User.findById(users[1]._id)
            })
            .then((user) => {
                expect(user.tokens.length).toBe(0);
                done();
            })
            .catch(e => done(e));
    });
});

describe('DELETE /users/me/token', () => {
    it('should remove auth token on logout', (done) => {
        request(app)
            .delete('/users/me/token')
            .set('x-auth', users[0].tokens[0].token)
            .then((response) => {
                expect(response.status).toBe(200);
                return User.findById(users[1]._id)
            })
            .then((user) => {
                expect(user.tokens.length).toBe(0);
                done();
            })
            .catch(e => done(e));
    });
})