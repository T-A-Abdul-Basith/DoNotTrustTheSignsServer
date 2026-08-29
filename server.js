import http from 'http';

const NUM_SIGNS = 5;

var signs = [
	["A", "B", "C", "D", "E"],
	["F", "G", "H", "I", "J"],
	["K", "L", "M", "N", "O"],
	["P", "Q", "R", "S", "T"]
]

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

					signs.append(clientData.signs);

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

server.listen(3000, () => console.log('Server running on port 3000'));
