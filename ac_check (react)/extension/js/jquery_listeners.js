$(document).ready(function(){
  /** 
   * Listener for when a document is uploaded
   */
  $(document).on('change', '#btn_upload', function(event) {
    var reader = new FileReader();
    
    reader.onload = function(event) {
      var jsonT = localStorage.getItem("json");
      var json = JSON.parse(jsonT);
      var jsonObj = JSON.parse(event.target.result);
      
      if (json == null){
        //Case is empty, the one who has just entered gets in.
        localStorage.setItem("json",JSON.stringify(jsonObj));
      }else{
        //Case not empty, merge with the previous one
        merge(json,jsonObj);
        localStorage.setItem("json",JSON.stringify(json));
      }
      update();
      //window.location.reload();
    }
  
    reader.readAsText(event.target.files[0]);
  });

  /**
   * Listener for the clear data button click
   */
  $("#btn_clear_data").click(function(){
      localStorage.removeItem('json');
      localStorage.removeItem('json_resultados');
      localStorage.removeItem("tabla_resultados");
      localStorage.removeItem("tabla_main");
      localStorage.removeItem("ultimo");
      
      //alert("Data successfully deleted");
      var origin = window.location.origin; 
      if(origin !=="https://www.w3.org"){
        //update();  
        window.location.reload();
      }
  });

  /**
   * Listener for the logo image click
   */
  $("#react_extension_logo_image").click(function(){
    window.open("https://github.com/larraagirrejulen/GrAL", '_blank');
    window.open("https://github.com/Itusil/TFG", '_blank')
  });



  async function fetchEvaluators(url, AM, AC, MV) {

    console.log(url.replaceAll("/",'%2f'));

    const formData  = new FormData();
    formData.append("uri", url);
    const [amResponse, acResponse, mvResponse] = await Promise.all([
      fetchWithTimeout('http://localhost:8080/https://accessmonitor.acessibilidade.gov.pt/results/' + url.replaceAll("/",'%2f'), {evaluate: AM, timeout: 60000}),
      fetchWithTimeout('http://localhost:8080/https://achecker.achecks.ca/checker/index.php:443', {evaluate: AC, timeout: 60000}),
      fetchWithTimeout('http://localhost:8080/https://mauve.isti.cnr.it/singleValidation.jsp', {evaluate: MV, timeout: 60000, method:"POST", body: formData})
    ]);

    if (!amResponse.ok || !acResponse.ok || !mvResponse.ok) {
      const message1 = `AM error: ${amResponse.status}`;
      const message2 = `AC error: ${acResponse.status}`;
      const message3 = `MV error: ${mvResponse.status}`;
      throw new Error(message1 + "\n" + message2 + "\n" + message3);
    }
    
    const am = await amResponse.text();
    const ac = await acResponse.text();
    const mv = await mvResponse.text();

    return [am, ac, mv];
  }



  async function fetchWithTimeout(resource, options = {}) {
    const { evaluate } = options;
    if (!evaluate){
      return fetch("http://localhost:8080/");
    } 
    const { timeout = 60000 } = options;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    const response = fetch(resource, {
      ...options,
      mode: "cors",
      redirect: "follow",
      signal: controller.signal
    });
    clearTimeout(timer);
    return response;
  }



  /**
   * Listener for the click on the button to get data automatically
   */
  $("#btn_get_data").click(function(){
    
    AM = $('#AM_checkbox').is(":checked");
    AC = $('#AC_checkbox').is(":checked");
    MV = $('#MV_checkbox').is(":checked");
    A11Y = $('#A11Y_checkbox').is(":checked");

    if (AM || AC || MV){

      fetchEvaluators(window.location.href, AM, AC, MV).then(([amResponse, acResponse, mvResponse]) => {
        /*json = JSON.stringify(amResponse);
        merge(json, JSON.stringify(acResponse));
        merge(json, JSON.stringify(mvResponse));*/

        var parser = new DOMParser();

        var doc = parser.parseFromString(amResponse, "text/html");

        console.log(doc);

        json = amResponse;

      }).catch(error => {
        console.log(error.message);
      });

      /*localStorage.removeItem('json');

      //if (A11Y) merge(json,a11y());

      saveJson(json);*/

    }else if(A11Y){
      /* localStorage.removeItem('json');
      json = a11y();
      saveJson(json);*/
    }else{
      alert('You need to choose at least one analizer');
    }

  });

  function saveJson(json){
    localStorage.setItem("json",json);
    update();
    alert("Data successfully saved");
    var origin = window.location.origin; 
    if(origin !=="https://www.w3.org"){
      window.location.reload();
    } 
  }

  /**
   * Listener for the click on the download button report
   */
  $("#btn_download").click(function(e){
    console.log('Id: '+$(this).attr('id'));
      var jsonT = localStorage.getItem("json");
      var json = JSON.parse(jsonT);

      var title = json.defineScope.scope.title;
      download(title+".json", JSON.stringify(json));
      var origin = window.location.origin; 
      console.log("Or"+origin);
      


      if(String(origin) !=="https://www.w3.org"){
        var ask = window.confirm("Do you want to upload the report on W3C?");
        if (ask) {
          window.location.href = "https://www.w3.org/WAI/eval/report-tool/";
        }
        
      }
  });




  $("#prueba").click(function(){


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