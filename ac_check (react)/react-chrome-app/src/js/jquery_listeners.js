
/*import puppeteer from 'puppeteer-core';


export default function pruebaAccessMonitor(){
  var html = null;
  (async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
  
    await page.goto('http://localhost:8080/https:%2f%2fwww.ehu.eus%2fes%2fhome');
  
    const searchResultSelector = '.evaluation-table';
    await page.waitForSelector(searchResultSelector);
  
    html = await page.content();
  
    console.log(html);
  
    await browser.close();
  })();

  return html;
}*/



async function fetchEvaluators(url, AM, AC, MV) {

  console.log(url.replaceAll("/",'%2f'));

  const formData  = new FormData();
  formData.append("uri", url);
  const [amResponse, acResponse, mvResponse] = await Promise.all([
    //fetchWithTimeout('http://localhost:8080/https://accessmonitor.acessibilidade.gov.pt/results/' + url.replaceAll("/",'%2f'), {evaluate: AM, timeout: 60000}),

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
/*$("#btn_get_data").click(function(){

  AM = $('#AM_checkbox').is(":checked");
  AC = $('#AC_checkbox').is(":checked");
  MV = $('#MV_checkbox').is(":checked");
  A11Y = $('#A11Y_checkbox').is(":checked");

  if (AM || AC || MV){

    fetchEvaluators(window.location.href, AM, AC, MV).then(([amResponse, acResponse, mvResponse]) => {
      json = JSON.stringify(amResponse);
      merge(json, JSON.stringify(acResponse));
      merge(json, JSON.stringify(mvResponse));

      var parser = new DOMParser();

      var doc = parser.parseFromString(amResponse, "text/html");

      console.log(doc);

      json = amResponse;

    }).catch(error => {
      console.log(error.message);
    });

    localStorage.removeItem('json');

    //if (A11Y) merge(json,a11y());

    saveJson(json);

  }else if(A11Y){
    localStorage.removeItem('json');
    json = a11y();
    saveJson(json);
  }else{
    alert('You need to choose at least one analizer');
  }

});*/

/*function saveJson(json){
  localStorage.setItem("json",json);
  update();
  alert("Data successfully saved");
  var origin = window.location.origin; 
  if(origin !=="https://www.w3.org"){
    window.location.reload();
  } 
}*/
