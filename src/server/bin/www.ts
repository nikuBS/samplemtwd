import process from 'process';
import https from 'https';
import fs from 'fs';
import { Application } from 'express';
import App from '../app';

const port: number = Number(process.env.PORT) || 3000;
const app: Application = App; // new App().app;

const certOptions = {
  key: fs.readFileSync(process.cwd() + '/src/server/config/cert/key.pem'),
  cert: fs.readFileSync(process.cwd() + '/src/server/config/cert/cert.pem')
};

// https options
// https.createServer(certOptions, app).listen(port, () => {
//   console.log('Https server listening on port ' + port);
// });
app.listen(port, () => console.log(`Express server listening at ${port}`));
app.on('error', err => console.error(err));
