import asyncio
import websockets
import json
import uuid
import os

"""
	Dictionary of rooms, which shall have a dictionary of ids to websockets. 
	This is since websockets are technically not unique, and we often want to select only some of them.
"""
rooms = {}


# Inevitably, the signaling server has to do some relaying.
# However, it is exclusively for signaling. Thus, colloquially, it is a signaling server, not a relay server.
# Though, in my opinion, a signaling server is thus definitely just a type / subset of relay server, but what do I know?
async def handler(websocket):
	# We need this id so that we can ensure signaling is targeted.
	peer_id = str(uuid.uuid4())[:8]
	room_id = None
	try:
		# This can be easily abused by a websocket sending bad packets to crash the server, and needs error handling
		# However, handling that isn't our top priority yet!
		async for message in websocket:
			data = json.loads(message)

			match data["type"]:
				case "join":
					room_id = data["room"]
					if room_id not in rooms:
						rooms[room_id] = {}
					rooms[room_id][peer_id] = websocket

					await websocket.send(json.dumps({
						"type": "welcome",
						"id": peer_id,
						"peers": list(rooms[room_id].keys())
					}))

				    # Tell everyone else we've joined
					for id, socket in rooms[room_id].items():
						if id != peer_id:
							await socket.send(json.dumps({
								"type": "new-peer",
								"id": peer_id
							}))

				case "send":
					target = data.get("to")

					if target in rooms[room_id]:
						await rooms[room_id][target].send(message)
				
				case _:
					{}
	except:
		pass # If there is an exception, whatever. We are just going to do what we finally must.
	finally:
		# Tell everyone we've left. If you have no websocket, you have no peer connection, so everyone needs to know
		for id, socket in rooms.get(room_id, {}).items():
			if id != peer_id:
				await socket.send(json.dumps({
					"type": "leaving-peer",
					"id": peer_id
				}))

		# Delete the entry, but does not crash Azure if there is no entry if it failed to do a handshake.
		rooms.get(room_id, {}).pop(peer_id, None)


port = int(os.environ.get("PORT", 8765)) # Needed for Azure

async def main():
	# Replace "0.0.0.0" with "localhost", and this can be a local server connected to, and port with 8765
	# Just then also set network.js's signalingURL to "ws://localhost:8765"
	# Plus, you'll want to connect to the server through the static website via two browsers. At least in my experience!
	async with websockets.serve(handler, "0.0.0.0", port):
		await asyncio.Future()

asyncio.run(main())