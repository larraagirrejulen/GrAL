
import '../../styles/sections/UserAuthentication.scss';

import { useState, useEffect} from "react";
import { fetchServer } from '../../js/evaluationOptions.js';
import { removeFromChromeStorage, storeOnChromeStorage } from "../../js/utils/chromeUtils.js";
import { setUseStateFromStorage } from '../../js/utils/reactUtils';

import Button from "../reusables/Button";


/**
 * Renders the UserAuthentication component.
 *
 * @param {Object} props - The component props.
 * @param {string} props.authenticationState - The current authentication state.
 * @param {function} props.setAuthenticationState - The function to update the authentication state.
 * @param {boolean} props.btnIsLoading - Indicates if the buttons are in loading state.
 * @returns {JSX.Element} The rendered UserAuthentication component.
 */
export default function UserAuthentication ({authenticationState, setAuthenticationState}:any): JSX.Element {

    const onLogoutHandler = () => {
        removeFromChromeStorage("authenticationState", true);
        setAuthenticationState("notLogged");
    }

    useEffect( ()=>{
        setUseStateFromStorage("authenticationState", true, setAuthenticationState);
    });
  
    return ( 
        <div id="extension_authentication_section">
  
            {authenticationState === "notLogged" ? <>

                <Button 
                    classList={"primary"} 
                    onClickHandler={() => setAuthenticationState("logging")} 
                    innerText={"Login"} 
                />
                <Button 
                    classList={"secondary spaced"} 
                    onClickHandler={() => setAuthenticationState("registering")} 
                    innerText={"Register"}  
                />

            </> : authenticationState === "logging" ? 

                <LoginForm setAuthState={setAuthenticationState} />

            : authenticationState === "registering" ? 
        
                <RegisterForm setAuthState={setAuthenticationState} />
            
            : <>
            
                <label className='userNameLabel'>
                    {"@" + authenticationState}
                    </label>
                <Button 
                    classList={"secondary"} 
                    onClickHandler={onLogoutHandler} 
                    innerText={"Logout"}
                />
        
            </> }

        </div>
    );
}



/**
 * Renders the LoginForm component.
 *
 * @param {Object} props - The component props.
 * @param {function} props.setAuthState - The function to update the authentication state.
 * @returns {JSX.Element} The rendered LoginForm component.
 */
function LoginForm({setAuthState}:any): JSX.Element {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async () => {

        if(email === "" || password === ""){
            alert("You must fill all input fields!!");
            return;
        }

        const bodyData:any = JSON.stringify({email, username: null, password});

        const loginResult:any = await fetchServer(bodyData, "userAuthentication");

        if(loginResult.success){
            storeOnChromeStorage("authenticationState", loginResult.username, true);
            setAuthState(loginResult.username);
        } else {
            window.alert(loginResult.error);
        }

    };

    return (
        <div className='form'>

            <h2>Login</h2>

            <InputField 
                value={email} 
                htmlFor={"email"}
                onChangeHandler={(e:any) => setEmail(e.target.value)}
            />

            <InputField 
                value={password} 
                htmlFor={"password"}
                onChangeHandler={(e:any) => setPassword(e.target.value)}
            />

            <FormButtons 
                authState={"logging"} 
                setAuthState={setAuthState} 
                submitHandler={handleSubmit}
            />

        </div>
    );
}



/**
 * Renders the RegisterForm component.
 *
 * @param {Object} props - The component props.
 * @param {function} props.setAuthState - The function to update the authentication state.
 * @returns {JSX.Element} The rendered RegisterForm component.
 */
function RegisterForm({setAuthState}:any): JSX.Element {

    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');

    const handleSubmit = async () => {

        if(password !== repeatPassword){
            alert("Passwords do not match!!");
            return;
        } else if(email === "" || username === "" || password === ""){
            alert("You must fill all input fields!!");
            return;
        }

        const bodyData:any = JSON.stringify({email, username, password});

        const registerResult:any = await fetchServer(bodyData, "userAuthentication");

        if(registerResult.success){
            window.alert("Successfully registered");
            setAuthState("logging");
        } else {
            window.alert("User already exists!!");
        }

    };

    return (
        <div className='form'>

            <h2>Register</h2>

            <InputField 
                value={email} 
                htmlFor={"email"}
                onChangeHandler={(e:any) => setEmail(e.target.value)}
            />

            <InputField 
                value={username} 
                htmlFor={"username"}
                onChangeHandler={(e:any) => setUsername(e.target.value)}
            />

            <InputField 
                value={password} 
                htmlFor={"password"}
                onChangeHandler={(e:any) => setPassword(e.target.value)}
            />

            <InputField 
                value={repeatPassword} 
                htmlFor={"repeatPassword"}
                onChangeHandler={(e:any) => setRepeatPassword(e.target.value)}
            />

            <FormButtons 
                authState={"registering"} 
                setAuthState={setAuthState} 
                submitHandler={handleSubmit}
            />

        </div>
    );
}



/**
 * Renders an input field component.
 *
 * @param {Object} props - The component props.
 * @param {string} props.value - The current value of the input field.
 * @param {string} props.htmlFor - The identifier for the input field.
 * @param {function} props.onChangeHandler - The function to handle changes in the input field.
 * @returns {JSX.Element} The rendered InputField component.
 */
function InputField({value, htmlFor, onChangeHandler}:any): JSX.Element {

    const data:any = {
        "email":{type:"text", labelTxt: "Email:"},
        "username": {type:"text", labelTxt: "Username:"},
        "password": {type:"password", labelTxt: "Password:"},
        "repeatPassword": {type:"password", labelTxt: "Repeat password:"}
    }

    return (
        <div className='field'>
            <label htmlFor={htmlFor}>{data[htmlFor].labelTxt}</label>
            <input 
                type={data[htmlFor].type} 
                value={value}
                onChange={onChangeHandler} 
            />
        </div>
    );

}



/**
 * Renders the FormButtons component.
 *
 * @param {Object} props - The component props.
 * @param {string} props.authState - The current authentication state.
 * @param {function} props.setAuthState - The function to update the authentication state.
 * @param {function} props.submitHandler - The function to handle form submission.
 * @returns {JSX.Element} The rendered FormButtons component.
 */
function FormButtons({authState, setAuthState, submitHandler}:any): JSX.Element {

    const [btnIsLoading, setBtnIsLoading] = useState(false);

    const stateBtnData:any = {
        "logging":[ "Login", "Register", "registering" ],
        "registering":[ "Register", "Login", "logging" ]
    };

    const onSubmit = () => {
        setBtnIsLoading(true);
        try{
            submitHandler();
        }catch(error){
            console.log(error);
        }finally{
            setBtnIsLoading(false);
        }
    }

    return (
        <div className='options'>

            <div className='leftDiv'>
                <Button 
                    classList={"primary"} 
                    onClickHandler={onSubmit} 
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