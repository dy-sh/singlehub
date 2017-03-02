MyNodes v4.0
---------------------

**Common changes:**

- Rewritten on Node.js.
- Code is written in TypeScript. 
  But all scripts are compiled into JavaScript and you can add new functionality using JavaScript if you want.
- Built-in database is replaced by NeDB.



**Node editor:**

- Step by step nodes execution (for debugging).
- Display values ​​for nodes inputs/outputs in real time.
- Move selected nodes to new container. The editor will create all the necessary inputs/outputs in the container and create links to relocated nodes. 
- Now you can make loop connections between nodes (A-B-A-B...). It will not cause any problems in the system.
- Advanced nodes settings (new UI elements).
- Modified UI. Controls got a little more compact and roomier. 
  The cursor now responds to the elements of the node. 
 
 
 
**New nodes:**

- **Debug**:
  - **Watcher**. Displays the value of the input as input label.
  - **Console**. Displays the value of the input to the console. 
  Synchronized between the client and the server (the value is displayed here and there).
  


**Changed nodes:**

- All nodes that transmit data between server and browser
  (UI, debug, etc..) now control the data rate to prevent flooding.
    
- **Main**:
  - **Constant**. Now it has a data type setting.
  
  
**Other changes:**
- Very comfortable color output debugging information to the console. 
  You can filter messages by importance: debug/info/warnings/errors.
  This also applies to the client part (in the debug panel of the browser).
- API to create nodes is now much friendlier to developers. 
  This is especially true of UI-nodes. 
  All of the code for backend and frontend is now focused in the node class.  
  