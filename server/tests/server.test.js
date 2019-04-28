const expect = require("expect");
const request = require("supertest");
const { ObjectID } = require('mongodb');


const { app } = require("./../server");
const { Todo } = require("./../models/todo");
const { User } = require('./../models/user');
const { todos, populateTodos, users, populateUsers } = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

describe("POST /todos", () => {
  it("should create a new todo", done => {
    var text = "test todo text";

    request(app)
      .post("/todos")
      .send({ text })
      .expect(200)
      .expect(res => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if (err) return done(err);
        Todo.find({ text })
          .then(todos => {
            expect(todos.length).toBe(1);
            expect(todos[0].text).toBe(text);
            done();
          })
          .catch(e => done(e));
      });
  });

  it("should not create todo with invalid data with invalid body data", done => {
    request(app)
      .post("/todos")
      .send({})
      .expect(400)

      .end((err, res) => {
        if (err) return done(err);
        Todo.find()
          .then(todos => {
            expect(todos.length).toBe(2);
            done();
          })
          .catch(e => done(e));
      });
  });
});

describe('GET /todos', () => {
  it('should get all todos', (done) => {
    request(app)
      .get('/todos')
      .expect(200)
      .expect(res => {
        expect(res.body.todos.length).toBe(2)
      })
      .end(done)
  })
})

describe('GET /todos/:id', () => {
  it('should return todo doc', done => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe(todos[0].text)
      })
      .end(done)
  })

  it('should return 404 if todo not found', done => {
    let id = new ObjectID()
    request(app)
      .get(`/todos/${id.toHexString()}`)
      .expect(404)
      .end(done)
  })

  it('should return 404 for non ObjectIDs', done => {
    request(app)
      .get('/todos/12345')
      .expect(404)
      .end(done)
  })
})

describe('DELETE  /todos/:id', () => {
  it('should remove a todo', done => {
    let hexId = todos[1]._id.toHexString();

    request(app)
      .delete(`/todos/${hexId}`)
      .expect(res => {
        expect(res.body.todo._id).toBe(hexId)
      })
      .end((err, res) => {
        if (err) return done(err)
        Todo.findById(hexId).then(todo => {
          expect(todo).toBeNull();
          done();
        }).catch(e => done(e))
      })
  })

  it('should return 404 if todo not found', done => {
    let id = new ObjectID()
    request(app)
      .delete(`/todos/${id.toHexString()}`)
      .expect(404)
      .end(done)
  })

  it('should return 404 if ObjectID is invalid', done => {
    request(app)
      .delete('/todos/12345')
      .expect(404)
      .end(done)
  })
})

describe('PATCH /todos/:id', () => {
  it('should update the todo', done => {
    let id = todos[0]._id.toHexString();
    let payLoad = { text: 'updated from test', completed: true }
    request(app)
      .patch(`/todos/${id}`)
      .send(payLoad)
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe(payLoad.text);
        expect(res.body.todo.completed).toBe(payLoad.completed);
        expect(res.body.todo.completed).toBe(true);
      })
      .end(done)
  })

  it('should clear completedAt when todo is not completed.', done => {
    let id = todos[1]._id.toHexString();
    let payLoad = { text: 'updated from test 2', completed: false };
    request(app)
      .patch(`/todos/${id}`)
      .send(payLoad)
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe(payLoad.text)
        expect(res.body.todo.completed).toBe(false)
        expect(res.body.todo.completedAt).toBeNull()
      })
      .end(done)
  })
})

describe('GET /users/me', () => {
  it('should return user if authenticated', done => {
    request(app)
      .get('/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect(res => {
        expect(res.body._id).toBe(users[0]._id.toHexString());
        expect(res.body.email).toBe(users[0].email);
      })
      .end(done);
  });

  it('should return 401 if not authenticated', done => {
    request(app)
      .get('/users/me')
      .expect(401)
      .expect(res => {
        expect(res.body).toEqual({});
      })
      .end(done);
  })
})

describe('POST /users', () => {
  it('should create a user', done => {
    var email = 'example@example.com';
    var password = '123mnb!';

    request(app)
      .post('/users')
      .send({ email, password })
      .expect(200)
      .expect(res => {
        expect(res.headers['x-auth']).toBeDefined();
        expect(res.body._id).toBeDefined();
        expect(res.body.email).toBe(email);
      })
      .end(err => {
        if (err) {
          return done(err)
        }
        User.findOne({ email }).then(user => {
          expect(user).not.toEqual({})
          expect(user.email).toBe(email);
          expect(user.password).not.toBe(password);
          done();
        }).catch(e => done(e))
      });
  })

  it('should return validation errors if request invalid', done => {
    var email = 'xample.com';
    var password = '123z'

    request(app)
      .post('/users')
      .send({ email, password })
      .expect(400)
      .end(done)

  })

  it('should not create user if email in use', done => {
    request(app)
      .post('/users')
      .send({ email: 'naderdaliri@gmail.com', password: 'asd123zx!' })
      .expect(400)
      .end(done)
  })
})

describe('POST /users/login', done => {
  it('should login user and return auth token', done => {
    request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: users[1].password
      })
      .expect(200)
      .expect(res => {
        expect(res.header['x-auth']).toBeDefined();
      })
      .end((e, res) => {
        if (e) return done(e);
        User.findById(users[1]._id).then(user => {
          expect(user.tokens[0]).toHaveProperty('access', 'auth');
          expect(user.tokens[0]).toHaveProperty('token', res.headers['x-auth']);
          done();
        }).catch(e => done(e))
      })
  });

  it('should reject invalid login', done => {
    request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: 'asd123hkhl'
      })
      .expect(400)
      .expect(res => {
        expect(res.header['x-auth']).toBeUndefined();
      })
      .end((e, res) => {
        if (e) return done(e);
        User.findById(users[1]._id).then(user => {
          expect(user.tokens).toHaveLength(0);
          done();
        }).catch(e => done(e))
      })
  });
});
