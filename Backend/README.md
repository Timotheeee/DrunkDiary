# DrunkDiary-Backend

This Backend uses JavaScript, NodeJS, Express and MongoDB and runs inside several Docker containers on our InIT VM. The server and database can also be installed locally to make the access slightly faster but this isn't necessary.

The structure of this backend corresponds to a clean MVC Architecture and is inspired by https://github.com/MoathShreim/Nodejs-rest-api-project-structure-Express.

***Any new files or folders in the root directory will not be deployed to the VM.***

### Usage
The server is updated for every new commit on the master branch and fully functional with a delay of about 15 seconds.

Server IP: 160.85.252.71,
Port: 8080

### Structure
- `server.js` Responsible for connecting the MongoDB and starting the server.
- `app.js` Configure everything that has to do with Express application.
- `/models` The goal of the route is to guide the request to the correct handler function which will be in one of the controllers.
- `/routes` Handle the application requests, invoke controller, interact with models and send back the response to the client.
- `/controllers` Business logic, e.g. how the business works and business needs ( Creating new user in the database, checking if the user password is correct, validating user input data)

### Documentation
* [Mongoose](https://mongoosejs.com/docs/guides.html)
* [ExpressJS](https://expressjs.com/de/api.html)

___

## Guide for Local Use with Docker (not needed)

### Local Installation
1. Install the desktop version of [Docker](https://docs.docker.com/get-docker/) on your local machine (not available for Windows 10 Home Edition).
2. (opt) When using Linux install [Docker Compose](https://docs.docker.com/compose/install/) (already included in Windows and Mac version).
3. Verify installation with `docker --version` in a terminal.

### Local Usage
1. Open terminal in root directory
2. Type `docker-compose up --build` to start up all containers. One of the last lines should read:
`dd-backend    | MondoDb connected`
3. Interact with the backend on port 8080.
4. Shutdown: Stop all containers with `Ctrl+C` (better shutdown solution than stopping all containers individually)

### Docker guide
***Docker containers eat quite a bit of storage space so you should delete all unused Docker images! The backend alone is approximately 1 GB.***
- `docker images` Lists all images on the machine
- `docker ps -a` Lists all running and stopped containers (a container is a running instance of an image)
- `docker stop CONTAINERNAME` Stops container execution by name
- `docker rmi IMAGENAME` Remove image by repository name
- `docker rm CONTAINERNAME` Remove container by name
- `docker rmi $(docker images -f "dangling=true" -q)` Only needed to cleanup dangling images (if an image shows repository name as \<none>)

## Guide for tests

### Socket and API tests
1. open network_test/SpecRunner.html in your browser

### Gamelogic tests
1. run 'npm test'