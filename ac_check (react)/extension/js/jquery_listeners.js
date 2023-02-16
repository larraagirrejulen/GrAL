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
   * Listener for clicking on an element of the results
   */
  $(".collapsible_tabla").click(function(){
    this.classList.toggle("active");
    var content = this.nextElementSibling;
    if (content.style.display === "block") {
      content.style.display = "none";
    } else {
      content.style.display = "block";
    }
  });

  /**
   * Listener for clicking on a sub-element of the results
   */
  $(".collapsible_tabla2").click(function(){
    this.classList.toggle("active");
    var content = this.nextElementSibling;
    if (content.style.display === "block") {
      content.style.display = "none";
    } else {
      content.style.display = "block";
    }
  });

  /**
   * Listener for clicking on a sub-sub-element of the results
   */
  $(".collapsible_tabla3").click(function(){
    let foto_ele = $(this).find('img')[0];
    if (typeof foto_ele !== 'undefined') {   
      let actual_src = foto_ele.getAttribute('src');  
      if(actual_src === "http://127.0.0.1:5000/flecha.png"){
        foto_ele.setAttribute('src',chrome.runtime.getURL('/images/arrow_up.png'));
      }else{
        foto_ele.setAttribute('src',chrome.runtime.getURL('/images/arrow.png'));
      }
      var content = this.nextElementSibling;
      if (content.style.display === "block") {
        content.style.display = "none";
      } else {
        content.style.display = "block";
      }
    }
  });

  /**
   * Listener for the click on the button to get data automatically
   */
  $("#auto").click(function(){

    if ($('#AM_checkbox').is(":checked") || $('#AC_checkbox').is(":checked")){

      localStorage.removeItem('json');
      var req = new XMLHttpRequest();
      var url = 'http://127.0.0.1:5000/getJSON/';
      req.responseType = 'json';
      var url_local = window.location.href;

      req.open('POST', url, true);
      req.onload  = function() {
        var jsonResponse = req.response;
        json = JSON.stringify(jsonResponse);

        //if ($('#A11Y_checkbox').is(":checked")) merge(json,a11y());

        /*console.log(json);
        alert("aaaaa");*/

        saveJson(json);
      }
    /*}else if($('#A11Y_checkbox').is(":checked")){
      json = a11y();
      saveJson(json);*/
    }else{
      alert('You need to choose at least one analizer');
      return;
    }

    req.setRequestHeader('Content-Type', 'application/json');
    req.send(JSON.stringify({
        'url': url_local,
        'AM': $('#AM_checkbox').is(":checked"),
        'AC': $('#AC_checkbox').is(":checked")
    }));
    document.getElementById('result_table').innerHTML='<div class="loader_s"></div>';
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


  $("#fetch").click(function(){

    async function fetchEvaluators() {
      const [amResponse, acResponse] = await Promise.all([
        fetchWithTimeout('http://localhost:8080/https://accessmonitor.acessibilidade.gov.pt/:443', {timeout: 5000}),
        fetchWithTimeout('http://localhost:8080/https://achecker.achecks.ca/checker/index.php:443')
      ]);
      if (!amResponse.ok || !acResponse.ok) {
        const message1 = `An error has occured: ${amResponse.status}`;
        const message2 = `An error has occured: ${acResponse.status}`;
        throw new Error(message1 + "\n" + message2);
      }
      const am = await amResponse.text();
      const ac = await acResponse.text();
      return [am, ac];
    }

    fetchEvaluators().then(([am, ac]) => {
      console.log("am: " + am);
      console.log("ac: " + ac);
    }).catch(error => {
      console.log(error.message);
    });

    async function fetchWithTimeout(resource, options = {}) {
      const { timeout = 8000 } = options;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeout);
      const response = await fetch(resource, {
        ...options,
        mode: "cors",
        signal: controller.signal  
      });
      clearTimeout(timer);
      return response;
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
    console.log("violations: " + v + " warnings: " + w + " manual_checks: " + m + " passed: " + p);

    let ruleResults = ruleGroupResult.getRuleResultsArray();
    var v = 0;
    var w = 0;
    var p = 0;
    var m = 0;
    for(let i = 0; i < ruleResults.length; i++) {
      try{
        ers = ruleResults[i].getElementResultsSummary();
        if (ers.violations>=1) v += 1;
        if (ers.warnings>=1) w += 1;
        if (ers.passed>=1) p += 1;
        if (ers.manual_checks>=1) m += 1;
      }
      catch (e){
        console.log("Error with rule " + rule + ": " + e)
      }
      
    }
    console.log("violations: " + v + " warnings: " + w + " manual_checks: " + m + " passed: " + p);

  });




  
});