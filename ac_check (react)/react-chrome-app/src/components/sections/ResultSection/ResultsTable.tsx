
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
import { removeCase } from '../../../js/resultsTableOptions';


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
    const [removedPointers, setRemovedPointers] = useState([]);
    const [removedDescriptions, setRemovedDescriptions] = useState([]);
    const [editedPointersGroup, setEditedPointersGroup] = useState([]);

    const onBlacklistClick = async (evaluator:any, message:any, outcome:any) => {
        if (window.confirm("Blacklist selected evaluator message?\n(You can remove blacklisted elements from the configuration)")){
            blackListElement({evaluator, criteria: criteria.criteria, outcome, message});
        } 
    };

    const saveChanges = async () => {
        
        const evaluationReport = await getFromChromeStorage("report", false);

        const criteriaTxt = getSuccessCriterias().find((elem) => elem.num === criteria.criteriaNumber);
    
        const reportCriteria = evaluationReport.auditSample.find((elem:any) => elem.test.includes(criteriaTxt.id));
    
        const editedFoundCase = criteria.hasPart[editIndex];

        const foundCaseIndex = reportCriteria.hasPart.findIndex((elem:any) => elem.subject === window.location.href && elem.result.outcome.replace("earl:", "") === editedFoundCase.outcome);

        if(editedFoundCase.descriptions.length === 0){

            reportCriteria.hasPart.splice(foundCaseIndex, 1);

        } else {

            const foundCase = reportCriteria.hasPart[foundCaseIndex];

            removedDescriptions.forEach((desc:any) => {

                const assertorIndex = foundCase.assertedBy.findIndex((elem:any) => elem === desc.description);

                foundCase.assertedBy.splice(assertorIndex, 1);

                const locationPointersGroup = foundCase.result.locationPointersGroup

                for(let i = 0; i < locationPointersGroup.length; i++){

                    const pointer = locationPointersGroup[i];

                    if(pointer.assertedBy.includes(desc.description.assertor)){
                        if(pointer.assertedBy.length === 1){
                            locationPointersGroup.splice(i, 1);
                            i--;
                        }else{
                            const index = pointer.assertedBy.indexOf(desc.description.assertor);
                            pointer.assertedBy.splice(index, 1);
                        }
                    }
                }
            }); 

            removedPointers.forEach((pointer:any) => {

                const index = foundCase.result.locationPointersGroup.findIndex((elem:any) => elem["ptr:expression"] === pointer.pointer.path);

                foundCase.result.locationPointersGroup.splice(index, 1);
            
            });

        }

        storeNewReport(evaluationReport);
    };

    const cancelChanges = () => {

        revertChanges();
        setEditIndex(-1);

    };

    const editCase = (index:any) => {

        if(editIndex !== -1){
            revertChanges();
        }
        setEditIndex(index);

    };

    function revertChanges(){
        removedPointers.forEach((elem:any) => {
            criteria.hasPart[editIndex].groupedPointers[elem.groupKey].splice(elem.index, 0, elem.pointer);
        }); 

        removedDescriptions.forEach((elem:any) => {
            criteria.hasPart[editIndex].descriptions.splice(elem.index, 0, elem.description);
        }); 

        editedPointersGroup.forEach((elem:any) => {
            criteria.hasPart[editIndex].groupedPointers[elem.key] = elem.pointers;
        });

        setEditedPointersGroup([]);
        setRemovedDescriptions([]);
        setRemovedPointers([]);
    }

    const handleRemoveMessage = (index:any) => {

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

            if(key === description.assertor){

                if(edited.find((elem:any) => elem.key === key) === undefined){
                    edited.push({pointers: groupedPointers[key], key});
                }
                delete groupedPointers[key];

            }else if(key.includes(description.assertor)){

                if(edited.find((elem:any) => elem.key === key) === undefined){
                    edited.push({pointers: groupedPointers[key], key});
                }
                let updatedKey:any = key.replace(description.assertor, "");

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

    
    const confirmCase = async (index:any) => {
        
        const evaluationReport = await getFromChromeStorage("report", false);

        const caseToConfirm = criteria.hasPart[index];

        const criteriaTxt = getSuccessCriterias().find((elem:any) => elem.num === criteria.criteriaNumber);

        const reportCriteria = evaluationReport.auditSample.find((elem:any) => elem.test.includes(criteriaTxt.id));

        const foundCaseIndex = reportCriteria.hasPart.indexOf((elem:any) => elem.subject === caseToConfirm.webPage && elem.result.outcome.replace("earl:", "") === caseToConfirm.outcome)

        reportCriteria.hasPart[foundCaseIndex].assertedBy.push({assertor: getFromChromeStorage("authenticationState"), description:""})

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
                                classList={"secondary small spaced"} 
                                onClickHandler={cancelChanges}
                                innerText={"Cancel"}
                            />
                        </> : <>
                            <img src={ getImgSrc("ok") } alt="Confirm found case" height="18px" onClick={()=>confirmCase(index)}/>
                            <img src={ getImgSrc("edit") } alt="Edit found case" height="16px" onClick={()=>editCase(index)}/>
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
                                        onClick={() => handleRemoveMessage(i)}
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
                        <CriteriaResultPointers resultGroupedPointers={result.groupedPointers} edit={editIndex === index} removedPointers={removedPointers} setRemovedPointers={setRemovedPointers} />
                    : null }
                    
                </>)}
            </> : null }
            
            

        </>))} 
    </>);
}


function CriteriaResultPointers({resultGroupedPointers, edit, removedPointers, setRemovedPointers}:any){  

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

        const newEditedPointers = [...removedPointers];
        newEditedPointers.push({
            pointer: resultGroupedPointers[groupKey][index],
            groupKey,
            index
        });
        setRemovedPointers(newEditedPointers);

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













