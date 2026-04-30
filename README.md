Online card gaming site.
Requires node.js to run.

Current structure:
```
dev:						old/wip files
static:
	|- index.html:			main page
	|- main-page.js:		code for main page
	|- player-api.js		player data interface
	|- flying-casino.js		global values + utility functions
	network:
		|- network.html:	test site for server.py
		|- network.js:		main networking api
	cards:					contains modularized card games
	lobby:
		|- lobby.html		lobby selection screen
		|- lobby.js			controls dynamic lobby selection
webserver.js:				debug website / demo for server.py
server.py:					first RTC datachannel demo-server
signal_server.js			manages RTC connections + tracks rooms
```

Before running the project, navigate to the root directory and run
```
npm install
```

**Please don't upload your node-modules folder! Delete it before adding changes!**

To ensure any changes you make are valid, navigate to the root directory and run
```
npm test
```

The project as a whole runs totally online, with the site being hosted as a GitHub Page, and the signaling server being hosted on Azure at flying-casino-brakftgmdhbca5cy.canadacentral-01.azurewebsites.net  

However, we are but only humble students, and so our azure server may take sometime to load as we cannot afford it to have it always on. Thus, we recommend that for testing you consider running the project servers locally, especially if multiplayer capabilities suddenly stall.  

To run the project's website locally instead of on our GitHub Page, first run the webserver:
```
node webserver.js
```
Default host is at `http://localhost:8080`.

You will also need to host the signaling server to play multiplayer:
```
node signal_server.js
```

You will need to change some variables to ensure that you are connecting to your locally run servers, rather than our azure server. More information can be found within static/flying-casino.js and to a lesser extent signal_server.js