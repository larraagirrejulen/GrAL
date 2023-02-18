
export default function addListeners(){
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
}


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
function collapsible3(elem){
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
}