import './css/main.css';
import './css/EvaluatorSelectionSection.css';
import './css/EvaluationSection.css';
import './css/ResultSection.css';

import { useState, useEffect, useRef } from "react";
import { getLogoSrc, getArrowSrc, getArrowUpSrc } from './js/extension_images.js';
import { loadStoredReport, getEvaluation} from './js/utils.js';
import parse from 'html-react-parser';
import { BeatLoader } from 'react-spinners';


export default function App() {

  const [logoImgSrc, setLogoImgSrc] = useState();
  useEffect(() => { 
    setLogoImgSrc(getLogoSrc());
  }, []);

  return (<>
    <div className="img_container">
      <img id="react_extension_logo_image" className="img_logo" alt="extension logo" src={logoImgSrc} />
    </div>

    <MainSections />
    
    <button id="prueba" style={{margin: "30px"}}> a11y proba </button>
  </>);
}





function MainSections(){

  const [checkboxes, setCheckboxes] = useState([
    { checked: true, label: "AccessMonitor", href: "https://accessmonitor.acessibilidade.gov.pt/"},
    { checked: false, label: "AChecker", href: "https://achecker.achecks.ca/checker/index.php"},
    { checked: false, label: "Mauve", href: "https://mauve.isti.cnr.it/singleValidation.jsp"},
    { checked: false, label: "A11Y library", href: "https://github.com/ainspector/a11y-evaluation-library"}
  ]);
  const handleCheckboxesChange = (newCheckboxes:any) => {
    setCheckboxes(newCheckboxes);
  };

  const [results, setResults] = useState({resultsSummary: "", resultsContent: ""});
  const handleResultsChange = (newResults:any) => {
    setResults(newResults);
  };
  useEffect(() => {
    const loadedResults = loadStoredReport();
    handleResultsChange(loadedResults);
  }, [])

  return(<>
    <EvaluatorSelectionSection checkboxes={checkboxes} onCheckboxesChange={handleCheckboxesChange} />
    <EvaluationSection checkboxes={checkboxes} onResultsChange={handleResultsChange} />
    <ResultSection results={results} />
  </>);
}





function EvaluatorSelectionSection ({checkboxes, onCheckboxesChange}:any) {

  const [isOpen, setIsOpen] = useState(false);

  const handleCheckboxChange = (index:any, isChecked:any) => {
    const newCheckboxes = [...checkboxes];
    newCheckboxes[index].checked = isChecked;
    onCheckboxesChange(newCheckboxes);
  };

  return (
    <div className="evaluator_selection_section">
      <div className="header" onClick={() => setIsOpen((prev:any) => !prev) }>
        <img src = { isOpen ? getArrowUpSrc() : getArrowSrc() } alt="dropdown_arrow" />
        <span>Select evaluators</span>
      </div>

      <div className="body" style={isOpen ? {display: "block"} : {display: "none"}}>
        {checkboxes.map((checkbox:any, index:any) => (
          <CustomCheckbox key={index} label={checkbox.label} href={checkbox.href} checked={checkbox.checked} onChange={(isChecked:any) => handleCheckboxChange(index, isChecked)} />
        ))}
      </div>
    </div> 
  );
}




function EvaluationSection ({checkboxes, handleResultsChange}:any) {

  const [isOpen, setIsOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const handleGetResultsClick = () => {
    setIsLoading(true);
    console.log("Outsider function called with items:", checkboxes);
    // Make an API call or perform some asynchronous operation here
    // When the operation is complete, set isLoading back to false
    const newResults = getEvaluation(checkboxes, setIsLoading).catch(error => { console.log(error.message); });
    handleResultsChange(newResults);
  };

  return (
    <div className="evaluation_section">
      <div className="header" onClick={() => setIsOpen((prev:any) => !prev) }>
        <img src = { isOpen ? getArrowUpSrc() : getArrowSrc() } alt="dropdown_arrow" />
        <span>Evaluation options</span>
      </div>

      <div className="body" style={isOpen ? {display: "block"} : {display: "none"}}>
        <button id="btn_get_data" className="button primary" onClick={handleGetResultsClick} disabled={isLoading}>
          {isLoading ? <BeatLoader size={8} color="#ffffff" /> : parse("Evaluate <br/> current page")}
        </button><br/>
        <label id="btn_clear_data" className="button secondary"> Clear stored data </label>
        <label id="btn_download" className="button primary">Download report</label>
        <label id="btn_upload" className="button secondary"><input type="file" accept=".json"/>Upload Report</label>
      </div>
    </div> 
  );
}





function ResultSection({results}:any) {

  return (
    <div className="result_section">
      <div className="header">
        <span>Evaluation Results</span>
      </div>
      <div className="body">
        <span id="result_table">{parse(results.resultsSummary)}</span><br/>
        <span id="content_table">{parse(results.resultsContent)}</span>
      </div>
    </div>
  );
}





function CustomCheckbox ({label, href, checked, onChange}:any ) {
  
  const [isChecked, setIsChecked] = useState(checked);

  const handleCheckboxChange = (event:any) => {
    setIsChecked(event.target.checked);
    onChange(event.target.checked);
  };

  return (
    <div className="checkbox-wrapper">
      <div className="checkbox">
        <input type="checkbox" checked={isChecked} onChange={handleCheckboxChange} className={isChecked ? "checked" : ""} />
        <a href={href}>{label}</a>
      </div><br/>
      <span>{isChecked ? "Selected" : "Unchecked"}</span>
    </div>
  );
}