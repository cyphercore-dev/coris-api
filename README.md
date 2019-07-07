# Coris API

### Features

- Docker image is based on Alpine and Node 12

- Build with stripped down version of [NestJS](https://www.npmjs.com/package/@nestjs/core). 

- Supports TypeScript, and ES6. 

- Utilizes Express as API, and Redis as storage solution.  

### Running

Prerequisites are docker and docker-compose. In repo root directory, run <code>docker-compose up</code>. This will launch node and redis in the same container.  Endpoint for queueng current validators is <code>http://localhost:3000/validators</code>.


API allows to initialize redis with custom list of validators. Script is located in <code>/src/app/services/init</code>.

### TODO

- FIX BUGS!!!

- Add caching layer to reddis, or at least utilize NestJS default caching.

- Requests/response processing pool might allow increase number of cuncurrent requests

- Configure redis (persistent storage would be nice)