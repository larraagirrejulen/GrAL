import './css/main.css';
import './css/selection_dropdown.css';
import './css/evaluation_dropdown.css';
import './css/result_section.css';

import { useState, useEffect, useRef } from "react";
import { getLogoImage, getArrowSrc, getArrowUpSrc } from './js/extension_images.js';
//import pruebaAccessMonitor from './js/jquery_listeners.js';
//import addListeners from './js/listeners.js';



/*function getCollapsibles(node:any) {
  console.log(node);
  return node.getElementsByClassName("collapsible_tabla");
}*/
/**
 * Listener for clicking on an element of the results
 */
/*function collapsible1(elem:any){
  console.log("aaaaaaaaa");
  elem.classList.toggle("active");
  var content = elem.nextElementSibling;
  if (content.style.display === "block") {
  content.style.display = "none";
  } else {
  content.style.display = "block";
  }
}*/

export default function App() {

  const [logoImgSrc, setLogoImgSrc] = useState("");
  
  useEffect(() => { 
    setLogoImgSrc(getLogoImage());
    //pruebaAccessMonitor();

    /*const collapsibles = getCollapsibles(ref.current);
    console.log(collapsibles);
    for (let i = 0; i < collapsibles.length; i++) {
      console.log(i);
      console.log(collapsibles.item(i));
      collapsibles.item(i).addEventListener('click', collapsible1, { passive: true });
    }*/
    
  }, [])

  return (<>
      <div className="img_container">
        <img id="react_extension_logo_image" className="img_logo" alt="extension logo" src={logoImgSrc} />
      </div>

      <Dropdown ident="selection_dropdown" label="Select evaluators:" type="selection" />
      <Dropdown ident="evaluation_dropdown" label="Evaluation options:" type="evaluation" />
      <Dropdown ident="result_dropdown" label="Evaluation results" type="result" />
      
      <button id="prueba"> a11y proba </button>
      <button id="http"> http request </button>
      <button id="fetch"> fetch proba </button>
  </>);
}



const Dropdown = ({ident, label, type}:any) => {

  const [isOpen, setIsOpen] = useState(true);

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

  const ref = useRef(null); // reference to DOM
  const [result, setResult] = useState({
    resultTableContent: "<div style='text-align:center'><text style='font-size:14px'>No data stored</text></div>",
    contentTableContent: ""
  });
  const evaluators = [
    { cId: "AM_checkbox", cCheck: true, cLabel: "AccessMonitor", cHref: "https://accessmonitor.acessibilidade.gov.pt/" },
    { cId: "AC_checkbox", cCheck: false, cLabel: "AChecker", cHref: "https://achecker.achecks.ca/checker/index.php" },
    { cId: "MV_checkbox", cCheck: false, cLabel: "Mauve", cHref: "https://mauve.isti.cnr.it/singleValidation.jsp" },
    { cId: "A11Y_checkbox", cCheck: false, cLabel: "A11Y library", cHref: "https://github.com/ainspector/a11y-evaluation-library" }
  ];

  useEffect(() => {
    loadStoredReport(setResult);
  }, [])

  return (<>{
    (type === "selection" ?
      evaluators.map(({ cId, cCheck, cLabel, cHref }, i) => (<> <Checkbox id={cId} check={cCheck} label={cLabel} href={cHref}/><br/> </>))
    : ( type === "evaluation" ? 
    <>
      <div className="button_wrapper">
        <label id="btn_get_data" className="button primary">Get automatically <br/> generated report</label><br/>
        <label id="btn_clear_data" className="button secondary"> Clean stored data </label>
        <label id="btn_download" className="button primary">Download report</label>
        <label id="btn_upload" className="button secondary"><input type="file" accept=".json"/>Upload Report</label>
      </div>
    </> : <>
      <p id="result_table" dangerouslySetInnerHTML={{__html: result.resultTableContent}}></p>
      <p id="content_table" dangerouslySetInnerHTML={{__html: result.contentTableContent}}  ref={ref}></p>
    </>))
  }</>);
}



const Checkbox = ({id, check, label, href}:any ) => {
  const [isChecked, setIsChecked] = useState(check);
  return (
    <div className="checkbox-wrapper">
      <div className="checkbox">
        <input id={id} type="checkbox" checked={isChecked} onChange={() => setIsChecked((prev:any) => !prev)} className={isChecked ? "checked" : ""} />
        <a href={href}>{label}</a>
      </div><br/>
      <span>{isChecked ? "Selected" : "Unchecked"}</span>
    </div>
  );
}



function loadStoredReport(setResult:any){
  
  var jsonT:any = localStorage.getItem("json");
  var jsonTabla = localStorage.getItem("tabla_resultados");
  var json = JSON.parse(jsonT);
  var main = localStorage.getItem("tabla_main");

  if (json != null && main != null){
    setResult({
      resultTableContent: jsonTabla,
      contentTableContent: main
    });
  }
}