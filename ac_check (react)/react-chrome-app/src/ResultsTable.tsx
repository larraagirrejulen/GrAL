
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

          <button className="collapsible" onClick={()=>handleCollapsible1sChange(index)}>
            <table style={{tableLayout: "fixed",  overflowWrap: "break-word"}}>
              <tr>
                <td style={{width:"68%"}}>{section.category}</td>
                <td>{section.passed + " " + section.failed + "  " + section.cannot_tell + "  " + section.not_present + "  " + section.not_checked}</td>
              </tr>
            </table>
          </button>
          { collapsible1s[index] ? <Collapsible1 section={section} /> : ""}
        </>))}
      </div>
    );
    
}



function Collapsible1({section}:any){

    const [collapsible2s, setCollapsible2s] = useState(Array(section.subsection.length).fill(false));

    const handleCollapsible2sChange = (index:any) => {
        const newCollapsible2s = [...collapsible2s];
        newCollapsible2s[index] = !collapsible2s[index];
        setCollapsible2s(newCollapsible2s);
    };

    return(<> {section.subsection.map((subsection:any, index:any) => (<>
        
        <button className="collapsible table1" onClick={()=>handleCollapsible2sChange(index)}>
        <table style={{width:"100%", tableLayout: "fixed", overflowWrap: "break-word"}}>
            <tr>
            <td style={{fontSize:"10px", width:"70%", whiteSpace:"normal", textAlign: "left"}}>{subsection.subsection}</td>
            <td>{subsection.passed + " " + subsection.failed + "  " + subsection.cannot_tell + "  " + subsection.not_present + "  " + subsection.not_checked}</td>
            </tr>
        </table>
        </button>
        { collapsible2s[index] ? <Collapsible2 subsection={subsection} /> : ""}
    
    </>))} </>);
}



function Collapsible2({subsection}:any){

    const [isOpen, setIsOpen] = useState(false);

    const [collapsible3s, setCollapsible3s] = useState(Array(subsection.sub2section.length).fill(false));

    const handleCollapsible3sChange = (index:any) => {
        const newCollapsible3s = [...collapsible3s];
        newCollapsible3s[index] = !collapsible3s[index];
        setCollapsible3s(newCollapsible3s);
    };

    return(<> {subsection.sub2section.map((sub2section:any, index:any) => (<>

        <button className="collapsible table2" style={{backgroundColor: sub2section.background_color}} onClick={() => {setIsOpen((prev:any) => !prev); handleCollapsible3sChange(index)}}>
            <table style={{width:"100%", tableLayout: "fixed", overflowWrap: "break-word"}}>
                <tr>
                {sub2section.hasOwnProperty("results") ? <>
                    <td style={{width:"15%"}}>
                        <img src={ isOpen ? getArrowUpSrc() : getArrowSrc() } alt="Show information" height="20px"/>
                    </td>
                    <td style={{width:"55%", fontSize:"10px",  textAlign:"left"}}>{sub2section.sub2section}</td>
                </>: <>
                    <td style={{width:"70%", fontSize:"10px",  textAlign:"left"}}>{sub2section.sub2section}</td>
                    <td style={{fontSize:"9px"}}><b>{sub2section.result_text}</b></td>
                </>}
                </tr>
            </table>
        </button>
        {sub2section.hasOwnProperty("results") && collapsible3s[index] ? <Collapsible3 sub2section={sub2section} /> : "" }
    
    </>))} </>);
}



function Collapsible3({sub2section}:any){

    return(
        <table className="tabla_resultados">
        {sub2section.results.map((result:any, index:any) => (<>
        
            <tr><td><u>Analizer</u>:  <b>{result.assertor}</b></td></tr>
            <tr><td><u>Result</u>:  <b>{result.outcome}</b></td></tr>
            <tr><td><u>Message:</u></td></tr>
            <tr><td>{result.description}</td></tr>

            {result.hasOwnProperty("solucion") ? <>
                <tr><td><u>Possible solution</u>:</td></tr>
                <tr><td>{result.solucion}</td></tr> 
            </> : ""}

            {result.hasOwnProperty("pointers") ? <>
                <tr><td><u>Code</u>:</td></tr>
                <tr><td>
                {result.pointers.map((pointer:any, index:any) => (<>
            
                    <code className="codigo_analisis" style={{cursor: "pointer"}} data-pointed-xpath={pointer.pointed_xpath}>{pointer.pointed_html}</code>

                </>))};
                <br/><br/></td></tr>
            </> : ""}

        </>))} 
        </table>
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