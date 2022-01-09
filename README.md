
# SingleHub

Home automation controller with node-based visual programming (Node.js port of [MyNodes.NET](https://github.com/dy-sh/MyNodes.NET)).

This software allows you to control hardware devices using MQTT, MySensors, Xiaomi and other protocols. You can use this program as a control center for your smart home, integrating various devices in one system, or as a controller for your simple device in Ardiuno. 

The program can be used for drawing graphs, collecting some statistics, using timers, visualizing and testing some logic, using voice synthesis, working with files, databases, executing OS commands on a schedule and etc. You can integrate several SingleHub systems running on different computers into one large system.

The code is written using the following frameworks/technologies/tools: Node, Express, Vue, Pug, Stylus, Vuetify, Socket.io, Webpack, TypeScript.

Feel free to join the development!

Find out more on the <a href="https://www.youtube.com/channel/UCZtlGnAmCMFgmkRptiKAT-g/videos"> YouTube channel</a>.


To be aware of all the changes, look at the [changelog](CHANGELOG.md).


### How to install

Install requirements:

- install Git: [https://git-scm.com/downloads](https://git-scm.com/downloads)
- install Node.js v8.4 or higher: [https://nodejs.org/en/download/](https://nodejs.org/en/download/)

Install SingleHub:

```bash
git clone https://github.com/dy-sh/singlehub
cd singlehub
npm i
```


### How to run

```bash
npm start
```

Open the configuration wizard in a browser: [http://localhost:1312](http://localhost:1312)


### How to upgrade to the latest version

```bash
git pull
npm run build
```


### How to run for develop (watch mode):

```bash
npm run watch
```

### Issues:

If you get "Can't find Python executable C:\Python36\python.exe, you can set the PYTHON env variable." error when installing, try this:

```bash
npm install --global --production windows-build-tools
```


