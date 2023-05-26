
import '../styles/UserAuthentication.css';

import { useState, useEffect} from "react";
import { fetchServer } from '../js/evaluation.js';
import { getFromChromeStorage, storeOnChromeStorage } from "../js/utils/chromeUtils.js";
import Button from "./reusables/Button";




export default function UserAuthentication ({authenticationState, setAuthenticationState, btnIsLoading}:any): JSX.Element {

    useEffect( ()=>{

        (async ()=>{
        
            const storedValue = await getFromChromeStorage("authenticationState", true);

            if(storedValue){
                setAuthenticationState(storedValue);
            }else{
                storeOnChromeStorage("authenticationState", "notLogged", true);
            }
        
        })();
        
    }, [setAuthenticationState]);

    const onLogoutHandler = () => {
        storeOnChromeStorage("authenticationState", "notLogged", true);
        setAuthenticationState("notLogged");
    }
  
    return ( <div className="authentication_section">
  
      {authenticationState === "notLogged" ? <>
      
        <Button 
            classList={"primary"} 
            onClickHandler={() => setAuthenticationState("logging")} 
            innerText={"Login"}
            isLoading={btnIsLoading}    
        />
        <Button 
            classList={"secondary spaced"} 
            onClickHandler={() => setAuthenticationState("registering")} 
            innerText={"Register"}
            isLoading={btnIsLoading}    
        />
      
      </> : authenticationState === "logging" ? 
  
        <LoginForm setAuthState={setAuthenticationState} />
      
      : authenticationState === "registering" ? 
  
        <RegisterForm setAuthState={setAuthenticationState} />
    
      : <>
      
        <label className='userNameLabel'>{"@" + authenticationState}</label>
        <Button 
            classList={"secondary"} 
            onClickHandler={onLogoutHandler} 
            innerText={"Logout"}
            isLoading={btnIsLoading}    
        />
  
      </> }
      
  
    </div> );
}



function LoginForm({setAuthState}:any) {

    const [btnIsLoading, setBtnIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async () => {

        setBtnIsLoading(true);

        if(email === "" || password === ""){
            alert("You must fill all input fields!!");
            setBtnIsLoading(false);
            return;
        }

        const bodyData:any = JSON.stringify({email, username: null, password});

        try{

            const loginResult:any = await fetchServer(bodyData, "userAuthentication");

            if(loginResult.success){
                storeOnChromeStorage("authenticationState", loginResult.username, true);
                setAuthState(loginResult.username);
            } else {
                window.alert(loginResult.error);
            }

        }catch(error){
            console.log(error);
        }finally{
            setBtnIsLoading(false);
        }

    };

  return (
    <div className='form'>
        <h2>Login</h2>
        <div className='field'>
            <label htmlFor="email">Email:</label>
            <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className='field'>
            <label htmlFor="password">Password:</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <FormButtons authState={"logging"} setAuthState={setAuthState} submitHandler={handleSubmit} btnIsLoading={btnIsLoading}/>
    </div>
  );
}




function RegisterForm({setAuthState}:any) {

    const [btnIsLoading, setBtnIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');

    const handleSubmit = async () => {

        setBtnIsLoading(true);

        if(password !== repeatPassword){
            alert("Passwords do not match!!");
            setBtnIsLoading(false);
            return;
        } else if(email === "" || username === "" || password === ""){
            alert("You must fill all input fields!!");
            setBtnIsLoading(false);
            return;
        }

        const bodyData:any = JSON.stringify({email, username, password});

        try{

            const registerResult:any = await fetchServer(bodyData, "userAuthentication");

            if(registerResult.success){
                window.alert("Successfully registered");
                setAuthState("logging");
            } else {
                window.alert("User already exists!!");
            }

        }catch(error){
            console.log(error);
        }finally{
            setBtnIsLoading(false);
        }

    };

    return (
        <div className='form'>
            <h2>Register</h2>
            <div className='field'>
                <label htmlFor="email">Email:</label>
                <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className='field'>
                <label htmlFor="username">Username:</label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div className='field'>
                <label htmlFor="password">Password:</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className='field'>
                <label htmlFor="repeatPassword">Repeat password:</label>
                <input type="password" value={repeatPassword} onChange={(e) => setRepeatPassword(e.target.value)} />
            </div>
            <FormButtons authState={"registering"} setAuthState={setAuthState} submitHandler={handleSubmit} btnIsLoading={btnIsLoading}/>
        </div>
    );
}




function FormButtons({authState, setAuthState, submitHandler, btnIsLoading}:any){

    const stateBtnData:any = {
        "logging":[ "Login", "Register", "registering" ],
        "registering":[ "Register", "Login", "logging" ]
    };

    return (
        <div className='options'>
            <div className='leftDiv'>
                <Button 
                    classList={"primary"} 
                    onClickHandler={submitHandler} 
                    innerText={stateBtnData[authState][0]}
                    isLoading={btnIsLoading}    
                />
            </div>
            <div className='rightDiv'>
                <Button 
                    classList={"secondary"} 
                    onClickHandler={() => setAuthState(stateBtnData[authState][2])} 
                    innerText={stateBtnData[authState][1]} 
                    isLoading={btnIsLoading}    
                />
                <Button 
                    classList={"secondary spaced"} 
                    onClickHandler={() => setAuthState("notLogged")} 
                    innerText={"Cancel"}  
                    isLoading={btnIsLoading}   
                />
            </div>
        </div>
    );

}