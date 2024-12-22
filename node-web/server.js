//import
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const exphbs = require('express-handlebars');
const app = express();
require("dotenv").config();
const PushSafer = require('pushsafer-notifications');
const PORT = process.env.PORT || 3000;
const auth_router= require('./routes');
const mqtt = require('mqtt')
// const mqttClient = mqtt.connect('mqtt://localhost'); // Replace 'localhost' with your broker's address
const nodemailer = require('nodemailer');
const pushsafer = new PushSafer({
  k: process.env.PUSHSAFER_API_KEY, // Replace with your PushSafer private key
});



// const host =  '570cff221bf04d3a90d0b5d329999263.s1.eu.hivemq.cloud'
// const port = '8883'

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
// app.post('/add-fingerprint', (req, res) => {
//   mqttClient.publish('iot/smartlock/fingerprint', 'ENROLL', (err) => {
//     if (err) {
//       console.error('Failed to publish message:', err);
//       return res.status(500).json({ error: 'Failed to send command' });
//     }
//     res.json({ message: 'Fingerprint enrollment command sent via MQTT.' });
//   });
// });



const mqttClient = mqtt.connect('mqtt://broker.hivemq.com:1883');

const statusTopic = '/smartLock/status';
const controlTopic = '/smartLock/control';


//MQTT connection
mqttClient.on('connect', () =>{
    console.log('Connected to MQTT broker');
    mqttClient.subscribe(controlTopic, (err) => {
        if (err) {
            console.error('Failed to subscribe to status topic: ',err);
        }
        else {
          console.log('Subscribed to topic: ', controlTopic);
        }
    });
    mqttClient.subscribe(statusTopic, (err) => {
      if (err) {
          console.error('Failed to subscribe to status topic: ',err);
      }
      else {
        console.log('Subscribed to topic: ', statusTopic);
      }
  });
});

// //Listen to message
// mqttClient.on('message', (topic, message) =>{
//     if (topic == statusTopic) {
//         lockState = message.toString();
//         console.log(`Status updated: ${lockState}`);
//         console.log(controlTopic);
//     }
// });

let buzzerState = 'Off'; 

const { addHistoryEntry, getMonitor } = require('./controllers/firebase-data-controller');
const user = getAuth().currentUser;
//Listen to message
mqttClient.on('message', async (topic, message) => {
  try {
    //const messageString = (message.toISOString());
    //console.log('Received message:', messageString);
    console.log(message.toString());
    if (message.toString() === 'Alert'){
        const alert_data = {
          t: 'Security Alert!', // Title
          m: 'Your lock has been failed to open too many times', // Message
          s: '', // Optional sound
          v: '', // Optional vibration
          i: '', // Optional icon
        };
        pushsafer.send(alert_data, (err, result) => {
          if (err) {
            console.error('Error sending PushSafer notification:', err);
          } else {
            console.log('PushSafer notification sent:', result);
          }
        });
    }
    const msg = message.toString();
    if (msg.startsWith('Buzzer_')) {
      buzzerState = msg.split('_')[1]; // Update server-side buzzer state
    }
    const data = JSON.parse(message.toString());
    console.log('Receive messsaaage: ', message)
    console.log(`Plain text message received: ${data.state}`);
    console.log(`Plain text message received: ${data.result}`);

    // Check if the message is valid JSON
    // let data;
    // try {
    //   data = JSON.parse(messageString);
    // } catch (jsonError) {
    //   console.warn('Message is not JSON, treating as plain text:', messageString);
    //   data = { text: messageString }; // Treat non-JSON messages as plain text
    // }

    const datetime = new Date().toLocaleString('vi-VN');

    // Process message (add logic based on your application's needs)
    if (data.text) {
      console.log(`Plain text message received: ${data.text}`);
    } else {
      console.log('JSON data received:', data);
      const { state, image, result } = data;

      data.date_time = datetime;
      

      // Example: Add the JSON message to Firebase
      await addHistoryEntry(data);
      // const changepass = {
      //   from: 'underwavecontact@gmail.com',
      //   to: user.email,
      //   subject: 'Password changed successfully',
      //   text: 'Your lock password has been successfully changed.',
      //   };
      // if (state == "Change password")
      // {
      //   await transporter.sendEmail(changepass);
      // }
      // const addfinger = {
      //   from: 'underwavecontact@gmail.com',
      //   to: user.email,
      //   subject: 'Finger added successfully',
      //   text: 'Your finger has been successfully added to your account.',
      // }    
      // if (state == "Add fingerprint")
      // {
      //   await transporter.sendEmail(addfinger);
      // }
    }
  } catch (error) {
    console.error('Error processing message:', error);
  }
});
const transporter = nodemailer.createTransport({
  service: 'gmail', // For example, Gmail
  auth: {
    user: 'underwavecontact@gmail.com',
    pass: 'awrj ukks lynl sslx'
  },
});

// let lockState = 'Locked';

app.post('/control', (req, res) => {
    const { command } = req.body;
    if (command === 'Lock' || command === 'Unlock' || command === 'Buzzer' || command === 'Add_finger_print' || command === 'changePassword') {
      if (command ==='Lock')
      {
        lockState = 'Unlock';
      }
      else (command === 'Unlock')
      {
        lockState = 'Lock';
      }
      if (command === 'Buzzer') {
        // Toggle the buzzer state
        buzzerState = buzzerState === 'Off' ? 'On' : 'Off';
        mqttClient.publish(controlTopic, `Buzzer_${buzzerState}`); // Send the updated state
        console.log(buzzerState)
      }

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