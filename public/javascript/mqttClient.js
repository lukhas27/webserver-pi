/*********************************************************
 * MQTT Configuration
 *********************************************************/
MQTT_BROKER = '192.168.0.169';
MQTT_PORT = 9001;
MQTT_CLIENTID = 'WebClient' + parseInt(Math.random() * 100);
MQTT_USERNAME = 'lukhas';
MQTT_PASSWORD = 'Chilldeinleben1';

// definition of topics
const topic= {
  BALKON_LED_STATE: "balkon/leds/state",
  BALKON_LED_COLOR: "balkon/leds/color",
  BALKON_LED_BRIGHTNESS: "balkon/leds/brightness"
};

// topic array for subscribing topics
const subTopics = 
[
  topic.BALKON_LED_STATE
];

// create a client instance
client = new Paho.MQTT.Client(MQTT_BROKER, MQTT_PORT, MQTT_CLIENTID);

// set callback handlers
client.onConnectionLost = onConnectionLost;
client.onMessageArrived = onMessageArrived;

// connect the client
client.connect({onSuccess:onConnect, userName:MQTT_USERNAME, password:MQTT_PASSWORD});


/*********************************************************
 * MQTT Callback
 *********************************************************/
// called when the client connects
function onConnect() {
  console.log("MQTT " + MQTT_CLIENTID + " connected!");
  for (var i = 0; i < subTopics.length; i++) {
    client.subscribe(subTopics[i], {qos:2});
    console.log("Subscribed to topic:\t" + subTopics[i]);
  }
}

// called when the client loses its connection
function onConnectionLost(responseObject) {
  if (responseObject.errorCode !== 0) {
    console.log("onConnectionLost:"+responseObject.errorMessage);
  }
}

// called when a message arrives
function onMessageArrived(message) {
  switch (message.destinationName){
    case topic.BALKON_LED_STATE:
        ledStateArrived(message.payloadString);
      break;
  }
  console.log("Message arrived [" + message.destinationName + "]:\t" + message.payloadString);
}


/*********************************************************
 * OnClick functions
 *********************************************************/
function switchOnClick(){
  if (document.getElementById("switchOnOff").checked){
    // crate new message with payload "on"
    message = new Paho.MQTT.Message("on");

    // determine topic and QoS for publishing message
    message.destinationName = topic.BALKON_LED_STATE;
    message.qos = 2;
    
    // publish message
    client.send(message);
    console.log("Message published [" + message.destinationName +"]:\t" + message.payloadString);
  }
  else {
    // crate new message with payload "off"
    message = new Paho.MQTT.Message("off");

    // determine topic and QoS for publishing message
    message.destinationName = topic.BALKON_LED_STATE;
    message.qos = 2;
    
    // publish message
    client.send(message);
    console.log("Message published [" + message.destinationName +"]:\t" + message.payloadString);
  }
}


/*********************************************************
 * OnMessageArrived functions
 *********************************************************/
function ledStateArrived(payload){
  if (payload == "on"){
    document.getElementById("switchOnOff").checked = true;
  }
  else{
    document.getElementById("switchOnOff").checked = false;
  }
}
