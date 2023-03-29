
import './css/main.css';
import './css/EvaluatorSelectionSection.css';
import './css/EvaluationSection.css';
import './css/ResultSection.css';


import { useEffect, useState } from "react";
import { getLogoSrc, getArrowSrc, getArrowUpSrc, getConfigImgSrc, openOptionsPage } from './js/extensionUtils.js';
import { performEvaluation} from './js/evaluation.js';
import { removeStoredReport, downloadStoredReport, uploadAndStoreReport, loadStoredReport } from './js/reportStoringUtils.js';
import parse from 'html-react-parser';
import { BeatLoader } from 'react-spinners';
import ResultsTable from './ResultsTable';




export default function App() {

  const [hidden, setHidden] = useState(false);

  const logoImgSrc:any = getLogoSrc();
  const configImgSrc:any = getConfigImgSrc();

  return (<>
    
    {hidden ? <img className="hidden_extension_logo" alt="extension logo when hidden" src={logoImgSrc} onClick={()=>setHidden(!hidden)} /> : ""}
    
    <div className= {`react_chrome_extension ${hidden ? 'hidden' : ''}`}>
      <img className="options_icon" src={configImgSrc} alt="open configuration options window" onClick={()=>openOptionsPage()} />
      <span className="close_icon" onClick={()=>setHidden(!hidden)}>&times;</span>
      <div className="img_container">
        <img alt="extension logo" src={logoImgSrc} onClick={() => {
          window.open("https://github.com/larraagirrejulen/GrAL", '_blank');
          window.open("https://github.com/Itusil/TFG", '_blank')
        }} />
      </div>

      <EvaluatorSelectionSection />
      <EvaluationSection />
      <ResultSection />
    </div>

  </>);
}




function EvaluatorSelectionSection () {
  const [isOpen, setIsOpen] = useState(localStorage.getItem("tabla_main")==null);

  const [checkboxes, setCheckboxes] = useState([
    { checked: false, label: "AccessMonitor", href: "https://accessmonitor.acessibilidade.gov.pt/"},
    { checked: false, label: "AChecker", href: "https://achecker.achecks.ca/checker/index.php"},
    { checked: false, label: "Mauve", href: "https://mauve.isti.cnr.it/singleValidation.jsp"},
    { checked: true, label: "A11Y library", href: "https://github.com/ainspector/a11y-evaluation-library"}
  ]);

  const handleCheckboxChange = (index:any) => {
    const newCheckboxes = [...checkboxes];
    newCheckboxes[index].checked = !newCheckboxes[index].checked;
    setCheckboxes(newCheckboxes);
    localStorage.setItem("checkboxes", JSON.stringify(newCheckboxes));
  };

  useEffect(() => {
    localStorage.setItem("checkboxes", JSON.stringify(checkboxes));
  });

  return ( <div className="evaluator_selection_section">

      <div className="header" onClick={() => setIsOpen((prev:any) => !prev) }>
        <img src = { isOpen ? getArrowUpSrc() : getArrowSrc() } alt="dropdown_arrow" />
        <span>Select evaluators</span>
      </div>

      <div className="body" style={isOpen ? {display: "block"} : {display: "none"}}>
        {checkboxes.map((checkbox:any, index:any) => (
          <div className="checkbox-wrapper">
            <div className="checkbox">
              <input type="checkbox" checked={checkbox.checked} onChange={()=>handleCheckboxChange(index)} className={checkbox.checked ? "checked" : ""} />
              <span onClick={() => { window.open(checkbox.href, '_blank'); }}>{checkbox.label}</span>
            </div><br/>
            <span>{checkbox.checked ? "Selected" : "Unchecked"}</span>
          </div>
        ))}
      </div>
    
  </div> );
}




function EvaluationSection () {

  const [isOpen, setIsOpen] = useState(localStorage.getItem("tabla_main")==null);
  const [isLoading, setIsLoading] = useState(false);

  function evaluateCurrentPage(){
    setIsLoading(true);
    performEvaluation().catch(
      (error)=>console.log("@evaluation.js: ERROR evaluating the page => " + error)
    ).finally(()=>setIsLoading(false));
  }

  return ( <div className="evaluation_section">

      <div className="header" onClick={() => setIsOpen((prev:any) => !prev) }>
        <img src = { isOpen ? getArrowUpSrc() : getArrowSrc() } alt="dropdown_arrow" />
        <span>Evaluation options</span>
      </div>

      <div className="body" style={isOpen ? {display: "block"} : {display: "none"}}>
        <button id="btn_get_data" className="button primary" onClick={evaluateCurrentPage} disabled={isLoading}>
          {isLoading ? <BeatLoader size={8} color="#ffffff" /> : parse("Evaluate current page")}
        </button><br/>
        <label id="btn_clear_data" className="button secondary" onClick={removeStoredReport}>Clear stored data</label><br/>
        <label id="btn_download" className="button primary" onClick={downloadStoredReport}>Download report</label><br/>
        <label id="btn_upload" className="button secondary"><input type="file" accept=".json" onChange={(event) => uploadAndStoreReport(event)} />Upload Report</label>
      </div>
    
  </div> );
}




function ResultSection() {

  const storedReport:any = loadStoredReport();

  const [activeLevels, setActiveLevels] = useState(['A', 'AA']);
  function handleLevelClick (level:any) {
    const levels = level === 'A' ? ['A'] : (level === 'AA' ? ['A', 'AA'] : ['A', 'AA', 'AAA']);
    setActiveLevels(levels);
    localStorage.setItem("activeLevels", JSON.stringify(levels));
  };

  useEffect(() => {
    localStorage.setItem("activeLevels", JSON.stringify(activeLevels));
  });

  return ( 
    <div className="result_section">

      <div className="header"><span>Evaluation Results</span></div>

      <div className="body">
        {storedReport.resultsContent !== "" ? 
        <>
          <div className='conformanceLevelSelector'>
            <p>Select conformace level:</p>
            <div className="level-container">
              <div className={`conformanceLevel ${activeLevels.includes('A') ? 'selected' : ''}`} onClick={() => handleLevelClick('A')}>A</div>
              <div className={`conformanceLevel ${activeLevels.includes('AA') ? 'selected' : ''}`} onClick={() => handleLevelClick('AA')}>AA</div>
              <div className={`conformanceLevel ${activeLevels.includes('AAA') ? 'selected' : ''}`} onClick={() => handleLevelClick('AAA')}>AAA</div>
            </div>
          </div>

          <ResultsTable results={storedReport} activeLevels={activeLevels}/>
        </>: 
          <div className = "table_container">{parse(storedReport.resultsSummary)}</div>
        }
      </div>

    </div> 
  );

}

