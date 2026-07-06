const fs = require('fs');
const path = require('path');
const fsPromises = require("fs/promises");

const filePath = path.join(__dirname, "sample-files", "sample.txt");
// Write a sample file for demonstration
fs.writeFile(
  filePath,
  "Hello, async world!",
  (err) => {
    if (err) {
      console.log("File write failed:", err.message);
      return;
    }
    console.log("Sample file created.");
    callbackExample();
    //callbackHellExample();
    promiseExample();
    asyncAwaitExample();
  }
);

// 1. Callback style
function callbackExample() {
  fs.readFile(filePath, "utf8", (err, content) => {
    if (err) {
      console.log("File read failed:", err.message);
      return;
    }

    console.log("Callback read:", content);
  });
}



// CALLBACK HELL EXAMPLE (test and leave it in comments)
// This function shows how multiple asynchronous operations in Node.js
// can become deeply nested when using callbacks (known as "callback hell"). 
/*
  function callbackHellExample() {
  fs.readdir(path.join(__dirname, "sample-files"), { withFileTypes: false }, (err, files) => {
    if (err) {
      console.log(err.message);
      return;
    }
    console.log("Directory read successfully.");
    console.log(files);
    //find file from readdir result
    const targetFile = files.find(file => file === 'sample.txt');
    if (!targetFile) {
      console.log("sample.txt not found in directory");
      return;
    }
    console.log('Out target file is:', targetFile);
    const fullPath = path.join(__dirname, "sample-files", targetFile);

    fs.stat(fullPath, (err, stats) => {
      if (err) {
        console.log(err.message);
        return;
      }
      
      console.log(`File size: ${stats.size} bytes`);
      console.log('The file was created:', stats.birthtime);
      

      fs.readFile(fullPath, "utf8", (err, content) => {
        if (err) {
          console.log("File read failed:", err.message);
          return;
        }

        console.log("Callback read:", content);
      });
    });
  });
}*/

// 2. Promise style
function promiseExample() {
  fsPromises.readFile(filePath, "utf8")
    .then((content) => {
      console.log("Promise read:", content);
    })
    .catch((err) => {
      console.log("File read failed:", err.message);
    });
};


// 3. Async/Await style
async function asyncAwaitExample() {
  try {
    const content = await fsPromises.readFile(filePath, "utf8");
    console.log("Async/Await read:", content);
  } catch (err) {
    console.log("Async/Await error:", err.message);
  }
}
