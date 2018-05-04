import { Application } from 'express';
import App from '../app';

const port: number = Number(process.env.PORT) || 3000;
const app: Application = App; // new App().app;

app.listen(port, () => console.log(`Express server listening at ${port}`));
app.on('error', err => console.error(err));
