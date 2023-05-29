
import '../../../styles/sections/resultSection/resultsTable.scss';

import { useState, useEffect} from "react";
import { blackListElement, getFromChromeStorage, getImgSrc, removeFromChromeStorage, storeOnChromeStorage } from '../../../js/utils/chromeUtils.js';
import { setUseStateFromStorage, getElementByPath, handleStateChange } from '../../../js/utils/reactUtils.js';
import { highlightElement, removeElementHighlights, selectHighlightedElement, unselectHighlightedElement } from '../../../js/utils/highlightUtils.js';
import parse from 'html-react-parser';
import { mapReportData } from '../../../js/mapReportData';
import Button from '../../reusables/Button';
import { getSuccessCriterias } from '../../../js/utils/wcagUtils';
import { storeNewReport } from '../../../js/evaluationOptions';


const outcome2Background:any = {
    "earl:passed": {backgroundColor: "#C8FA8C"},
    "earl:failed": {backgroundColor: "#FA8C8C"},
    "earl:cantTell": {backgroundColor: "#F5FA8C"},
    "earl:inapplicable": {backgroundColor: "#FFFFFF"},
    "earl:untested": {backgroundColor: "#8CFAFA"}
}



export default function ResultsTable({conformanceLevels}:any){

    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [mantainExtended, setMantainExtended] = useState(false);
    const [reportTableContent, setReportTableContent] = useState([]);
    const [selectedMainCategories, setSelectedMainCategories] = useState(Array(reportTableContent.length).fill(false));

    useEffect(() => {
        (async ()=>{
            const update = await getFromChromeStorage("blackListUpdated");
            if(update){
                removeFromChromeStorage("blackListUpdated", true);
                mapReportData();
            }
        })();
        setUseStateFromStorage("mantainExtended", true, setMantainExtended, "could not get 'mantainExtended' option!");
        setUseStateFromStorage("reportTableContent", false, setReportTableContent, "'reportTableContent' is null or undefined!");
        
        const storedValue = sessionStorage.getItem("selectedMainCategories");
        if(storedValue){
            setSelectedMainCategories(JSON.parse(storedValue));
            sessionStorage.removeItem("selectedMainCategories");
        }

    }, []);

    const clickHandler = (index:any) => {
        const newStates = mantainExtended ? [...selectedMainCategories] : Array(reportTableContent.length).fill(false);
        newStates[index] = !selectedMainCategories[index];
        setSelectedMainCategories(newStates);

        sessionStorage.setItem("selectedMainCategories", JSON.stringify(newStates));
    
        removeElementHighlights();

        setSelectedIndex(selectedIndex === index ? -1 : index);
    }
    
    return(<>
        {localStorage.getItem("evaluationScope")?.includes(window.location.href) ? <>
            <p>Current webpage evaluation results:</p>
            <div id="resultsTable">
                <table>
                    <thead>
                        <tr> <th>Standard</th> <OutcomeHeaders/> </tr>
                    </thead>
                    <tbody id="resultsTableContent">
                        {reportTableContent.map((mainCategory:any, index:any) => (<>
                            <tr 
                                className={"collapsible mainCategory" + (index === selectedIndex ? " active" : "") }
                                onClick={()=>clickHandler(index)}
                            >
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
        </> : null}
    </>);
    
}







function SubCategory({subCategories, mantainExtended, conformanceLevels}:any){

    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [selectedSubCategories, setSelectedSubCategories] = useState(Array(subCategories.length).fill(false));

    const clickHandler = (index:any) => {
        const newStates = mantainExtended ? [...selectedSubCategories] : Array(subCategories.length).fill(false);
        newStates[index] = !selectedSubCategories[index];
        setSelectedSubCategories(newStates);
    
        sessionStorage.setItem("selectedSubCategories", JSON.stringify(newStates));

        removeElementHighlights();

        setSelectedIndex(selectedIndex === index ? -1 : index);
    }

    useEffect(() => {
        const storedValue = sessionStorage.getItem("selectedSubCategories");
        if(storedValue){
            setSelectedSubCategories(JSON.parse(storedValue));
            sessionStorage.removeItem("selectedSubCategories");
        }
    }, []);

    return(<> 
        {subCategories.map((subCategory:any, index:any) => (<>

            <tr 
                className={"collapsible subCategory" + (index === selectedIndex ? " active" : "") }
                onClick={()=>clickHandler(index)}>
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

    const clickHandler = (index:any) => {
        const newStates = mantainExtended ? [...selectedCriterias] : Array(criterias.length).fill(false);
        newStates[index] = !selectedCriterias[index];
        setSelectedCriterias(newStates);
    
        sessionStorage.setItem("selectedCriterias", JSON.stringify(newStates));

        removeElementHighlights();
    }

    useEffect(() => {
        const storedValue = sessionStorage.getItem("selectedCriterias");
        if(storedValue){
            setSelectedCriterias(JSON.parse(storedValue));
            sessionStorage.removeItem("selectedCriterias");
        }
    }, []);

    return(<> 
        {criterias.map((criteria:any, index:any) => (<>

            { conformanceLevels.includes(criteria.conformanceLevel) ? <>
            
                <tr className={"collapsible criteria"} style={{...outcome2Background[criteria.outcomes[window.location.href]]}} onClick={() => {clickHandler(index)}}>
                    <td colSpan={2}>
                        {criteria.hasOwnProperty("hasPart") ? <>
                            
                            <img src={ selectedCriterias[index] ? getImgSrc("extendedArrow") : getImgSrc("contractedArrow") } alt="Show information" height="20px"/>
                            {criteria.criteria}
                            
                        </> : <> {criteria.criteria} </> }
                    </td>
                    <td colSpan={4}>{criteria.outcomes[window.location.href]}</td>
                </tr>
                {criteria.hasOwnProperty("hasPart") && selectedCriterias[index] ? 
                    <CriteriaResults criteria={criteria} />
                : null }
        
            </> : null }

        </>))} 
    </>);
}




function CriteriaResults({criteria}:any){  

    const [selectedCriteriaResults, setSelectedCriteriaResults] = useState(Array(criteria.hasPart.length).fill(false));
    const [editIndex, setEditIndex] = useState(-1);

    const onBlacklistClick = async (evaluator:any, message:any, outcome:any) => {
        if (window.confirm("Blacklist selected evaluator message?\n(You can remove blacklisted elements from the configuration)")){
            blackListElement({evaluator, criteria: criteria.criteria, outcome, message});
        } 
    };

    const saveChanges = () => {
        
    };

    const cancelChanges = () => {
        setEditIndex(-1);
    };

    const confirmCase = () => {
        
    };

    const removeCase = async (index:any) => {

        if(!window.confirm("Are you sure you want to remove this found case?")) return;

        const evaluationReport = await getFromChromeStorage("report", false);

        const criteriaTxt = getSuccessCriterias().find((elem:any) => elem.num === criteria.criteriaNumber);

        const reportCriteria = evaluationReport.auditSample.find((elem:any) => elem.test.includes(criteriaTxt.id));

        const reportHasPart = reportCriteria.hasPart;

        const removingFoundCase = criteria.hasPart[index];

        const foundCaseIndex = reportHasPart.indexOf((elem:any) => elem.subject === removingFoundCase.webPage && elem.result.outcome.replace("earl:", "") === removingFoundCase.outcome)

        reportHasPart.splice(foundCaseIndex, 1);

        criteria.hasPart.splice(index, 1);

        let newOutcome = "untested";

        for(let i = 0; i < criteria.hasPart.length; i++){
            const foundCase = criteria.hasPart[i];
            if(foundCase.webPage === window.location.href){
                newOutcome = foundCase.outcome;
                break;
            }
        };

        criteria.outcomes[window.location.href] = "earl:" + newOutcome;

        if(reportHasPart.length === 0){
            reportCriteria.result.outcome = "earl:untested";
            reportCriteria.result.description = "";
            delete reportCriteria.assertedBy;
            delete reportCriteria.mode;
        }else{
            const outcomeDescriptions:any = {
                "earl:passed": ["No violations found", "PASSED:"],
                "earl:failed": ["Found a violation ...", "An ERROR was found:"],
                "earl:cantTell": ["Found possible applicable issue, but not sure...", "A POSSIBLE ISSUE was found:"],
                "earl:inapplicable": ["SC is not applicable", "Cannot apply:"]
            };
    
            reportCriteria.result.outcome = "earl:" + newOutcome;
            reportCriteria.result.description = outcomeDescriptions["earl:" + newOutcome];
        }

        storeNewReport(evaluationReport);

    };


    return(<>
        {criteria.hasPart.map((result:any, index:any) => (<>

            {result.webPage === window.location.href ? <>
                <tr className="collapsible criteriaResult" onClick={() => handleStateChange(selectedCriteriaResults, setSelectedCriteriaResults, index, false, criteria.hasPart.length)}>
                    <td colSpan={6} style={{...outcome2Background["earl:" + result.outcome]}}>
                        <img src={ selectedCriteriaResults[index] ? getImgSrc("extendedArrow") : getImgSrc("contractedArrow") } alt="Show information" height="20px"/>
                        {result.outcome}

                        {editIndex === index ? <>
                            <Button 
                                classList={"primary small"} 
                                onClickHandler={saveChanges}
                                innerText={"Save"}
                            />
                            <Button 
                                classList={"secondary small"} 
                                onClickHandler={cancelChanges}
                                innerText={"Cancel"}
                            />
                        </> : <>
                            <img src={ getImgSrc("ok") } alt="Confirm found case" height="18px" onClick={confirmCase}/>
                            <img src={ getImgSrc("edit") } alt="Edit found case" height="16px" onClick={()=>setEditIndex(index)}/>
                            <img src={ getImgSrc("remove") } alt="Remove found case" height="16px" onClick={()=>removeCase(index)}/>
                        </>}
                        
                    </td>
                </tr>

                {(selectedCriteriaResults[index] || editIndex === index) && (<>
                
                    {result.descriptions.map((element:any, i:any) => (<>

                        <tr>
                            <td style={{textAlign:"left", fontWeight:"bold", paddingTop:"10px"}} colSpan={6}>{parse("@" + element.assertor)}
                                {editIndex === index ? <>
                                    <img 
                                        className='removeIcon' 
                                        src={ getImgSrc("remove") } 
                                        alt="Remove message" 
                                        title="Remove message"
                                        height="18px"
                                    />
                                </> : <>
                                    <img 
                                        className='blacklistIcon' 
                                        src={ getImgSrc("blacklist") } 
                                        alt="Add message to blacklist" 
                                        title="Add message to blacklist"
                                        height="18px" 
                                        onClick={() => onBlacklistClick(element.assertor, element.description, result.outcome)}
                                    />
                                </>}
                                
                            </td>
                        </tr>
                        <tr><td style={{textAlign:"left"}} colSpan={6}>{parse(element.description)}</td></tr>
                    
                    </>))}

                    { result.hasOwnProperty("groupedPointers") ? 
                        <CriteriaResultPointers resultGroupedPointers={result.groupedPointers} edit={editIndex === index} />
                    : null }
                    
                </>)}
            </> : null }
            
            

        </>))} 
    </>);
}


function CriteriaResultPointers({resultGroupedPointers, edit}:any){  

    const [selectedPointer, setSelectedPointer] = useState<{ [groupKey: string]: number | null }>({});

    const [hiddenElements, setHiddenElements] = useState<{ [groupKey: string]: number[] }>({});

    
    function handlePointerClick (groupKey:string, index:number){

        unselectHighlightedElement(); // If previously selected

        if (selectedPointer[groupKey] === index) {

            setSelectedPointer({});

        } else {

            setSelectedPointer({ [groupKey]: index });

            const pointer = resultGroupedPointers[groupKey][index];

            selectHighlightedElement(groupKey, index, pointer.documentation);
        
        } 

    }

    function handleRemovePointerClick(groupKey:string, index:any){

        resultGroupedPointers[groupKey].splice(index, 1);

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

                        {index + 1}. {selectedPointer[groupKey] === index ? 
                            parse(pointer.html) 
                        : 
                            parse(pointer.html.substring(0, 27) + " ... ")} 
                        {hiddenElements[groupKey]?.includes(index) && "(HIDDEN)"}
                        
                        {edit && (
                            <img 
                                className='removePointerIcon' 
                                src={ getImgSrc("remove") } 
                                alt="Remove pointer from list" 
                                title="Remove pointer" 
                                height="16px" 
                                onClick={() => handleRemovePointerClick(groupKey, index)}
                            />
                        )}
                        
                    </pre> 
                ))}
                
            </td></tr>

        </>))}

    </>);
}






export function OutcomeHeaders(){
    return(<>
        <th className="passed" title='Passed' style={{...outcome2Background["earl:passed"]}}>P</th>
        <th className="failed" title='Failed' style={{...outcome2Background["earl:failed"]}}>F</th>
        <th className="cantTell" title='Can&#39;t tell' style={{...outcome2Background["earl:cantTell"]}}>CT</th>
        <th className="inapplicable" title='Not Present' style={{...outcome2Background["earl:inapplicable"]}}>NP</th>
        <th className="untested" title='Not checked' style={{...outcome2Background["earl:untested"]}}>NC</th>
    </>);
}

function ResultCount({category, conformanceLevels}:any){

    let passed = 0, failed = 0, cantTell = 0, inapplicable = 0, untested = 0;

    const outcomes = category.webPageOutcomes[window.location.href];

    if(outcomes){
        for(const conformanceLevel of conformanceLevels){
            passed += outcomes["earl:passed"][conformanceLevel];
            failed += outcomes["earl:failed"][conformanceLevel];
            cantTell += outcomes["earl:cantTell"][conformanceLevel];
            inapplicable += outcomes["earl:inapplicable"][conformanceLevel];
            untested += outcomes["earl:untested"][conformanceLevel];
        }
    }

    return(<> <td>{passed}</td><td>{failed}</td><td>{cantTell}</td><td>{inapplicable}</td><td>{untested}</td> </>);
}













