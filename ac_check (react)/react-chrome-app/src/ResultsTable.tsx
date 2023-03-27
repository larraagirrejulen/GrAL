
import './css/ResultsTable.css';

import { useState } from "react";
import { getArrowSrc, getArrowUpSrc } from './js/extensionUtils.js';




function Summary({results,  activeLevels}:any){

    var passed = 0, failed = 0, cannot_tell = 0, not_present = 0, not_checked = 0;
    for(var level of activeLevels){
        passed += results.resultsSummary.passed[level];
        failed += results.resultsSummary.failed[level];
        cannot_tell += results.resultsSummary.cannot_tell[level];
        not_present += results.resultsSummary.not_present[level];
        not_checked += results.resultsSummary.not_checked[level];
    }

    return(<>
        <table className="summary">
            <tr><th style={{backgroundColor: "#C8FA8C"}} title='Passed'>P</th><th style={{backgroundColor: "#FA8C8C"}} title='Failed'>F</th><th style={{backgroundColor: "#F5FA8C"}} title='Can&#39;t tell'>CT</th><th style={{backgroundColor: "#FFFFFF"}} title='Not Present'>NP</th><th style={{backgroundColor: "#8CFAFA"}} title='Not checked'>NC</th></tr>
            <tr><td>{passed}</td><td>{failed}</td><td>{cannot_tell}</td><td>{not_present}</td><td>{not_checked}</td></tr>
        </table>
    </>);
}




export default function ResultsTable({results, activeLevels}:any){
  
    const [collapsibles, setCollapsibles] = useState([false, false, false, false]);
    const handleCollapsiblesChange = (index:any) => {
      const newCollapsibles = [...collapsibles];
      newCollapsibles[index] = !collapsibles[index];
      setCollapsibles(newCollapsibles);
    };
  
    return(
      <div className = "results_container">

        <Summary results={results} activeLevels={activeLevels} />

        <div className='table_container'>
            <table>
                <thead>
                    <tr>
                        <th>Standard</th>
                        <th style={{backgroundColor: "#C8FA8C"}} title='Passed'>P</th><th style={{backgroundColor: "#FA8C8C"}} title='Failed'>F</th><th style={{backgroundColor: "#F5FA8C"}} title='Can&#39;t tell'>CT</th><th style={{backgroundColor: "#FFFFFF"}} title='Not Present'>NP</th><th style={{backgroundColor: "#8CFAFA"}} title='Not checked'>NC</th>
                    </tr>
                </thead>
                <tbody>
                    {results.resultsContent.map((section:any, index:any) => (<>
                    <tr className="collapsible section" onClick={()=>handleCollapsiblesChange(index)}>
                        <td>{section.category}</td>
                        <Results section={section} activeLevels={activeLevels}/>
                    </tr>
                    { collapsibles[index] ? <Collapsible1 section={section} activeLevels={activeLevels} /> : ""}
                    </>))}
                </tbody>
            </table>
        </div>
        
        
      </div>
    );
    
}




function Collapsible1({section, activeLevels}:any){

    const [collapsibles, setCollapsibles] = useState(Array(section.subsection.length).fill(false));

    const handleCollapsiblesChange = (index:any) => {
        const newCollapsibles = [...collapsibles];
        newCollapsibles[index] = !collapsibles[index];
        setCollapsibles(newCollapsibles);
      };

    return(<> {section.subsection.map((subsection:any, index:any) => (<>

        <tr className="collapsible table1" onClick={()=>handleCollapsiblesChange(index)}>
            <td>{subsection.subsection}</td>
            <Results section={subsection} activeLevels={activeLevels}/>
        </tr>
        { collapsibles[index] ? <Collapsible2 subsection={subsection} activeLevels={activeLevels} /> : ""}
    
    </>))} </>);
}




function Collapsible2({subsection, activeLevels}:any){

    const [isOpen, setIsOpen] = useState(Array(subsection.sub2section.length).fill(false));
    const handleIsOpen = (index:any) => {
        const newIsOpen = [...isOpen];
        newIsOpen[index] = !isOpen[index];
        setIsOpen(newIsOpen);
    };

    const [collapsible3s, setCollapsible3s] = useState(Array(subsection.sub2section.length).fill(false));

    const handleCollapsible3sChange = (index:any) => {
        const newCollapsible3s = [...collapsible3s];
        newCollapsible3s[index] = !collapsible3s[index];
        setCollapsible3s(newCollapsible3s);
    };

    return(<> {subsection.sub2section.map((sub2section:any, index:any) => (<>

        { activeLevels.includes(sub2section.conformanceLevel) ? <>
        
            <tr className="collapsible table2" style={{backgroundColor: sub2section.background_color}} onClick={() => {handleIsOpen(index); handleCollapsible3sChange(index)}}>
                {sub2section.hasOwnProperty("results") ? <>
                    <td colSpan={6}>
                        <img src={ isOpen[index] ? getArrowUpSrc() : getArrowSrc() } alt="Show information" height="20px"/>
                        {sub2section.sub2section}
                    </td>
                </>: <>
                    <td>{sub2section.sub2section}</td>
                    <td colSpan={5}>{sub2section.result_text}</td>
                </>}
            </tr>
            {sub2section.hasOwnProperty("results") && collapsible3s[index] ? <Collapsible3 sub2section={sub2section} /> : "" }
    
        </> : "" }


    
    </>))} </>);
}




function Collapsible3({sub2section}:any){

    return(<>
        {sub2section.results.map((result:any, index:any) => (<>
            
            <tr><td style={{textAlign:"left"}}><u>Analizer</u>:  </td><td colSpan={5}>{result.assertor}</td></tr>
            <tr><td style={{textAlign:"left"}}><u>Result</u>:  </td><td colSpan={5}>{result.outcome}</td></tr>
            <tr><td style={{textAlign:"left"}}><u>Message:</u></td></tr>
            <tr><td style={{textAlign:"left"}} colSpan={6}>{result.description}</td></tr>

            {result.hasOwnProperty("solucion") ? <>
                <tr><td style={{textAlign:"left"}}><u>Possible solution</u>:</td></tr>
                <tr><td style={{textAlign:"left"}}colSpan={6}>{result.solucion}</td></tr> 
            </> : ""}

            {result.hasOwnProperty("pointers") ? <>
                <tr><td style={{textAlign:"left"}}><u>Code</u>:</td></tr>
                
                {result.pointers.map((pointer:any, index:any) => (<>
                    <tr><td colSpan={6} style={{textAlign:"left"}}>
                        <code className="codigo_analisis" style={{cursor: "pointer"}} data-pointed-xpath={pointer.pointed_xpath}>{pointer.pointed_html}</code>             
                    </td></tr><br/>
                </>))};
            </> : ""}
            
        </>))} 
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

    return(<>
        <td>{passed}</td>
        <td>{failed}</td>
        <td>{cannot_tell}</td>
        <td>{not_present}</td>
        <td>{not_checked}</td>
    </>);
}
