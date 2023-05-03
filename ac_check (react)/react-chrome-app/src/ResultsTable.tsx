
import './css/resultsTable.css';

import { useState, useEffect, useCallback } from "react";
import { getImgSrc, sendMessageToBackground } from './js/utils/chromeUtils.js';
import { setUseStateFromStorage } from './js/utils/reactUtils.js';
import { getElementByPath, clearHighlights } from './js/utils/highlightUtils.js';
import parse from 'html-react-parser';



const outcome2Background:any = {
    "passed": {backgroundColor: "#C8FA8C"},
    "failed": {backgroundColor: "#FA8C8C"},
    "cantTell": {backgroundColor: "#F5FA8C"},
    "inapplicable": {backgroundColor: "#FFFFFF"},
    "untested": {backgroundColor: "#8CFAFA"}
}



/**
 * Handles changes to a boolean state value in an array of state values.
 *
 * @param {Array<boolean>} useState - The current array of boolean state values.
 * @param {function} setUseState - The React `useState` hook function to update the state with the new array of boolean values.
 * @param {number} index - The index of the state value to change.
 * @param {boolean} mantainExtended - Whether to maintain the other values of the array.
 * @param {number} arrayLength - The length of the array to fill when adding a new state value.
 * @returns {void}
 */
function handleStateChange(useState:any, setUseState:any, index:any, mantainExtended:any, arrayLength:any): void{

    const newStates = mantainExtended ? [...useState] : Array(arrayLength).fill(false);
    newStates[index] = !useState[index];
    setUseState(newStates);

    clearHighlights();
}


export default function ResultsTable({conformanceLevels}:any){

    const [mantainExtended, setMantainExtended] = useState(false);
    const [reportTableContent, setReportTableContent] = useState([]);
    const [selectedMainCategories, setSelectedMainCategories] = useState(Array(reportTableContent.length).fill(false));

    useEffect(() => {
        (async ()=>{ 
            setUseStateFromStorage("mantainExtended", true, setMantainExtended, "could not get 'mantainExtended' option!");
            setUseStateFromStorage("reportTableContent", false, setReportTableContent, "'reportTableContent' is null or undefined!");
        })();
    }, []);
    
    return(
      <div className = "resultsContainer">
        <Summary conformanceLevels={conformanceLevels} />
        <div className="resultsTable">
            <table>
                <thead>
                    <tr> <th>Standard</th> <OutcomeHeaders/> </tr>
                </thead>
                <tbody>
                    {reportTableContent.map((mainCategory:any, index:any) => (<>
                        <tr className="collapsible mainCategory" onClick={()=>handleStateChange(selectedMainCategories, setSelectedMainCategories, index, mantainExtended, reportTableContent.length)}>
                            <td>{mainCategory.categoryTitle}</td>
                            <ResultCount category={mainCategory} conformanceLevels={conformanceLevels}/>
                        </tr>
                        { selectedMainCategories[index] ? 
                            <SubCategory subCategories={mainCategory.subCategories} mantainExtended={mantainExtended} conformanceLevels={conformanceLevels} /> 
                        : null }
                    </>))}
                </tbody>
            </table>
        </div>
        
      </div>
    );
    
}




function Summary({conformanceLevels}:any){

    const [outcomesCount, setOutcomesCount] = useState([0, 0, 0, 0, 0]);
    const [reportSummary, setReportSummary] = useState(null);

    useEffect(() => { 
        (async ()=>{
            setUseStateFromStorage("reportSummary", false, setReportSummary, "'reportSummary' is null or undefined!");
        })();
    },[]);

    useEffect(() => { 
        if(reportSummary){
            (async ()=>{
                let passed = 0, failed = 0, cantTell = 0, inapplicable = 0, untested = 0;
                for(const conformanceLevel of conformanceLevels){
                    passed += reportSummary["earl:passed"][conformanceLevel];
                    failed += reportSummary["earl:failed"][conformanceLevel];
                    cantTell += reportSummary["earl:cantTell"][conformanceLevel];
                    inapplicable += reportSummary["earl:inapplicable"][conformanceLevel];
                    untested += reportSummary["earl:untested"][conformanceLevel];
                }
                setOutcomesCount([passed, failed, cantTell, inapplicable, untested]);
            })();
        }
    },[conformanceLevels, reportSummary]);

    return(
        <table className="summaryTable">
            <tr> <OutcomeHeaders /> </tr>
            <tr> {outcomesCount.map((count:any) => ( <td>{count}</td> ))} </tr>
        </table>
    );
}

function OutcomeHeaders(){
    return(<>
        <th className="passed" title='Passed' style={{...outcome2Background["passed"]}}>P</th>
        <th className="failed" title='Failed' style={{...outcome2Background["failed"]}}>F</th>
        <th className="cantTell" title='Can&#39;t tell' style={{...outcome2Background["cantTell"]}}>CT</th>
        <th className="inapplicable" title='Not Present' style={{...outcome2Background["inapplicable"]}}>NP</th>
        <th className="untested" title='Not checked' style={{...outcome2Background["untested"]}}>NC</th>
    </>);
}

function ResultCount({category, conformanceLevels}:any){

    let passed = 0, failed = 0, cantTell = 0, inapplicable = 0, untested = 0;

    for(const conformanceLevel of conformanceLevels){
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




function SubCategory({subCategories, mantainExtended, conformanceLevels}:any){

    const [selectedSubCategories, setSelectedSubCategories] = useState(Array(subCategories.length).fill(false));

    return(<> 
        {subCategories.map((subCategory:any, index:any) => (<>

            <tr className="collapsible subCategory" onClick={()=>handleStateChange(selectedSubCategories, setSelectedSubCategories, index, mantainExtended, subCategories.length)}>
                <td>{subCategory.subCategoryTitle}</td>
                <ResultCount category={subCategory} conformanceLevels={conformanceLevels} />
            </tr>
            { selectedSubCategories[index] ? 
                <Criterias criterias={subCategory.criterias} mantainExtended={mantainExtended} conformanceLevels={conformanceLevels}/> 
            : null }
        
        </>))} 
    </>);
}




function Criterias({criterias, mantainExtended, conformanceLevels}:any){

    const [selectedCriterias, setSelectedCriterias] = useState(Array(criterias.length).fill(false));

    return(<> 
        {criterias.map((criteria:any, index:any) => (<>

            { conformanceLevels.includes(criteria.conformanceLevel) ? <>
            
                <tr className={"collapsible criteria"} style={{...outcome2Background[criteria.outcome]}} onClick={() => {handleStateChange(selectedCriterias, setSelectedCriterias, index, mantainExtended, criterias.length)}}>
                    <td colSpan={2}>
                        {criteria.hasOwnProperty("hasPart") ? <>
                            
                            <img src={ selectedCriterias[index] ? getImgSrc("extendedArrow") : getImgSrc("contractedArrow") } alt="Show information" height="20px"/>
                            {criteria.criteria}
                            
                        </> : <> {criteria.criteria} </> }
                    </td>
                    <td colSpan={4}>{criteria.outcome}</td>
                </tr>
                {criteria.hasOwnProperty("hasPart") && selectedCriterias[index] ? 
                    <CriteriaResults criteriaResults={criteria.hasPart} mantainExtended={mantainExtended} />
                : null }
        
            </> : null }

        </>))} 
    </>);
}



function CriteriaResults({criteriaResults}:any){  

    const [selectedCriteriaResults, setSelectedCriteriaResults] = useState(Array(criteriaResults.length).fill(false));

    function handleCriteriaResultStateChange (index:any){

        handleStateChange(selectedCriteriaResults, setSelectedCriteriaResults, index, false, criteriaResults.length);

        if(!selectedCriteriaResults[index] && criteriaResults[index].groupedPointers){

            const defaultStyles = Object.fromEntries(
                Object.entries(criteriaResults[index].groupedPointers).map(([groupKey, pointers]:any) => [
                    groupKey, []
                ])
            );

            for (const groupKey in criteriaResults[index].groupedPointers) {
                for(const pointer of criteriaResults[index].groupedPointers[groupKey]){

                    const element = getElementByPath(pointer.path, pointer.innerText);

                    if(element){
                        element.setAttribute("tabindex", "0");
                        defaultStyles[groupKey].push({"style": element.style.border, "path": pointer.path});
                    }else{
                        defaultStyles[groupKey].push(null);
                    }
                    
                }
            }

            sessionStorage.setItem("defaultStyles", JSON.stringify(defaultStyles));
        }

    }

    return(<>
        {criteriaResults.map((result:any, index:any) => (<>
            
            <tr className="collapsible criteriaResult" onClick={() => handleCriteriaResultStateChange(index)}>
                <td colSpan={6} style={{...outcome2Background[result.outcome]}}>
                    <img src={ selectedCriteriaResults[index] ? getImgSrc("extendedArrow") : getImgSrc("contractedArrow") } alt="Show information" height="20px"/>
                    {result.outcome}
                </td>
            </tr>

            {selectedCriteriaResults[index] && (<>
            
                {result.descriptions.map((element:any, index:any) => (<>

                    <tr><td style={{textAlign:"left", fontWeight:"bold", paddingTop:"10px"}} colSpan={6}>{parse("@" + element.assertor)}</td></tr>
                    <tr><td style={{textAlign:"left"}} colSpan={6}>{parse(element.description)}</td></tr>
                
                </>))}

                { result.hasOwnProperty("groupedPointers") ? 
                    <CriteriaResultPointers resultGroupedPointers={result.groupedPointers} />
                : null }
                
            </>)}

        </>))} 
    </>);
}


function CriteriaResultPointers({resultGroupedPointers}:any){  


    const getStructureObject = useCallback((empty = false) => {
        return Object.fromEntries(Object.entries(resultGroupedPointers).map(([groupKey, pointers]:any) => [
            groupKey, 
            empty ? [] : pointers.map(() => false)
        ]))
    }, [resultGroupedPointers]);    // The function will be redefined when resultGroupedPointers is updated

    const [selectedPointers, setSelectedPointers] = useState( getStructureObject() );
    const [hiddenElements, setHiddenElements] = useState( getStructureObject() );

    
    function handlePointerClick (groupKey:any, index:any){
        
        let newSelectedPointer =  getStructureObject();
        newSelectedPointer[groupKey][index] = !selectedPointers[groupKey][index];
        setSelectedPointers(newSelectedPointer);

        if(hiddenElements[groupKey][index]){

            if(!selectedPointers[groupKey][index]) {
                sendMessageToBackground("showHiddenElement");
            }
            return;
        } 

        for (const group in resultGroupedPointers) {
            for(let i = 0; i < resultGroupedPointers[group].length; i++){

                if(hiddenElements[group][i]) continue;

                const element = getElementByPath(resultGroupedPointers[group][i].path, resultGroupedPointers[group][i].innerText);

                if(element){

                    const highlightAnimation = (repeat:any) => {
                        setTimeout(() => {
                            element.style.border = "3px solid white";
                            setTimeout(() => {
                                element.style.border = "3px solid #FF3633";
                                if(repeat > 0) highlightAnimation (repeat - 1);
                            }, 120);
                        }, 120);
                    }

                    if(index === i && groupKey === group && !selectedPointers[group][index]){

                        sendMessageToBackground("createElementPopup", resultGroupedPointers[group][i].path);

                        element.focus();
                        element.blur();
                        element.style.border = "3px solid #FF3633";
                        highlightAnimation(1);
                        continue;
                    }
                    element.style.border = "3px solid #005a6a";

                }
            }
        }

    }


    useEffect(() => { 

        const hidden = getStructureObject(true);

        for (const groupKey in resultGroupedPointers) {
            for(const pointer of resultGroupedPointers[groupKey]){

                const element = getElementByPath(pointer.path, pointer.innerText);

                if(element){
                    if(element.getAttribute('type') === "hidden" || element.getAttribute("hidden")!==null){
                        hidden[groupKey].push(true);
                    }else{
                        hidden[groupKey].push(false);
                        element.style.border = "3px solid #005a6a";
                    }
                }else{
                    hidden[groupKey].push(false);
                }
            }
        }
        setHiddenElements(hidden);

    }, [getStructureObject, resultGroupedPointers]);    // The use effect will rerun when getStructureObject or resultGroupedPointers is updated
      


    return(<>
        
        {Object.entries(resultGroupedPointers).map(([groupKey, pointers]:any) => (<>

            <tr><td colSpan={6} style={{textAlign:"left"}}>

                <span style={{fontWeight: "bold", paddingTop:"10px"}}>{"[ " + groupKey + " ]"}</span>
                {pointers.map((pointer:any, index:any) => (
                    <pre
                        className="codigo_analisis"
                        style={!hiddenElements[groupKey][index] ? 
                            (selectedPointers[groupKey][index] ? { border: "3px solid #FF3633" } : { border: "1px solid #005a6a" }) 
                            : { color:"black" }}
                        onClick={() => handlePointerClick(groupKey, index)}
                    >
                        {index + 1}. {selectedPointers[groupKey][index] ? parse(pointer.html) : parse(pointer.html.substring(0, 30) + " ... ")} {hiddenElements[groupKey][index] && "(HIDDEN)"}
                    </pre> 
                ))}
                
            </td></tr>

        </>))}

    </>);
}



