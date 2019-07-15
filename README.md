# Coris API (Microservices)

Set of microservices to cache data for Coris Blockchain Explorer.

### Features

- Docker image is based on Alpine and Node 12

- Build in NodeJS

- Utilize Redis as storage service.

### Running

First you need docker and docker-compose to be installed. 

Configuire rpc in <code>/services/validators/lib.js</code> to point to your giaia light client endpoint. For example, if you run service on same host as the client, your config might look as following:

```javascript
const MAX_CONCUR = 15;
const RPC_URL = 'localhost';
const RPC_PORT = 1317;
```

In the other case, you host actua url and port. 

Data from redis is available at the following endpoints:

- <code>localhost:3000/api/validators</code>

### Turn of redis persistence

Using redis-cli:

```bash
$ redis-cli

$ config set save ""
```