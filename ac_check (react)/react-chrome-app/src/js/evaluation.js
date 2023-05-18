
import { storeNewReport } from './reportStorage.js';


/**
 * Perform an evaluation based on given scope and selected analyzers.
 * @async
 * @function performEvaluation
 * @param {function} setIsLoading - Function to enable and disable loading animation.
 * @throws {Error} Throws an error if an error occurs during the evaluation process.
 * @returns {void}
 */
export async function performEvaluation(setIsLoading){

    try{

        setIsLoading(true);

        const scope = JSON.parse(localStorage.getItem("scope"));
        if(scope.length === 0){
            alert("You need to set at least a web page as a scope");
            return;
        }

        const checkboxes = JSON.parse(localStorage.getItem("checkboxes"));
        const [am, ac, mv, a11y, pa, lh] = checkboxes.map(({ checked }) => checked);

        if([am, ac, mv, a11y, pa, lh].every(val => val === false)) {
            alert("You need to choose at least one analizer");
            return;
        }

        const bodyData = JSON.stringify({ am, ac, mv, a11y, pa, lh, scope });

        const evaluationReport = await fetchEvaluation(bodyData);

        storeNewReport(evaluationReport);

    } catch (error) {
        console.error("Error during evaluation process => ", error);
        alert("An error occurred during evaluation. Please try again.");
    } finally {
        setIsLoading(false);
    }

}


/**
 * Fetches the evaluation report from a server using a JSON body.
 * @async
 * @function fetchEvaluation
 * @param {string} bodyData - The JSON body containing the parameters for the evaluation report.
 * @param {number} [timeout=120000] - The timeout for the fetch request, in milliseconds.
 * @returns {Promise<object>} - The evaluation report as an object.
 * @throws {Error} If there was an error with the fetch request, or if the request timed out.
 */
async function fetchEvaluation(bodyData, timeout = 120000) {

    try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeout);

        const response = await fetch('http://localhost:8080/http://localhost:7070/getEvaluationJson', {
            body: bodyData,
            method: "POST",
            headers: {"Content-Type": "application/json"},
            signal: controller.signal
        });
        
        clearTimeout(timer);

        if (!response.ok) throw new Error("HTTP error! Status: " + response.status);
        
        const report = await response.json();

        return JSON.parse(report);

    } catch (error) {
        throw new Error("Error fetching scraping server => " + error.name === 'AbortError' ? 'fetch timed out!' : error.message)
    }

}