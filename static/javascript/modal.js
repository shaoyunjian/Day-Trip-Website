"use strict"
// --------------- User Modal  ------------------

const loginModal = document.querySelector("#login-modal")
const registerModal = document.querySelector("#register-modal")
const modal = document.querySelectorAll(".modal")
const modalCloseBtn = document.querySelectorAll(".modal-close-btn")
const loginModalFooter = document.querySelector(".login-modal-footer")
const registerModalFooter = document.querySelector(".register-modal-footer")
const navLoginRegisterBtn = document.querySelector(".nav-login-register-btn")
const popupNotification = document.querySelector("#popup-notification")
const modalMessage = document.querySelector(".modal-message")
const modalContentBtn = document.querySelector(".modal-content-btn")

navLoginRegisterBtn.addEventListener("click", openLoginModal)
loginModalFooter.addEventListener("click", openRegisterModal)
registerModalFooter.addEventListener("click", openLoginModal)

modalCloseBtn.forEach((value) => {
  value.addEventListener("click", () => {
    closeModal()
  })
})

document.addEventListener("click", (event) => {
  if(event.target === loginModal || 
    event.target === registerModal ||
    event.target === popupNotification){
    closeModal()
  }
})


// ------------- Modal function -----------------

function openLoginModal() {
  loginModal.style.display = "block"
  registerModal.style.display = "none"
}

function openRegisterModal() {
  loginModal.style.display = "none"
  registerModal.style.display = "block"
}

function openMessageModal(message, btnMessage){
  popupNotification.style.display = "block"
  modalMessage.innerHTML = message
  modalContentBtn.textContent = btnMessage
  modalContentBtn.addEventListener("click", closeModal)
}

function closeModal() {
  loginModal.style.display = "none"
  registerModal.style.display = "none"
  popupNotification.style.display = "none"
}

// -------------- User data validation ------------

function userDataValidation(name=null, email, password){
  const name_regex = /^.{1,10}$/
  const email_regex = /[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}/
  const password_regex = /^[a-zA-Z0-9]{8,16}$/
  
  if (name){
    if (!name_regex.test(name)) {
      return "invalid name"
    } else if (!email_regex.test(email)) {
      return "invalid email"
    } else if (!password_regex.test(password)) {
      return "invalid password"
    } else {
      return "valid"
    }
  } else {
    if (!email_regex.test(email)) {
      return "invalid email"
    } else if (!password_regex.test(password)) {
      return "invalid password"
    } else {
      return "valid"
    }
  }
}


// ---------------  Register ---------------------- 

const registerBtn = document.querySelector(".register-btn")
const inputRegisterName = document.querySelector("#input-register-name")
const inputRegisterEmail = document.querySelector("#input-register-email")
const inputRegisterPassword = document.querySelector("#input-register-password")
const registerModalStatus = document.querySelector("#register-modal-status")

registerBtn.addEventListener("click", () => {
  const url = "/api/user"
  const inputRegisterNameValue = inputRegisterName.value.trim()
  const inputRegisterEmailValue = inputRegisterEmail.value.trim()
  const inputRegisterPasswordValue = inputRegisterPassword.value.trim()
  const registerValidationResult = userDataValidation(inputRegisterNameValue, inputRegisterEmailValue, inputRegisterPasswordValue)

  // register validation
  if (!inputRegisterNameValue || !inputRegisterEmailValue || !inputRegisterPasswordValue){
    registerModalStatus.innerHTML = `
      <div class="status-description">請不要有空白</div>`
  } else if (registerValidationResult === "invalid name") {
    registerModalStatus.innerHTML = `
      <div class="status-description">姓名請輸入1~10個字元</div>`
  } else if (registerValidationResult === "invalid email") {
    registerModalStatus.innerHTML = `
      <div class="status-description">電子郵件不符合格式</div>`
  } else if (registerValidationResult === "invalid password") {
    registerModalStatus.innerHTML = `
      <div class="status-description">密碼請輸入8至16個字母或數字</div>`
  } else {
    register()
  }

  async function register() {
    const response = await fetch(url, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        name: inputRegisterNameValue,
        email: inputRegisterEmailValue,
        password: inputRegisterPasswordValue
      })
    })
    
    const jsonData = await response.json()

    if (jsonData.message === "email already exists"){
      registerModalStatus.innerHTML = `
      <div class="status-description">電子信箱已註冊</div>`
    } else if(jsonData.ok === true){
      registerModalStatus.innerHTML = `
      <div class="status-description">註冊成功</div>`
      registerModalFooter.innerHTML = "點此登入"
      inputRegisterName.value = ""
      inputRegisterEmail.value = ""
      inputRegisterPassword.value= ""
    } else {
      console.log("error")
    }
  }
})


// ------------------- Login ----------------------

const loginBtn = document.querySelector(".login-btn")
const inputLoginEmail = document.querySelector("#input-login-email")
const inputLoginPassword = document.querySelector("#input-login-password")
const loginModalStatus = document.querySelector("#login-modal-status")

loginBtn.addEventListener("click", () => {
  const inputLoginEmailValue = inputLoginEmail.value
  const inputLoginPasswordValue = inputLoginPassword.value
  const loginValidationResult = userDataValidation(null, inputLoginEmailValue, inputLoginPasswordValue)

  if (!inputLoginEmailValue || !inputLoginPasswordValue) {
    loginModalStatus.innerHTML = `
      <div class="status-description">請不要空白</div>`
  } else if (loginValidationResult === "invalid email") {
    loginModalStatus.innerHTML = `
      <div class="status-description">電子郵件不符合格式</div>`
  } else if (loginValidationResult === "invalid password") {
    loginModalStatus.innerHTML = `
      <div class="status-description">密碼請輸入8至16個字母或數字</div>`
  } else {
    login()
  }
  
  
  async function login() {
    const response = await fetch("/api/user/auth", {
      method: "PUT",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        email: inputLoginEmailValue,
        password: inputLoginPasswordValue
      })
    })

    const jsonData = await response.json()
    if (jsonData.ok) {
     window.location = window.location.href
    } else {
      loginModalStatus.innerHTML = `
      <div class="status-description">電子郵件或密碼輸入錯誤</div>`
    }
  }
})


// ----------- Load and check login status---------

const navLoginLogoutBtn = document.querySelector(".nav-login-logout-btn")
let isLoggedIn = false
let userEmail = ""

window.addEventListener("DOMContentLoaded", checkLoginStatus)

async function checkLoginStatus() {
  const response = await fetch("/api/user/auth", {
    method: "GET",
    headers: {"Content-Type": "application/json"}
  })
  const jsonData = await response.json()

  if(jsonData.data){
    navLoginRegisterBtn.style.display="none"
    logoutBtn.style.display="block"
    isLoggedIn = true
    userEmail = jsonData.data.email
  } else {
    isLoggedIn = false
  }
}

// ------------------ Logout ---------------------

const logoutBtn = document.querySelector(".logout-btn")

logoutBtn.addEventListener("click", (event) => {
  event.preventDefault()
  const url = "/api/user/auth"

  logout()
  async function logout(){
    const response = await fetch(url, {
      method: "DELETE",
      headers: {"Content-Type": "application/json"}
    })
    const jsonData = await response.json()
    window.location = window.location.href
  }
})

// ---------------- Itinerary booking--------------
const bookingCartBtn = document.querySelector(".booking-cart-btn")

bookingCartBtn.addEventListener("click", () => {
  checkLoginStatus()
  if (isLoggedIn){
      window.location = "/booking"
  } else {
    openLoginModal()
  }
})
