
import '../../styles/sections/evaluationOptions.scss';

import { useEffect, useState } from "react";
import Button from '../reusables/Button';

import { getFromChromeStorage, getImgSrc } from '../../scripts/utils/chromeUtils.js';
import { removeLoadedReport, downloadLoadedReport, uploadNewReport, evaluateScope, testEvaluators } from '../../scripts/reportLoadingOptions.js';
import { storeNewReport } from '../../scripts/reportStorageOptions.js';


/**
 * Component for displaying users evaluation options.
 * @param {Object} authenticationState - The authentication state.
 * @param {Function} setLoadingReports - The function to set the loading reports state.
 * @returns {JSX.Element} EvaluationOptions component.
 */
export default function EvaluationOptions ({authenticationState, setLoadingReports}:any): JSX.Element {

  const [animateBtn, setAnimateBtn] = useState("none");
  const [isOpen, setIsOpen] = useState(false);
  const [reportIsLoaded, setReportIsLoaded] = useState("false");

  useEffect(()=>{
    getFromChromeStorage(window.location.hostname + ".reportIsLoaded", false)
    .then((value)=>{
      setReportIsLoaded(value);
    });
  });

  
  
  return ( 
    <div id="evaluationOptions">

      <Button 
        classList={"primary br"} 
        onClickHandler={()=>{evaluateScope(setAnimateBtn)}}
        innerText={"Evaluate selected scope"}  
        isLoading={animateBtn !== "none"}  
        animate={animateBtn === "evaluate"}
      /><br/>

      <div className='dropdownBtn'>
        <div className={"dropdownHead" + (isOpen ? " active" : "")} onClick={()=>setIsOpen(!isOpen)}>
          <label>Current report options</label>
          <img 
            src={ isOpen ? getImgSrc("extendedArrow") : getImgSrc("contractedArrow") } 
            alt="dropdown_arrow" 
          />
        </div>

        {isOpen && (
          <div className='dropdownBody'>
            <label onClick={removeLoadedReport}>Remove report</label>
            <label onClick={downloadLoadedReport}>Export report</label>
            <label id="importReport">
              <input type="file" accept=".json" onChange={(event:any) => uploadNewReport(event)} />
              Import new report
            </label>
          </div>
        )}
      </div><br/>

      {authenticationState !== "notLogged" && ( <>
        <div className='loggedOptions'>
          <p>Server storage options:</p>
          <Button 
            classList={"primary br"} 
            onClickHandler={()=>storeNewReport(setAnimateBtn, authenticationState)}
            innerText={"Store current report"}  
            isLoading={animateBtn !== "none"}
            animate={animateBtn === "store"}
            disabled={reportIsLoaded !== "true"}
          /><br/>
          <Button 
            classList={"secondary"} 
            onClickHandler={()=>setLoadingReports(true)}
            innerText={"Load report from storage"}  
            isLoading={animateBtn !== "none"}
            animate={animateBtn === "load"}
          />
        </div>
      </> )}

      {/*<Button 
        classList={"primary lineSpaced"} 
        onClickHandler={()=>{testEvaluators()}}
        innerText={"Test evaluators"}
      />*/}
      
    </div>
  );
}