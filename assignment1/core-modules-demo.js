const os = require('os');
const path = require('path');
const fs = require('fs');
const fsProm = require('fs/promises');

const sampleFilesDir = path.join(__dirname, 'sample-files');
if (!fs.existsSync(sampleFilesDir)) {
  fs.mkdirSync(sampleFilesDir, { recursive: true });
}

// OS module
console.log(`Platform: ${os.type()} (${os.platform()})`);
console.log(`CPU: ${os.cpus()[0].model}`);
console.log(`Total Memory: ${os.totalmem()}`);

// Path module
const joinedPath = path.join('/path', 'to', 'sample-files', 'folder', 'file.txt');
console.log('Joined path:', joinedPath);


// fs.promises API
async function demoFileWork() {
  try {
    const filePath = path.join(sampleFilesDir, 'demo.txt');
    await fsProm.writeFile(filePath, "Hello from fs.promises!");
    const content = await fsProm.readFile(filePath, "utf8");

    console.log('fs.promises read:', content);
  } catch (err) {
    console.log("File operation failed:", err.message);
  }
}

demoFileWork();


// ADVANCED OPTION - Streams for large files- log first 40 chars of each chunk
//const largeFilePath = path.join(sampleFilesDir, "largefile.txt");
const largeFilePath = path.join(sampleFilesDir, "largefile.txt");
async function largeFileWrite() {
  try {
    let content = "";

    for (let i = 1; i <= 100; i++) {
      content += `Line ${i}: Lorem Ipsum text here\n`;
    }

    await fsProm.writeFile(largeFilePath, content);

    console.log("File is not empty:", content.length > 0);

    startStream(); // IMPORTANT: start stream AFTER file is ready

  } catch (err) {
    console.log("File operation failed:", err.message);
  }
}

function startStream() {
  const readStream = fs.createReadStream(largeFilePath, {
    encoding: "utf8",
    highWaterMark: 1024,
  });
  readStream.on("data", (chunk) => {
    console.log("Read chunk:", chunk.slice(0, 40));
  });
  readStream.on("end", () => {
    console.log("Finished reading large file with streams.");
  });

  readStream.on("error", (err) => {
    console.log("Error reading file:", err.message);
  });

}

largeFileWrite();
