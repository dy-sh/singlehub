MyNodes v4.0
---------------------

**Common changes:**

- Rewritten on Node.js.
- Built-in database is replaced by NeDB.



**Node editor:**

- Step by step nodes execution. (for debugging).
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
  Controls the data flow to prevent flooding.
  


**Changed nodes:**
  
- **Main**:
  - **Constant**. Now it has a data type setting.
