const express = require('express');
const multer = require('multer');
const path = require('path');
const os = require('os');
const fs = require('fs');

const app = express();
const port = 3000;

const { exec } = require('child_process');

const projectDirectory = path.resolve(__dirname);

// Give all permissions to project folder
exec(`sudo chmod -R 777 "${projectDirectory}"`, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  console.log('Permissions granted to project folder.');
});

// Install lodash package
exec('sudo npm install lodash', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  console.log('lodash package installed successfully.');
});

// Get IP address of the server
const networkInterfaces = os.networkInterfaces();
let ipAddress;

Object.keys(networkInterfaces).forEach((interfaceName) => {
  networkInterfaces[interfaceName].forEach((interface) => {
    if (interface.family === 'IPv4' && !interface.internal) {
      ipAddress = interface.address;
    }
  });
});

// Set up file upload destination and storage
const storage = multer.diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

// Initialize multer upload
const upload = multer({ storage });

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Set the path to the views directory (assuming the views directory is in the same directory as index.js)
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the "public" directory
app.use(express.static('public'));

// Ensure the uploads directory exists with appropriate permissions
const uploadsDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadsDir)) {
  try {
    fs.mkdirSync(uploadsDir, { recursive: true });
    fs.chmodSync(uploadsDir, '0777');
  } catch (err) {
    console.error('Error creating uploads directory:', err);
    process.exit(1);
  }
}

// Routes
app.get('/', (req, res) => {
  res.render('index', { ipAddress, port });
});

app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    res.status(400).send('No file uploaded.');
  } else {
    res.send('File uploaded successfully.');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`App listening at http://${ipAddress}:${port}`);
});
