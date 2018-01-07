const request = require('supertest');
const app = require('./../app');
const {Todo} = require('./../db/models/todo');
const {User} = require('./../db/models/user');
const {ObjectID} = require('mongodb');

const todos = [{
    _id: new ObjectID(),
    text: 'Fist test todo'
}, {
    _id: new ObjectID(),
    text: 'Second test todo',
    completed: true,
    completedAt: 123
}];

beforeEach((done) => {
    Todo.remove({}).then(() => {
        return Todo.insertMany(todos);
    }).then(() => done());
});

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
                done()
            })
            .catch(e => done(e));
    });
})