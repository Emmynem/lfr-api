# law-firm-api

### `Running in development mode`

In order to run the app in development mode for pm2 cluster, do the following:

- Open 2 node terminals
- On the first one, run `npm run pm2-all-cluster-dev`
- On the second one, run `npm run watch:pm2` 
- That's all, it'll clean the dist folder and create a new one and also when any changes occur in the system it'll 
stop the current instance(s), clean the dist folder again, create a new one and reload the instance(s). 

### `Running in production mode`

In order to run the app in production mode for pm2 cluster, do the following:

- Run new build and zip the app, dist-app, env, .gitignore, .npmrc, credentials.json, package.json, package-lock.json, README.md and token.json
- Select from the list of package scripts and run `pm2-all-cluster` or `pm2-all-cluster-max` (for max cores)
- That's all. 

> npx kill-port `<port number here>`
> On new files upload, no need to run the scripts again, it'll auto reload when it detects changes.

## Available Scripts

The following scripts are available in the `package.json`:

- **`start`**: Runs the application in production mode.
- **`build`**: Cleans the `dist-app` directory and transpiles the source code.
- **`server`**: Starts the server from the transpiled code.
- **`dev`**: Runs the application in development mode, including building and starting the server.
- **`prod`**: Builds the application and starts the server in production mode.
- **`transpile`**: Transpiles the source code using Babel.
- **`clean`**: Removes the `dist-app` directory.
- **`watch:dev`**: Starts the application in development mode with file watching using `nodemon`.
- **`test`**: Placeholder for running tests (currently not implemented).

## Getting Started

To get started, clone the repository and install the dependencies:

```bash
git clone <repository-url>
cd drippo-lifestyle-api
npm install
```

### Development

To run the application in development mode:

```bash
npm run dev
```

### Production

To build and run the application in production mode:

```bash
npm run prod
```

### Cleaning and Building

To clean the build directory and transpile the source code:

```bash
npm run build
```

### Watching for Changes

To start the application in development mode with file watching:

```bash
npm run watch:dev
```


