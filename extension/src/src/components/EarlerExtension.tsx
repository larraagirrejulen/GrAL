
import '../styles/extension.scss';

import { useEffect, useState } from "react";

import StoredReportManagement from './sections/StoredReportManagement';
import UserAuthentication from './sections/UserAuthentication';
import ScopeDefinition from './sections/ScopeDefinition';
import EvaluatorSelection from './sections/EvaluatorSelection';
import EvaluationOptions from './sections/EvaluationOptions';
import ReportResults from './sections/ReportResults/ReportResults';

import { getImgSrc } from '../scripts/utils/chromeUtils';



/**
 * Extension main component that wraps all other functionalities.
 * @returns {JSX.Element} The rendered JSX element.
 */
export default function EarlerExtension() {

  const [extensionHidden, setExtensionHidden] = useState(false);
  const [authenticationState, setAuthenticationState] = useState("notLogged");
  const [manageStoredReports, setManageStoredReports] = useState(false);

  useEffect(() => {
    document.body.classList.toggle('earlerEnabled', !extensionHidden);
  }, [extensionHidden]);
    

  return (<>

    {extensionHidden && (
      <img 
        id="hiddenEarlerLogo" 
        alt="extension logo when hidden" 
        src={getImgSrc("icon128")} 
        onClick={()=>setExtensionHidden(false)} 
      /> 
    )}
    
    <div id="earlerExtension" className= {`${extensionHidden && 'hidden'}`}>
      <img 
        className="icon options" 
        src={getImgSrc("settingsGear")} 
        alt="open configuration options window" 
        onClick={() => chrome.runtime.sendMessage({action: "openOptionsPage"})} 
      />
      
      <span className="icon close" onClick={()=>setExtensionHidden(true)}>&times;</span>

      <div className="earlerLogoContainer">
        <img 
          alt="extension logo" 
          src={getImgSrc("icon128")} 
          onClick={() => window.open("https://github.com/larraagirrejulen/GrAL", '_blank')} 
        />
      </div>

      {manageStoredReports ? <>
      
        <StoredReportManagement 
          setManageStoredReports={setManageStoredReports} 
          authenticationState={authenticationState} 
        />

      </> : <>

        <UserAuthentication 
          authenticationState={authenticationState} 
          setAuthenticationState={setAuthenticationState} 
        />

        { authenticationState !== "logging" && authenticationState !== "registering" && (<>
          <ScopeDefinition /> 
          <EvaluatorSelection /> 
          <EvaluationOptions 
            authenticationState={authenticationState} 
            setLoadingReports={setManageStoredReports} 
          /> 
          <ReportResults />
        </> )}
        
      </>}
      
    </div>

  </>);

}