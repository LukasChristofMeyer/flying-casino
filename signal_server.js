import ws from 'ws';
import crypto from 'crypto';
import express from 'express';

/** Required to serve files via relative file paths. */
let __dirname;
__dirname ??= import.meta.dirname;
const options = { root: __dirname };

/** Controls settings for the room provider.
 * Essentially a secondary webserver to serve as an API for listing lobbies.
 */
const roomServiceConfig = {
	port: 443,
	hostname: 'localhost'
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

	constructor() {
		this.#socketDict = new Map();
		// Development values
		/** Name of the room */
		this.name = "room #" + (Math.random() * 24 | 0);
		/** Username of the room's creator */
		this.creator = "user" + (Math.random() * 10_000 | 0).toString().padStart(4, "0");
		/** Name of the game being played */
		this.game = "video-poker";
	}

	/** Returns API-related information, like owner and number of players */
	get info() {
		return {
			name: this.name,
			creator: this.creator,
			game: this.game
		}
	}

	/**
	 * @param {string} uuid UUID of the newly connected peer
	 * @param {WebSocket} socket Connection to the signaling server
	 */
	add(uuid, socket) {
		if (!this.#socketDict.get(uuid))
			this.#socketDict.set(uuid, socket);

		// Reveal other peers to client
		socket.send(JSON.stringify({
			'type': 'welcome',
			'id': uuid,
			'peers': Object.keys(this.#socketDict).join(',')
		}));

		// Tell existing peers about this new client
		this.exclusiveBroadcast(uuid, JSON.stringify({
			'type': 'new-peer',
			'id': uuid
		}));

	}

	broadcast() {

	}

	/** Broadcasts a message to everyone but a certain peer */
	exclusiveBroadcast(ignoreUUID, message) {
		for (const [peerUUID, peerSocket] of this.#socketDict)
			if (peerUUID != ignoreUUID)
				peerSocket.send(message);
	}
}

/**
 * @param {WebSocket} socket 
 */
function handler(socket) {
	const uuid = crypto.randomUUID();

	socket.on('message', data => {
		packet = toObject(data);

		switch (packet.type) {
			case 'join':
				const roomId = packet.room;
				let room;

				if (!(room = roomDict.get(roomId)))
					roomDict.set(
						roomId,
						room = new Room()
					);
				room.add(uuid, socket);

				/*let room;
				if (!(room = rooms[room_id])) {
					// Create a new room
					room = rooms[room_id] = {};
				}
				room[peer_id] = socket;

				// Reveal other peers to new client
				socket.send(JSON.stringify({
					'type': 'welcome',
					'id': peer_id,
					'peers': Object.keys(room).join(',')
				}));

				// Tell existing peers about this client
				for (const peer in room)
					if (peer != peer_id)
						room[peer].send(JSON.stringify({
							'type': 'new-peer',
							'id': peer_id
						}))
				*/
				break;
			case 'send':
				const targetPeer = packet.to;
				break;
		}
	});

	socket.on('close', () => {
		// Notify other clients that this one is leaving.

	});
}

// Host for lobby API
const app = express();

// Debug purposes only
for (let r = 0; r < Math.random() * 24; ++r)
	roomDict.set(crypto.randomUUID(), new Room());

app.get('/rooms', (request, response) => {
	/** @type {Room} */
	let room;
	// Need to make rooms self-aware of ID, and decide which side (server/client) is in control of room properties
	let API = roomDict.keys().map(id => (
		room = roomDict.get(id),
		{
			id: id,
			name: room.info.name,
			game: room.info.game,
			creator: room.info.creator
		}
	)).toArray();

	console.log('API response:', JSON.stringify(API));

	// Necessary for allowing insecure access
	response.setHeader("Access-Control-Allow-Origin", "*");

	response.send(API);
});

app.listen(roomServiceConfig.port, roomServiceConfig.hostname, () => {
	console.log(`room-service running @ http://${roomServiceConfig.hostname}:${roomServiceConfig.port}`)
});