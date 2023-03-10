
import { useState } from "react";
import { getArrowSrc, getArrowUpSrc } from './js/extension_images.js';


export default function ResultsTable({results}:any){
  
    const [collapsible1s, setCollapsible1s] = useState([false, false, false, false]);
  
    const handleCollapsible1sChange = (index:any) => {
      const newCollapsible1s = [...collapsible1s];
      newCollapsible1s[index] = !collapsible1s[index];
      setCollapsible1s(newCollapsible1s);
    };
  
    return(
      <div className = "table_container">
        <SummaryAndHeaders results={results} />
        {results.resultsContent.map((section:any, index:any) => (<>

          <button className="collapsible_tabla" onClick={()=>handleCollapsible1sChange(index)}>
            <table style={{tableLayout: "fixed",  overflowWrap: "break-word"}}>
              <tr>
                <td style={{width:"68%"}}>{section.category}</td>
                <td>{section.passed + " " + section.failed + "  " + section.cannot_tell + "  " + section.not_present + "  " + section.not_checked}</td>
              </tr>
            </table>
          </button>
          { collapsible1s[index] ?
            <Collapsible1 section={section} />
            : ""}

        </>))}
      </div>
    );
    
}
  
function SummaryAndHeaders({results}:any){
return(<>
    <table className="summary_table">
        <tr><th style={{backgroundColor: "#C8FA8C"}} title='Passed'>P</th><th style={{backgroundColor: "#FA8C8C"}} title='Failed'>F</th><th style={{backgroundColor: "#F5FA8C"}} title='Can&#39;t tell'>CT</th><th style={{backgroundColor: "#FFFFFF"}} title='Not Present'>NP</th><th style={{backgroundColor: "#8CFAFA"}} title='Not checked'>NC</th></tr>
        <tr><th>{results.resultsSummary.passed}</th><th>{results.resultsSummary.failed}</th><th>{results.resultsSummary.cannot_tell}</th><th>{results.resultsSummary.not_present}</th><th>{results.resultsSummary.not_checked}</th></tr>
    </table>
    <table className="results_table">
        <tr>
        <th style={{width:"68%", backgroundColor:"white"}}>Standard</th>
        <th style={{backgroundColor: "#C8FA8C"}} title='Passed'>P</th><th style={{backgroundColor: "#FA8C8C"}} title='Failed'>F</th><th style={{backgroundColor: "#F5FA8C"}} title='Can&#39;t tell'>CT</th><th style={{backgroundColor: "#FFFFFF"}} title='Not Present'>NP</th><th style={{backgroundColor: "#8CFAFA"}} title='Not checked'>NC</th>
        </tr>
    </table>
</>);
}

function Collapsible1({section}:any){

const [collapsible2s, setCollapsible2s] = useState(Array(section.subsection.length).fill(false));

const handleCollapsible2sChange = (index:any) => {
    const newCollapsible2s = [...collapsible2s];
    newCollapsible2s[index] = !collapsible2s[index];
    setCollapsible2s(newCollapsible2s);
};

return(
    <div className="content_tabla">
    {section.subsection.map((subsection:any, index:any) => (<>
    
        <button type="button" className="collapsible_tabla2" onClick={()=>handleCollapsible2sChange(index)}>
        <table style={{width:"100%", tableLayout: "fixed", overflowWrap: "break-word"}}>
            <tr>
            <td style={{fontSize:"10px", width:"70%", whiteSpace:"normal", textAlign: "left"}}>{subsection.subsection}</td>
            <td>{subsection.passed + " " + subsection.failed + "  " + subsection.cannot_tell + "  " + subsection.not_present + "  " + subsection.not_checked}</td>
            </tr>
        </table>
        </button>
        { collapsible2s[index] ?
        <Collapsible2 subsection={subsection} />
        : ""}
    </>))}
    </div>
);
}

function Collapsible2({subsection}:any){

const [isOpen, setIsOpen] = useState(false);

return(
    <div className="content_tabla">
    {subsection.sub2section.map((sub2section:any, index:any) => (<>
        <button type="button" className="collapsible_tabla3" style={{backgroundColor: sub2section.background_color}}>
        <table style={{width:"100%", tableLayout: "fixed", overflowWrap: "break-word"}}>
            <tr>
            {sub2section.hasOwnProperty("results") ? <>
                <td style={{width:"15%"}} onClick={() => setIsOpen((prev:any) => !prev) }>
                    <img src={ isOpen ? getArrowUpSrc() : getArrowSrc() } alt="Show information" height="20px"/>
                </td>
                <td style={{width:"55%", fontSize:"10px",  textAlign:"left"}}>sub2section.sub2section</td>
            </>: <>
                <td style={{width:"70%", fontSize:"10px",  textAlign:"left"}}>sub2section.sub2section</td>
                <td style={{fontSize:"9px"}}><b>sub2section.result_text</b></td>
            </>}
            </tr>
        </table>
        </button>
        <div className="content_tabla">

        </div>
    </>))}
    </div>
);
}
