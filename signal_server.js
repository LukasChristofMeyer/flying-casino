import {WebSocketServer} from 'ws';
import crypto from 'crypto';
import express from 'express';
import http from 'http';

/** Required to serve files via relative file paths. */
let __dirname;
__dirname ??= import.meta.dirname;
const options = { root: __dirname };

/** Controls settings for the server as a whole, including the room provider and websocket handler
 */
const roomServiceConfig = {
	/** Needed for Azure; we have to ask kindly for the PORT we can use.
	 * This is why you connect to the external Azure server without a port, but if hosted locally will have to connect to localhost:8765 */ 
	port: process.env.PORT || 8765,
	hostname: '0.0.0.0' // Change to localhost to run server locally!
};

/** Converts binary messages back to string. */
const decoder = new TextDecoder();

/** Parses a raw WebSocket message into an object. Equivalent of json.loads() in the python version.
 * @param {ArrayBuffer} raw
*/
const toObject = raw => {
	try {
		return JSON.parse(decoder.decode(raw));
	} catch (error) {
		console.error('invalid JSON:', error);
		return {};
	}
}

/** Global room object.
 * @type {Map<string, Room>}
 */
const roomDict = new Map();

class Room {
	/** @type {Map<string, WebSocket>} */
	#socketDict
	timeout = null
	
	beginTimeout() {
		clearTimeout(this.timeout); // If there was another timeout, remove it. This is needed for cancellation.
		this.timeout = setTimeout(() => roomDict.delete(this.id), 180000); // Anyway, possibly resetting it for another three minutes is harmless
	}
	cancelTimeout() {
		clearTimeout(this.timeout);
		// Despite the name, if you're here for 24 hours and do not do anything to cancelTimeOut, you should leave likely for your own sake
		// This long period is reasonable; the only interaction rooms have is the start of P2P interactions, so you could play a while
		this.timeout = setTimeout(() => roomDict.delete(this.id), 86400000)

		// Notably, this also readds the room to the dict, in case it already did time out and was removed.
		if (!roomDict.has(this.id)) {
			roomDict.set(this.id, this)
		}
	}


	constructor() {
		this.#socketDict = new Map();
		// Initialized later
		/** UUID */
		this.id = '';
		/** Name of the room */
		this.name = '';
		/** Username of the room's creator */
		this.creator = '';
		/** Name of the game being played */
		this.game = '';

		this.connectedPeers = 0;

		// If nothing stops us, this room will no longer be in the map in three minutes.
		this.beginTimeout()
	}

	/** Returns API-related information, like owner and number of players */
	get info() {
		return {
			id: this.id,
			name: this.name,
			creator: this.creator,
			game: this.game
		}
	}

	/** Adds a new peer to the room
	 * @param {string} uuid UUID of the newly connected peer
	 * @param {WebSocket} socket Connection to the signaling server
	 * @returns {boolean} Whether the peer could be added
	 */
	add(uuid, socket) {
		// Should be game based (?)
		if (this.connectedPeers >= 4)
			return false;
		if (!this.#socketDict.get(uuid))
			this.#socketDict.set(uuid, socket);
		// Reveal other peers to client
		socket.send(JSON.stringify({
			'type': 'welcome',
			'id': uuid,
			'peers': [...this.#socketDict.keys()]
		}));

		// Tell existing peers about this new client
		this.exclusiveBroadcast(uuid, JSON.stringify({
			'type': 'new-peer',
			'id': uuid
		}));
		++this.connectedPeers;

		// As somebody is now in this room, we shall no longer be removing it!
		this.cancelTimeout()

		return true;
	}

	/** Removes a peer from the room
	 * @param {string} uuid 
	 */
	remove(uuid) {
		if (!this.#socketDict.get(uuid))
			return;

		this.exclusiveBroadcast(uuid, JSON.stringify({
			'type': 'leaving-peer',
			'id': uuid
		}));
		this.#socketDict.delete(uuid);
		--this.connectedPeers;
		
		// If there is nobody in the room anymore, we'll remove the room from being accessible in three minutes.
		if (this.connectedPeers <= 0) {this.beginTimeout} 
	}

	broadcast() {

	}

	/** Broadcasts a message to everyone but a certain peer
	 * @param {string} ignoreUUID send to everyone but this
	 * @param {string} message
	 */
	exclusiveBroadcast(ignoreUUID, message) {
		this.cancelTimeout() // If we're being used, do not time out!
		for (const [peerUUID, peerSocket] of this.#socketDict) {
			if (peerUUID != ignoreUUID)
				peerSocket.send(message);
		}
	}


	/** 
	 * Sends a message to a certain peer
	 * Added to handle the WebSocket 'send' type, without compromising the privacy of #socketDict
	 * 
	 * @param {string} playerUUID
	 * @param {string} message
	 */
	sendTo(playerUUID, message) {
		this.cancelTimeout() // If we're being used, do not time out!
		this.#socketDict.get(playerUUID).send(message)
	}
}

/** 
 * Handler for WebSockets, which is exclusively used for creating WebRTC data connections
 * 
 * Takes WebSocket messages of type:
 * * 'join'  
 * > Requiring key-pair 'room': room UUID  
 * > This message type will add the sending WebSocket to a room which was previously created, giving the WebSocket a .associatedRoom.  
 * > It returns a message of type 'welcome' giving information on all other WebSockets in the room, 
 *   and also tells every other WebSocket related to the room of the new WebSocket.
 * * 'send'
 * > Requiring key-pair 'to': id of websocket wish to send to, and expecting key-pair 'from': id of our own websocket  
 * > This message type will send an arbitrary JSON WebSocket message to another WebSocket in the same room, by that WebSockets UUID.  
 * 
 * On WebSocket close, it will tell all other peers of a WebSockets within the WebSocket's room to be removed.  
 * 
 * With these messages, you are intended to then set up WebRTC P2P data connections to all WebSockets in a room.  
 * Look at static/network/network.js for our implementation.
 * 
 * @param {WebSocket} socket 
 * @param {http.IncomingMessage} _request Unusued. The HTTP request which was upgraded to a WebSocket we are handling.
 */
function handler(socket, _request) {
	const socketUuid = crypto.randomUUID();

	socket.on('message', data => {
		let packet = toObject(data);

		switch (packet.type) {
			case 'join':
				const room = roomDict.get(packet.room);
				if (room) {room.add(socketUuid, socket)} 
				else {
					socket.send(JSON.stringify({"type": "denied"}))
					socket.terminate() // You're trying to crash everyone, so scram!!!
					return
				}

				socket.associatedRoom = room;

				break;
			case 'send':
				const targetPeer = packet.to;

				if (socket.associatedRoom) {
					roomDict.get(socket.associatedRoom.id).sendTo(targetPeer, JSON.stringify(packet))
				}

				break;
		}
	});

	socket.on('close', () => {
		// Notify other clients that this one is leaving.
		if (socket.associatedRoom)
			socket.associatedRoom.remove(socketUuid);
	});
}

// Host for lobby API
const app = express();
// Needed to view POST requests
app.use(express.text());

// Debug purposes only
//for (let r = 0; r < Math.random() * 24; ++r) roomDict.set(crypto.randomUUID(), new Room());

app.get('/rooms', (request, response) => {
	/** @type {Room} */
	let room;

	// Generate room list
	let API = roomDict.values().map(room => room.info).toArray();

	console.log('API response:', JSON.stringify(API));

	// Necessary for allowing insecure access
	response.setHeader('Access-Control-Allow-Origin', '*');
	response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
	response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

	response.send(API);
});

app.post('/create-room', (request, response) => {
	console.log('Received room creation request');

	const roomCreateRequest = JSON.parse(request.body);

	let room = new Room();
	room.creator = roomCreateRequest.creator || 'unknown #' + (Math.random() * 10_000 | 0).padStart(4, '0');
	room.name = roomCreateRequest.name || `${room.creator}'s Table`;
	room.game = roomCreateRequest.game || 'video-poker';

	// Generate unique ID
	while (roomDict.get(room.id = crypto.randomUUID()));
	roomDict.set(room.id, room);

	response.setHeader('Access-Control-Allow-Origin', '*');
	response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
	response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
	// Only way to "close" a one sided request
	response.send('');
});


/** Global stats object. Just expects a key string and a value string. 
 * @type {Map<string, string>}
 */
const stats = new Map();

app.get('/stats', (request, response) => {
	// shoutouts to https://www.geeksforgeeks.org/javascript/how-to-convert-map-to-json-in-javascript/
	let statsAPI = JSON.stringify(Object.fromEntries(stats))

	// Necessary for allowing insecure access
	response.setHeader('Access-Control-Allow-Origin', '*');
	response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
	response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

	response.send(statsAPI);
});

/** /create-stats wants a .key and a .value. We then just place these into the stats map  */
app.post('/create-stats', (request, response) => {
	const statsRequest = JSON.parse(request.body);

	stats.set(statsRequest.key, statsRequest.value);

	response.setHeader('Access-Control-Allow-Origin', '*');
	response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
	response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
	// Only way to "close" a one sided request
	response.send('');
});

// Magic framework stuff that makes everything work as one wonderful webapp, with only one port!
// Essentially, a wss / WebSocket is just http, but with an upgrade request to instead be a WebSocket;
// Thus, server.listen can sort what connection is either for http or WebSocket, without needing ports, or anything complex.
// This is a TLDR; I would give a source / documentation, but I've gone down the rabbit hole too much to provide anything succinct!
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on('connection', handler)

server.listen(roomServiceConfig.port, roomServiceConfig.hostname, () => {
	console.log(`room-service running @ http://${roomServiceConfig.hostname}:${roomServiceConfig.port}`)
});