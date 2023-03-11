
import { useState } from "react";
import { getArrowSrc, getArrowUpSrc } from './js/extension_images.js';


export default function ResultsTable({results, activeLevels}:any){
  
    const [collapsible1s, setCollapsible1s] = useState([false, false, false, false]);
    const handleCollapsible1sChange = (index:any) => {
      const newCollapsible1s = [...collapsible1s];
      newCollapsible1s[index] = !collapsible1s[index];
      setCollapsible1s(newCollapsible1s);
    };
  
    return(
      <div className = "table_container">
        <SummaryAndHeaders results={results} activeLevels={activeLevels} />
        {results.resultsContent.map((section:any, index:any) => (<>

          <button className="collapsible" onClick={()=>handleCollapsible1sChange(index)}>
            <table style={{tableLayout: "fixed",  overflowWrap: "break-word"}}>
              <tr>
                <td style={{width:"68%"}}>{section.category}</td>
                <Results section={section} activeLevels={activeLevels}/>
              </tr>
            </table>
          </button>
          { collapsible1s[index] ? <Collapsible1 section={section} activeLevels={activeLevels} /> : ""}
        </>))}
      </div>
    );
    
}



function Collapsible1({section, activeLevels}:any){

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
            <Results section={subsection} activeLevels={activeLevels}/>
            </tr>
        </table>
        </button>
        { collapsible2s[index] ? <Collapsible2 subsection={subsection} activeLevels={activeLevels} /> : ""}
    
    </>))} </>);
}



function Collapsible2({subsection, activeLevels}:any){

    const [isOpen, setIsOpen] = useState(false);

    const [collapsible3s, setCollapsible3s] = useState(Array(subsection.sub2section.length).fill(false));

    const handleCollapsible3sChange = (index:any) => {
        const newCollapsible3s = [...collapsible3s];
        newCollapsible3s[index] = !collapsible3s[index];
        setCollapsible3s(newCollapsible3s);
    };

    return(<> {subsection.sub2section.map((sub2section:any, index:any) => (<>

        { activeLevels.includes(sub2section.conformanceLevel) ? <>
        
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
    
        </> : "" }


    
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
            
                    <code className="codigo_analisis" style={{cursor: "pointer"}} data-pointed-xpath={pointer.pointed_xpath}>{pointer.pointed_html}</code>                    <br/><br/>

                </>))};
                <br/><br/></td></tr>
            </> : ""}

        </>))} 
        </table>
    );
}



function SummaryAndHeaders({results,  activeLevels}:any){

    var passed = 0, failed = 0, cannot_tell = 0, not_present = 0, not_checked = 0;
    for(var level of activeLevels){
        passed += results.resultsSummary.passed[level];
        failed += results.resultsSummary.failed[level];
        cannot_tell += results.resultsSummary.cannot_tell[level];
        not_present += results.resultsSummary.not_present[level];
        not_checked += results.resultsSummary.not_checked[level];
    }

    return(<>
        <table className="summary_table">
            <tr><th style={{backgroundColor: "#C8FA8C"}} title='Passed'>P</th><th style={{backgroundColor: "#FA8C8C"}} title='Failed'>F</th><th style={{backgroundColor: "#F5FA8C"}} title='Can&#39;t tell'>CT</th><th style={{backgroundColor: "#FFFFFF"}} title='Not Present'>NP</th><th style={{backgroundColor: "#8CFAFA"}} title='Not checked'>NC</th></tr>
            <tr><th>{passed}</th><th>{failed}</th><th>{cannot_tell}</th><th>{not_present}</th><th>{not_checked}</th></tr>
        </table>
        <table className="results_table">
            <tr>
            <th style={{width:"68%", backgroundColor:"white"}}>Standard</th>
            <th style={{backgroundColor: "#C8FA8C"}} title='Passed'>P</th><th style={{backgroundColor: "#FA8C8C"}} title='Failed'>F</th><th style={{backgroundColor: "#F5FA8C"}} title='Can&#39;t tell'>CT</th><th style={{backgroundColor: "#FFFFFF"}} title='Not Present'>NP</th><th style={{backgroundColor: "#8CFAFA"}} title='Not checked'>NC</th>
            </tr>
        </table>
    </>);
}



function Results({section, activeLevels}:any){

    var passed = 0, failed = 0, cannot_tell = 0, not_present = 0, not_checked = 0;
    for(var level of activeLevels){
        passed += section.passed[level];
        failed += section.failed[level];
        cannot_tell += section.cannot_tell[level];
        not_present += section.not_present[level];
        not_checked += section.not_checked[level];
    }

    return(
        <td>
            {passed + " " + failed + "  " + cannot_tell + "  " + not_present + "  " + not_checked}
        </td>
    )
}