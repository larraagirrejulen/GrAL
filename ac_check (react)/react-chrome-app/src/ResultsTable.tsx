
import './css/resultsTable.css';

import { useState, useEffect } from "react";
import { getArrowSrc, getArrowUpSrc, getOptions } from './js/extensionUtils.js';
import parse from 'html-react-parser';
import { getFromChromeStorage } from './js/extensionUtils.js';



export default function ResultsTable({activeLevels}:any){

    const [reportTableContent, setReportTableContent] = useState([]);
    const [mantainExtended, setMantainExtended] = useState(false);
    
    useEffect(() => {
        getOptions("mantainExtended", setMantainExtended);
        (async ()=>{ setReportTableContent(await getFromChromeStorage("reportTableContent")); })();
    }, []);

    const [collapsibles, setCollapsibles] = useState(Array(reportTableContent.length).fill(false));
    const handleCollapsiblesChange = (index:any, mantainExtended:any) => {
      const newCollapsibles = mantainExtended ? [...collapsibles] : Array(reportTableContent.length).fill(false);
      newCollapsibles[index] = !collapsibles[index];
      setCollapsibles(newCollapsibles);
    };
  
    return(
      <div className = "results_container">

        <Summary activeLevels={activeLevels} />

        <div className='table_container'>
            <table>
                <thead>
                    <tr>
                        <th>Standard</th>
                        <th style={{backgroundColor: "#C8FA8C"}} title='Passed'>P</th><th style={{backgroundColor: "#FA8C8C"}} title='Failed'>F</th><th style={{backgroundColor: "#F5FA8C"}} title='Can&#39;t tell'>CT</th><th style={{backgroundColor: "#FFFFFF"}} title='Not Present'>NP</th><th style={{backgroundColor: "#8CFAFA"}} title='Not checked'>NC</th>
                    </tr>
                </thead>
                <tbody>
                    {reportTableContent.map((section:any, index:any) => (<>
                    <tr className="collapsible section" onClick={()=>handleCollapsiblesChange(index, mantainExtended)}>
                        <td>{section.category}</td>
                        <Results section={section} activeLevels={activeLevels}/>
                    </tr>
                    { collapsibles[index] ? <Collapsible1 section={section} activeLevels={activeLevels} mantainExtended={mantainExtended}/> : ""}
                    </>))}
                </tbody>
            </table>
        </div>
        
      </div>
    );
    
}




function Summary({activeLevels}:any){

    const [outcomesCount, setOutcomesCount] = useState([0, 0, 0, 0, 0]);

    useEffect(() => { 
        (async ()=>{
            const reportSummary = await getFromChromeStorage("reportSummary");

            let passed = 0, failed = 0, cannot_tell = 0, not_present = 0, not_checked = 0;
            for(var level of activeLevels){
                passed += reportSummary.passed[level];
                failed += reportSummary.failed[level];
                cannot_tell += reportSummary.cannot_tell[level];
                not_present += reportSummary.not_present[level];
                not_checked += reportSummary.not_checked[level];
            }
            setOutcomesCount([passed, failed, cannot_tell, not_present, not_checked]);
        })();
    });

    return(
        <table className="summary">
            <tr><th style={{backgroundColor: "#C8FA8C"}} title='Passed'>P</th><th style={{backgroundColor: "#FA8C8C"}} title='Failed'>F</th><th style={{backgroundColor: "#F5FA8C"}} title='Can&#39;t tell'>CT</th><th style={{backgroundColor: "#FFFFFF"}} title='Not Present'>NP</th><th style={{backgroundColor: "#8CFAFA"}} title='Not checked'>NC</th></tr>
            <tr><td>{outcomesCount[0]}</td><td>{outcomesCount[1]}</td><td>{outcomesCount[2]}</td><td>{outcomesCount[3]}</td><td>{outcomesCount[4]}</td></tr>
        </table>
    );
}




function Collapsible1({section, activeLevels, mantainExtended}:any){

    const [collapsibles, setCollapsibles] = useState(Array(section.subsection.length).fill(false));

    const handleCollapsiblesChange = (index:any, mantainExtended:any) => {
        const newCollapsibles = mantainExtended ? [...collapsibles] : Array(section.subsection.length).fill(false);
        newCollapsibles[index] = !collapsibles[index];
        setCollapsibles(newCollapsibles);
      };

    return(<> 
        {section.subsection.map((subsection:any, index:any) => (<>

            <tr className="collapsible table1" onClick={()=>handleCollapsiblesChange(index, mantainExtended)}>
                <td>{subsection.subsection}</td>
                <Results section={subsection} activeLevels={activeLevels}/>
            </tr>
            { collapsibles[index] ? <Collapsible2 subsection={subsection} activeLevels={activeLevels} mantainExtended={mantainExtended} /> : ""}
        
        </>))} 
    </>);
}




function Collapsible2({subsection, activeLevels, mantainExtended}:any){

    const [collapsible3s, setCollapsible3s] = useState(Array(subsection.sub2section.length).fill(false));

    const handleCollapsible3sChange = (index:any, mantainExtended:any) => {
        const newCollapsible3s = mantainExtended ? [...collapsible3s] : Array(subsection.sub2section.length).fill(false);
        newCollapsible3s[index] = !collapsible3s[index];
        setCollapsible3s(newCollapsible3s);
    };

    return(<> 
        {subsection.sub2section.map((sub2section:any, index:any) => (<>

            { activeLevels.includes(sub2section.conformanceLevel) ? <>
            
                <tr className="collapsible table2" style={{backgroundColor: sub2section.background_color}} onClick={() => {handleCollapsible3sChange(index,mantainExtended)}}>
                    {sub2section.hasOwnProperty("results") ? <>
                        <td colSpan={6}>
                            <img src={ collapsible3s[index] ? getArrowUpSrc() : getArrowSrc() } alt="Show information" height="20px"/>
                            {sub2section.sub2section}
                        </td>
                    </>: <>
                        <td>{sub2section.sub2section}</td>
                        <td colSpan={5}>{sub2section.result_text}</td>
                    </>}
                </tr>
                {sub2section.hasOwnProperty("results") && collapsible3s[index] ? <Collapsible3 sub2section={sub2section} /> : "" }
        
            </> : "" }


        
        </>))} 
    </>);
}




function Collapsible3({sub2section}:any){

    return(<>
        {sub2section.results.map((result:any, index:any) => (<>
            
            <tr><td style={{textAlign:"left"}}><u>Analizer</u>:  </td><td colSpan={5}>{result.assertor}</td></tr>
            <tr><td style={{textAlign:"left"}}><u>Result</u>:  </td><td colSpan={5}>{result.outcome}</td></tr>
            <tr><td style={{textAlign:"left"}}><u>Message:</u></td></tr>
            <tr><td style={{textAlign:"left"}} colSpan={6}>{parse(result.description)}</td></tr>

            {result.hasOwnProperty("solucion") ? <>
                <tr><td style={{textAlign:"left"}}><u>Possible solution</u>:</td></tr>
                <tr><td style={{textAlign:"left"}}colSpan={6}>{result.solucion}</td></tr> 
            </> : ""}

            {result.hasOwnProperty("pointers") ? <>
                <tr><td style={{textAlign:"left"}}><u>Code</u>:</td></tr>
                
                {result.pointers.map((pointer:any, index:any) => (<>
                    <tr><td colSpan={6} style={{textAlign:"left"}}>
                        <Pointer pointer={pointer} index={index}/>         
                    </td></tr>
                </>))}
            </> : ""}
            
        </>))} 
    </>);
}


function Pointer({ pointer, index }:any) {
  
    const preStyles:any = {
        backgroundColor: "#f4f4f4",
        padding: "1rem",
        border: "1px solid #ccc",
        borderRadius: "5px",
        fontSize: "14px"
    };

    return (
      <pre
        className="codigo_analisis"
        style={{ ...preStyles, cursor: "pointer" }}
        data-pointed-xpath={pointer.pointed_xpath}
      >
        {index + 1}. {parse(pointer.pointed_html)}
      </pre>
    );
  }


function Results({section, activeLevels}:any){

    let passed = 0, failed = 0, cannot_tell = 0, not_present = 0, not_checked = 0;
    for(var level of activeLevels){
        passed += section.passed[level];
        failed += section.failed[level];
        cannot_tell += section.cannot_tell[level];
        not_present += section.not_present[level];
        not_checked += section.not_checked[level];
    }

    return(<>
        <td>{passed}</td>
        <td>{failed}</td>
        <td>{cannot_tell}</td>
        <td>{not_present}</td>
        <td>{not_checked}</td>
    </>);
}
