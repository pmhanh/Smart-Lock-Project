//import
const express = require('express');
const mqtt = require('mqtt');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const exphbs = require('express-handlebars');
const app = express();
require("dotenv").config();
const PORT = process.env.PORT || 3000;
const auth_router= require('./routes');

app.use(express.static('public'));
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }));




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

app.get


app.use('/', auth_router);
// sign up page
app.get('/signup', (req, res) => {
  res.render('signup');
});

app.get('/history', (req, res) =>{
  res.render('history');
});

app.get('/reset', (req, res) => {
  res.render('resetpassword')
})

app.get('/notify', (req, res) => {
  res.render('notify_password')
})

// const mqttClient = mqtt.connect('mqtt://broker.hivemq.com:1883');

// const statusTopic = 'smartLock/status';
// const controlTopic = 'smartLock/control';

// let lockState = 'Locked';

// //MQTT connection
// mqttClient.on('connect', () =>{
//     console.log('Connected to MQTT broker');
//     mqttClient.subscribe(statusTopic, (err) => {
//         if (err) {
//             console.error('Failed to subscribe to status topic: ',err);
//         }
//     });
// });

// //Listen to message
// mqttClient.on('message', (topic, message) =>{
//     if (topic == statusTopic) {
//         lockState = message.toString();
//         console.log('Status updated: ${lockState}');
//     }
// });


// //request
// app.get('/status', (req, res) =>{
//     res.json({ status: lockState});
// })


// app.get('/login', (req, res) => {
//     res.render('home.html')
// })

// app.post('/control', (req, res) => {
//     const { command } = req.body;
//     if (command === 'Lock' || command === 'Unlock') {
//       mqttClient.publish(controlTopic, command);
//       res.json({ success: true, message: `Sent command: ${command}` });
//     } else {
//       res.status(400).json({ success: false, message: 'Invalid command' });
//     }
//   });
  
  // Start the server
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });