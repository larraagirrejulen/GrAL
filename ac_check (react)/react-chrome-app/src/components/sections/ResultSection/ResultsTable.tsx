
import '../../../styles/sections/resultSection/resultsTable.scss';

import { useState, useEffect} from "react";
import { blackListElement, getFromChromeStorage, getImgSrc, removeFromChromeStorage } from '../../../js/utils/chromeUtils.js';
import { setUseStateFromStorage, getElementByPath, collapsibleClickHandler } from '../../../js/utils/reactUtils.js';
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

const outcome2Description:any = {
    "earl:passed": ["No violations found", "PASSED:"],
    "earl:failed": ["Found a violation ...", "An ERROR was found:"],
    "earl:cantTell": ["Found possible applicable issue, but not sure...", "A POSSIBLE ISSUE was found:"],
    "earl:inapplicable": ["SC is not applicable", "Cannot apply:"]
};

const wcagCriterias = getSuccessCriterias();


export default function ResultsTable({conformanceLevels}:any){

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

        setUseStateFromStorage("mantainExtended", true, setMantainExtended);
        setUseStateFromStorage("reportTableContent", false, setReportTableContent);
        
        const storedValue = sessionStorage.getItem("selectedMainCategories");
        if(storedValue){
            setSelectedMainCategories(JSON.parse(storedValue));
        }
    }, []);

    useEffect(() => {
        sessionStorage.setItem("selectedMainCategories", JSON.stringify(selectedMainCategories));
        removeElementHighlights();
    }, [selectedMainCategories]);
    
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
                                className={"collapsible mainCategory" + (selectedMainCategories[index] ? " active" : "") }
                                onClick={() => collapsibleClickHandler(
                                            selectedMainCategories, 
                                            setSelectedMainCategories, 
                                            index, 
                                            mantainExtended, 
                                            reportTableContent.length
                                        )}
                            >
                                <td>{mainCategory.categoryTitle}</td>
                                <ResultCount 
                                    category={mainCategory} 
                                    conformanceLevels={conformanceLevels}
                                />
                            </tr>
                            { selectedMainCategories[index] && ( 
                                <SubCategory 
                                    subCategories={mainCategory.subCategories} 
                                    mantainExtended={mantainExtended} 
                                    conformanceLevels={conformanceLevels} 
                                /> 
                            )}
                        </>))}
                    </tbody>
                </table>
            </div>
        </> : null}
    </>);
    
}







function SubCategory({subCategories, mantainExtended, conformanceLevels}:any){

    const [selectedSubCategories, setSelectedSubCategories] = useState(Array(subCategories.length).fill(false));

    useEffect(() => {
        const storedValue = sessionStorage.getItem("selectedSubCategories");
        if(storedValue){
            setSelectedSubCategories(JSON.parse(storedValue));
        }
    }, []);

    useEffect(() => {
        sessionStorage.setItem("selectedSubCategories", JSON.stringify(selectedSubCategories));
        removeElementHighlights();
    }, [selectedSubCategories]);

    return(<> 
        {subCategories.map((subCategory:any, index:any) => (<>

            <tr 
                className={"collapsible subCategory" + (selectedSubCategories[index] ? " active" : "") }
                onClick={() => collapsibleClickHandler(
                    selectedSubCategories, 
                    setSelectedSubCategories, 
                    index, 
                    mantainExtended, 
                    subCategories.length
                )}
            >
                <td>{subCategory.subCategoryTitle}</td>
                <ResultCount category={subCategory} conformanceLevels={conformanceLevels} />
            </tr>
            { selectedSubCategories[index] && ( 
                <Criterias 
                    criterias={subCategory.criterias} 
                    mantainExtended={mantainExtended} 
                    conformanceLevels={conformanceLevels}
                /> 
            )}
        
        </>))} 
    </>);
}


function Criterias({criterias, mantainExtended, conformanceLevels}:any){

    const [selectedCriterias, setSelectedCriterias] = useState(Array(criterias.length).fill(false));

    useEffect(() => {
        const storedValue = sessionStorage.getItem("selectedCriterias");
        if(storedValue){
            setSelectedCriterias(JSON.parse(storedValue));
        } 
    }, []);

    useEffect(() => {
        sessionStorage.setItem("selectedCriterias", JSON.stringify(selectedCriterias));
        removeElementHighlights();
    }, [selectedCriterias]);

    return(<> 
        {criterias.map((criteria:any, index:any) => (<>

            { conformanceLevels.includes(criteria.conformanceLevel) && (<>
            
                <tr 
                    className={"collapsible criteria"} 
                    style={{...outcome2Background[criteria.outcomes[window.location.href]]}} 
                    onClick={() => collapsibleClickHandler(
                        selectedCriterias, 
                        setSelectedCriterias, 
                        index, 
                        mantainExtended, 
                        criterias.length, 
                    )}
                >
                    <td colSpan={2}>
                        {criteria.hasOwnProperty("hasPart") ? <>
                            
                            <img 
                                src={ selectedCriterias[index] ? 
                                        getImgSrc("extendedArrow") 
                                    : 
                                        getImgSrc("contractedArrow") 
                                    } 
                                alt="Show information" height="20px"
                            />
                            {criteria.criteria}
                            
                        </> : <> {criteria.criteria} </> }
                    </td>
                    <td colSpan={4}>{criteria.outcomes[window.location.href]}</td>
                </tr>
                {criteria.hasOwnProperty("hasPart") && selectedCriterias[index] && ( 
                    <CriteriaResults criteria={criteria} />
                )}
        
            </>)}

        </>))} 
    </>);
}




function CriteriaResults({criteria}:any){  

    const [selectedCriteriaResults, setSelectedCriteriaResults] = useState(Array(criteria.hasPart.length).fill(false));
    const [editIndex, setEditIndex] = useState(-1);

    const [removedPointers, setRemovedPointers] = useState([]);
    const [removedDescriptions, setRemovedDescriptions] = useState([]);
    const [editedPointersGroup, setEditedPointersGroup] = useState([]);
    const [editedDescriptions, setEditedDescriptions] = useState([]);

    useEffect(() => {
        removeElementHighlights();
    }, [selectedCriteriaResults]);

    async function getFoundCaseFromReport(index:any){

        const evaluationReport = await getFromChromeStorage("report", false);

        const criteriaTxt = wcagCriterias.find((elem:any) => elem.num === criteria.criteriaNumber);

        const reportCriteria = evaluationReport.auditSample.find(
            (elem:any) => elem.test.includes(criteriaTxt.id)
        );
    
        const foundCaseIndex = reportCriteria.hasPart.findIndex(
            (elem:any) => elem.subject === criteria.hasPart[index].webPage && 
                elem.result.outcome.replace("earl:", "") === criteria.hasPart[index].outcome
        );

        return [evaluationReport, reportCriteria, foundCaseIndex];

    }

    function removeFoundCaseFromReport(reportCriteria:any){

        reportCriteria.result.outcome = "earl:untested";
        reportCriteria.result.description = "";
        delete reportCriteria.assertedBy;
        delete reportCriteria.mode;

    }

    const saveChanges = async () => {
        
        const [evaluationReport, reportCriteria, foundCaseIndex] = await getFoundCaseFromReport(editIndex);
    
        if(criteria.hasPart[editIndex].descriptions.length === 0){
    
            reportCriteria.hasPart.splice(foundCaseIndex, 1);
    
            if(reportCriteria.hasPart.length === 0){
                removeFoundCaseFromReport(reportCriteria);
            }
    
        } else {
    
            const foundCase = reportCriteria.hasPart[foundCaseIndex];
            const locationPointersGroup = foundCase.result.locationPointersGroup;
    
            removedDescriptions.forEach((desc:any) => {

                const removedDescAssertor = desc.description.assertor;
    
                const assertorIndex = foundCase.assertedBy.findIndex(
                    (elem:any) => elem.assertor === removedDescAssertor
                );
                foundCase.assertedBy.splice(assertorIndex, 1);
    
                for(let i = 0; i < locationPointersGroup.length; i++){
    
                    const pointerAssertors = locationPointersGroup[i].assertedBy;
    
                    if(pointerAssertors.includes(removedDescAssertor)){

                        if(pointerAssertors.length === 1){
                            locationPointersGroup.splice(i, 1);
                            i--;
                        }else{
                            const index = pointerAssertors.indexOf(removedDescAssertor);
                            pointerAssertors.splice(index, 1);
                        }

                    }
                }

            }); 
    
            editedDescriptions.forEach((desc:any) => {

                const removed = removedDescriptions.findIndex(
                    (removedDesc:any) => removedDesc.description.assertor === desc.assertor
                );

                if(removed === -1){
                    const edited = criteria.hasPart[editIndex].descriptions.find(
                        (elem:any) => elem.assertor === desc.assertor
                    );
                    const assertorDescription = foundCase.assertedBy.find(
                        (elem:any) => elem.assertor === desc.assertor
                    );
                    assertorDescription.description = edited.description;
                }

            });

            removedPointers.forEach((ptr:any) => {
    
                const index = locationPointersGroup.findIndex(
                    (elem:any) => elem["ptr:expression"] === ptr.pointer.path
                );
    
                if(index !== -1){
                    locationPointersGroup.splice(index, 1);
                }
            
            });

            const modifier = await getFromChromeStorage("authenticationState");

            if(!foundCase.modifiedBy.includes(modifier)){
                foundCase.modifiedBy.push(modifier);
            }

            foundCase.lastModifier = modifier;
            
        }

        storeNewReport(evaluationReport);
    };

    const cancelChanges = () => {

        removedDescriptions.forEach((elem:any) => {
            criteria.hasPart[editIndex].descriptions.splice(elem.index, 0, elem.description);
        }); 

        editedPointersGroup.forEach((elem:any) => {
            criteria.hasPart[editIndex].groupedPointers[elem.key] = elem.pointers;
        });

        editedDescriptions.forEach((oldValues:any) => {
            const assertorDescription = criteria.hasPart[editIndex].descriptions.find(
                (desc:any) => desc.assertor === oldValues.assertor
            );
            assertorDescription.description = oldValues.description;
        });

        removedPointers.forEach((ptr:any) => {
            criteria.hasPart[editIndex].groupedPointers[ptr.groupKey].splice(ptr.index, 0, ptr.pointer);
        }); 

        setEditedPointersGroup([]);
        setRemovedDescriptions([]);
        setRemovedPointers([]);
        setEditedDescriptions([]);
        setEditIndex(-1);

    };

    const removeDescription = async (index:any) => {

        const newRemovedDescriptions:any = [...removedDescriptions];
    
        const description = criteria.hasPart[editIndex].descriptions[index];
    
        newRemovedDescriptions.push({
            description,
            index
        });
        setRemovedDescriptions(newRemovedDescriptions);
    
        criteria.hasPart[editIndex].descriptions.splice(index, 1);
    
        const groupedPointers = criteria.hasPart[editIndex].groupedPointers;
    
        const edited:any = [...editedPointersGroup];
    
        for (const key in groupedPointers) {

            const pointers = groupedPointers[key];
    
            if(key === description.assertor){
    
                if(edited.find((elem:any) => elem.key === key) === undefined){
                    edited.push({pointers, key});
                }
                delete groupedPointers[key];
    
            }else if(key.includes(description.assertor)){
    
                if(edited.find((elem:any) => elem.key === key) === undefined){
                    edited.push({pointers, key});
                }
                let updatedKey = key.replace(description.assertor, "");
    
                updatedKey = updatedKey.replace(", , ", ", ");
    
                if(updatedKey.startsWith(", ")){
                    updatedKey = updatedKey.replace(", ", "");
                }else if(updatedKey.endsWith(", ")){
                    updatedKey = updatedKey.substring(0, updatedKey.length-2);
                }
    
                if(updatedKey in groupedPointers){
    
                    if(edited.find((elem:any) => elem.key === updatedKey) === undefined){
                        edited.push({pointers: [...groupedPointers[updatedKey]], key:updatedKey});
                    }
                    
                    groupedPointers[key].forEach((pointer:any) => {
                        groupedPointers[updatedKey].push(pointer);
                    })
                }else{
                    groupedPointers[updatedKey] = groupedPointers[key];
                }
                
                delete groupedPointers[key];
                
            }
        }
    
        setEditedPointersGroup(edited);
    };

    const updateDescription = async (newValue:any, index:any) => {

        const edited:any = [...editedDescriptions];

        const editedAssertorDesc:any = criteria.hasPart[editIndex].descriptions[index];

        if(edited.findIndex((elem:any) => elem.assertor === editedAssertorDesc.assertor) === -1){
            edited.push({
                assertor: editedAssertorDesc.assertor, 
                description: editedAssertorDesc.description
            });
        }

        editedAssertorDesc.description = newValue;

        setEditedDescriptions(edited);

    };



    const removeFoundCase = async (index:any) =>{

        if(!window.confirm("Are you sure you want to remove this found case?")) return;
    
        const [evaluationReport, reportCriteria, foundCaseIndex] = await getFoundCaseFromReport(index);
    
        reportCriteria.hasPart.splice(foundCaseIndex, 1);
    
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
    
        if(reportCriteria.hasPart.length === 0){
            removeFoundCaseFromReport(reportCriteria);
        }else{
            reportCriteria.result.outcome = "earl:" + newOutcome;
            reportCriteria.result.description = outcome2Description["earl:" + newOutcome];
        }
    
        storeNewReport(evaluationReport);
    
    };


    return(<>
        {criteria.hasPart.map((result:any, index:any) => (<>

            {result.webPage === window.location.href && (<>
                <tr 
                    className="collapsible criteriaResult" 
                    onClick={
                        () => collapsibleClickHandler(selectedCriteriaResults, setSelectedCriteriaResults, index, false, criteria.hasPart.length)
                    }
                >
                    <td colSpan={6} style={{...outcome2Background["earl:" + result.outcome]}}>
                        <img 
                            src={ selectedCriteriaResults[index] ? 
                                    getImgSrc("extendedArrow") 
                                : 
                                    getImgSrc("contractedArrow") 
                                } 
                            alt="Show information" 
                            height="20px"
                        />
                        {result.outcome}
                        
                        {editIndex === index ? <>
                            <Button 
                                classList={"primary small"} 
                                onClickHandler={saveChanges}
                                innerText={"Save"}
                            />
                            <Button 
                                classList={"secondary small spaced"} 
                                onClickHandler={cancelChanges}
                                innerText={"Cancel"}
                            />
                        </> : <>
                            <span>
                                {result.modifiedBy.length > 0 ? <>  
                                    {" - Last modifier: @" + result.lastModifier} 
                                </> : <>
                                    {" - Unmodified "}
                                </>}
                            </span>
                            <img 
                                src={ getImgSrc("edit") } 
                                alt="Edit found case" 
                                title="Edit found case" 
                                height="16px" 
                                onClick={()=>{
                                    if(editIndex !== -1) cancelChanges();
                                    setEditIndex(index);
                                }}
                            />
                            <img 
                                src={ getImgSrc("remove") } 
                                alt="Remove found case"
                                title="Remove found case"
                                height="16px" 
                                onClick={()=>removeFoundCase(index)}
                            />
                        </>}

                        
                        
                    </td>
                </tr>

                {(selectedCriteriaResults[index] || editIndex === index) && (<>
                
                    {result.descriptions.map((element:any, i:any) => (<>

                        <tr>
                            <td style={{textAlign:"left", fontWeight:"bold", paddingTop:"10px"}} colSpan={6}>
                                {parse("@" + element.assertor)}

                                {editIndex === index ? <>
                                    <img 
                                        className='removeIcon' 
                                        src={ getImgSrc("remove") } 
                                        alt="Remove message" 
                                        title="Remove message"
                                        height="18px"
                                        onClick={() => removeDescription(i)}
                                    />
                                </> : <>
                                    <img 
                                        className='blacklistIcon' 
                                        src={ getImgSrc("blacklist") } 
                                        alt="Add message to blacklist" 
                                        title="Add message to blacklist"
                                        height="18px" 
                                        onClick={() => blackListElement({
                                            evaluator: element.assertor, 
                                            criteria: criteria.criteria, 
                                            outcome: result.outcome, 
                                            message: element.description
                                        })}
                                    />
                                </>}
                            </td>
                        </tr>
                        <tr>
                            {editIndex === index ?
                                <textarea 
                                    style={{textAlign:"left"}} 
                                    value={element.description} 
                                    onChange={(e:any) => updateDescription(e.target.value, i)} 
                                />
                            :
                                <td style={{textAlign:"left"}} colSpan={6}>{element.description}</td>
                            }
                        </tr>
                    
                    </>))}

                    { result.hasOwnProperty("groupedPointers") && (
                        <CriteriaResultPointers 
                            resultGroupedPointers={result.groupedPointers} 
                            edit={editIndex === index} 
                            removedPointers={removedPointers} 
                            setRemovedPointers={setRemovedPointers} 
                        />
                    )}
                    
                </>)}
            </>)}
            
            

        </>))} 
    </>);
}


function CriteriaResultPointers({resultGroupedPointers, edit, removedPointers, setRemovedPointers}:any){  

    const [selectedPointer, setSelectedPointer] = useState<{ [groupKey: string]: number | null }>({});

    const [hiddenElements, setHiddenElements] = useState<{ [groupKey: string]: number[] }>({});

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

    function handlePointerClick(groupKey:string, index:number){

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

        const newEditedPointers = [...removedPointers];
        newEditedPointers.push({
            pointer: resultGroupedPointers[groupKey][index],
            groupKey,
            index
        });
        setRemovedPointers(newEditedPointers);

        resultGroupedPointers[groupKey].splice(index, 1);

    }

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

