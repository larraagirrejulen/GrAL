
import './css/extension.css';
import './css/evaluationScopeSection.css';
import './css/evaluatorSelectionSection.css';
import './css/evaluationSection.css';
import './css/resultSection.css';

import { useEffect, useState } from "react";
import { getImgSrc, sendMessageToBackground } from './js/utils/chromeUtils.js';
import { removeStoredReport, downloadStoredReport, uploadNewReport } from './js/reportStorage.js';
import { setUseStateFromStorage } from './js/utils/reactUtils.js';
import { performEvaluation } from './js/evaluation.js';
import { BeatLoader } from 'react-spinners';
import ResultsTable from './ResultsTable';




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

  /**
   * Retrieves the "shiftWebpage" setting from Chrome storage and sets it as a state variable.
  */
  useEffect( ()=>{
    setUseStateFromStorage("shiftWebpage", true, setShiftWebpage, "could not get 'shiftWebpage' option!");
  }, []);

  /**
   * Toggles the extension's active class on the webpage when the "hidden" or "shiftWebpage" state variables change.
  */
  useEffect(() => {
    if(shiftWebpage){
      hidden ? document.body.classList.remove('extension-active') : document.body.classList.add('extension-active');
    }
  }, [hidden, shiftWebpage]);

  return (<>
    
    {hidden ? <img className="hidden_extension_logo" alt="extension logo when hidden" src={getImgSrc("icon128")} onClick={()=>setHidden(!hidden)} /> : ""}
    
    <div className= {`react_chrome_extension ${hidden && 'hidden'}`}>

      <img className="options_icon" src={getImgSrc("settingsGear")} alt="open configuration options window" onClick={()=>sendMessageToBackground("openOptionsPage")} />
      <span className="close_icon" onClick={()=>setHidden(!hidden)}>&times;</span>

      <div className="img_container">
        <img alt="extension logo" src={getImgSrc("icon128")} onClick={() => {
          window.open("https://github.com/larraagirrejulen/GrAL", '_blank');
          window.open("https://github.com/Itusil/TFG", '_blank')
        }} />
      </div>

      <EvaluationScope /> 
      <EvaluatorSelectionSection /> 
      <EvaluationSection /> 
      <ResultSection />

    </div>

  </>);
}





function EvaluationScope (): JSX.Element {

  const [isOpen, setIsOpen] = useState(localStorage.getItem("evaluated") !== "true");

  const [webPageList, setWebPageList] = useState([{name: window.document.title, url: window.location.href}]);

  const [newWebPage, setNewWebPage] = useState({ name: "", url: "" });
  const [editItemIndex, setEditItemIndex] = useState(-1);

  const handleAddItem = () => {
    setEditItemIndex(webPageList.length);
    const newListItem = { name: "", url: "" }
    setNewWebPage(newListItem);
    const newList = [...webPageList, newListItem];
    setWebPageList(newList);
    localStorage.setItem("scope", JSON.stringify(newList));
  };

  const handleEditItem = (index:any) => {
    setEditItemIndex(index);
    setNewWebPage(webPageList[index]);
  };

  const handleUpdateItem = () => {

    const url = new URL(window.location.href);
    const baseUrl = url.origin + "/";
    if(newWebPage.name === ""){
      alert("Wrong web page name");
      return;
    }else if(!newWebPage.url.startsWith(baseUrl)){
      alert("URL must start with: " + baseUrl);
      return;
    }

    const newList = [...webPageList];
    newList[editItemIndex] = newWebPage;
    setWebPageList(newList);
    localStorage.setItem("scope", JSON.stringify(newList));
    setNewWebPage({ name: "", url: "" });
    setEditItemIndex(-1);
  };

  const handleDeleteItem = (index:any) => {
    const newList = [...webPageList];
    newList.splice(index, 1);
    setWebPageList(newList);
    localStorage.setItem("scope", JSON.stringify(newList));
  };

  useEffect(() => { 
    const storedScope = localStorage.getItem("scope");
    if(storedScope !== null){
      if(JSON.parse(storedScope).length > 0){
        setWebPageList(JSON.parse(storedScope));
      }
    }else{
      localStorage.setItem("scope", JSON.stringify(webPageList));
    }     
  }, [webPageList]);

  return ( <div className="scope_section">

      <div className="header" onClick={() => setIsOpen((prev:any) => !prev) }>
        <img src = { isOpen ? getImgSrc("extendedArrow") : getImgSrc("contractedArrow") } alt="dropdown_arrow" />
        <span>Evaluation scope</span>
      </div>

      <div className="body" style={isOpen ? {display: "block"} : {display: "none"}}>
        <ul className="scopeInputList">
          {webPageList.map((webPage:any, index:any)=>(
            <li className="scopeInput">
                {editItemIndex === index ? (
                  <div>
                  <input
                    type="text"
                    placeholder="Name"
                    value={newWebPage.name}
                    onChange={(e) =>
                      setNewWebPage({ ...newWebPage, name: e.target.value })
                    }
                  />
                  <input
                    type="text"
                    placeholder="URL"
                    value={newWebPage.url}
                    onChange={(e) =>
                      setNewWebPage({ ...newWebPage, url: e.target.value })
                    }
                  />
                  <button onClick={handleUpdateItem}>Save</button>
                  {newWebPage.name === "" && newWebPage.url === ""  ? 
                    <button onClick={() => handleDeleteItem(index)}>Cancel</button> 
                  : null}
                  
                </div>
              ) : (
                <div>
                  <span onClick={() => { window.open(webPage.url, '_blank'); }}>{webPage.name}</span>
                  <img className="edit icon" alt="edit web page data" src={getImgSrc("edit")} onClick={() => handleEditItem(index)} />
                  <img className="delete icon" alt="remove web page from list" src={getImgSrc("delete")} onClick={() => handleDeleteItem(index)} />
                </div>
              )}
            </li>
          ))}
        </ul>
        <div>
          <button className='addWebPageBtn' onClick={handleAddItem}>Add web page</button>
        </div>
      </div>
    
  </div> );
}




/**
 * A React component that allows the user to select which accessibility evaluators to use.
 * 
 * @function EvaluatorSelectionSection
 * @returns {JSX.Element} The JSX code for rendering the component.  
*/
function EvaluatorSelectionSection (): JSX.Element {

  const [isOpen, setIsOpen] = useState(localStorage.getItem("evaluated") !== "true");

  const [checkboxes, setCheckboxes] = useState([
    { checked: false, label: "AccessMonitor", href: "https://accessmonitor.acessibilidade.gov.pt/"},
    { checked: false, label: "AChecker", href: "https://achecker.achecks.ca/checker/index.php"},
    { checked: false, label: "Mauve", href: "https://mauve.isti.cnr.it/singleValidation.jsp"},
    { checked: false, label: "A11y library", href: "https://github.com/ainspector/a11y-evaluation-library"},
    { checked: false, label: "Pa11y", href: "https://github.com/pa11y/pa11y"},
    { checked: false, label: "Lighthouse", href: "https://developer.chrome.com/docs/lighthouse/overview/"}
  ]);

  const handleCheckboxChange = (index:any) => {
    const newCheckboxes = [...checkboxes];
    newCheckboxes[index].checked = !newCheckboxes[index].checked;
    setCheckboxes(newCheckboxes);
    localStorage.setItem("checkboxes", JSON.stringify(newCheckboxes));
  };

  /**
   * useEffect hook that sets the state of checkboxes based on the values stored in localStorage.
   * If no values are found in localStorage, the initial state of checkboxes is stored in localStorage.
   * 
   * @param {array} checkboxes - The current state of the checkboxes
  */
  useEffect(() => {
    const storedCheckboxes = localStorage.getItem("checkboxes");
    if(storedCheckboxes !== null){
      setCheckboxes(JSON.parse(storedCheckboxes));
    }else{
      localStorage.setItem("checkboxes", JSON.stringify(checkboxes));
    } 
  }, [checkboxes]);

  return ( <div className="evaluator_selection_section">

      <div className="header" onClick={() => setIsOpen((prev:any) => !prev) }>
        <img src = { isOpen ? getImgSrc("extendedArrow") : getImgSrc("contractedArrow") } alt="dropdown_arrow" />
        <span>Select evaluators</span>
      </div>

      <div className="body" style={isOpen ? {display: "block"} : {display: "none"}}>
        {checkboxes.map((checkbox:any, index:any) => (
          <div className="checkbox-wrapper">
            <div className="checkbox">
              <input type="checkbox" checked={checkbox.checked} onChange={()=>handleCheckboxChange(index)} className={checkbox.checked && "checked" } />
              <span onClick={() => { window.open(checkbox.href, '_blank'); }}>{checkbox.label}</span>
            </div><br/>
            <span>{checkbox.checked ? "Selected" : "Unchecked"}</span>
          </div>
        ))}
      </div>
    
  </div> );
}




/**
 * A React component that allows the user to make a new accesibility evaluation, remove a stored report,
 * download a stored report, or upload a new report
 * 
 * @function EvaluationSection
 * @returns {JSX.Element} - The EvaluationSection component.
*/
function EvaluationSection (): JSX.Element {

  const [isOpen, setIsOpen] = useState(localStorage.getItem("evaluated") !== "true");
  const [isLoading, setIsLoading] = useState(false);
  const [evaluated, setEvaluated] = useState(false);

  useEffect(() => { 
    setEvaluated(localStorage.getItem("evaluated") === "true");   
  }, []);

  return ( <div className="evaluation_section">

      <div className="header" onClick={() => setIsOpen((prev:any) => !prev) }>
        <img src = { isOpen ? getImgSrc("extendedArrow") : getImgSrc("contractedArrow") } alt="dropdown_arrow" />
        <span>Evaluation options</span>
      </div>
      <div className="body" style={isOpen ? {display: "block"} : {display: "none"}}>

        <button id="btn_get_data" className="button primary" onClick={()=>{performEvaluation(setIsLoading)}} disabled={isLoading}>
          {isLoading ? <BeatLoader size={8} color="#ffffff" /> : "Evaluate current page"}
        </button><br/>

        {evaluated ? <>
          <button id="btn_clear_data" className="button secondary" onClick={removeStoredReport} disabled={isLoading}>Clear stored data</button><br/>
          <button id="btn_download" className="button primary" onClick={downloadStoredReport} disabled={isLoading}>Download report</button><br/>
        </> : null}
        
        <label id="btn_upload" className="button secondary"><input type="file" accept=".json" onChange={(event) => uploadNewReport(event)} disabled={isLoading}/>Upload Report</label>
      
      </div>
    
  </div> );
}




/**
 * A React component that allows the user to see and manipulate the results of the current stored report
 * 
 * @function ResultSection
 * @returns {JSX.Element} - React component
*/
function ResultSection(): JSX.Element {
  
  const [conformanceLevels, setConformanceLevels] = useState(['A', 'AA']);
  function handleLevelClick (level:any) {
    const levels = level === 'A' ? ['A'] : (level === 'AA' ? ['A', 'AA'] : ['A', 'AA', 'AAA']);
    setConformanceLevels(levels);
    localStorage.setItem("conformanceLevels", JSON.stringify(levels));
  };

  /**
   * React hook that runs after every render of the component and sets the conformance levels
   * from the stored value in local storage if it exists. If not, it sets the initial value of
   * conformance levels and stores it in local storage.
   * 
   * @param {array} conformanceLevels - an array of strings representing the selected conformance levels
  */
  useEffect(() => {
    const storedConformanceLevels = localStorage.getItem("conformanceLevels");
    if(storedConformanceLevels !== null){
      setConformanceLevels(JSON.parse(storedConformanceLevels));
    }else{
      localStorage.setItem("conformanceLevels", JSON.stringify(conformanceLevels));
    }
  }, [conformanceLevels]);

  return ( 
    <div className="result_section">

      <div className="header"><span>Evaluation Results</span></div>

      <div className="body">
        {localStorage.getItem("evaluated") === "true" ? <>

          <div className='conformanceLevelSelector'>
            <p>Select conformace level:</p>
            <div className="level-container">
              {["A", "AA", "AAA"].map((level:any) => (
                <div className={`conformanceLevels ${conformanceLevels.includes(level) ? 'selected' : ''}`} onClick={() => handleLevelClick(level)}>{level}</div>
              ))}
            </div>
          </div>

          <ResultsTable conformanceLevels={conformanceLevels}/>
        
        </> : 
          <div style={{textAlign: "center", padding:"15px 0"}}>Website has not been evaluated</div>
        }
      </div>

    </div> 
  );

}

