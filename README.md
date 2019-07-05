# Coris API

Build fully with stripped down version of [NestJS](https://www.npmjs.com/package/@nestjs/core). Comes with TypeScript support, and Redis as storage solution.  

Other major dependencies:

- [nest-schedule](https://www.npmjs.com/package/nest-schedule) - Scheduling


### Running

Prerequisites are docker and docker-compose. In repo root directory, run <code>docker-compose up</code>. This will launch node on <code>http://localhost:3000/</code>, and redis in the same container.  


API allows to initialize redis with custom list of validators. Script is located in <code>/src/app/services/init</code>.

### TODO

- FIX BUGS!!!

- Add caching layer to reddis, or at least utilize NestJS default caching.

- Requests/response processing pool might allow increase number of cuncurrent requests

- Configure redis (persistent storage would be nice)