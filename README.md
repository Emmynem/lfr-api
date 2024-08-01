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
