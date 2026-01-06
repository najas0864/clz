document.addEventListener("DOMContentLoaded", ()=>{
  let email = document.forms.login.email;
  let lPass = document.forms.login.password;
  let rEmail = document.forms.register.newemail;
  let rPass = document.forms.register.newPassword;
  let formContainer = document.querySelector(".formContainer");
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,12}$/;

  document.onclick = (e) => e.target.classList.contains("myPop")?document.querySelector(".myPop").classList.remove("active"):null;
  document.querySelectorAll("#links").forEach(link => link.addEventListener("click", (e) => {
    e.preventDefault();
    link.getAttribute("href") === "#register"?formContainer.style.transform = "translateX(-50%)":formContainer.style.transform = "translateX(0)";
  }));

  /////////alert msg pop up function/////////
  function showMsg(success, message) {
    let popUp = document.createElement("span")
    popUp.innerText=message;
    popUp.classList.add("message");
    setTimeout(() => { popUp.remove() }, 3000);
    (!success)? document.body.append(popUp):window.location.href = "/index";
  }

  document.forms.login.addEventListener("submit", async (e)=>{
    e.preventDefault();
    document.getElementById('logInBtn').style = "pointer-events:none;background-color:darkgray;";
    if(!email||!lPass){ return showMsg(false, "All fields are required")}
    const formData = new FormData(e.target);
    const entries = Object.fromEntries(formData.entries());
    const res = await fetch('/logIn',{method: "POST",headers: {'Content-Type': 'application/json'},body:JSON.stringify(entries)});
    const logResult = await res.json();
    const {success,message} = logResult;
    showMsg(success, message);
  })
  document.forms.register.addEventListener("submit", async (e)=>{
    e.preventDefault();
    document.getElementById('regBtn').style = "pointer-events:none;background-color:darkgray;";
    if(!rEmail||!rPass){ return showMsg(false, "All fields are required")}
    if (!emailRegex.test(rEmail.value.trim())) {return showMsg(false, "Enter a valid email")}
    if (!passwordRegex.test(rPass.value.trim())) {return showMsg(false, "Enter a valid password\nPassword must be\n-> 6-12 chars\n-> 1 uppercase\n -> 1 number\n -> 1 special char")}
    const formData = new FormData(e.target);
    const entries = Object.fromEntries(formData.entries());
    const res = await fetch('/signUp',{method: "POST",headers: {'Content-Type': 'application/json'},body:JSON.stringify(entries)});
    const logResult = await res.json();
    const {success,message} = logResult;
    showMsg(success, message);
  })
});