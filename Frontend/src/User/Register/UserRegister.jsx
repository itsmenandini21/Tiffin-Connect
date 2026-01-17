import "./UserRegister.css"
function UserRegister(){
    return (
        <div className="UserReg">
            <h2>Register here</h2>
            <div className="inputBox">
                <i className="fa-solid fa-user icon"></i>
                <input type="text" name="name" placeholder="Enter your name" />
            </div>
            <div className="inputBox">
                <i className="fa-solid fa-envelope icon"></i>
                <input type="email" name="email" placeholder="Enter a valid email id"></input>
            </div>
            <div className="inputBox">
                <i className="fa-solid fa-lock icon"></i>
                <input type="password" name="password" placeholder="Enter your password" />
            </div>
            <div className="inputBox">
                <i className="fa-solid fa-lock icon"></i>
                <input type="password" name="confirmPassword" placeholder="Confirm your password" />
            </div>
            <button className="signIn">Create Account</button>
        </div>
    )
}
export default UserRegister