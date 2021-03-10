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
  BALKON_LED_BRIGHTNESS: "balkon/leds/brightness",
  BALKON_LED_RANGEMIN: "balkon/leds/borders/min",
  BALKON_LED_RANGEMAX: "balkon/leds/borders/max"
};

// topic array for subscribing topics
const subTopics = 
[
  topic.BALKON_LED_STATE,
  topic.BALKON_LED_COLOR,
  topic.BALKON_LED_BRIGHTNESS,
  topic.BALKON_LED_RANGEMIN,
  topic.BALKON_LED_RANGEMAX
];

// create a client instance
client = new Paho.MQTT.Client(MQTT_BROKER, MQTT_PORT, MQTT_CLIENTID);

// set callback handlers
client.onConnectionLost = onConnectionLost;
client.onMessageArrived = onMessageArrived;

// connect the client
client.connect({onSuccess:onConnect, userName:MQTT_USERNAME, password:MQTT_PASSWORD});


/*********************************************************
 * HTML Configuration
 *********************************************************/

// switch OnOff
var switchOnOff = document.getElementById("switch-OnOff");

// slider brightness
var sliderBrightness = document.getElementById("slider-brightness");

// wheel color picker
var colorPicker = document.getElementById("color-block");
var colorPickerPB = document.getElementById("color-picker-pb");


// led borders
/* var ledRangeMin = document.getElementById("led-range-min");
var ledRangeMax = document.getElementById("led-range-max");

initRange1(ledRangeMin);
initRange2(ledRangeMax); */

/*********************************************************
 * Event Handler
 *********************************************************/

// switch OnOff
switchOnOff.onchange = function(){
  if (switchOnOff.checked){
    publish(topic.BALKON_LED_STATE, "on");
  }
  else {
    publish(topic.BALKON_LED_STATE, "off");
  }
};

// slider brightness
sliderBrightness.oninput = function(){
  // publish
  publish(topic.BALKON_LED_BRIGHTNESS, sliderBrightness.value);
};

// color picker
colorPicker.oncolorchange = function(){
  publish(topic.BALKON_LED_COLOR, colorPicker.value);
};

/* // led border
ledRangeMin.oninput = function(){
  publish(topic.BALKON_LED_RANGEMIN, ledRangeMin.value);
};
ledRangeMax.oninput = function(){
  publish(topic.BALKON_LED_RANGEMAX, ledRangeMax.value);
}; */

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
    case topic.BALKON_LED_BRIGHTNESS:
        ledBrightnessArrived(message.payloadString);
      break;
    case topic.BALKON_LED_COLOR:
        ledColorArrived(message.payloadString);
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

/*********************************************************
 * Initizialistation
 *********************************************************/
/* function initRange1(document){
  document.value=Math.min(document.value,document.parentNode.childNodes[5].value-1);
  var value=(100/(parseInt(document.max)-parseInt(document.min)))*parseInt(document.value)-(100/(parseInt(document.max)-parseInt(document.min)))*parseInt(document.min);
  var children = document.parentNode.childNodes[1].childNodes;
  children[1].style.width=value+'%';
  children[5].style.left=value+'%';
  children[7].style.left=value+'%';children[11].style.left=value+'%';
  children[11].childNodes[1].innerHTML=document.value;
}

function initRange2(document){
  document.value=Math.max(document.value,document.parentNode.childNodes[3].value-(-1));
  var value=(100/(parseInt(document.max)-parseInt(document.min)))*parseInt(document.value)-(100/(parseInt(document.max)-parseInt(document.min)))*parseInt(document.min);
  var children = document.parentNode.childNodes[1].childNodes;
  children[3].style.width=(100-value)+'%';
  children[5].style.right=(100-value)+'%';
  children[9].style.left=value+'%';children[13].style.left=value+'%';
  children[13].childNodes[1].innerHTML=document.value;
}

function sliderDistanceOnChange(){
  document.getElementById("inverse-left").style = "width:70%;";
  document.getElementById("inverse-right").style = "width:70%;";

  document.getElementById("range").style = "left:30%;right:40%;";
  document.getElementById("thumb1").style = "left:30%;";
  document.getElementById("thumb2").style = "left:60%;";

  document.getElementById("sign1").style = "left:30%;";
  document.getElementById("value1") = 30;
  document.getElementById("sign2").style = "left:60%;";
  document.getElementById("value2") = 60;
} */