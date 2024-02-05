### Testing Tool

![Coverage](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/MishaKav/5e90d640f8c212ab7bbac38f72323f80/raw/jest-coverage-comment__main.json)
![License](https://img.shields.io/github/license/MishaKav/jest-coverage-comment)
![Version](https://img.shields.io/github/package-json/v/MishaKav/jest-coverage-comment)

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

