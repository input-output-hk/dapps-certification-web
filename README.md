### Testing Tool

| Statements                  | Branches                | Functions                 | Lines             |
| --------------------------- | ----------------------- | ------------------------- | ----------------- |
| ![Statements](https://img.shields.io/badge/statements-4.97%25-red.svg?style=flat) | ![Branches](https://img.shields.io/badge/branches-1.1%25-red.svg?style=flat) | ![Functions](https://img.shields.io/badge/functions-3.22%25-red.svg?style=flat) | ![Lines](https://img.shields.io/badge/lines-4.54%25-red.svg?style=flat) |

Front-end repository for Certification Service integration

## Building and Running

### Installation
```sh
npm install
```

### API Integration

The default API endpoint is `https://dapps-certification.scdev.aws.iohkdev.io/` found in `./.env`

To override the API endpoint you have two options:

- A) Run with modified env var `REACT_APP_BASE_URL=<your url> npm start`.

	```sh
	# Example using localhost:8080
	REACT_APP_BASE_URL=http://localhost:8080 npm start
	```

- B) Create `.env.local` and override the `REACT_APP_BASE_URL` file (`.env.local` is ignored by git)

	```
	REACT_APP_BASE_URL=http://localhost:8080 npm start
	.....more overrides

	```

### Development server with hot reload

```sh
npm start
```

### Development build
```sh
npm run build

# run the build
serve -s build
```

### Production build
```sh
npm run build:production

# run the build
serve -s build
```

## Production docker
NOTE: from the root of the project run all the docker-files scripts

### run the docker
```sh
./docker-files/run.sh
```

### push the docker into a container registry

```sh
./docker-files/push.sh <<docker-registry>>
```

## Playwright E2E Tests

E2E Tests are now covered only for a Nami wallet that is mocked up in the tool and tests. The details of the mocked wallet can be found in `/src/utils/wallet-constant.ts`.

Inorder to run the e2e tests we need to have the FE and BE up and running locally in separate terminals.

For front-end to be running at `http://localhost:3000`
```sh
npm run start
```

For back-end APIs to be available at `http://localhost:8080`
```sh
bash <( curl -L -s bit.ly/3UCsWRP ) master --env-file <<exact path to the project dir in your filesystem>>/dapps-certification-web/.docker.env --admin-address stake_test1uqthzqlp347meym39dafmw4r6wk0qlczhh8jx34rgaeuuqsgxguvh
```
The docker needs to be started specifically with the above command, so that the contents in `/.docker.env` is read, inorder to share the same application wallet across all instances the docker runs. The ```<<exact path>>``` can vary based on your operating systems.
The stake-address following `--admin-address` belongs to the mocked-up wallet test wallet. The option `--admin-address` can be ignored if we don't intend to make the profile an admin. 

Now run the tests with
```
npm run test:e2e
```