import { useState, useEffect, createRef } from "react";
import './css/main.css';
import './css/selection_dropdown.css';
import './css/evaluation_dropdown.css';
import './css/result_section.css';
import {getLogoSrc, getArrowSrc, getArrowUpSrc} from './js/get_extension_images.js';



export default function App() {
  
  const [resultTableContent, setResultTableContent] = useState("");
  const [contentTableContent, setContentTableContent] = useState("");
  const [imgSrc, setImgSrc] = useState("");

  useEffect(() => {
    setImgSrc(getLogoSrc());
    loadStoredResults(setResultTableContent, setContentTableContent);
  }, [])

  function loadStoredResults(setResultTableContent:any, setContentTableContent:any){
    if(window.location.hostname !== 'www.w3.org'){
        var jsonT:any = localStorage.getItem("json");
        var jsonTabla = localStorage.getItem("tabla_resultados");
        var json = JSON.parse(jsonT);
        var main = localStorage.getItem("tabla_main");
        
        var texto:any = "";
        var texto2 = "";

        if (json == null) texto = "<div style='text-align:center'><text style='font-size:14px'>No data stored</text></div>";
        else texto = jsonTabla;

        if (main == null) texto2 = "<text style='font-size:26px'></text>";
        else texto2 = main;

        setResultTableContent(texto);
        setContentTableContent(texto2);
    }
  }

  return (
    <>
      <div className="img_container">
        <img id="react_extension_logo_image" className="img_logo" alt="extension logo image" src={imgSrc} />
      </div>

      <Dropdown id="selection_dropdown" className="selection_dropdown" label="Select evaluators:" checkbox={true}/>
      
      <Dropdown id="evaluation_dropdown" className="evaluation_dropdown" label="Evaluation options:" checkbox={false}/>
      
      <div className="result_section">
        <span>Report content:</span>
        <p id="result_table" dangerouslySetInnerHTML={{__html: resultTableContent}}></p>
        <p id="content_table" dangerouslySetInnerHTML={{__html: contentTableContent}}></p>
      </div>
      <button id="prueba"> a11y proba </button>
      <button id="fetch"> fetch proba </button>
    </>
  );
}

const Dropdown = ({id, className, label, checkbox}:any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [evaluators, setEvaluators] = useState([
    { cId: "AM_checkbox", cLabel: "AccessMonitor", cChecked: true, cHref: "https://accessmonitor.acessibilidade.gov.pt/" },
    { cId: "AC_checkbox", cLabel: "AChecker", cChecked: true, cHref: "https://achecker.achecks.ca/checker/index.php" },
    { cId: "A11Y_checkbox", cLabel: "A11Y library", cChecked: true, cHref: "https://github.com/ainspector/a11y-evaluation-library" }
  ]);
  return(
    <div id={id} className={className} >
      <div className="dropdown_header" onClick={() => setIsOpen((prev:any) => !prev)}>
        <img src = { isOpen ? getArrowUpSrc() : getArrowSrc() } alt="dropdown_arrow" />
        <span>{label}</span>
      </div>
      <div className="dropdown_body">
        { isOpen && (checkbox ? 
          evaluators.map(({ cId, cLabel, cChecked, cHref }, i) => (<><Checkbox id={cId} label={cLabel} checked={cChecked} href={cHref} /> <br/></>))
          : <>
            <div className="button_wrapper">
              <label id="btn_get_data" className="button primary">Get automatically <br/> generated report</label><br/>
              <label id="btn_clear_data" className="button secondary"> Clean stored data </label>
              <label id="btn_download" className="button primary">Download report</label>
              <label id="btn_upload" className="button secondary"><input type="file" accept=".json"/>Upload Report</label>
            </div>
          </>)
        } 
      </div>
    </div>
  );
}


const Checkbox = ({id, label, checked, href}:any ) => {
  const defaultChecked = checked ? true : false;
  const [isChecked, setIsChecked] = useState(defaultChecked);
  return (
    <div id={id} className="checkbox-wrapper">
      <div className="checkbox">
        <input type="checkbox" checked={isChecked} onChange={() => setIsChecked((prev:any) => !prev)} className={isChecked ? "checked" : ""} />
        <a href={href}>{label}</a>
      </div><br/>
      <span>{isChecked ? "Selected" : "Unchecked"}</span>
    </div>
  );
}



