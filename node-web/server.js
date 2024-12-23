//import
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const exphbs = require('express-handlebars');
const app = express();
require("dotenv").config();
const PORT = process.env.PORT || 3000;
const auth_router= require('./routes');
const mqtt = require('mqtt')

const host =  '570cff221bf04d3a90d0b5d329999263.s1.eu.hivemq.cloud'
const port = '8883'

app.use(express.static('public'));
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

const {getAuth, db} = require('./config/firebase')

const auth = getAuth()

app.engine('hbs', exphbs.engine({
  defaultLayout: 'main',
  extname: '.hbs',
  layoutsDir: __dirname + '/views/layouts/',
  partialsDir: __dirname + '/views/partials/'
}));

app.set('view engine', 'hbs');

app.set('views', './views');

//home page
app.get('/', (req, res) => {
  res.render('index');
});

// login page
app.get('/login', (req, res) => {
  res.render('login');
});


// reset password page
app.get('/forgot', (req, res) => {
  res.render('forgot_password');
});



app.use('/', auth_router);
// sign up page
app.get('/signup', (req, res) => {
  res.render('signup');
});

app.get('/reset', (req, res) => {
  res.render('resetpassword')
})

app.get('/notify', (req, res) => {
  res.render('notify_password')
})


app.get('/:userId/monitor', (req, res) => {
  const userId = req.path.split('/')[1]
  res.render('monitor', {userId : userId})
})


// mqtt
app.post('/add-fingerprint', (req, res) => {
  mqttClient.publish('iot/smartlock/fingerprint', 'ENROLL', (err) => {
    if (err) {
      console.error('Failed to publish message:', err);
      return res.status(500).json({ error: 'Failed to send command' });
    }
    res.json({ message: 'Fingerprint enrollment command sent via MQTT.' });
  });
});




const mqttClient = mqtt.connect('mqtt://broker.hivemq.com:1883');

const statusTopic = 'smartLock/status';
const controlTopic = 'smartLock/control';

// let lockState = 'Locked';

//MQTT connection
mqttClient.on('connect', () =>{
    console.log('Connected to MQTT broker');
    mqttClient.subscribe(controlTopic, (err) => {
        if (err) {
            console.error('Failed to subscribe to status topic: ',err);
        }
    });
});

//Listen to message
mqttClient.on('message', (topic, message) =>{
    if (topic == controlTopic) {
        lockState = message.toString();
        console.log('Status updated: ${lockState}');
    }
});


// //request
// app.get('/status', (req, res) =>{
//     res.json({ status: lockState});
// })


// app.get('/login', (req, res) => {
//     res.render('home.html')
// })

app.post('/control', (req, res) => {
    const { command } = req.body;
    if (command === 'Lock' || command === 'Unlock') {
      mqttClient.publish(controlTopic, command);
      res.json({ success: true, message: `Sent command: ${command}` });
    } else {
      res.status(400).json({ success: false, message: 'Invalid command' });
    }
  });
  
  // Start the server
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });