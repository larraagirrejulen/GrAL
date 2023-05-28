
import '../../styles/sections/selectEvaluators.scss';

import { useEffect, useState } from "react";

import Dropdown from '../reusables/DropdownSection';


/**
 * A React component that allows the user to select which accessibility evaluators to use.
 * 
 * @function EvaluatorSelectionSection
 * @returns {JSX.Element} The JSX code for rendering the component.  
*/
export default function EvaluatorSelection (): JSX.Element {

  const [checkboxes, setCheckboxes] = useState([
    { checked: false, label: "AccessMonitor - Website", href: "https://accessmonitor.acessibilidade.gov.pt/"},
    { checked: false, label: "AChecker - Website", href: "https://achecker.achecks.ca/checker/index.php"},
    { checked: false, label: "Mauve - Website", href: "https://mauve.isti.cnr.it/singleValidation.jsp"},
    { checked: false, label: "A11y - Library", href: "https://github.com/ainspector/a11y-evaluation-library"},
    { checked: false, label: "Pa11y - Library", href: "https://www.npmjs.com/package/pa11y"},
    { checked: false, label: "Lighthouse - Library", href: "https://developer.chrome.com/docs/lighthouse/overview/"}
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

  return ( 
    <Dropdown headerText={"Select evaluators"} classList={"last"}>

      {checkboxes.map((checkbox:any, index:any) => (
        <div className="checkbox-wrapper">

          <div className="checkbox">

            <input 
              type="checkbox" 
              checked={checkbox.checked} 
              onChange={()=>handleCheckboxChange(index)} 
              className={checkbox.checked && "checked" } 
            />
            <span onClick={() => { window.open(checkbox.href, '_blank'); }}>
              {checkbox.label}
            </span>
          </div><br/>

          <span>{checkbox.checked ? "Selected" : "Unchecked"}</span>

        </div>
      ))}
      
    </Dropdown>
  );
}