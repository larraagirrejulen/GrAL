
import './css/resultsTable.css';

import { useState, useEffect } from "react";
import { getArrowSrc, getArrowUpSrc, getOptions } from './js/extensionUtils.js';
import parse from 'html-react-parser';
import { getFromChromeStorage } from './js/extensionUtils.js';



export default function ResultsTable({activeConformanceLevels}:any){

    const [mantainExtended, setMantainExtended] = useState(false);
    const [reportTableContent, setReportTableContent] = useState([]);
    useEffect(() => {
        (async ()=>{ 
            setMantainExtended(await getOptions("mantainExtended"));
            setReportTableContent(await getFromChromeStorage("reportTableContent")); 
        })();
    }, []);
   
    const [selectedMainCategories, setSelectedMainCategories] = useState(Array(reportTableContent.length).fill(false));
    const handleMainCategoryStateChange = (index:any) => {
        const newStates = mantainExtended ? [...selectedMainCategories] : Array(reportTableContent.length).fill(false);
        newStates[index] = !selectedMainCategories[index];
        setSelectedMainCategories(newStates);
    };

    
    return(
      <div className = "results_container">
        <Summary activeConformanceLevels={activeConformanceLevels} />
        <div className="table_container">
            <table>
                <thead>
                    <tr> <th>Standard</th> <OutcomeHeaders/> </tr>
                </thead>
                <tbody>
                    {reportTableContent.map((mainCategory:any, index:any) => (<>
                        <tr className="collapsible mainCategory" onClick={()=>handleMainCategoryStateChange(index)}>
                            <td>{mainCategory.categoryTitle}</td>
                            <ResultCount category={mainCategory} activeConformanceLevels={activeConformanceLevels}/>
                        </tr>
                        { selectedMainCategories[index] ? 
                            <SubCategory subCategories={mainCategory.subCategories} mantainExtended={mantainExtended} activeConformanceLevels={activeConformanceLevels} /> 
                        : null }
                    </>))}
                </tbody>
            </table>
        </div>
        
      </div>
    );
    
}


function OutcomeHeaders(){
    return(<>
        <th className="passed" title='Passed' style={{backgroundColor:"#C8FA8C"}}>P</th>
        <th className="failed" title='Failed' style={{backgroundColor:"#FA8C8C"}}>F</th>
        <th className="cantTell" title='Can&#39;t tell' style={{backgroundColor:"#F5FA8C"}}>CT</th>
        <th className="inapplicable" title='Not Present' style={{backgroundColor:"#FFFFFF"}}>NP</th>
        <th className="untested" title='Not checked' style={{backgroundColor:"#8CFAFA"}}>NC</th>
    </>);
}

function Summary(activeConformanceLevels:any){

    const [outcomesCount, setOutcomesCount] = useState([0, 0, 0, 0, 0]);

    useEffect(() => { 
        (async ()=>{
            const reportSummary = await getFromChromeStorage("reportSummary");
            let passed = 0, failed = 0, cantTell = 0, inapplicable = 0, untested = 0;

            for(const conformanceLevel of activeConformanceLevels){
                passed += reportSummary["earl:passed"][conformanceLevel];
                failed += reportSummary["earl:failed"][conformanceLevel];
                cantTell += reportSummary["earl:cantTell"][conformanceLevel];
                inapplicable += reportSummary["earl:inapplicable"][conformanceLevel];
                untested += reportSummary["earl:untested"][conformanceLevel];
            }
            setOutcomesCount([passed, failed, cantTell, inapplicable, untested]);
        })();
    });

    return(
        <table className="reportSummary">
            <tr> <OutcomeHeaders /> </tr>
            <tr> {outcomesCount.map((count:any) => ( <td>{count}</td> ))} </tr>
        </table>
    );
}

function ResultCount({category, activeConformanceLevels}:any){

    let passed = 0, failed = 0, cantTell = 0, inapplicable = 0, untested = 0;

    for(const conformanceLevel of activeConformanceLevels){
        passed += category.passed[conformanceLevel];
        failed += category.failed[conformanceLevel];
        cantTell += category.cantTell[conformanceLevel];
        inapplicable += category.inapplicable[conformanceLevel];
        untested += category.untested[conformanceLevel];
    }

    return(<>
        <td>{passed}</td><td>{failed}</td><td>{cantTell}</td><td>{inapplicable}</td><td>{untested}</td>
    </>);
}




function SubCategory({subCategories, mantainExtended, activeConformanceLevels}:any){

    const [selectedSubCategories, setSelectedSubCategories] = useState(Array(subCategories.length).fill(false));

    const handleSubCategoryStateChange = (index:any) => {
        const newStates = mantainExtended ? [...selectedSubCategories] : Array(subCategories.length).fill(false);
        newStates[index] = !selectedSubCategories[index];
        setSelectedSubCategories(newStates);
    };

    return(<> 
        {subCategories.map((subCategory:any, index:any) => (<>

            <tr className="collapsible subCategory" onClick={()=>handleSubCategoryStateChange(index)}>
                <td>{subCategory.subCategoryTitle}</td>
                <ResultCount category={subCategory} activeConformanceLevels={activeConformanceLevels} />
            </tr>
            { selectedSubCategories[index] ? 
                <Criterias criterias={subCategory.criterias} mantainExtended={mantainExtended} activeConformanceLevels={activeConformanceLevels}/> 
            : null }
        
        </>))} 
    </>);
}




function Criterias({criterias, mantainExtended, activeConformanceLevels}:any){

    const [selectedCriterias, setSelectedCriterias] = useState(Array(criterias.length).fill(false));

    const handleCriteriaStateChange = (index:any) => {
        const newStates = mantainExtended ? [...selectedCriterias] : Array(criterias.length).fill(false);
        newStates[index] = !selectedCriterias[index];
        setSelectedCriterias(newStates);
    };

    return(<> 
        {criterias.map((criteria:any, index:any) => (<>

            { activeConformanceLevels.includes(criteria.conformanceLevel) ? <>
            
                <tr className={"collapsible criteria " + criteria.outcome} onClick={() => {handleCriteriaStateChange(index)}}>
                    {criteria.hasOwnProperty("results") ? <>
                        <td colSpan={6}>
                            <img src={ selectedCriterias[index] ? getArrowUpSrc() : getArrowSrc() } alt="Show information" height="20px"/>
                            {criteria.criteria}
                        </td>
                    </>: <>
                        <td>{criteria.criteria}</td>
                        <td colSpan={5}>{criteria.outcome}</td>
                    </>}
                </tr>
                {criteria.hasOwnProperty("results") && selectedCriterias[index] ? 
                    <CriteriaResults criteriaResults={criteria.results} mantainExtended={mantainExtended} />
                : null }
        
            </> : null }

        </>))} 
    </>);
}



function CriteriaResults({criteriaResults, mantainExtended}:any){  

    const [selectedCriteriaResults, setSelectedCriteriaResults] = useState(Array(criteriaResults.length).fill(false));

    function handleCriteriaResultStateChange (index:any){
        const newStates = mantainExtended ? [...selectedCriteriaResults] : Array(criteriaResults.length).fill(false);
        newStates[index] = !selectedCriteriaResults[index];
        setSelectedCriteriaResults(newStates);
    }


    return(<>
        {criteriaResults.map((result:any, index:any) => (<>
            
            <tr className="collapsible criteriaResult" onClick={() => handleCriteriaResultStateChange(index)}>
                <td>
                    <img src={ selectedCriteriaResults[index] ? getArrowUpSrc() : getArrowSrc() } alt="Show information" height="20px"/>
                    {result.assertor}
                </td>
                <td colSpan={5}>
                    {result.outcome}
                </td>
            </tr>

            {selectedCriteriaResults[index] && <>

                <tr><td style={{textAlign:"left"}} colSpan={6}>{parse(result.description)}</td></tr>

                {result.hasOwnProperty("pointers") ? 
                    <CriteriaResultPointers resultPointers={result.pointers}  mantainExtended={mantainExtended} />
                : null }
                
            </>}
            

        </>))} 
    </>);
}


function CriteriaResultPointers({resultPointers, mantainExtended}:any){  

    const [selectedPointers, setSelectedPointers] = useState(Array(resultPointers.length).fill(false));

    function handlePointerClick (index:any){
        let newSelectedPointer = mantainExtended ? [...selectedPointers] : Array(resultPointers.length).fill(false);
        newSelectedPointer[index] = !selectedPointers[index];
        setSelectedPointers(newSelectedPointer);
    }

    const preStyles:any = {
        backgroundColor: "#f4f4f4",
        padding: "1rem",
        borderRadius: "5px",
        fontSize: "14px",
        cursor: "pointer"
    };

    /*useEffect(() => { 
        for(const pointer of result.pointers){
            console.log(pointer.xpath);
            const element:any = document.evaluate(pointer.pointed_xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            console.log(element);
            //element.style.border = "1px solid #005a6a";
        }
    });*/

    return(<>

        <tr><td style={{textAlign:"left"}}><u>Code pointers</u>:</td></tr>
        
        {resultPointers.map((pointer:any, index:any) => (<>

            <tr><td colSpan={6} style={{textAlign:"left"}}>
                <pre
                    className="codigo_analisis"
                    style={selectedPointers[index] ? { ...preStyles, border: "3px solid #FF3633" } : { ...preStyles, border: "1px solid #005a6a" }}
                    onClick={() => handlePointerClick(index)}
                >
                    {index + 1}. {parse(pointer.html)}
                </pre>       
            </td></tr>
        
        </>))}

    </>);
}



