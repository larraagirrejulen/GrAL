

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
  export default async function getDataHandler() {

    const AM = document.getElementById('#AM_checkbox').is(":checked");
    const AC = document.getElementById('#AC_checkbox').is(":checked");
    const MV = document.getElementById('#MV_checkbox').is(":checked");
    const A11Y = document.getElementById('#A11Y_checkbox').is(":checked");

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

  }











/*export function addListeners(){
    console.log("aaaaaaaaaaaaaaaaa");
    var elements1 = document.getElementsByClassName(".collapsible_tabla");
    var elements2 = document.getElementsByClassName(".collapsible_tabla");
    var elements3 = document.getElementsByClassName(".collapsible_tabla");
    console.log(elements1);
    for (var i = 0; i < elements1.length; i++) {
        elements1[i].addEventListener('click', collapsible1);
    }
    for (var i = 0; i < elements2.length; i++) {
        elements2[i].addEventListener('click', collapsible2);
    }
    for (var i = 0; i < elements3.length; i++) {
        elements3[i].addEventListener('click', collapsible3);
    }
}*/


/**
 * Listener for clicking on an element of the results
 */
function collapsible1(elem){
    console.log("aaaaaaaaa");
    elem.classList.toggle("active");
    var content = elem.nextElementSibling;
    if (content.style.display === "block") {
    content.style.display = "none";
    } else {
    content.style.display = "block";
    }
}

/**
 * Listener for clicking on a sub-element of the results
 */
function collapsible2(elem){
    elem.classList.toggle("active");
    var content = elem.nextElementSibling;
    if (content.style.display === "block") {
    content.style.display = "none";
    } else {
    content.style.display = "block";
    }
}

/**
 * Listener for clicking on a sub-sub-element of the results
 */
/*function collapsible3(elem){
    let foto_ele = $(elem).find('img')[0];
    if (typeof foto_ele !== 'undefined') {   
        console.log(foto_ele) 
        let actual_src = foto_ele.getAttribute('src'); 
        console.log(actual_src) 
        if(actual_src === "" || actual_src === getArrowSrc()){
        foto_ele.setAttribute('src', getArrowUpSrc());
        }else{
        foto_ele.setAttribute('src', getArrowSrc());
        }
        var content = elem.nextElementSibling;
        if (content.style.display === "block") {
        content.style.display = "none";
        } else {
        content.style.display = "block";
        }
    }
}*/