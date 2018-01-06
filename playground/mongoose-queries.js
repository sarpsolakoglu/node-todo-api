const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/db/models/todo');
const {ObjectID} = require('mongodb');

var id = '5a512a493ab0796267989613';

if (ObjectID.isValid(id)) {
    Todo.findById(id).then((todo) => {
        if (!todo) {
            return console.log('Id not found');
        }
        console.log('Todo by ID', todo);
    }).catch(e => console.log(e));
} else {
    console.log('ID not valid');
}

// Todo.find({
//     _id: id
// }).then((todos) => {
//     console.log('Todos', todos);
// });

// Todo.findOne({
//     _id: id
// }).then((todo) => {
//     console.log('Todo', todo);
// });

