Online card gaming site.
Requires node.js to run.

Current structure:
```
static:
	|- index.html:			main page
	|- main-page.js:		code for main page
	|- player-api.js		player data interface
	network:
		|- network.html:	test datachannel site
		|- network.js:		main networking api
	cards:
		|- card.js			base card class
		|- deck.js			base pattern for card games
		|- cards-demo.html	small game demo
		|- poker.js			game #1: poker
	lobby:
		|- lobby.html		lobby selection screen
		|- lobby.js			controls dynamic lobby selection
webserver.js:				debug website
server.py:					debug datachannel server
signal_server.js			manages RTC connections + tracks rooms
```

Before running the project, navigate to the root directory and run
```
npm install
```

**Please don't upload your node-modules folder! Delete it before adding changes!**

To run the project locally, first run the webserver:
```
node webserver.js
```
Default host is at `http://localhost:8080`.

You may also need to host the signaling server:
```
node signal_server.js
```