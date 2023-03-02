import './css/main.css';
import './css/selection_dropdown.css';
import './css/evaluation_dropdown.css';
import './css/result_section.css';

import { useState, useEffect, useRef } from "react";
import { getLogoSrc, getArrowSrc, getArrowUpSrc } from './js/extension_images.js';
import { loadStoredReport, getEvaluation} from './js/utils.js';
import parse from 'html-react-parser';


export default function App() {

  const [logoImgSrc, setLogoImgSrc] = useState("");
  useEffect(() => { 
    setLogoImgSrc(getLogoSrc());
  }, []);

  return (<>
    <div className="img_container">
      <img id="react_extension_logo_image" className="img_logo" alt="extension logo" src={logoImgSrc} />
    </div>

    <Dropdown ident="selection_dropdown" label="Select evaluators" type="selection" />
    <Dropdown ident="evaluation_dropdown" label="Evaluation options" type="evaluation" />
    <Dropdown ident="result_dropdown" label="Evaluation results" type="result" />
    
    <button id="prueba" style={{margin: "30px"}}> a11y proba </button>
  </>);
}



const Dropdown = ({ident, label, type}:any) => {

  const [isOpen, setIsOpen] = useState(false);

  return(
    <div id={ident} className={ident} >
      <div className="dropdown_header" onClick={(type:any) => type !== "result" ? setIsOpen((prev:any) => !prev) : null }>
        { type !== "result" ? <img src = { isOpen ? getArrowUpSrc() : getArrowSrc() } alt="dropdown_arrow" /> : null }
        <span>{label}</span>
      </div>
      <div className="dropdown_body" style={type === "result" || isOpen ? {display: "block"} : {display: "none"}} >
        <DropdownBody type={type} />
      </div>
    </div>
  );
}



const DropdownBody = ({type}:any ) => {

  const [checkStates, setCheckStates] = useState([ true, false, false, false ]); // AM, AC, MV, A11Y
  
  function checkHandler(checkboxIndex:any) {
    const updatedCheckedStates = checkStates.map((check, index) =>
      index === checkboxIndex ? !check : check
    );
    setCheckStates(updatedCheckedStates);
  };

  const [result, setResult] = useState({
    resultTableContent: "<div style='text-align: center; padding-top: 15px;'>No data stored</div>",
    contentTableContent: ""
  });

  async function getResultsHandler(){
    /*setResult({
      resultTableContent: "<div className='loading_gif'/>",
      contentTableContent: ""
    });
    console.log({checkStates});*/
    await getEvaluation(checkStates, setResult).catch(error => { console.log(error.message); });
  }


  useEffect(() => {
    loadStoredReport(setResult);
  }, [])

  return (<>{
    (type === "selection" ? <>
      <Checkboxes checkStates={checkStates} checkHandler={checkHandler} /><br/> 
    </> : ( type === "evaluation" ? 
      <div className="button_wrapper">
        <label id="btn_get_data" className="button primary" onClick={getResultsHandler}>Evaluate <br></br> current page</label>
        <label id="btn_clear_data" className="button secondary"> Clear stored data </label>
        <label id="btn_download" className="button primary">Download report</label>
        <label id="btn_upload" className="button secondary"><input type="file" accept=".json"/>Upload Report</label>
      </div> 
    : <>
        <span id="result_table">{parse(result.resultTableContent)}</span><br/>
        <span id="content_table">{parse(result.contentTableContent)}</span>
    </>))
  }</>);
}





/**
 * React custom checkboxes component
 * @param checkStates has a boolean value for each checkbox checked state. True if checked.
 * @param checkHandler handler for checkbox onChange event.
 * @returns react custom checkbox components
 */
const Checkboxes = ({checkStates, checkHandler}:any ) => {
  const checkboxInfo = [
    { label: "AccessMonitor", href: "https://accessmonitor.acessibilidade.gov.pt/"},
    { label: "AChecker", href: "https://achecker.achecks.ca/checker/index.php"},
    { label: "Mauve", href: "https://mauve.isti.cnr.it/singleValidation.jsp"},
    { label: "A11Y library", href: "https://github.com/ainspector/a11y-evaluation-library"}
  ];
  return (<>
    {checkboxInfo.map(({ label, href}, index) => (
      <div className="checkbox-wrapper">
        <div className="checkbox">
          <input type="checkbox" checked={checkStates[index]} onChange={() => checkHandler(index)} className={checkStates[index] ? "checked" : ""} />
          <a href={href}>{label}</a>
        </div><br/>
        <span>{checkStates[index] ? "Selected" : "Unchecked"}</span>
      </div>
    ))}
  </>);
}