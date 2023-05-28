
import '../../../styles/sections/resultSection/reportResults.scss';

import { useEffect, useState } from "react";
import ResultsTable from './ResultsTable';
import SummaryTable from './SummaryTable';



/**
 * A React component that allows the user to see and manipulate the results of the current stored report
 * 
 * @function ResultSection
 * @returns {JSX.Element} - React component
*/
export default function ReportResults(): JSX.Element {
  
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
    <div id="resultSection">

      <div className="header"><span>Report Results</span></div>

      <div className="body">
        {localStorage.getItem("evaluated") === "true" ? <>

          <div id="conformanceLevelSelector">
            <p>Select conformace level:</p>
            <div className="level-container">
              {["A", "AA", "AAA"].map((level:any) => (
                <div className={`conformanceLevels ${conformanceLevels.includes(level) ? 'selected' : ''}`} onClick={() => handleLevelClick(level)}>{level}</div>
              ))}
            </div>
          </div>

          <SummaryTable conformanceLevels={conformanceLevels}/>

          <ResultsTable conformanceLevels={conformanceLevels}/>
        
        </> : 
          <div style={{textAlign: "center", padding:"15px 0"}}>Website has not been evaluated</div>
        }
      </div>

    </div> 
  );

}

