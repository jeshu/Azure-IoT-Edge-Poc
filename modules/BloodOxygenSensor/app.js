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
  interval: 1000,
  maxValue: 100,
  variation:20,
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

      const valueMocker = () => {
        const variation = Math.floor(Math.random() * config.variation);
        const data = {
          oxygenLevel: config.maxValue - variation,
          unit: '%',
        };
        client.sendOutputEvent('BloodOxygenOutput', 
        new Message(JSON.stringify(data)),
        err =>{
          if(err) {
            console.error(`Message send error: ${err}`);
          } else {
            console.log(
              `BloodPressureDevice >- Data: ${JSON.stringify(data)}`,
            );
            setTimeout(valueMocker, config.interval);
          }
        });
      };
      setTimeout(valueMocker, config.interval);
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