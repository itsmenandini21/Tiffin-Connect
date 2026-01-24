import "./UserLogin.css";
function UserLogin(props){
    return (
        <div className="UserLogin">
            <h2>Login</h2>
            <div className="inputBox">
                <i className="fa-solid fa-envelope icon"></i>
                <input type="email" name="email" placeholder="Enter a valid email id"></input>
            </div>
            <div className="inputBox">
                <i className="fa-solid fa-lock icon"></i>
                <input type="password" name="password" placeholder="Enter your password" />
            </div>
            <button className="Login">Login</button>
            <p className="registerText">Don't have an account?
                <span onClick={props.switch}> Sign In</span>
            </p>
        </div>
    )
}
export default UserLogin;