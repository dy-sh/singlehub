
SingleHub v0.9

Home automation controller with node-based visual programming (Node.js port of MyNodes.NET).

To be aware of all the changes, look at the [changelog](https://github.com/derwish-pro/singlehub/blob/master/CHANGELOG.md).

This software allows you to control hardware devices using MQTT, MySensors, Xiaomi and other protocols. You can use this program as a control center for your smart home, integrating various devices in one system, or as a controller for your simple device in Ardiuno. 

The program can be used for drawing graphs, collecting some statistics, using timers, visualizing and testing some logic, using voice synthesis, working with files, databases, executing OS commands on a schedule and etc. You can integrate several SingleHub systems running on different computers into one large system.

The code is written using the following frameworks/technologies/tools: Node, Express, Vue, Pug, Stylus, Vuetify, Socket.io, Webpack, TypeScript.

Feel free to join the development!




**How to install:**
-------------------

**Install requirements:**
- install Git: [https://git-scm.com/downloads](https://git-scm.com/downloads)
- install Node.js v8.4 or higher: [https://nodejs.org/en/download/](https://nodejs.org/en/download/)
- reboot


**Install SingleHub:**

- git clone https://github.com/derwish-pro/singlehub
- cd singlehub
- npm i


**How to run:**
-------------------

- npm start
- open in browser: [http://localhost:1312](http://localhost:1312)


**How to upgrade to the latest version:**
-------------------

- git pull
- npm run build



**How to run for develop (watch mode):**
-------------------
- npm run watch
