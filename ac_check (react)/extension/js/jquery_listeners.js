$(document).ready(function(){

  /** 
   * Function to store given json on extension localStorage
   */
  function saveJson(json){
    localStorage.setItem("json",json);
    update();
    window.location.reload();
  }

  /** 
   * Listener to upload a new document
   */
  $(document).on('change', '#btn_upload', (event) => {
    var reader = new FileReader();
    reader.onload = function(event) {
      var jsonT = localStorage.getItem("json");
      var savedJson = JSON.parse(jsonT);
      var json = JSON.parse(event.target.result);
      
      if (savedJson != null) merge(json,savedJson);

      saveJson(JSON.stringify(json));
    }
    reader.readAsText(event.target.files[0]);
  });

  /**
   * Listener for the clear data button click
   */
  $("#btn_clear_data").click(() => {
      localStorage.removeItem('json');
      localStorage.removeItem('json_resultados');
      localStorage.removeItem("tabla_resultados");
      localStorage.removeItem("tabla_main");
      localStorage.removeItem("ultimo");
      window.location.reload();
  });

  /**
   * Listener for the logo image click
   */
  $("#react_extension_logo_image").click(() => {
    window.open("https://github.com/larraagirrejulen/GrAL", '_blank');
    window.open("https://github.com/Itusil/TFG", '_blank')
  });

  /**
   * Listener for the download button report click
   */
  $("#btn_download").click(() => {
    var jsonT = localStorage.getItem("json");
    var json = JSON.parse(jsonT);

    var title = json.defineScope.scope.title;
    download(title+".json", JSON.stringify(json));

    if (window.confirm("Do you want to upload the report on W3C?")) window.open("https://www.w3.org/WAI/eval/report-tool/", '_blank');
  });
  




  async function fetchWithTimeout(resource, options = {}) {
    const { timeout = 60000 } = options;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    const response = fetch(resource, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timer);
    return response;
  }

  async function fetchScraper(bodyData) {
    const response = await fetchWithTimeout('http://localhost:8080/http://localhost:7070/getEvaluationJson', { method: 'POST', body: bodyData });
    if (!response.ok) throw new Error("Error on fetching scraper server: " + response.status);
    const json = await response.json();
    return JSON.stringify(json["body"], null, 2);
  }

  /**
   * Listener for the click on the button to get data automatically
   */
  $("#btn_get_data").click(async () => {

    AM = $('#AM_checkbox').is(":checked");
    AC = $('#AC_checkbox').is(":checked");
    MV = $('#MV_checkbox').is(":checked");
    A11Y = $('#A11Y_checkbox').is(":checked");

    if (AM || AC || MV){

      const bodyData = JSON.stringify({ "am": AM, "ac": AC, "mv":MV, "url": window.location.href});
      
      document.getElementById('result_table').innerHTML='<div class="loading_gif"/>';

      var json = await fetchScraper(bodyData).catch(error => { console.log(error.message); });

      document.getElementById('result_table').innerHTML='';

      console.log(json);

      /*localStorage.removeItem('json');
      if (A11Y){
        const a11y = a11y();
        merge(json, a11y);
      } 
      saveJson(json);*/

    }else if(A11Y){
      /* localStorage.removeItem('json');
      json = a11y();
      saveJson(json);*/
    }else{
      alert('You need to choose at least one analizer');
    }

  });


  $("#prueba").click(() => {

    // Configure evaluator factory and get evaluator
    doc = window.document;
    let evaluatorFactory = OpenAjax.a11y.EvaluatorFactory.newInstance();
    var ruleset = OpenAjax.a11y.RulesetManager.getRuleset('ARIA_STRICT');
    evaluatorFactory.setParameter('ruleset', ruleset);
    evaluatorFactory.setFeature('eventProcessing', 'fae-util');
    evaluatorFactory.setFeature('groups', 7);
    let evaluator = evaluatorFactory.newEvaluator();

    // Gure luzapenak jarritako html elementuak kendu
    const extension = doc.getElementById("react-chrome-extension");
    extension.remove();

    // Evaluate and save result
    result = evaluator.evaluate(doc, doc.title, window.location.href);

    // Gure luzapenak jarritako html elementuak berriro jarri
    doc.body.appendChild(extension);

    console.log(result);

    // Get evaluation results
    let ruleGroupResult   = result.getRuleResultsAll();
    let ruleSummaryResult = ruleGroupResult.getRuleResultsSummary();
    v = ruleSummaryResult.violations;
    w = ruleSummaryResult.warnings;
    p = ruleSummaryResult.manual_checks;
    m = ruleSummaryResult.passed;
    pa = ruleSummaryResult.page;
    h = ruleSummaryResult.hidden;
    console.log("violations: " + v + " warnings: " + w + " manual_checks: " + m + " passed: " + p + " page: " + pa + " h: " + h);

    let ruleResults = ruleGroupResult.getRuleResultsArray();
    console.log(ruleSummaryResult);
    console.log(ruleResults);
    var v = 0;
    var w = 0;
    var p = 0;
    var m = 0;
    var pa = 0;
    var h = 0;
    for(let i = 0; i < ruleResults.length; i++) {
      try{
        if(ruleResults[i].rule.rule_id.startsWith("LINK")){
          console.log(ruleResults[i]);
        }
        ers = ruleResults[i].getElementResultsSummary();
        if (ers.violations>=1) v += 1;
        if (ers.warnings>=1) w += 1;
        if (ers.passed>=1) p += 1;
        if (ers.manual_checks>=1) m += 1;
        if (ers.page>=1) pa += 1;
        if (ers.hidden>=1) h += 1;
      }
      catch (e){
        console.log("Error with rule " + rule + ": " + e)
      }
      
    }
    console.log("violations: " + v + " warnings: " + w + " manual_checks: " + m + " passed: " + p + " page: " + pa + " h: " + h);

  });


});