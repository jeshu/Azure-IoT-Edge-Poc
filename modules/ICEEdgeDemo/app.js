/**
 * Blood Oxygen Stimulator IoT Container
 *
 * Units : %
 *
 * Lower value should be greater then 90
 */

'use strict';

const Protocol = require('azure-iot-device-mqtt').Mqtt;
const { ModuleClient, Message } = require('azure-iot-device');

const config = {
  interval: 10000,
  maxValue: 100,
  variation: 200,
};

let bloodSugar = 0;
let bloodOxygen = 0;
let bloodPressure = {};
let temperature = 0;

const valueProcessor = () => {
  let counter = 0;
  if (temperature && (temperature < 95.5 || temperature > 98.5)) {
    ++counter;
  } 
  if(bloodOxygen && bloodOxygen < 90){ 
    ++counter;
  }
  if(bloodSugar && (bloodSugar < 80 || bloodSugar > 140)) {
    ++counter;
  }
  if((bloodPressure.diastolic < 60  || bloodPressure.diastolic > 90) ||
  (bloodPressure.systolic < 90  || bloodPressure.systolic > 140)) {
    ++counter;
  }
  
  return counter > 2;
};

function main() {
  ModuleClient.fromEnvironment(Protocol, (err, client) => {
    if (err) {
    } else {
      client.on('inputMessage', (inputName, msg) => {
        client.complete(msg, printResultFor('completed'));
        const data = JSON.parse(Buffer.from(msg.data).toString());
        switch (inputName) {
          case 'input1':
            bloodSugar = data.sugerLevel;
            break;
          case 'input2':
            bloodPressure = {
              systolic: data.systolic,
              diastolic: data.diastolic,
            };
            break;
          case 'input3':
            temperature = data.temperature;
            break;
          case 'input4':
            bloodOxygen = data.oxygenLevel;
            break;
        }
        if(valueProcessor()) {
          console.log(`data userFine >> | ${temperature} | ${bloodPressure.systolic}/${bloodPressure.diastolic} | ${bloodSugar} | ${bloodOxygen}`);
          return;
        }
        console.log(`data userAlert >>  ${temperature} | ${bloodPressure.systolic}/${bloodPressure.diastolic} | ${bloodSugar} | ${bloodOxygen}`);
        client.sendOutputEvent(
          'FinalOutput',
          new Message(JSON.stringify(data)),
          (err) => {
            if (err) {
              console.error(`Message send error: ${err}`);
            } else {
              console.log(`------------------------------ICEEdgeDemo D2C >- Data: ${JSON.stringify(data)}`);
            }
          },
        );
      });
      client.onMethod('reset', (req, res) => {
        console.log(
          `Got method call [${req.requestId}, ${
            req.methodName
          }, ${JSON.stringify(req.payload, null, 2)}]`,
        );
        res.send(
          200,
          'Device reset successful',
          printResultFor('method response'),
        );
      });
    }
  });
}
function printResultFor(op) {
  return function printResult(err, res) {
    if (err) console.log(op + ' error: ' + err.toString());
    if (res) '';//console.log(op + ' status: ' + res.constructor.name);
  };
}

main();
