const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();
const XLSX = require('xlsx');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error(err));

// Multer setup
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/uploads');
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    }
  });

  const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limiting file size to 5MB
    fileFilter: function (req, file, cb) {
      if (file.mimetype !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        return cb(new Error('Only Excel files are allowed'));
      }
      cb(null, true);
    }
  });
  

// Set the template engine
app.set('view engine', 'ejs');

// Fetch data from the request
app.use(bodyParser.urlencoded({ extended: false }));

// Static folder path
app.use(express.static(path.resolve(__dirname, 'public')));

const CompanyModel = require('./models/company');
const ContactModel = require('./models/contact');

// Initialize arrays to hold uploaded data
let companiesData = [];
let contactsData = [];

app.get('/', async (req, res) => {
  try {
    res.render('home', { companies: companiesData, contacts: contactsData });

  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/upload-companies', upload.single('excel'), async (req, res) => {
  try {
    const workbook = XLSX.readFile(req.file.path);
    const sheet_namelist = workbook.SheetNames;
    const xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_namelist[0]]);
    companiesData = xlData; // Update companiesData with uploaded data
    res.redirect('/'); // Redirect to render updated data

  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/upload-contacts', upload.single('excel'), async (req, res) => {
  try {
    const workbook = XLSX.readFile(req.file.path);
    const sheet_namelist = workbook.SheetNames;
    const xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_namelist[0]]);
    contactsData = xlData; // Update contactsData with uploaded data
    res.redirect('/'); // Redirect to render updated data

  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
