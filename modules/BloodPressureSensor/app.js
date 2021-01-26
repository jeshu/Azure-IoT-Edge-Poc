/**
 * Blood Pressure Stimulator IoT Container
 *
 * Units : mmHg
 *
 * Normal BP condition - 90 < systolic < 140 && 60 < diastolic < 90
 * High BP condition - systolic > 140 || diastolic > 90
 * Low BP condition - systolic < 90 || diastolic < 60
 */

'use strict';

const Protocol = require('azure-iot-device-mqtt').Mqtt;
const { ModuleClient, Message } = require('azure-iot-device');

const config = {
  interval: 1000,
  systolicBloodPressureMax: 160,
  diastolicBloodPressureMax: 140,
  variation: 100,
};

function main() {
  ModuleClient.fromEnvironment(Protocol, (err, client) => {
    if (err) {
    } else {
      client.on('inputMessage', (inputName, msg) => {
        client.complete(msg, printResultFor('completed'));
        const data = Buffer.from(msg.data).toString();
        console.log(
          `BloodPressureDevice <- Data: ${JSON.stringify(JSON.parse(data))}`,
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

      const bpRandomGenerator = () => {
        const variation = Math.floor(Math.random() * config.variation);
        const data = {
          systolic: config.systolicBloodPressureMax - variation,
          diastolic: config.diastolicBloodPressureMax - variation,
          unit: 'mmHg',
        };
        client.sendOutputEvent('BloodPressureOutput', 
        new Message(JSON.stringify(data)),
        err =>{
          if(err) {
            console.error(`Message send error: ${err}`);
          } else {
            console.log(
              `BloodPressureDevice >- Data: ${JSON.stringify(data)}`,
            );
            setTimeout(bpRandomGenerator, config.interval);
          }
        });
      };
      setTimeout(bpRandomGenerator, config.interval);
    }
  });
};
function printResultFor(op) {
  return function printResult(err, res) {
    if (err) console.log(op + " error: " + err.toString());
    if (res) console.log(op + " status: " + res.constructor.name);
  };
}


main();