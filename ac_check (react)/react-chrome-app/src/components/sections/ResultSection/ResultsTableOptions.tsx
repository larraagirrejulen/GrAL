
//import '../../styles/.scss';

import { storeNewReport } from "../../../js/evaluationOptions";
import { removeCase } from "../../../js/resultsTableOptions";
import { getFromChromeStorage, getImgSrc } from "../../../js/utils/chromeUtils";
import { getSuccessCriterias } from "../../../js/utils/wcagUtils";
import Button from "../../reusables/Button";


export default function ResultsTableOptions(
    { editIndex, setEditIndex, criteria, index }:any
){

    const saveChanges = () => {
        
    };

    const cancelChanges = () => {
        setEditIndex(-1);
    };

    const editCase = () => {
        
        setEditIndex(index);

    };

    const confirmCase = async () => {
        
        const evaluationReport = await getFromChromeStorage("report", false);

        const caseToConfirm = criteria.hasPart[index];

        const criteriaTxt = getSuccessCriterias().find((elem:any) => elem.num === criteria.criteriaNumber);

        const reportCriteria = evaluationReport.auditSample.find((elem:any) => elem.test.includes(criteriaTxt.id));

        const foundCaseIndex = reportCriteria.hasPart.indexOf((elem:any) => elem.subject === caseToConfirm.webPage && elem.result.outcome.replace("earl:", "") === caseToConfirm.outcome)

        reportCriteria.hasPart[foundCaseIndex].assertedBy.push({assertor: getFromChromeStorage("authenticationState"), description:""})

        storeNewReport(evaluationReport);

    };

    return(<>
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
            <img src={ getImgSrc("ok") } alt="Confirm found case" height="18px" onClick={()=>confirmCase()}/>
            <img src={ getImgSrc("edit") } alt="Edit found case" height="16px" onClick={()=>editCase()}/>
            <img src={ getImgSrc("remove") } alt="Remove found case" height="16px" onClick={()=>removeCase(index)}/>
        </>}
    </>);
}
