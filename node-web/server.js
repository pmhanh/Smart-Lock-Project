const express = require('express');
const mqtt = require('mqtt');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

const mqttClient = mqtt.connect('mqtt://broker.hivemq.com:1883');

const statusTopic = 'smartLock/status';
const controlTopic = 'smartLock/control';

let lockState = 'Locked';

//MQTT connection
mqttClient.on('connect', () =>{
    console.log('Connected to MQTT broker');
    mqttClient.subscribe(statusTopic, (err) => {
        if (err) {
            console.error('Failed to subscribe to status topic: ',err);
        }
    });
});

//Listen to message
mqttClient.on('message', (topic, message) =>{
    if (topic == statusTopic) {
        lockState = message.toString();
        console.log('Status updated: ${lockState}');
    }
});

app.get('/status', (req, res) =>{
    res.json({ status: lockState});
})

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