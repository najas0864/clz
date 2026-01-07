    // document.addEventListener('DOMContentLoaded',()=>{
    //     const passToggles = document.querySelector('.tog');
    //     passToggles.addEventListener('click', (e) => {
    //         const passwordInput = e.target.parentElement.nextElementSibling;
    //         if (passwordInput.type === 'password') {
    //             passwordInput.type = 'text';
    //             passToggles.innerHTML='Hide';
    //         } else {
    //             passwordInput.type = 'password';
    //             passToggles.innerHTML='Show';
    //         }
    //     });
    //     function showMsg(success, message) {
    //         let popUp = document.createElement("span");
    //         popUp.innerText=message;
    //         popUp.classList.add("message");
    //         setTimeout(() => { popUp.remove() }, 3000);
    //         (!success)? document.body.append(popUp):window.location.href = "/index";
    //     }
    //     let existingEmail = document.getElementById("existingEmail");
    //     let passEmail = document.getElementById("passEmail");
    //     let reEmail = document.getElementById("reEmail");
    //     let getOtpBtn = document.getElementById("getOtp");

    //     let newPass = document.getElementById("newPass");
    //     newPass.readOnly = true;
    //     let verifyOtpBtn = document.getElementById("verifyOtp");
    //     verifyOtpBtn.style="display:none;";
    //     let rePassBtn = document.getElementById("resetPass");
    //     rePassBtn.style="display:none;";
    //     let otp = document.getElementById("otp");
    //     otp.readOnly = true;
    //     const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,12}$/;

    //     document.forms.getOtp.addEventListener("submit", async (e) => {
    //         e.preventDefault();
    //         getOtpBtn.style = "pointer-events:none;background-color:darkgray;";
    //         const formData = new FormData(e.target);
    //         const entries = Object.fromEntries(formData.entries());
    //         const res = await fetch('/getOtp',{method: "POST",headers: {'Content-Type': 'application/json'},body:JSON.stringify(entries)});
    //         const logResult = await res.json();
    //         const {success,message,email} = logResult;
    //         if(success){
    //             otp.focus();
    //             existingEmail.value=email;
    //             existingEmail.readOnly = true;
    //             otp.readOnly = false;
    //             reEmail.value=email;
    //             passEmail.value=email;
    //             verifyOtpBtn.style="display:block;";
    //             getOtpBtn.style="display:none;";
    //             showMsg(false, message)
    //         }else{
    //             getOtpBtn.disabled = false;
    //             showMsg(success, message)
    //         }
    //     });
    //     document.forms.verifyOtp.addEventListener("submit", async (e) => {
    //         e.preventDefault();
    //         verifyOtpBtn.style = "pointer-events:none;background-color:darkgray;";
    //         const formData = new FormData(e.target);
    //         const entries = Object.fromEntries(formData.entries());
    //         const res = await fetch('/verifyOtp',{method: "POST",headers: {'Content-Type': 'application/json'},body:JSON.stringify(entries)});
    //         const logResult = await res.json();
    //         const {message,success} = logResult;
    //         verifyOtpBtn.disabled = true;
    //         if(success){
    //             rePassBtn.style="display:block;";
    //             otp.readOnly = true;
    //             newPass.readOnly = false;
    //             verifyOtpBtn.style="display:none;";
    //             showMsg(false, message);
    //         }else{
    //             verifyOtpBtn.disabled = false;
    //             showMsg(success, message);
    //         }
    //     });
    //     document.forms.updatePass.addEventListener("submit", async (e) => {
    //         e.preventDefault();
    //         rePassBtn.style = "pointer-events:none;background-color:darkgray;";
    //         if (!passwordRegex.test(newPass.value.trim()))return showMsg(false, "Enter a valid password\nPassword must be\n-> 6-12 chars\n-> 1 uppercase\n -> 1 number\n -> 1 special char");
    //         const formData = new FormData(e.target);
    //         const entries = Object.fromEntries(formData.entries());
    //         const res = await fetch('/updatePassword',{method: "POST",headers: {'Content-Type': 'application/json'},body:JSON.stringify(entries)});
    //         const logResult = await res.json();
    //         const {message,success} = logResult;
    //         rePassBtn.disabled = true;
    //         if(success){
    //             rePassBtn.type="button";
    //             document.forms.updatePass.reset();
    //             newPass.readOnly = true;
    //             showMsg(success, message);
    //         }else{
    //             rePassBtn.disabled = false;
    //             showMsg(success, message);
    //         }
    //     });
    // })
    document.addEventListener("DOMContentLoaded", () => {
    const existingEmail = document.getElementById("existingEmail");
    const otp = document.getElementById("otp");
    const reEmail = document.getElementById("reEmail");
    const passEmail = document.getElementById("passEmail");
    const newPass = document.getElementById("newPass");
    const getOtpBtn = document.getElementById("getOtp");
    const verifyOtpBtn = document.getElementById("verifyOtp");
    const rePassBtn = document.getElementById("resetPass");
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,12}$/;

    const formState = JSON.parse(localStorage.getItem("resetFormState") || "{}");
    verifyOtpBtn.style.display = "none";
    rePassBtn.style.display = "none";
    newPass.readOnly = formState.otpReadOnly==true ? false : true;
    otp.readOnly = true;

    function showMsg(success, message) {
        const popUp = document.createElement("span");
        popUp.innerText = message;
        popUp.classList.add("message");
        setTimeout(() => popUp.remove(), 3000);
        (!success) ?document.body.append(popUp): window.location.href = "/index";
    }
    const passToggle = document.querySelector(".tog");
    passToggle.addEventListener("click", () => {
        if (newPass.type === "password") {
            newPass.type = "text";
            passToggle.innerText = "Hide";
        } else {
            newPass.type = "password";
            passToggle.innerText = "Show";
        }
    });
    if (formState.email) {
        existingEmail.value = formState.email;
        existingEmail.readOnly = formState.existingEmailReadOnly || false;
        otp.value = formState.otp || "";
        otp.readOnly = formState.otpReadOnly ?? true;
        verifyOtpBtn.style.display = formState.verifyOtpBtnDisplay || "none";
        getOtpBtn.style.display = formState.getOtpBtnDisplay || "block";
        reEmail.value = formState.email;
        passEmail.value = formState.email;
        rePassBtn.style.display = formState.rePassBtnDisplay || "none";
    }
    function persist() {
        const state = {
            email: existingEmail.value,
            existingEmailReadOnly: existingEmail.readOnly,
            otp: otp.value,
            otpReadOnly: otp.readOnly,
            getOtpBtnDisplay: getOtpBtn.style.display,
            verifyOtpBtnDisplay: verifyOtpBtn.style.display,
            rePassBtnDisplay: rePassBtn.style.display,
        };
        localStorage.setItem("resetFormState", JSON.stringify(state));
    }
    existingEmail.addEventListener("input", persist);
    otp.addEventListener("input", persist);
    document.forms.getOtp.addEventListener("submit", async (e) => {
        e.preventDefault();
        getOtpBtn.style.pointerEvents = "none";
        getOtpBtn.style.backgroundColor = "darkgray";
        const data = Object.fromEntries(new FormData(e.target).entries());
        const res = await fetch("/getOtp", {method: "POST",headers: { "Content-Type": "application/json" },body: JSON.stringify(data),});
        const { success, message, email } = await res.json();
        if (success) {
            existingEmail.value = email;
            existingEmail.readOnly = true;
            otp.readOnly = false;
            reEmail.value = email;
            passEmail.value = email;
            verifyOtpBtn.style.display = "block";
            getOtpBtn.style.display = "none";
            persist();
            otp.focus();
            showMsg(false, message);
        } else {
            getOtpBtn.disabled = false;
            showMsg(success, message);
        }
    });
    document.forms.verifyOtp.addEventListener("submit", async (e) => {
        e.preventDefault();
        verifyOtpBtn.style.pointerEvents = "none";
        verifyOtpBtn.style.backgroundColor = "darkgray";
        verifyOtpBtn.disabled = true;
        const data = Object.fromEntries(new FormData(e.target).entries());
        const res = await fetch("/verifyOtp", {method: "POST",headers: { "Content-Type": "application/json" },body: JSON.stringify(data),});
        const { success, message } = await res.json();
        if (success) {
            otp.readOnly = true;
            newPass.readOnly = false;
            verifyOtpBtn.style.display = "none";
            rePassBtn.style.display = "block";
            persist();
            showMsg(false, message);
        } else {
            verifyOtpBtn.disabled = false;
            showMsg(success, message);
        }
    });
    document.forms.updatePass.addEventListener("submit", async (e) => {
        e.preventDefault();
        rePassBtn.style.pointerEvents = "none";
        rePassBtn.style.backgroundColor = "darkgray";
        rePassBtn.disabled = true;
        if (!passwordRegex.test(newPass.value.trim())) {
            rePassBtn.disabled = false;
            return showMsg(
                false,
                "Enter a valid password\nPassword must be\n-> 6-12 chars\n-> 1 uppercase\n-> 1 number\n-> 1 special char"
            );
        }
        const data = Object.fromEntries(new FormData(e.target).entries());
        const res = await fetch("/updatePassword", {method: "POST",headers: { "Content-Type": "application/json" },body: JSON.stringify(data),});
        const { success, message } = await res.json();
        if (success) {
            newPass.readOnly = true;
            document.forms.updatePass.reset();
            localStorage.removeItem("resetFormState");
            showMsg(success, message);
        } else {
            rePassBtn.style.pointerEvents = "all";
            rePassBtn.disabled = false;
            showMsg(success, message);
        }
    });
});