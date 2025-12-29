import { model, Schema } from "mongoose";

const resultsSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    quizId: { type: Schema.Types.ObjectId, ref: "Quiz", required: true },
    userAnswers: [Number],
    correctAnswers: [Number],
    score: Number,
    createdAt: { type: Date, default: Date.now }
});
const Result  = model("results", resultsSchema);
export default Result;