# DrunkDiary

# Installation Guide
##### Prerequisites:

- Running the App on your Phone [Expo](https://play.google.com/store/apps/details?id=host.exp.exponent&hl=de)
- Installing Dependencies & run the App [NPM](https://www.npmjs.com/get-npm)
- Coding Style [SonarLint](https://plugins.jetbrains.com/plugin/7973-sonarlint)
- IDE [Intellij](https://www.jetbrains.com/de-de/idea/download/)
- Local DB Instance [Docker](https://docs.docker.com/docker-for-windows/install/)

##### Code Structure:
[Guideline](https://github.zhaw.ch/PSIT4-DrunkDiary/DrunkDiary/wiki/Code-Structure)

##### API Documentation:
[Documentation](https://github.zhaw.ch/PSIT4-DrunkDiary/DrunkDiary-Backend/wiki/API-documentation)

##### Sonar Lint:
Setup your SonarLint Connection to the DrunkDiary Server
Address: 160.85.252.71:9000

##### Database with local Docker:
If you're using a local DB instead of the server.
Change the server IP to your Docker instance.

Change the server.js in the backend Project.
the part mongoose.connect to "mongodb://mongo:27017"

Go to the backend project root folder with the docker container
and run: 
docker-compose up --build

##### running the App:
run this two commands in the terminal of Intellij:
- npm install -g
- npm start

After it is started up, it opens a browser window for expo. 
Scan the shown QR Code with your Expo app on the phone.

PS: For Expo to work, if you're not in the same network with your PC & phone you need to activate tunnel connection.
