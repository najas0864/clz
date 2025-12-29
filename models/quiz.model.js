import { model, Schema } from "mongoose";

const subjects = [
  "Mathematics-I",
  "Society and Technology",
  "Digital Logic",
  "English I",
  "Computer Fundamentals & Applications",

  "Mathematics-II",
  "C Programming",
  "Financial Accounting",
  "English II",
  "Microprocessor and Computer Architecture",

  "Data Structures and Algorithms",
  "Probability and Statistics",
  "System Analysis and Design",
  "OOP in Java",
  "Web Technology",

  "Operating System",
  "Numerical Methods",
  "Software Engineering",
  "Scripting Language",
  "Database Management System",

  "MIS and E-Business",
  "DotNet Technology",
  "Computer Networking",
  "Introduction to Management",
  "Computer Graphics and Animation",

  "Mobile Programming",
  "Distributed System",
  "Applied Economics",
  "Advanced Java Programming",
  "Network Programming",

  "Cyber Law and Professional Ethics",
  "Cloud Computing",
  "Internship",
  "Elective I",
  "Elective II",

  "Operational Research",
  "Elective III",
  "Elective IV",
];
const optionSchema = new Schema({
  text: { type: String, required: true }
});
const questionSchema = new Schema({
  questionText: { type: String, required: true },
  options: {type: [optionSchema],validate: v => v.length === 4},
  correctIndex: {type: Number,required: true,min: 1,max: 4}
});
const quizSchema = new Schema({
    email: { type: String, required: true },
    semester: { type: Number, required: true },
    subject: { type: String, enum: subjects, required: true },
    questions: {type: [questionSchema],validate: v => v.length === 10}
  },{ timestamps: true }
);
const Quiz = model("Quiz", quizSchema);
export default Quiz;