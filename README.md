### Testing Tool

| Statements                  | Branches                | Functions                 | Lines             |
| --------------------------- | ----------------------- | ------------------------- | ----------------- |
| ![Statements](#statements#) | ![Branches](#branches#) | ![Functions](#functions#) | ![Lines](#lines#) |

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

