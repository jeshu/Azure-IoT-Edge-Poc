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
  baseValue: 97.6,
};

function main() {
  ModuleClient.fromEnvironment(Protocol, (err, client) => {
    if (err) {
    } else {
      client.on('inputMessage', (inputName, msg) => {
        client.complete(msg, printResultFor('completed'));
        const data = Buffer.from(msg.data).toString();
        console.log(
          `Temperature <- Data: ${JSON.stringify(JSON.parse(data))}`,
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

      const valueMocker = (angle) => {
        const data = {
          temperature:
            config.baseValue +
            Math.floor( 5 * Math.cos((angle * Math.PI) / 180)),
          unit: 'fahrenheit',
        };

        if (angle > 180) {
          angle = 0;
        }
        client.sendOutputEvent(
          'TemperatureOutput',
          new Message(JSON.stringify(data)),
          (err) => {
            if (err) {
              console.error(`Message send error: ${err}`);
            } else {
              console.log(`Temperature >- Data: ${JSON.stringify(data)}`);
              setTimeout(valueMocker, config.interval, ++angle);
            }
          },
        );
      };
      setTimeout(valueMocker, config.interval, 0);
    }
  });
}
function printResultFor(op) {
  return function printResult(err, res) {
    if (err) console.log(op + ' error: ' + err.toString());
    if (res) console.log(op + ' status: ' + res.constructor.name);
  };
}

main();
