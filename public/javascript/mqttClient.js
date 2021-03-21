/*********************************************************
 * MQTT Configuration
 *********************************************************/
MQTT_BROKER = '192.168.0.169';
MQTT_PORT = 9001;
MQTT_CLIENTID = 'WebClient' + parseInt(Math.random() * 100);

// definition of topics
const topic= {
  BALKON_LEDS_STATE: "balkon/leds/state",
  BALKON_LEDS_COLOR: "balkon/leds/color",
  BALKON_LEDS_BRIGHTNESS: "balkon/leds/brightness",
  BALKON_LEDS_RANGE_MIN: "balkon/leds/range/min",
  BALKON_LEDS_RANGE_MAX: "balkon/leds/range/max",
  BALKON_LEDS_STATUS: "balkon/leds/status"
};

// topic array for subscribing topics
const subTopics = 
[
  topic.BALKON_LEDS_STATE,
  topic.BALKON_LEDS_COLOR,
  topic.BALKON_LEDS_BRIGHTNESS,
  topic.BALKON_LEDS_RANGE_MIN,
  topic.BALKON_LEDS_RANGE_MAX
];

// create a client instance
client = new Paho.MQTT.Client(MQTT_BROKER, MQTT_PORT, MQTT_CLIENTID);

// set callback handlers
client.onConnectionLost = onConnectionLost;
client.onMessageArrived = onMessageArrived;

// connect the client
client.connect({onSuccess:onConnect});


/*********************************************************
 * HTML Configuration
 *********************************************************/

// switch OnOff
var switchOnOff = document.getElementById('switch-OnOff');

// slider brightness
var sliderBrightness = document.getElementById('slider-brightness');

// wheel color picker
var colorPicker = document.getElementById('color-block');


// leds range
var ledRangeMin = document.getElementById('range-min');
var ledRangeMax = document.getElementById('range-max');

/*********************************************************
 * Event Handler
 *********************************************************/

// switch OnOff
switchOnOff.onchange = function(){
  if (switchOnOff.checked){
    publish(topic.BALKON_LEDS_STATE, "on");
  }
  else {
    publish(topic.BALKON_LEDS_STATE, "off");
  }
};

// slider brightness
sliderBrightness.oninput = function(){
  publish(topic.BALKON_LEDS_BRIGHTNESS, sliderBrightness.value);
};

// color picker
colorPicker.oncolorchange = function(){
  publish(topic.BALKON_LEDS_COLOR, colorPicker.value);
};

// led range
ledRangeMin.oninput = function(){
  // publish
  publish(topic.BALKON_LEDS_RANGE_MIN, ledRangeMin.value);

  // update slider
  this.value=Math.min(this.value,this.parentNode.childNodes[5].value-1);
  var value=(100/(parseInt(this.max)-parseInt(this.min)))*parseInt(this.value)-(100/(parseInt(this.max)-parseInt(this.min)))*parseInt(this.min);
  var children = this.parentNode.childNodes[1].childNodes;
  children[1].style.width=value+'%';
  children[5].style.left=value+'%';
  children[7].style.left=value+'%';children[11].style.left=value+'%';
  children[11].childNodes[1].innerHTML=this.value;
};

ledRangeMax.oninput = function(){
  publish(topic.BALKON_LEDS_RANGE_MAX, ledRangeMax.value);

  this.value=Math.max(this.value,this.parentNode.childNodes[3].value-(-1));
  var value=(100/(parseInt(this.max)-parseInt(this.min)))*parseInt(this.value)-(100/(parseInt(this.max)-parseInt(this.min)))*parseInt(this.min);
  var children = this.parentNode.childNodes[1].childNodes;
  children[3].style.width=(100-value)+'%';
  children[5].style.right=(100-value)+'%';
  children[9].style.left=value+'%';children[13].style.left=value+'%';
  children[13].childNodes[1].innerHTML=this.value;
};

/*********************************************************
 * MQTT Functions
 *********************************************************/

// called when the client connects
function onConnect() {
  console.log("MQTT " + MQTT_CLIENTID + " connected!");
  for (var i = 0; i < subTopics.length; i++) {
    client.subscribe(subTopics[i], {qos:2});
    console.log("Subscribed to topic:\t" + subTopics[i]);
  }

  // get actual status of LEDs
  publish(topic.BALKON_LEDS_STATUS, "request");
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
    case topic.BALKON_LEDS_STATE:
        ledStateArrived(message.payloadString);
      break;
    case topic.BALKON_LEDS_BRIGHTNESS:
        ledBrightnessArrived(message.payloadString);
      break;
    case topic.BALKON_LEDS_COLOR:
        ledColorArrived(message.payloadString);
      break;
    case topic.BALKON_LEDS_RANGE_MIN:
      ledRangeMinArrived(message.payloadString);
    break;
    case topic.BALKON_LEDS_RANGE_MAX:
      ledRangeMaxArrived(message.payloadString);
    break;
  }
  console.log("Message arrived [" + message.destinationName + "]:\t" + message.payloadString);
}

// called to publish
function publish(destination, payload){
  // crate new message with value of range as payload
  message = new Paho.MQTT.Message(payload);
  
  // determine topic and QoS for publishing message
  message.destinationName = destination;
  message.qos = 2;
  
  // publish message
  client.send(message);
  console.log("Message published [" + message.destinationName +"]:\t" + message.payloadString);
}


/*********************************************************
 * OnMessageArrived functions
 *********************************************************/

function ledStateArrived(payload){
  if (payload == "on"){
    switchOnOff.checked = true;
  }
  else{
    switchOnOff.checked = false;
  }
}

function ledBrightnessArrived(payload){
  sliderBrightness.value = payload;
}

function ledColorArrived(payload){
  colorPicker.value = payload;
  /* colorPickerPB.css("background-color", colorPicker.value); */
}

function ledRangeMinArrived(payload){
  ledRangeMin.value = payload;
}

function ledRangeMaxArrived(payload){
  ledRangeMax.value = payload;
}