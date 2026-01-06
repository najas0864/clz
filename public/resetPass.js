document.addEventListener('DOMContentLoaded',()=>{
    const passToggles = document.querySelector('.tog');
    passToggles.addEventListener('click', (e) => {
    const passwordInput = e.target.parentElement.nextElementSibling;
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        passToggles.innerHTML='Hide';
    } else {
        passwordInput.type = 'password';
        passToggles.innerHTML='Show';
    }
    });
    function showMsg(success, message) {
    let popUp = document.createElement("span");
    popUp.innerText=message;
    popUp.classList.add("message");
    setTimeout(() => { popUp.remove() }, 3000);
    (!success)? document.body.append(popUp):window.location.href = "/index";
    }
    let existingEmail = document.getElementById("existingEmail");
    let passEmail = document.getElementById("passEmail");
    let reEmail = document.getElementById("reEmail");
    let getOtpBtn = document.getElementById("getOtp");

    let newPass = document.getElementById("newPass");
    newPass.readOnly = true;
    let verifyOtpBtn = document.getElementById("verifyOtp");
    verifyOtpBtn.style="display:none;";
    let rePassBtn = document.getElementById("resetPass");
    rePassBtn.style="display:none;";
    let otp = document.getElementById("otp");
    otp.readOnly = true;
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,12}$/;

    document.forms.getOtp.addEventListener("submit", async (e) => {
    e.preventDefault();
    getOtpBtn.style = "pointer-events:none;background-color:darkgray;";
    const formData = new FormData(e.target);
    const entries = Object.fromEntries(formData.entries());
    const res = await fetch('/getOtp',{method: "POST",headers: {'Content-Type': 'application/json'},body:JSON.stringify(entries)});
    const logResult = await res.json();
    const {success,message,email} = logResult;
    if(success){
        otp.focus();
        existingEmail.value=email;
        existingEmail.readOnly = true;
        otp.readOnly = false;
        reEmail.value=email;
        passEmail.value=email;
        verifyOtpBtn.style="display:block;";
        getOtpBtn.style="display:none;";
        showMsg(false, message)
    }else{
        getOtpBtn.disabled = false;
        showMsg(success, message)
    }
    });
    document.forms.verifyOtp.addEventListener("submit", async (e) => {
    e.preventDefault();
    verifyOtpBtn.style = "pointer-events:none;background-color:darkgray;";
    const formData = new FormData(e.target);
    const entries = Object.fromEntries(formData.entries());
    const res = await fetch('/verifyOtp',{method: "POST",headers: {'Content-Type': 'application/json'},body:JSON.stringify(entries)});
    const logResult = await res.json();
    const {message,success} = logResult;
    verifyOtpBtn.disabled = true;
    if(success){
        rePassBtn.style="display:block;";
        otp.readOnly = true;
        newPass.readOnly = false;
        verifyOtpBtn.style="display:none;";
        showMsg(false, message);
    }else{
        verifyOtpBtn.disabled = false;
        showMsg(success, message);
    }
    });
    document.forms.updatePass.addEventListener("submit", async (e) => {
    e.preventDefault();
    rePassBtn.style = "pointer-events:none;background-color:darkgray;";
    if (!passwordRegex.test(newPass.value.trim())) {
        showMsg(false, "Enter a valid password\nPassword must be\n-> 6-12 chars\n-> 1 uppercase\n -> 1 number\n -> 1 special char");
        return;
    }
    const formData = new FormData(e.target);
    const entries = Object.fromEntries(formData.entries());
    const res = await fetch('/updatePassword',{method: "POST",headers: {'Content-Type': 'application/json'},body:JSON.stringify(entries)});
    const logResult = await res.json();
    const {message,success} = logResult;
    rePassBtn.disabled = true;
    if(success){
        rePassBtn.type="button";
        document.forms.updatePass.reset();
        newPass.readOnly = true;
        showMsg(success, message);
    }else{
        rePassBtn.disabled = false;
        showMsg(success, message);
    }
    });
})