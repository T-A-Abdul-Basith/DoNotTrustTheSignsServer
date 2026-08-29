import http from 'http';
import mysql from 'mysql2';

const NUM_SIGNS = 5;

var signs = [];
var newsigns = [];

let con;

function loginSQL() {
	con = mysql.createConnection({
		host : process.env.MYSQLHOST,
		port : process.env.MYSQLPORT,
		user : process.env.MYSQLUSER,
		password : process.env.MYSQLPASSWORD,
		database : 'defaultdb'
	});

	con.connect((err) => {
		if (err) throw err;
	});
}

loginSQL();

con.query('select * from signs;', (error, results, fields) => {
	if (error) throw error;
	for (let element of results) {
		signs.push([element.sign1, element.sign2, element.sign3, element.sign4, element.sign5]);
	}
});

con.end();

let autoSave = setInterval(() => {
	console.log("Auto Saving...");
	loginSQL();

	for (let element of newsigns) {
		con.execute("insert into signs (sign1, sign2, sign3, sign4, sign5) values (?, ?, ?, ?, ?);", element, (err, res) => {if (err) throw err;});
	}

	con.commit();
	con.end();

	newsigns = [];
	console.log("Done");
}, 600000);

const server = http.createServer((req, res) => {
	if (req.method === 'POST') {
		if (req.url === '/requestSigns') {
	        	let body = '';

			req.on('data', chunk => {
				body += chunk.toString();
			});
	
			req.on('end', () => {
				try {
 					res.writeHead(200, {'Content-Type': 'application/json'});
					let index = Math.floor(Math.random() * signs.length);
 					res.end(JSON.stringify({
						signs: signs[index]
 					}));
				} catch (error) {
					console.log("Error occurred while sending signs");
					console.log(error.toString());
					res.writeHead(400, {'Content-Type': 'text/plain'});
					res.end('An error occurred while fetching the Signs');
				}
			});
		} else if (req.url === '/addSigns') {
	        	let body = '';

			req.on('data', chunk => {
				body += chunk.toString();
			});
	
			req.on('end', () => {
				try {
					const clientData = JSON.parse(body);

					if (!("signs" in clientData) && !Array.isArray(clientData.signs) && clientData.length != NUM_SIGNS)
						throw new Error("Recieved Object does not contain a valid signs array");

					signs.push(clientData.signs);
					newsigns.push(clientData.signs);

 					res.writeHead(200, {'Content-Type': 'text/plain'});
 					res.end("Signs recieved");
				} catch (error) {
					console.log("Error occurred while recieving signs");
					console.log(error.toString());
					res.writeHead(400, {'Content-Type': 'text/plain'});
					res.end('An error occurred while recieving the Signs');
				}
			});
		} else {
			console.log("Attempt to access ", req.url, ", ignored");
			res.writeHead(404, {'Content-Type': 'text/plain'});
			res.end('Invalid Request');
		}
	} else {
		console.log("Attempt to access ", req.url, ", ignored");
		res.writeHead(404, {'Content-Type': 'text/plain'});
		res.end('Not Found');
	}
});

let shutdownHandle = () => {
	clearInterval(autoSave);
	loginSQL();

	for (let element of newsigns) {
		con.execute("insert into signs (sign1, sign2, sign3, sign4, sign5) values (?, ?, ?, ?, ?);", element, (err, res) => {if (err) throw err;});
	}

	con.commit();
	con.end();
	console.log("Data saved, program terminating...");
	setTimeout(process.exit, 5000, 0);
};

process.on("SIGINT", shutdownHandle);
process.on("SIGTERM", shutdownHandle);

server.listen(process.env.PORT, "0.0.0.0", () => console.log('Server online'));
