/*********************************************************
 * MQTT Configuration
 *********************************************************/
MQTT_BROKER = "192.168.0.169";
MQTT_PORT = 9001;
MQTT_CLIENTID = "WebClient" + parseInt(Math.random() * 1000);

// definition of topics
const topic = {
  BALKON_LEDS_STATE: "balkon/leds/state",
  BALKON_LEDS_COLOR: "balkon/leds/color",
  BALKON_LEDS_BRIGHTNESS: "balkon/leds/brightness",
  BALKON_LEDS_MODE: "balkon/leds/mode",
  BALKON_LEDS_RANGE_MIN: "balkon/leds/range/min",
  BALKON_LEDS_RANGE_MAX: "balkon/leds/range/max",
  BALKON_LEDS_SPEEDFACTOR: "balkon/leds/speedfactor",
  BALKON_LEDS_STATUS: "balkon/leds/status",
};

// topic array for subscribing topics
const subTopics = [
  topic.BALKON_LEDS_STATE,
  topic.BALKON_LEDS_COLOR,
  topic.BALKON_LEDS_BRIGHTNESS,
  topic.BALKON_LEDS_MODE,
  topic.BALKON_LEDS_RANGE_MIN,
  topic.BALKON_LEDS_RANGE_MAX,
  topic.BALKON_LEDS_SPEEDFACTOR,
];

// create a client instance
client = new Paho.MQTT.Client(MQTT_BROKER, MQTT_PORT, MQTT_CLIENTID);

// set callback handlers
client.onConnectionLost = onConnectionLost;
client.onMessageArrived = onMessageArrived;

// connect the client
client.connect({ onSuccess: onConnect });

/*********************************************************
 * HTML Configuration
 *********************************************************/

// switch OnOff
var switchOnOff = document.getElementById("switch-OnOff");

// slider brightness
var sliderBrightness = document.getElementById("slider-brightness");

// modi buttons
var button1 = document.getElementById("mode-1");
var button2 = document.getElementById("mode-2");
var button3 = document.getElementById("mode-3");

// wheel color picker
var colorPicker = document.getElementById("color-block");

// leds range
var setting = {
  roots: document.querySelector(".my-js-slider"),
  limits: { minLimit: 0, maxLimit: 29 },
  rangeValue: { minValue: 0, maxValue: 29 },
  valueNoteDisplay: true,
  type: "range",
  step: 1,
};

var rangeSlider = wRunner(setting); // inizialies range slider

// init range values
var ledRangeMin = 0;
var ledRangeMax = 29;
var ledRangeMinOld = 0;
var ledRangeMaxOld = 29;

// speedfactor
var sliderSpeedfactor = document.getElementById("slider-speedfactor");

/*********************************************************
 * Event Handler
 *********************************************************/

// switch OnOff
switchOnOff.onchange = function () {
  if (switchOnOff.checked) {
    publish(topic.BALKON_LEDS_STATE, "on");
  } else {
    publish(topic.BALKON_LEDS_STATE, "off");
  }
};

// slider brightness
sliderBrightness.oninput = function () {
  publish(topic.BALKON_LEDS_BRIGHTNESS, sliderBrightness.value);
};

// modi buttons
button1.onclick = function () {
  publish(topic.BALKON_LEDS_MODE, String(0));
};

button2.onclick = function () {
  publish(topic.BALKON_LEDS_MODE, String(1));
};

button3.onclick = function () {
  publish(topic.BALKON_LEDS_MODE, String(2));
};

// color picker
colorPicker.oncolorchange = function () {
  publish(topic.BALKON_LEDS_COLOR, colorPicker.value);
};

// 2 point range slider
rangeSlider.onValueUpdate(function (values) {
  ledRangeMin = values.minValue;
  ledRangeMax = values.maxValue;
  
  publish(topic.BALKON_LEDS_RANGE_MIN, String(ledRangeMin));
  publish(topic.BALKON_LEDS_RANGE_MAX, String(ledRangeMax));
});

// slider speedfactor
sliderSpeedfactor.oninput = function () {
  publish(topic.BALKON_LEDS_SPEEDFACTOR, sliderSpeedfactor.value);
};

/*********************************************************
 * MQTT Functions
 *********************************************************/

// called when the client connects
function onConnect() {
  console.log("MQTT " + MQTT_CLIENTID + " connected!");
  for (var i = 0; i < subTopics.length; i++) {
    client.subscribe(subTopics[i], { qos: 2 });
    console.log("Subscribed to topic:\t" + subTopics[i]);
  }

  // get actual status of LEDs
  publish(topic.BALKON_LEDS_STATUS, "request");
}

// called when the client loses its connection
function onConnectionLost(responseObject) {
  if (responseObject.errorCode !== 0) {
    console.log("onConnectionLost:" + responseObject.errorMessage);
  }
}

// called when a message arrives
function onMessageArrived(message) {
  switch (message.destinationName) {
    case topic.BALKON_LEDS_STATE:
      ledStateArrived(message.payloadString);
      break;
    case topic.BALKON_LEDS_BRIGHTNESS:
      ledBrightnessArrived(message.payloadString);
      break;
    case topic.BALKON_LEDS_MODE:
      ledModeArrived(message.payloadString);
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
    case topic.BALKON_LEDS_SPEEDFACTOR:
      ledSpeedfactorArrived(message.payloadString);
      break;
  }
  console.log(
    "Message arrived [" +
      message.destinationName +
      "]:\t" +
      message.payloadString
  );
}

// called to publish
function publish(destination, payload) {
  // crate new message with value of range as payload
  message = new Paho.MQTT.Message(payload);

  // determine topic and QoS for publishing message
  message.destinationName = destination;
  message.qos = 2;

  // publish message
  client.send(message);
  console.log(
    "Message published [" +
      message.destinationName +
      "]:\t" +
      message.payloadString
  );
}

/*********************************************************
 * OnMessageArrived functions
 *********************************************************/

function ledStateArrived(payload) {
  if (payload == "on") {
    switchOnOff.checked = true;
  } else {
    switchOnOff.checked = false;
  }
}

function ledBrightnessArrived(payload) {
  sliderBrightness.value = payload;
}

function ledModeArrived(payload) {
  mode = parseInt(payload);
  switch(mode){
    case 0:
      document.getElementById("mode-1").style.opacity = 1;
      document.getElementById("mode-2").style.opacity = 0.4;
      document.getElementById("mode-3").style.opacity = 0.4;
      break;
    case 1:
      document.getElementById("mode-1").style.opacity = 0.4;
      document.getElementById("mode-2").style.opacity = 1;
      document.getElementById("mode-3").style.opacity = 0.4;
      break;
    case 2:
      document.getElementById("mode-1").style.opacity = 0.4;
      document.getElementById("mode-2").style.opacity = 0.4;
      document.getElementById("mode-3").style.opacity = 1;
      break;
  }
}

function ledColorArrived(payload) {
  colorPicker.value = payload;
  colorPicker.color = payload;
}

function ledRangeMinArrived(payload) {
  /* ledRangeMin = payload;

  if (ledRangeMax - ledRangeMin > 2) {
    if (ledRangeMin != ledRangeMinOld) {
      rangeSlider.setRangeValue({
        minValue: ledRangeMin,
        maxValue: ledRangeMax,
      });
    }
    ledRangeMinOld = ledRangeMin;
  } */
}

function ledRangeMaxArrived(payload) {
  /* ledRangeMax = payload;
  
  if (ledRangeMax - ledRangeMin > 2) {
    if (ledRangeMax != ledRangeMaxOld) {
      rangeSlider.setRangeValue({
        minValue: ledRangeMin,
        maxValue: ledRangeMax,
      });
    }
  }
  ledRangeMaxOld = ledRangeMax; */
}

function ledSpeedfactorArrived(payload) {
  sliderSpeedfactor.value = payload;
}
