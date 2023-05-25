
import '../styles/UserAuthentication.css';

import { useState, useEffect} from "react";
import { fetchServer } from '../js/evaluation.js';
import { getFromChromeStorage, storeOnChromeStorage } from "../js/utils/chromeUtils.js";
import ExtensionButton from "./Button";




export default function UserAuthentication ({authenticationState, setAuthenticationState}:any): JSX.Element {
  
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
      
        <ExtensionButton 
            classList={"primary"} 
            onClickHandler={() => setAuthenticationState("logging")} 
            innerText={"Login"}    
        />
        <ExtensionButton 
            classList={"secondary spaced"} 
            onClickHandler={() => setAuthenticationState("registering")} 
            innerText={"Register"}    
        />
      
      </> : authenticationState === "logging" ? 
  
        <LoginForm setAuthState={setAuthenticationState} />
      
      : authenticationState === "registering" ? 
  
        <RegisterForm setAuthState={setAuthenticationState} />
    
      : <>
      
        <label className='userNameLabel'>{"@" + authenticationState}</label>
        <ExtensionButton 
            classList={"secondary"} 
            onClickHandler={onLogoutHandler} 
            innerText={"Logout"}    
        />
  
      </> }
      
  
    </div> );
}




function LoginForm({setAuthState}:any) {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {

        setIsLoading(true);

        if(email === "" || password === ""){
            alert("You must fill all input fields!!");
            setIsLoading(false);
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
            setIsLoading(false);
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
        <div className='options'>
            <div className='leftDiv'>
                <ExtensionButton 
                    classList={"primary"} 
                    onClickHandler={handleSubmit} 
                    innerText={"Login"}
                    isLoading={isLoading}    
                />
            </div>
            <div className='rightDiv'>
                <ExtensionButton 
                    classList={"secondary"} 
                    onClickHandler={() => setAuthState("registering")} 
                    innerText={"Register"} 
                    isLoading={isLoading}    
                />
                <ExtensionButton 
                    classList={"secondary spaced"} 
                    onClickHandler={() => setAuthState("notLogged")} 
                    innerText={"Cancel"}  
                    isLoading={isLoading}   
                />
            </div>
        </div>
    </div>
  );
}




function RegisterForm({setAuthState}:any) {

    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {

        setIsLoading(true);

        if(password !== repeatPassword){
            alert("Passwords do not match!!");
            setIsLoading(false);
            return;
        } else if(email === "" || username === "" || password === ""){
            alert("You must fill all input fields!!");
            setIsLoading(false);
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
            setIsLoading(false);
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
            <div className='options'>
                <div className='leftDiv'>
                    <ExtensionButton 
                        classList={"primary"} 
                        onClickHandler={handleSubmit} 
                        innerText={"Register"}
                        isLoading={isLoading}    
                    />
                </div>
                <div className='rightDiv'>
                    <ExtensionButton 
                        classList={"secondary"} 
                        onClickHandler={() => setAuthState("logging")} 
                        innerText={"Login"} 
                        isLoading={isLoading}    
                    />
                    <ExtensionButton 
                        classList={"secondary spaced"} 
                        onClickHandler={() => setAuthState("notLogged")} 
                        innerText={"Cancel"}  
                        isLoading={isLoading}   
                    />
                </div>
            </div>
        </div>
    );
}

