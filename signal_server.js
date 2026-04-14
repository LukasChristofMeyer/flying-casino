import ws from 'ws';
import crypto from 'crypto';

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

/** @type {Map<string, Room>} */
const roomDict = new Map();

class Room {
	/** @type {Map<string, WebSocket>} */
	#socketDict
	constructor() {
		this.#socketDict = new Map();
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