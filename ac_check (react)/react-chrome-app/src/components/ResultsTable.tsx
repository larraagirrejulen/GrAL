
import '../styles/resultsTable.css';

import { useState, useEffect} from "react";
import { blackListElement, getFromChromeStorage, getImgSrc, removeFromChromeStorage } from '../js/utils/chromeUtils.js';
import { setUseStateFromStorage, getElementByPath, handleStateChange } from '../js/utils/reactUtils.js';
import { highlightElement, selectHighlightedElement, unselectHighlightedElement } from '../js/utils/highlightUtils.js';
import parse from 'html-react-parser';
import { mapReportData } from '../js/mapReportData';


const outcome2Background:any = {
    "earl:passed": {backgroundColor: "#C8FA8C"},
    "earl:failed": {backgroundColor: "#FA8C8C"},
    "earl:cantTell": {backgroundColor: "#F5FA8C"},
    "earl:inapplicable": {backgroundColor: "#FFFFFF"},
    "earl:untested": {backgroundColor: "#8CFAFA"}
}



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
        setUseStateFromStorage("mantainExtended", true, setMantainExtended, "could not get 'mantainExtended' option!");
        setUseStateFromStorage("reportTableContent", false, setReportTableContent, "'reportTableContent' is null or undefined!");
    }, []);
    
    return(
      <div className = "resultsContainer">
        <Summaries conformanceLevels={conformanceLevels} />
        {localStorage.getItem("evaluationScope")?.includes(window.location.href) ? 
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
        : null}
      </div>
    );
    
}


function Summaries({conformanceLevels}:any){

    const [webSiteOutcomes, setWebSiteOutcomes] = useState([0, 0, 0, 0, 0]);
    const [siteSummary, setSiteSummary] = useState(null);
    
    const [webPageOutcomes, setWebPageOutcomes] = useState([0, 0, 0, 0, 0]);
    const [pageSummaries, setPageSummaries] = useState(null);

    const [webpage, setWebpage] = useState(null);

    const [activeTab, setActiveTab] = useState('website');

    const countOutcomes = async (summary:any, setOutcomes:any) => {
        let passed = 0, failed = 0, cantTell = 0, inapplicable = 0, untested = 0;
        for(const conformanceLevel of conformanceLevels){
            passed += summary["earl:passed"][conformanceLevel];
            failed += summary["earl:failed"][conformanceLevel];
            cantTell += summary["earl:cantTell"][conformanceLevel];
            inapplicable += summary["earl:inapplicable"][conformanceLevel];
            untested += summary["earl:untested"][conformanceLevel];
        }
        setOutcomes([passed, failed, cantTell, inapplicable, untested]);
    };

    useEffect(() => { 
        setUseStateFromStorage("siteSummary", false, setSiteSummary, "'siteSummary' is null or undefined!");
        setUseStateFromStorage("pageSummaries", false, setPageSummaries, "'pageSummaries' is null or undefined!");
        
    },[]);

    useEffect(() => { 
        if(siteSummary){
            countOutcomes(siteSummary, setWebSiteOutcomes);
        }
        if(pageSummaries){

            let scope:any = localStorage.getItem("scope");

            scope = JSON.parse(scope);

            const currentWebpage:any = scope.find((elem:any) => elem.url === window.location.href)

            setWebpage(currentWebpage ? currentWebpage.name : null)

            const webPageSummary = pageSummaries[window.location.href];
            
            if(webPageSummary){
                countOutcomes(webPageSummary, setWebPageOutcomes);
            }
            
        }
    },[conformanceLevels, siteSummary, pageSummaries]);

    return(<>

        <div className="tabs">
            <button
                className={activeTab === 'website' ? 'active' : ''}
                onClick={() => setActiveTab('website')}
                style={{width: "90px"}}
            >
                Website
            </button>
            <button
                className={activeTab === 'webpage' ? 'active' : ''}
                onClick={() => setActiveTab('webpage')}
                style={{width: "136px"}}
            >
                {pageSummaries && pageSummaries[window.location.href] && webpage ? 
                    webpage
                : "Current webpage"}
            </button>
        </div>

        {activeTab === 'website' && (<>
            <table className="summaryTable">
                <tr> <OutcomeHeaders /> </tr>
                <tr> {webSiteOutcomes.map((count:any) => ( <td>{count}</td> ))} </tr>
            </table>
        </>)}

        {activeTab === 'webpage' && (<>
            {pageSummaries && pageSummaries[window.location.href] ? (
                <table className="summaryTable">
                    <tr> <OutcomeHeaders /> </tr>
                    <tr> {webPageOutcomes.map((count:any) => ( <td>{count}</td> ))} </tr>
                </table>
            ) : (
                <div style={{ textAlign: 'center', padding: '15px 0' }}>
                    Current webpage has not been evaluated
                </div>
            )}
        </>)}
        
    </>);
}


function OutcomeHeaders(){
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
            
                <tr className={"collapsible criteria"} style={{...outcome2Background[criteria.outcomes[window.location.href]]}} onClick={() => {handleStateChange(selectedCriterias, setSelectedCriterias, index, mantainExtended, criterias.length)}}>
                    <td colSpan={2}>
                        {criteria.hasOwnProperty("hasPart") ? <>
                            
                            <img src={ selectedCriterias[index] ? getImgSrc("extendedArrow") : getImgSrc("contractedArrow") } alt="Show information" height="20px"/>
                            {criteria.criteria}
                            
                        </> : <> {criteria.criteria} </> }
                    </td>
                    <td colSpan={4}>{criteria.outcomes[window.location.href]}</td>
                </tr>
                {criteria.hasOwnProperty("hasPart") && selectedCriterias[index] ? 
                    <CriteriaResults criteriaResults={criteria.hasPart} criteria={criteria.criteria} />
                : null }
        
            </> : null }

        </>))} 
    </>);
}




function CriteriaResults({criteriaResults, criteria}:any){  

    const [selectedCriteriaResults, setSelectedCriteriaResults] = useState(Array(criteriaResults.length).fill(false));

    const onBlacklistClick = async (evaluator:any, message:any, outcome:any) => {
        if (window.confirm("Blacklist selected evaluator message?\n(You can remove blacklisted elements from the configuration)")){
            blackListElement({evaluator, criteria, outcome, message});
        } 
    };

    return(<>
        {criteriaResults.map((result:any, index:any) => (<>

            {result.webPage === window.location.href ? <>
                <tr className="collapsible criteriaResult" onClick={() => handleStateChange(selectedCriteriaResults, setSelectedCriteriaResults, index, false, criteriaResults.length)}>
                    <td colSpan={6} style={{...outcome2Background["earl:" + result.outcome]}}>
                        <img src={ selectedCriteriaResults[index] ? getImgSrc("extendedArrow") : getImgSrc("contractedArrow") } alt="Show information" height="20px"/>
                        {result.outcome}
                    </td>
                </tr>

                {selectedCriteriaResults[index] && (<>
                
                    {result.descriptions.map((element:any, index:any) => (<>

                        <tr>
                            <td style={{textAlign:"left", fontWeight:"bold", paddingTop:"10px"}} colSpan={6}>{parse("@" + element.assertor)}
                                <img className='blacklistIcon' src={ getImgSrc("blacklist") } alt="Add message to blacklist" height="18px" onClick={() => onBlacklistClick(element.assertor, element.description, result.outcome)}/>
                            </td>
                        </tr>
                        <tr><td style={{textAlign:"left"}} colSpan={6}>{parse(element.description)}</td></tr>
                    
                    </>))}

                    { result.hasOwnProperty("groupedPointers") ? 
                        <CriteriaResultPointers resultGroupedPointers={result.groupedPointers} />
                    : null }
                    
                </>)}
            </> : null }
            
            

        </>))} 
    </>);
}


function CriteriaResultPointers({resultGroupedPointers}:any){  

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




















