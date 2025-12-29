import express from "express";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "./models/user.model.js";
import Quiz from "./models/quiz.model.js";
import { compare } from "bcryptjs";
import { getOtp } from "./config/mail.js";
import { conectDB } from "./config/db.js";
import { isValidObjectId } from "mongoose";
import cookieParser from "cookie-parser";
import Result from "./models/ans.model.js";

const app = express();
dotenv.config();
conectDB();

app.use(express.json());
app.use(cookieParser());
const port = process.env.PORT || 1000;
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "pug");
app.use(express.static("public"));


// middleware////////////////////////////////////////////////////////////////////////////////////////////////////
const authenticateToken = (req, res, next) => {
    const sessionCookieName = Object.keys(req.cookies).find(name =>name.startsWith("session_"));
    if (!sessionCookieName) return res.render("auth", {title: "Authentication",message: "Token expired"});
    const token =  req.cookies[sessionCookieName];
    if (!token) return res.render("auth", {title:"Authentication", message: "Token expired" });
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.render("auth", { title:"Authentication", message: `Invalid Token ${err.message}` });
        req.user = user;
        next();
    });
};
// get routes ////////////////////////////////////////////////////////////////////////////////////////////////////
app.get("/",authenticateToken, async(req,res)=>{
    const semesters = await Quiz.distinct("semester");
    res.render("index",{title:"Home", email: req.user.email, sem:semesters });
});
app.get("/admin",authenticateToken, async (req,res)=>{
    const user = await User.findOne({ email: req.user.email });
    if (user.role !== 'teacher') return res.status(403).render("index", {title: "Home", message: "Access denied. Teachers only." });
    res.render("admin",{title:"Admin",data:false});
});
app.get("/quiz",authenticateToken,(req,res)=>{
    res.render("quiz",{title:"Quiz"});
});
app.get("/resetPassword",(req,res)=>{
    res.render("resetPass",{title:"Reset Password"});
});
app.get("/auth",(req,res)=>{
    res.render("auth",{title:"Authentication"});
});
app.get("/profile",authenticateToken, async (req,res)=>{
    const user = await User.findOne({ email: req.user.email });
    const role = user.role==='teacher'?true:false;
    res.render("profile",{title:"Profile",isTeacher:role,info:req.user});
});
app.get("/semester/:id",authenticateToken, async (req, res) => {
    const quizzes = await Quiz.find({}, { subject: 1 });
    const grouped = {};
    quizzes.forEach(q => {
        if (!grouped[q.subject]) grouped[q.subject] = [];
        grouped[q.subject].push(q);
    });
    try{
        const semester = Number(req.params.id);
        const quiz = await Quiz.find({ semester });
        const semesters = await Quiz.distinct("semester");
        res.render('index',{data:quiz,title:"Home",sem:semesters, email: req.user.email,grouped });
    } catch (err) {res.render("404", { title: "Page not Found" });}
});
app.get("/subject/:id",authenticateToken, async (req, res) => {
    try{
        const user = await User.findOne({ email: req.user.email });
        const role = user.role==='teacher'?true:false;
        const id = req.params.id;  
    	if (!isValidObjectId(id)) return res.json({ success: false, message: "Invalid user Id or quiz removed by teacher" });
        const quiz = await Quiz.findById(id);
        if (quiz)  return res.render('quiz',{data:quiz,title:"Quiz", isTeacher:role });
        res.render("404", { title: "Page not Found" });
    } catch (err) {res.json({ title: "Page not Found" })}
});
app.get("/admin/:id",authenticateToken, async (req,res)=>{
    const quiz = await Quiz.findOne({ _id: req.params.id });
    const user = await User.findOne({ email: quiz.email });
    if (user.role !== 'teacher') return res.json({sucess:false, message: "Access denied. Teachers only." });
    res.render("admin",{data:quiz, success:true});
});
app.get("/history",authenticateToken, async (req, res) => {
    const attempts = await Result.find({ userId: req.user.id })
    .populate("quizId", "semester subject")
    .sort({ createdAt: -1 });
    res.json(attempts);
});

// post routes ////////////////////////////////////////////////////////////////////////////////////////////////////
// quiz & result handlers ////////////////////////////////////////////////////////////////////////////////////////////////////

app.post("/quiz",authenticateToken, async (req,res) => {
    try {
        const user = await User.findOne({ email: req.user.email });
        if (user.role!=='teacher') return res.render("index", {title: "Home", message: "Access denied. Teachers only." });
        const body = Array.isArray(req.body) ? req.body[0] : req.body;
        const questions = [];
        for (let i = 0; i < 10; i++) {
            questions.push({
                questionText: req.body[`q${i}_t`],
                correctIndex: Number(req.body[`q${i}_c`]),
                options: [
                { text: req.body[`q${i}_o0`] },
                { text: req.body[`q${i}_o1`] },
                { text: req.body[`q${i}_o2`] },
                { text: req.body[`q${i}_o3`] }
                ]
            });
        }
        const quiz = new Quiz({email: req.user.email,semester: Number(body.semester),subject: body.subject,questions});
        await quiz.save();
        res.json({ success: true, message: "Quiz saved successfully",id:quiz._id });
    }catch (error) {res.status(500).json({success:false,message:`Server Error: ${error.message}`})};
});
app.post("/quiz/:id",authenticateToken,async (req,res) => {
    const quiz = req.body;
    const id = req.params.id;
    res.json({title:"Update Quiz", data:quiz,id:id, success:true});
});
app.put("/quiz/:id", authenticateToken, async (req, res) => {
    try {
        const user = await User.findOne({ email: req.user.email });
        if (user.role !== "teacher") {return res.status(403).json({success: false,message: "Access denied. Teachers only."})}
        const body = Array.isArray(req.body) ? req.body[0] : req.body;
        const questions = [];
        for (let i = 0; i < 10; i++) {
            questions.push({
                questionText: body[`q${i}_t`],
                correctIndex: Number(body[`q${i}_c`]),
                options: [
                { text: body[`q${i}_o0`] },
                { text: body[`q${i}_o1`] },
                { text: body[`q${i}_o2`] },
                { text: body[`q${i}_o3`] }
                ]
            });
        }
        const updateData = {semester: Number(body.semester),subject: body.subject,questions};
        const updatedQuiz = await Quiz.findByIdAndUpdate(req.params.id,updateData,{ new: true, runValidators: true });
        if (!updatedQuiz) {return res.status(404).json({success: false,message: "Quiz not found."})}
        res.json({success: true,message: "Quiz updated successfully.",data: updatedQuiz});
    } catch (error) {res.status(500).json({success: false,message: `Server Error: ${error.message}`})}
});

app.delete("/quiz/:id",authenticateToken,async (req,res) => {
    const id = req.params.id;
    if (!isValidObjectId(id)) return res.status(404).json({ success: false, message: "Invalid Quiz Id" });
    try {
        const data = await Quiz.findById(id);
        if(!data) return res.status(400).json({ success: false , message: "Quiz not found." })
            const resdata = await Quiz.findByIdAndDelete(id);
        if(resdata) return res.status(200).json({ success: true, message: "Quiz deleted" })
            res.status(200).json({ success: false, message: "Error deleting Quiz!" })
    } catch (error) {res.status(500).json({success:false,message:`Server Error: ${error.message}`})};
});

app.post("/submitAns",authenticateToken,async (req,res)=>{
    try {
        const id = req.body.id;
        const quiz = await Quiz.findById(id);
        if (!quiz) { return res.status(404).json({ success: false, message: "Quiz not found" })}
        const userAnswers = Object.keys(req.body)
        .filter(key => key.startsWith("ans[") || key.startsWith("qsn["))
        .map(key => Number(req.body[key]));
        const correct = quiz.questions.map(q => q.correctIndex);
        let score = 0;
        correct.forEach((c, i) => { if (userAnswers[i] === c) score++; });
        const attempt = new Result({
            userId: req.user?.id,
            quizId: id,
            userAnswers,
            correctAnswers: correct,
            score,
        });    
        await attempt.save();
        const nextQuiz = await Quiz.findOne({
            semester: quiz.semester,
            subject: quiz.subject,
            _id: { $gt: id }
        }).sort({ _id: 1 });    
        const nextQuizId = nextQuiz ? nextQuiz._id : null;
        res.status(200).json({ nextId: nextQuizId, correctAnswers: correct,userAnswers,score});
    } catch (error) {res.status(500).json({success:false,message:`Server Error: ${error.message}`})};  
})   
app.put("/submitAns",authenticateToken,async (req,res)=>{
    try {
        const id = req.body.id;
        const quiz = await Quiz.findById(id);
        if (!quiz) { return res.status(404).json({ success: false, message: "Quiz not found" })}
        const userAnswers = Object.keys(req.body)
        .filter(key => key.startsWith("ans[") || key.startsWith("qsn["))
        .map(key => Number(req.body[key]));
        const correct = quiz.questions.map(q => q.correctIndex);
        let score = 0;
        correct.forEach((c, i) => { if (userAnswers[i] === c) score++; });
        const attempt = new Result({
            userId: req.user?.id,
            quizId: id,
            userAnswers,
            correctAnswers: correct,
            score,
        });    
        await attempt.save();
        const nextQuiz = await Quiz.findOne({
            semester: quiz.semester,
            subject: quiz.subject,
            _id: { $gt: id }
        }).sort({ _id: 1 });    
        const nextQuizId = nextQuiz ? nextQuiz._id : null;
        res.status(200).json({ nextId: nextQuizId, correctAnswers: correct,userAnswers,score});
    } catch (error) {res.status(500).json({success:false,message:`Server Error: ${error.message}`})};  
})    
app.delete("/result/:id",authenticateToken,async (req,res) => {
    const id = req.params.id;
    if (!isValidObjectId(id)) return res.status(404).json({ success: false, message: "Invalid Resilt Id" });
    try {
        const data = await Result.findById(id);
        if(!data) return res.status(400).json({ success: false , message: "Result not found." })
            const resdata = await Result.findByIdAndDelete(id);
        if(resdata) return res.status(200).json({ success: true, message: "Result deleted" })
            res.status(200).json({ success: false, message: "Error deleting Result!" })
    } catch (error) {res.status(500).json({success:false,message:`Server Error: ${error.message}`})};
});

// post routes ////////////////////////////////////////////////////////////////////////////////////////////////////
// auth form handlers ////////////////////////////////////////////////////////////////////////////////////////////////////

app.post("/signUp",async (req,res)=>{
    const {email,password,role} = req.body;
    const existingEmail = await User.findOne({email});
    if (existingEmail) return res.status(400).json({ success:false,message: "Email already in use!" });
    if (!email || !password || !role) return res.render("auth", { success:false,message: "Please provide all fields" });
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({email,password:hashedPassword,role});
    try {
        await newUser.save();
        const token = jwt.sign({ id:newUser._id,email: newUser.email, password: newUser.password }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.cookie(`session_${email.split("@")[0].toLowerCase()}`, token, {
            httpOnly: true,
            secure: false,
            sameSite: 'strict',
            maxAge: 60 * 60 * 24000,
        });
        res.status(200).json({success:true,message:"User created sucessful"});
    } catch (error) {res.status(500).json({success:false,message:`Server Error: ${error.message}`})};
});
app.post("/logIn",async (req,res)=>{
    const { email, password } = req.body;
    try {
        const user = await User.findOne({email});
        if (!user) return res.json({success:false, message: "invalid email" });
        const isMatch = await compare(password, user.password);
        if (!isMatch) { return res.json({success:false, message: "!!!Invalid password!!!" }) }
        const token =  jwt.sign({ id:user._id, email: user.email, password: user.password }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.cookie(`session_${email.split("@")[0].toLowerCase()}`, token, {
            httpOnly: true,
            secure: false,
            sameSite: 'strict',
            maxAge: 60 * 60 * 24000,
        });
        res.status(200).json({success:true,message:"User log-in sucessful"});
    }  catch (error) {res.status(500).json({success:false,message:`Server Error: ${error.message}`})};
});
app.post("/getOtp",async(req,res)=>{
    try {
        const {email} = req.body; 
        const user = await User.findOne({email});
        if(!user) return res.json({success:false,message:'invalid Email.'})
        const newOtp = Math.floor(Math.random() * 900000) + 100000;
        user.otp=newOtp
        getOtp(email,newOtp)
        await user.save();
        res.json({success:true, message:"OTP sent to your mail verify to reset password.",email:email})
    } catch (error) {res.status(200).json({success:false,message:`Server Error: ${error.message}`})};
});
app.post("/verifyOtp",async(req,res)=>{
    try {
        const {otp,reEmail} = req.body;
        const OTP = Number(otp)
        const user = await User.findOne({email:reEmail});
        if(user.otp===OTP){
            user.otp=null;
            res.json({message:"OTP verifyed.",success:true})
        }else{
            res.json({message:"Wrong OTP!",success:false})
        }
    } catch (error) {res.status(500).json({success:false,message:`Server Error: ${error.message}`})}; 
})
app.post("/updatePassword",async(req,res)=>{
    try {
        const {passEmail,newPass} = req.body;
        const user = await User.findOne({email:passEmail});
        const isMatch = await compare(newPass, user.password);
        if(isMatch) return res.json({ success: false, message:"new password must not be same as old.",email:passEmail,resetPass:true})
        const hashedPassword = await bcrypt.hash(newPass, 10);
        user.password=hashedPassword;
        await user.save();
        const token =  jwt.sign({ id:user._id, email: user.email, password: user.password }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.cookie(`session_${passEmail.split("@")[0].toLowerCase()}`, token, {
            httpOnly: true,
            secure: false,
            sameSite: 'strict',
            maxAge: 60 * 60 * 24000,
        });
        res.json({ success: true, message:"password updated sucessfully"});
    } catch (error) {res.status(500).json({success:false,message:`Server Error: ${error.message}`})};
});
app.post("/logout",authenticateToken,(req, res) => {
    try {
        res.clearCookie(`session_${req.user.email.split("@")[0].toLowerCase()}`);
        res.render("auth", {title:"Authentication", message: "Logged out successfully" });
    } catch (error) {res.status(500).json({success:false,message:`Server Error: ${error.message}`})};
});
app.delete("/deleteUser/:id",authenticateToken,async (req,res) => {
    // send mail to user about account deletion and confirm before deletion
    try {
        const { id } = req.params;
        if (!isValidObjectId(id)) return res.status(404).json({ success: false, message: "Invalid user Id" });
        await User.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "user deleted" });
    } catch (error) {res.status(500).json({success:false,message:`Server Error: ${error.message}`})};
});
app.use((req, res) => {res.status(404).render('404',{title:"Page not Found"});});
app.listen(port,()=>console.log(`http://localhost:${port}`))