
import './css/resultsTable.css';

import { useState, useEffect} from "react";
import { getImgSrc, sendMessageToBackground } from './js/utils/chromeUtils.js';
import { setUseStateFromStorage, getElementByPath, handleStateChange } from './js/utils/reactUtils.js';
import { highlightElement, selectHighlightedElement } from './js/utils/highlightUtils.js';
import parse from 'html-react-parser';


const outcome2Background:any = {
    "passed": {backgroundColor: "#C8FA8C"},
    "failed": {backgroundColor: "#FA8C8C"},
    "cantTell": {backgroundColor: "#F5FA8C"},
    "inapplicable": {backgroundColor: "#FFFFFF"},
    "untested": {backgroundColor: "#8CFAFA"}
}



export default function ResultsTable({conformanceLevels}:any){

    const [mantainExtended, setMantainExtended] = useState(false);
    const [reportTableContent, setReportTableContent] = useState([]);
    const [selectedMainCategories, setSelectedMainCategories] = useState(Array(reportTableContent.length).fill(false));

    useEffect(() => {
        setUseStateFromStorage("mantainExtended", true, setMantainExtended, "could not get 'mantainExtended' option!");
        setUseStateFromStorage("reportTableContent", false, setReportTableContent, "'reportTableContent' is null or undefined!");
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
        setUseStateFromStorage("reportSummary", false, setReportSummary, "'reportSummary' is null or undefined!");
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

    return(<> <td>{passed}</td><td>{failed}</td><td>{cantTell}</td><td>{inapplicable}</td><td>{untested}</td> </>);
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

    return(<>
        {criteriaResults.map((result:any, index:any) => (<>
            
            <tr className="collapsible criteriaResult" onClick={() => handleStateChange(selectedCriteriaResults, setSelectedCriteriaResults, index, false, criteriaResults.length)}>
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

    const [selectedPointer, setSelectedPointer] = useState<{ [groupKey: string]: number | null }>({});

    const [hiddenElements, setHiddenElements] = useState<{ [groupKey: string]: number[] }>({});

    
    function handlePointerClick (groupKey:string, index:number){

        const previousSelected:any = document.querySelector(".acCheckHighlighter.selected");
        if(previousSelected){
            previousSelected.classList.remove("selected");
            previousSelected.style.border = "3px solid #00FFF7";
        }

        if (selectedPointer[groupKey] === index) {

            setSelectedPointer({});

        } else {

            setSelectedPointer({ [groupKey]: index });

            if(hiddenElements[groupKey]?.includes(index)){
                //sendMessageToBackground("showHiddenElement");
                return;
            }

            selectHighlightedElement(groupKey, index);
        
        } 

    }

    useEffect(() => {
        const newHiddenElements: { [groupKey: string]: number[] } = {};

        for (const groupKey in resultGroupedPointers) {
            for (let i = 0; i < resultGroupedPointers[groupKey].length; i++) {

                const pointer = resultGroupedPointers[groupKey][i];
                const pointedElement = getElementByPath(pointer.path, pointer.innerText);

                if(pointedElement){
                    if(pointedElement.getAttribute('type') === "hidden" || pointedElement.getAttribute("hidden")!==null){
                        
                        if (!newHiddenElements[groupKey]) {
                            newHiddenElements[groupKey] = [];
                        }
                        newHiddenElements[groupKey].push(i);

                    }else{
                        highlightElement(pointedElement, groupKey, i);
                    }
                }
            }
        }
        setHiddenElements(newHiddenElements);
    }, [resultGroupedPointers]);
      


    return(<>
        
        {Object.entries(resultGroupedPointers).map(([groupKey, groupPointers]:any) => (<>

            <tr><td colSpan={6} style={{textAlign:"left"}}>

                <span style={{fontWeight: "bold", paddingTop:"10px"}}>{"[ " + groupKey + " ]"}</span>

                {groupPointers.map((pointer:any, index:any) => (
                    <pre className="codigo_analisis"
                        style={!hiddenElements[groupKey]?.includes(index) ? 
                            (selectedPointer[groupKey] === index ? { border: "3px solid #FF3633" } : { border: "1px solid #005a6a" }) 
                            : { color:"black" }}
                        onClick={() => handlePointerClick(groupKey, index)}
                    >
                        {index + 1}. {selectedPointer[groupKey] === index ? parse(pointer.html) : 
                            parse(pointer.html.substring(0, 30) + " ... ")} {hiddenElements[groupKey]?.includes(index) && "(HIDDEN)"}
                    </pre> 
                ))}
                
            </td></tr>

        </>))}

    </>);
}




















