import UserRegister from "./User/Register/UserRegister";
import UserLogin from "./User/Login/UserLogin";
import { useState } from "react";
function App(){
   const [showLogin,setLogin]=useState(true);
   function switchToRegister(){
      setLogin(false)
   }
   function switchToLogin(){
      setLogin(true);
   }
   return <>
   {showLogin ? <UserLogin switch={switchToRegister} />: <UserRegister switch={switchToLogin} />}
   </>

}
export default App;