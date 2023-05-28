
import '../../../styles/sections/resultSection/summaryTable.scss';

import { useState, useEffect} from "react";
import { setUseStateFromStorage } from '../../../js/utils/reactUtils.js';
import { OutcomeHeaders } from './ResultsTable';


export default function SummaryTable({conformanceLevels}:any){

    const [webSiteOutcomes, setWebSiteOutcomes] = useState([0, 0, 0, 0, 0]);
    const [siteSummary, setSiteSummary] = useState(null);
    
    const [webPageOutcomes, setWebPageOutcomes] = useState([0, 0, 0, 0, 0]);
    const [pageSummaries, setPageSummaries] = useState(null);

    const [webpage, setWebpage] = useState(null);

    const [activeTab, setActiveTab] = useState('website');

    const countOutcomes = (summary:any, setOutcomes:any) => {
        let outcomes = [0, 0, 0, 0, 0];
        for(const conformanceLevel of conformanceLevels){
            outcomes[0] += summary["earl:passed"][conformanceLevel];
            outcomes[1] += summary["earl:failed"][conformanceLevel];
            outcomes[2] += summary["earl:cantTell"][conformanceLevel];
            outcomes[3] += summary["earl:inapplicable"][conformanceLevel];
            outcomes[4] += summary["earl:untested"][conformanceLevel];
        }
        setOutcomes(outcomes);
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

    return(
        <div id="evaluationSummary">

            <p>Current Site/Page summary:</p>
            <div className="tabs">
                <div
                    className={activeTab === 'website' ? 'active' : ''}
                    onClick={() => setActiveTab('website')}
                    style={{width: "90px"}}
                >
                    Website
                </div>
                <div
                    className={activeTab === 'webpage' ? 'active' : ''}
                    onClick={() => setActiveTab('webpage')}
                    style={{width: "136px"}}
                >
                    {pageSummaries && pageSummaries[window.location.href] && webpage ? 
                        webpage
                    : "Current webpage"}
                </div>
            </div>

            {activeTab === 'website' && (<>
                <table id="summaryTable">
                    <tr> <OutcomeHeaders /> </tr>
                    <tr> {webSiteOutcomes.map((count:any) => ( <td>{count}</td> ))} </tr>
                </table>
            </>)}

            {activeTab === 'webpage' && (<>
                {pageSummaries && pageSummaries[window.location.href] ? (
                    <table id="summaryTable">
                        <tr> <OutcomeHeaders /> </tr>
                        <tr> {webPageOutcomes.map((count:any) => ( <td>{count}</td> ))} </tr>
                    </table>
                ) : (
                    <div style={{ textAlign: 'center', padding: '15px 0' }}>
                        Current webpage has not been evaluated
                    </div>
                )}
            </>)}

        </div>
    );
}




















