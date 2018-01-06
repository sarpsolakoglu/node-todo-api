const request = require('supertest');
const {app} = require('./../app');
const {Todo} = require('./../db/models/todo');
const {User} = require('./../db/models/user');

beforeEach((done) => {
    Todo.remove({}).then(() => done());
});

describe('POST /todos', () => {
    it('should create a new todo', done => {
        var text = 'Test todo text';
        request(app)
            .post('/todos')
            .send({text})
            .then(response => {
                expect(response.status).toBe(200);
                expect(response.body.text).toBe(text);
                return Todo.find();
            })
            .then(todos => {
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
            .then(response => {
                expect(response.status).toBe(400);
                return Todo.find();
            })
            .then(todos => {
                expect(todos.length).toBe(0);
                done();
            })
            .catch(e => done(e));
    });
});