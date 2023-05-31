
import '../../styles/sections/evaluationOptions.scss';

import { useState } from "react";
import { getImgSrc } from '../../js/utils/chromeUtils.js';
import { removeStoredReport, downloadStoredReport, uploadNewReport, performEvaluation, storeReport } from '../../js/evaluationOptions.js';

import Button from '../reusables/Button';


/**
 * Renders the EvaluationOptions component.
 *
 * @param {Object} authenticationState - The authentication state.
 * @returns {JSX.Element} The rendered EvaluationOptions component.
 */
export default function EvaluationOptions ({authenticationState}:any): JSX.Element {

  const [animateBtn, setAnimateBtn] = useState("none");
  const [isOpen, setIsOpen] = useState(false);
  
  return ( 
    <div id="evaluationOptions">

      <Button 
        classList={"primary"} 
        onClickHandler={()=>{performEvaluation(setAnimateBtn)}}
        innerText={"Evaluate scope"}  
        isLoading={animateBtn !== "none"}  
        animate={animateBtn === "evaluate"}
      />

      <div className='dropdownBtn'>
        <div className={"dropdownHead" + (isOpen ? " active" : "")} onClick={()=>setIsOpen(!isOpen)}>
          <label>Report options</label>
          <img 
            src={ isOpen ? getImgSrc("extendedArrow") : getImgSrc("contractedArrow") } 
            alt="dropdown_arrow" 
          />
        </div>

        {isOpen && (
          <div className='dropdownBody'>
            <label onClick={removeStoredReport}>Remove</label>
            <label onClick={downloadStoredReport}>Export</label>
            <label id="importReport">
              <input type="file" accept=".json" onChange={(event) => uploadNewReport(event)} />
              Import
            </label>
          </div>
        )}
      </div>

      {authenticationState !== "notLogged" && ( 
        <div className='loggedOptions'>
          <Button 
            classList={"primary"} 
            onClickHandler={()=>storeReport(setAnimateBtn, authenticationState)}
            innerText={"Save report"}  
            isLoading={animateBtn !== "none"}
            animate={animateBtn === "store"}
          />
          <Button 
            classList={"secondary spaced"} 
            onClickHandler={()=>alert("hey")}
            innerText={"Load saved report"}  
            isLoading={animateBtn !== "none"}
            animate={animateBtn === "load"}
          />
        </div>
      )}
      
    </div>
  );
}