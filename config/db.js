import { connect } from "mongoose";

export const conectDB = async () => {
    try {
        await connect(process.env.MONGO_URL);
    } catch (err) {
        console.log(err.message);
        process.exit(1);
    }
}