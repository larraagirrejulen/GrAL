import './css/main.css';
import './css/EvaluatorSelectionSection.css';
import './css/EvaluationSection.css';
import './css/ResultSection.css';

import { useState, useEffect, useRef } from "react";
import { getLogoSrc, getArrowSrc, getArrowUpSrc } from './js/extension_images.js';
import { loadStoredReport, getEvaluation, downloadCurrentReport, clearStoredEvaluationData} from './js/utils.js';
import parse from 'html-react-parser';
import { BeatLoader } from 'react-spinners';


export default function App() {

  const [hidden, setHidden] = useState(false);

  function toggleHidden() {
    setHidden(!hidden);
  }

  const [logoImgSrc, setLogoImgSrc] = useState();
  useEffect(() => { 
    setLogoImgSrc(getLogoSrc());
  }, []);

  return (<>
    {hidden ? <img className="hidden_extension_logo" alt="extension logo when hidden" src={logoImgSrc} onClick={toggleHidden} /> : ""}
    <div className= {`react_chrome_extension ${hidden ? 'hidden' : ''}`}>
      <span className="close_icon" onClick={toggleHidden}>&times;</span>
      <div className="img_container">
        <img alt="extension logo" src={logoImgSrc} onClick={() => {
          window.open("https://github.com/larraagirrejulen/GrAL", '_blank');
          window.open("https://github.com/Itusil/TFG", '_blank')
        }} />
      </div>

      <MainSections dropdownsDefaultState={localStorage.getItem("tabla_main")==null}/>
      
      <button id="prueba" style={{margin: "30px"}}> a11y proba </button>
    </div>
  </>);
}





function MainSections({dropdownsDefaultState}:any){

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
    <EvaluatorSelectionSection dropdownsDefaultState={dropdownsDefaultState} checkboxes={checkboxes} onCheckboxesChange={handleCheckboxesChange} />
    <EvaluationSection dropdownsDefaultState={dropdownsDefaultState} checkboxes={checkboxes} onResultsChange={handleResultsChange} />
    <ResultSection results={results} />
  </>);
}





function EvaluatorSelectionSection ({dropdownsDefaultState, checkboxes, onCheckboxesChange}:any) {
  const [isOpen, setIsOpen] = useState(dropdownsDefaultState);

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
        <span onClick={() => { window.open(href, '_blank'); }}>{label}</span>
      </div><br/>
      <span>{isChecked ? "Selected" : "Unchecked"}</span>
    </div>
  );
}





function EvaluationSection ({dropdownsDefaultState, checkboxes, handleResultsChange}:any) {
  const [isOpen, setIsOpen] = useState(dropdownsDefaultState);
  const [isLoading, setIsLoading] = useState(false);

  const handleGetResultsClick = () => {
    setIsLoading(true);
    const newResults = getEvaluation(checkboxes, setIsLoading);
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
          {isLoading ? <BeatLoader size={8} color="#ffffff" /> : parse("Evaluate current page")}
        </button><br/>
        <label id="btn_clear_data" className="button secondary" onClick={clearStoredEvaluationData}>Clear stored data</label>
        <label id="btn_download" className="button primary" onClick={downloadCurrentReport}>Download report</label>
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
        {results.resultsContent !== "" ? 
        <>
          <ConformanceLevelSelector/>
          <ResultsTable results={results}/>
        </>: 
          <div className = "table_container">{parse(results.resultsSummary)}</div>
        }
      </div>
    </div>
  );
}

function ConformanceLevelSelector(){

  const [activeLevels, setActiveLevels] = useState(['A', 'AA']);

  const handleLevelClick = (label:any) => {
    if (label === 'A') {
      setActiveLevels(['A']);
    } else if (label === 'AA') {
      setActiveLevels(['A', 'AA']);
    } else if (label === 'AAA') {
      setActiveLevels(['A', 'AA', 'AAA']);
    }
  }

  return (
    <div className='conformanceLevelSelector'>
      <p>Select conformace level:</p>
      <div className="level-container">
        <ConformanceLevel label="A" selected={activeLevels.includes('A')} onClick={() => handleLevelClick('A')} />
        <ConformanceLevel label="AA" selected={activeLevels.includes('AA')} onClick={() => handleLevelClick('AA')} />
        <ConformanceLevel label="AAA" selected={activeLevels.includes('AAA')} onClick={() => handleLevelClick('AAA')} />
      </div>
    </div>
  );
}

function ConformanceLevel(props:any){

  const { label, selected, onClick } = props;

  return(
    <div className={`conformanceLevel ${selected ? 'selected' : ''}`} onClick={onClick}>
      {label}
    </div>
  );
}

function ResultsTable({results}:any){
  console.log(JSON.stringify(results.resultsSummary));
  return(
    <div className = "table_container">
      <table className="summary_table">
        <tr><th style={{backgroundColor: "#C8FA8C"}} title='Passed'>P</th><th style={{backgroundColor: "#FA8C8C"}} title='Failed'>F</th><th style={{backgroundColor: "#F5FA8C"}} title='Can&#39;t tell'>CT</th><th style={{backgroundColor: "#FFFFFF"}} title='Not Present'>NP</th><th style={{backgroundColor: "#8CFAFA"}} title='Not checked'>NC</th></tr>
        <tr><th>{results.resultsSummary.passed}</th><th>{results.resultsSummary.failed}</th><th>{results.resultsSummary.cannot_tell}</th><th>{results.resultsSummary.not_present}</th><th>{results.resultsSummary.not_checked}</th></tr>
      </table>
      <table className="results_table">

      </table>
    </div>
  );
  
}