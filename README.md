# Azure IoT edge application with custom modules.
### PoC application to check the capability for Azure Edge Services


## Application objective
This application consists of 4 custom AzureIoTEdge modules which are stimulating the sensors for recording the human vitals.
1. BloodPressureSensor
2. TemperatureSensor
3. BloodSugerSensor
4. BloodOxygenSensor

5th Module ICEEdgeDemo recives the data from above mentioned modules and process the data and with some logic decided which data needs to be send on azure and which one to skip.

These modules were written in simple javascript and using docker containers for linux were executed.

Useful links : 
https://docs.microsoft.com/en-us/azure/iot-edge/tutorial-develop-for-linux


