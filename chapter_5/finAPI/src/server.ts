import createConnection from './database';
import { app } from './app';

createConnection().then(() => {
  app.listen(3333, () => { console.log('Server is running') });
})

