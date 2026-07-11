# Node.js Fundamentals

## What is Node.js?
Node.js is a JavaScript runtime environment that lets run JavaScript outside the browser, on your computer or a server.


## How does Node.js differ from running JavaScript in the browser?
Node.js lets read and write files, start a web server, read environment variables, work with operating system services.


## What is the V8 engine, and how does Node use it?
V8 is a part of Node that computes JS. It reads JS code, convert it into machine code and then executes the code.


## What are some key use cases for Node.js?
Key use cases for Node.js include building APIs, creating command-line tools (CLIs), and developing real-time applications such as chat apps and live collaboration platforms.
These are good use cases because:
APIs: Handle requests from web or mobile applications and communicate with databases.
CLIs: Help automate development tasks and system administration.
Real-time apps: Support many simultaneous users with fast, asynchronous communication.



## Explain the difference between CommonJS and ES Modules. Give a code example of each.
The main difference between CommonJS and ES Modules is that CommonJS uses require() to import modules and module.exports to export code, while ES Modules use import and export. CommonJS is the traditional module system in Node.js and loads modules synchronously. ES Modules are the modern JavaScript standard and support static imports and other modern JavaScript features.

**CommonJS (default in Node.js):**
// math.js
function add(a, b) {
  return a + b;
}

module.exports = add;

// app.js
const add = require("./math");

console.log(add(2, 3)); // 5



**ES Modules (supported in modern Node.js):**
// math.js
export function add(a, b) {
  return a + b;
}

// app.js
import { add } from "./math.js";

console.log(add(2, 3)); // 5