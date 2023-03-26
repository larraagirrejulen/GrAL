
import './css/main.css';
import './css/EvaluatorSelectionSection.css';
import './css/EvaluationSection.css';
import './css/ResultSection.css';


import { useState, useEffect} from "react";
import { getLogoSrc, getArrowSrc, getArrowUpSrc, getConfigImgSrc, openOptionsPage } from './js/extensionUtils.js';
import { performEvaluation} from './js/evaluation.js';
import { removeStoredReport, loadStoredReport, downloadStoredReport, uploadAndStoreReport } from './js/reportStoringUtils.js';
import parse from 'html-react-parser';
import { BeatLoader } from 'react-spinners';
import ResultsTable from './ResultsTable';




export default function App() {

  const [hidden, setHidden] = useState(false);

  const [logoImgSrc, setLogoImgSrc] = useState();
  const [configImgSrc, setConfigImgSrc] = useState();
  useEffect(() => { 
    setLogoImgSrc(getLogoSrc());
    setConfigImgSrc(getConfigImgSrc());
  }, []);

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

      <MainSections />
    </div>

  </>);
}





function MainSections(){

  const [checkboxes, setCheckboxes] = useState([
    { checked: false, label: "AccessMonitor", href: "https://accessmonitor.acessibilidade.gov.pt/"},
    { checked: false, label: "AChecker", href: "https://achecker.achecks.ca/checker/index.php"},
    { checked: false, label: "Mauve", href: "https://mauve.isti.cnr.it/singleValidation.jsp"},
    { checked: true, label: "A11Y library", href: "https://github.com/ainspector/a11y-evaluation-library"}
  ]);

  const [activeLevels, setActiveLevels] = useState(['A', 'AA']);
  function handleLevelClick (level:any) {
    if (level === 'A') {
      setActiveLevels(['A']);
    } else if (level === 'AA') {
      setActiveLevels(['A', 'AA']);
    } else if (level === 'AAA') {
      setActiveLevels(['A', 'AA', 'AAA']);
    }
  }

  return(<>
    <EvaluatorSelectionSection checkboxes={checkboxes} onCheckboxesChange={(newCheckboxes:any)=>setCheckboxes(newCheckboxes)} />
    <EvaluationSection checkboxes={checkboxes} activeLevels={activeLevels} />
    <ResultSection activeLevels={activeLevels} onLevelsChange={(label:any) => handleLevelClick(label)} />
  </>);
}





function EvaluatorSelectionSection ({checkboxes, onCheckboxesChange}:any) {
  const [isOpen, setIsOpen] = useState(localStorage.getItem("tabla_main")==null);

  const handleCheckboxChange = (index:any, isChecked:any) => {
    const newCheckboxes = [...checkboxes];
    newCheckboxes[index].checked = isChecked;
    onCheckboxesChange(newCheckboxes);
  };

  return ( <div className="evaluator_selection_section">

      <div className="header" onClick={() => setIsOpen((prev:any) => !prev) }>
        <img src = { isOpen ? getArrowUpSrc() : getArrowSrc() } alt="dropdown_arrow" />
        <span>Select evaluators</span>
      </div>

      <div className="body" style={isOpen ? {display: "block"} : {display: "none"}}>
        {checkboxes.map((checkbox:any, index:any) => (
          <div className="checkbox-wrapper">
            <div className="checkbox">
              <input type="checkbox" checked={checkbox.checked} onChange={()=>handleCheckboxChange(index, !checkbox.checked)} className={checkbox.checked ? "checked" : ""} />
              <span onClick={() => { window.open(checkbox.href, '_blank'); }}>{checkbox.label}</span>
            </div><br/>
            <span>{checkbox.checked ? "Selected" : "Unchecked"}</span>
          </div>
        ))}
      </div>
    
  </div> );
}




function EvaluationSection ({checkboxes, activeLevels}:any) {
  const [isOpen, setIsOpen] = useState(localStorage.getItem("tabla_main")==null);
  const [isLoading, setIsLoading] = useState(false);

  return ( <div className="evaluation_section">

      <div className="header" onClick={() => setIsOpen((prev:any) => !prev) }>
        <img src = { isOpen ? getArrowUpSrc() : getArrowSrc() } alt="dropdown_arrow" />
        <span>Evaluation options</span>
      </div>

      <div className="body" style={isOpen ? {display: "block"} : {display: "none"}}>
        <button id="btn_get_data" className="button primary" onClick={() => performEvaluation(checkboxes, setIsLoading)} disabled={isLoading}>
          {isLoading ? <BeatLoader size={8} color="#ffffff" /> : parse("Evaluate current page")}
        </button><br/>
        <label id="btn_clear_data" className="button secondary" onClick={removeStoredReport}>Clear stored data</label><br/>
        <label id="btn_download" className="button primary" onClick={()=>downloadStoredReport(activeLevels)}>Download report</label><br/>
        <label id="btn_upload" className="button secondary"><input type="file" accept=".json" onChange={(event) => uploadAndStoreReport(event)} />Upload Report</label>
      </div>
    
  </div> );
}




function ResultSection({activeLevels, onLevelsChange}:any) {

  const storedReport:any = loadStoredReport();

  return ( 
    <div className="result_section">

      <div className="header"><span>Evaluation Results</span></div>

      <div className="body">
        {storedReport.resultsContent !== "" ? 
        <>
          <div className='conformanceLevelSelector'>
            <p>Select conformace level:</p>
            <div className="level-container">
              <div className={`conformanceLevel ${activeLevels.includes('A') ? 'selected' : ''}`} onClick={() => onLevelsChange('A')}>A</div>
              <div className={`conformanceLevel ${activeLevels.includes('AA') ? 'selected' : ''}`} onClick={() => onLevelsChange('AA')}>AA</div>
              <div className={`conformanceLevel ${activeLevels.includes('AAA') ? 'selected' : ''}`} onClick={() => onLevelsChange('AAA')}>AAA</div>
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

