import express, { Application, Request, Response} from 'express';
import 'dotenv/config';
import { sendMail, getHtml } from './config/mail';
import { emailQueue } from './queues/emailQueue';
import Routes from './routes/index';
import cors from "cors";
import { appLimiter } from './config/limiters';
const app: Application = express();
const port = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({
  origin: process.env.CLIENT_APP_URL,
  credentials: true
}));
// routes
app.use(Routes);
app.use(appLimiter);

app.get('/', async (req: Request, res: Response) => {
  return res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
export default app;