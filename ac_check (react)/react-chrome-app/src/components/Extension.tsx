
import '../styles/extension.scss';

import { useEffect, useState } from "react";
import { getImgSrc, sendMessageToBackground } from '../js/utils/chromeUtils.js';
import { setUseStateFromStorage } from '../js/utils/reactUtils';

import UserAuthentication from './sections/UserAuthentication';
import EvaluationScope from './sections/EvaluationScope';
import EvaluatorSelection from './sections/EvaluatorSelection';
import EvaluationOptions from './sections/EvaluationOptions';
import ReportResults from './sections/ResultSection/ReportResults';


/**
 * A React component that represents the accessibility evaluator Chrome extension.
 * 
 * @function Extension
 * @exports Extension
 * @returns {JSX.Element} JSX representation of the Extension component.
*/
export default function Extension(): JSX.Element {

  const [shiftWebpage, setShiftWebpage] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [authenticationState, setAuthenticationState] = useState("notLogged");

  /**
   * Retrieves the "shiftWebpage" setting from Chrome storage and sets it as a state variable.
  */
  useEffect( ()=>{
    setUseStateFromStorage("shiftWebpage", true, setShiftWebpage);
  }, []);


  /**
   * Toggles the extension's active class on the webpage when the "hidden" or "shiftWebpage" state variables change.
  */
  useEffect(() => {
    if(shiftWebpage){
      document.body.classList[hidden ? "remove" : "add"]('extension-active');
    } 
  }, [hidden, shiftWebpage]);
    
  return (<>
    
    {hidden && (
      <img 
        id="hidden_extension_logo" 
        alt="extension logo when hidden" 
        src={getImgSrc("icon128")} 
        onClick={()=>setHidden(!hidden)} 
      /> 
    )}
    
    <div id="react_chrome_extension" className= {`${hidden && 'hidden'}`}>
      <img 
        className="icon options" 
        src={getImgSrc("settingsGear")} 
        alt="open configuration options window" 
        onClick={()=>sendMessageToBackground("openOptionsPage")} 
      />
      
      <span className="icon close" onClick={()=>setHidden(!hidden)}>&times;</span>

      <div className="img_container">
        <img alt="extension logo" src={getImgSrc("icon128")} onClick={() => {
          window.open("https://github.com/larraagirrejulen/GrAL", '_blank');
          window.open("https://github.com/Itusil/TFG", '_blank')
        }} />
      </div>

      <UserAuthentication 
        authenticationState={authenticationState} 
        setAuthenticationState={setAuthenticationState} 
      />

      { !["logging, registering"].includes(authenticationState) && (<>
        <EvaluationScope /> 
        <EvaluatorSelection /> 
        <EvaluationOptions authenticationState={authenticationState} /> 
        <ReportResults />
      </> )}
    </div>

  </>);
}