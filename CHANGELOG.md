SingleHub v0.9
---------------------

**Common changes:**

- Rewritten from ASP.NET to Node.js.
- Completely redesigned UI (single-page application).


**Hardware:**

- MQTT protocol support.
- Xiaomi devices support: Smart Socket Plug 2, Eyecare Lamp 2, Yeelight, Power Strip (If your device is not listed, write to me and I will add it).
- MySensors: Protocol updated to 2.0. Now you can use multiple MySensors serial\ethernet gateways at the same time. Each gateway is a separate container. Nodes that the gateway detected are automatically added to the container. 
When the hardware MYS-node presents the sensors, or sending sensor data, 
then all the necessary pins will be automatically added to the node in the editor, 
and you can immediately send and receive messages to the hardware node. 
You can also edit the sensors by calling "Configure" from the node nontext menu.
In the config page, you can add new sensors manually, delete unnecessary sensors, change their type, etc. 
If one sensor in your hardware node works with several types of data at once, 
then you can add several sensors with the same ID, but with different data types. 
You can change some more node settings by calling the "Settings" in node context menu.


**Node editor:**

- Step by step nodes execution (for debugging).
- Display values ​​for nodes inputs/outputs in real time.
- Move selected nodes to new container. The editor will create all the necessary inputs/outputs in the container and create links to relocated nodes. 
- Now you can make loop connections between nodes (A-B-A-B...). It will not cause any problems in the system.
- Advanced nodes settings (new UI elements).


 **Dashboard:**
 
- Dashboard is now made in a modern dark style, with animated elements.
- The application is now single-page. The dashboard and the node editor are now located on the same page. This made it possible to make a better interaction between the editor and the dashboard. Due to the fact that the entire application is now loaded entirely, the responsiveness of the interface is now very high.
- Now the nodes that require a lot of settings have a nice and convenient configuration interface.

 
**New nodes:**

- **Protocols**:
  - **MQTT client**. This node allows to connect to MQTT broker, subscribe to events and publish values.
  - **Xiaomi device**. This node allows to conntrol Xiaomi devices.
  - **MYS Controller Serial**. This node allows to connect to MySensors serial-gateway.
  - **MYS Controller Ethernet**. This node allows to connect to MySensors ethernet-gateway.

- **Opearion**:
  - **Trigger**. If the input "Set" comes "true", the node sends "true" to the output.  If the input "Reset" comes "true", the node sends "false" to the output. The "Set" input is blocked when "Reset" is true.

- **Debug**:
  - **Watcher**. Displays the value of the input as input label.
  - **Console**. Displays the value of the input to the console. 
  Synchronized between the client and the server (the value is displayed here and there).

- **Math**:
  - **Abs**. Returns the absolute value of a number. 
  - **Acos**. Returns the arccosine of a number. 
  - **Asin**. Returns the arcsine of a number. 
  - **Atan**. Returns the arcsine of a number. 
  - **Cbrt**. Returns the cube root of a number. 
  - **Ceil**. Returns the smallest integer greater than or equal to a number. 
  - **Exp**. Returns E pow x, where x is the argument, and E is Euler's constant (2.718…), the base of the natural logarithm.
  - **Logarithm**. Returns the natural logarithm of a number.
  - **Max**. Compares two numbers and return the highest value. 
  - **Min**. Compares two numbers and return the lowest value.   
  - **Sign**. Returns the sign of the x, indicating whether x is positive, negative or zero.   
  - **Trunc**. Returns the integral part of the number x, removing any fractional digits.   
  
- **Filters**:
  - **Reduce Duplicates**. This node reduces the number of duplicated transmitted values.


**Changed nodes:**

- All nodes that transmit data between server and browser
  (UI, debug, etc..) now control the data rate to prevent flooding.
    
- **Main**:
  - **Constant**. Now it has a data type setting.
  
- **UI**:
  - **Button**. Change button text option.
  - **Switch**. Now it has an input. 
  - **State**.  It is no longer needed (due to the Switch), so it is removed.
  - **Slider**. Now it has an input.
  - **Chart**. Changing settings in editor. Chart log realtime update.
  - **RGB Sliders**. Now it has an input. Added a preview of the color.
  - **RGBW Sliders**. Now it has an input. Added a preview of the color.
  - **Audio**. Now it is not related to the any panel in the deshbord. This means that the sound will be played regardless of which panel is open.
  - **Voice Chrome**. Now it is not related to the any panel in the deshbord. This means that the sound will be played regardless of which panel is open.
  - **Voice Yandex**. Now it is not related to the any panel in the deshbord. This means that the sound will be played regardless of which panel is open.
   
- **Numbers**:
  - **Random**. Now you can set the number of digits after the decimal point.

- **System**:
  - **Execute**. This node is now cross-platform.

- **Time**:
  - **Fade**. More node settings.

- **Connection**:
  - **Local Transmitter/Receiver**. Now you can set the number of inputs/outputs.
  - **Remote Transmitter/Receiver**. Now you can set the number of inputs/outputs.
  
- **Opearion**:
  - **Flip-Flop**. Reset on disconnect settings.

- **Compare**:
  - **AND**. You can specify the number of inputs in the node settings.
  - **OR**. You can specify the number of inputs in the node settings. 
  
- **Filters**:
  - **Reduce events**. Reset pin.



**For developers:**
- Code is written in TypeScript and JavaScript, but all scripts are compiled into JavaScript and you can add new functionality using JavaScript if you want.
- Using Vue and Vuetify for the user interface.
- Built-in database is replaced by NeDB. 
- Very comfortable color output debugging information to the console. 
  You can filter messages by importance: debug/info/warnings/errors.
  This also applies to the client part (in the debug panel of the browser).
- API to create nodes is now much friendlier. 
- Now, API allows the node to accept http requests from other nodes 
  or from the browser and render interface (apart from the editor and dashboard).
  Thus, for example ui-chart, renders simple interface on the dashboard 
  and completely different when referring to it directly from the browser.
  