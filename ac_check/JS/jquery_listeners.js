$(document).ready(function(){
  /** 
   * Listener for when a document is uploaded
   */
  $(document).on('change', '#file-upload-button', function(event) {
    var reader = new FileReader();
    
    reader.onload = function(event) {
      var jsonT = localStorage.getItem("json");
      var json = JSON.parse(jsonT);
      var jsonObj = JSON.parse(event.target.result);
      
      if (json == null){
        //Case is empty, the one who has just entered gets in.
        localStorage.setItem("json",JSON.stringify(jsonObj));
        update();
      }else{
        //Case not empty, merge with the previous one
        merge(json,jsonObj);
        localStorage.setItem("json",JSON.stringify(json));
        update();
      }
      alert("JSON successfully loaded!");
      window.location.reload();
    }
  
    reader.readAsText(event.target.files[0]);
  });

  /**
   * Listener for the clear data button click
   */
  $("#limpiar").click(function(){
      localStorage.removeItem('json');
      localStorage.removeItem('json_resultados');
      localStorage.removeItem("tabla_resultados");
      localStorage.removeItem("tabla_main");
      localStorage.removeItem("ultimo");
      
      alert("Data successfully deleted");
      var origin = window.location.origin; 
      if(origin !=="https://www.w3.org"){
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
        foto_ele.setAttribute('src',"http://127.0.0.1:5000/flecha_arriba.png");
      }else{
        foto_ele.setAttribute('src',"http://127.0.0.1:5000/flecha.png");
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
    document.getElementById('tabla_res').innerHTML='<div class="loader_s"></div>';
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
  $("#download").click(function(e){
    console.log('Id: '+$(this).attr('id'));
      var jsonT = localStorage.getItem("json");
      var json = JSON.parse(jsonT);

      var title = json.defineScope.scope.title;
      download(title+".json", JSON.stringify(json));
      var origin = window.location.origin; 
      console.log("Or"+origin);
      
      if(String(origin) !=="https://www.w3.org"){
        window.location.href = "https://www.w3.org/WAI/eval/report-tool/";
      }
  });

  /**
   * Listener for clicking on the links of the accessibility analyzers
     */
  $(".sn_label_paginas").click(function(){
      let url =$(this).attr('id');
      url = url.substring(0,2);
      if(url === "AM"){
         window.open("https://accessmonitor.acessibilidade.gov.pt/", '_blank').focus();
      }
      if(url === "AC"){
         window.open("https://achecker.achecks.ca/checker/index.php", '_blank').focus();
      }
      if(url === "A1"){ // A11Y
        window.open("https://github.com/ainspector/a11y-evaluation-library", '_blank').focus();
      }
  });






  $("#prueba").click(function(){

    // Get document info from browser context
    doc = window.document;
    url = window.location.href;

    // Get and configure an evaluatorFactory
    let evaluatorFactory = OpenAjax.a11y.EvaluatorFactory.newInstance();

    // A tools developer wants to use the ARIAStrictRuleset
    var asRuleset = OpenAjax.a11y.RulesetManager.getRuleset('ARIA_STRICT');

    // and configure it...
    evaluatorFactory.setParameter('ruleset', asRuleset);
    evaluatorFactory.setFeature('eventProcessing',   'none');
    evaluatorFactory.setFeature('brokenLinkTesting', false);

    // Get the evaluator
    let evaluator = evaluatorFactory.newEvaluator();

    // Gure luzapenak jarritako html elementuak kendu
    const element = doc.getElementById("sidenav_s");
    element.remove();
    /*const ancestor = doc.getElementById("main_s");
    descendents = ancestor.getElementsByTagName('*');
    ancestor.remove();
    for (i = 0; i < descendents.length; ++i) {
      doc.body.appendChild(descendents[i]);
      console.log(descendents[i]);
    }
    alert("aaaaa");*/

    // Evaluate
    result = evaluator.evaluate(doc, doc.title, url);

    // Gure luzapenak jarritako html elementuak berriro jarri
    /*descendents = doc.body.getElementsByTagName('*');
    for (i = 0; i < descendents.length; ++i) {
      descendents[i].remove();
    }
    doc.body.appendChild(ancestor);*/
    doc.body.appendChild(element);

    console.log(result);

    // Get evaluation results
    data = result.getRuleset().toJSON();
    json = JSON.parse(data);

    // Print results
    var v = 0;
    var w = 0;
    var p = 0;
    var m = 0;
    var h = 0;
    for (rule in json.rule_mappings){
      ers = result.getRuleResult(rule).getElementResultsSummary();
      if (ers.violations>=1) v += 1;
      if (ers.warnings>=1) w += 1;
      if (ers.passed>=1) p += 1;
      if (ers.manual_checks>=1) m += 1;
      if (ers.hidden>=1) h += 1;
    }
    console.log("violations: ", v);
    console.log("warnings: ", w);
    console.log("passed: ", p);
    console.log("manual_checks: ", m);
    console.log("hidden: ", h);

    /*checked = []
    for (rule in json.rule_mappings){
      r = rule.substring(0, rule.length - 2);
      r = r.replace('_', '');
      if (!checked.includes(r)){
        checked.push(r);
        var v = 0;
        var w = 0;
        var p = 0;
        var m = 0;
        var h = 0;
        console.log("RULE TYPE: ", r);
        for (rule in json.rule_mappings){
          if(rule.startsWith(r)){
            ers = result.getRuleResult(rule).getElementResultsSummary();
            v += ers.violations;
            w += ers.warnings;
            p += ers.passed;
            m += ers.manual_checks;
            h += ers.hidden;
          }
        }
        console.log("violations: ", v);
        console.log("warnings: ", w);
        console.log("passed: ", p);
        console.log("manual_checks: ", m);
        console.log("hidden: ", h);
        console.log(" ----------------------- ");
      }
    }*/

  });




  
});