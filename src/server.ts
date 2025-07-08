import app from "./app"
import dotenv from 'dotenv';

dotenv.config()


const port: number = parseInt(process.env.PORT || '3000', 10);
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});