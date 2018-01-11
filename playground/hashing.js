const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

var password = '123abc1';
// bcrypt.genSalt(10, (err, salt) => {
//     bcrypt.hash(password, salt, (err, hash) => {
//         console.log(hash);
//     });
// });

var hashedPassword = '$2a$10$uJgkCBmjVIG2sfAYXwVrUuM6qORlUuUFlPjn2V26/LS6H.sdRibQG';

bcrypt.compare(password, hashedPassword, (err, res) => {
    console.log(res);
});

// var data = {
//     id: 10
// };

// var token = jwt.sign(data, '123abc');
// console.log(token);


// var decoded = jwt.verify(token, '123abc');
// console.log(decoded);