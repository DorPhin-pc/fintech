var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '1q2w3e4r',
  database : 'fintech'
});
 
connection.connect();
 
connection.query('SELECT 1 + 4 AS solution', function (error, results, fields) {
  if (error) throw error;
  console.log('The solution is: ', results[0].solution);
});
 
connection.end();