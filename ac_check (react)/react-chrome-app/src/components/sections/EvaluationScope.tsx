
import '../../styles/sections/evaluationScope.scss';

import { useEffect, useState } from "react";
import { getImgSrc } from '../../js/utils/chromeUtils.js';

import Button from '../reusables/Button';
import Dropdown from '../reusables/DropdownSection';



/**
 * Renders the EvaluationScope component.
 *
 * @returns {JSX.Element} The rendered EvaluationScope component.
 */
export default function EvaluationScope (): JSX.Element {

  const [webPageList, setWebPageList] = useState([{name: window.document.title, url: window.location.href}]);

  const [newWebPage, setNewWebPage] = useState({ name: "", url: "" });
  const [editItemIndex, setEditItemIndex] = useState(-1);


  /**
   * Handles adding a new item to the evaluation scope.
   */
  const handleAddItem = () => {
    setEditItemIndex(webPageList.length);

    const newListItem = { name: "", url: "" }
    setNewWebPage(newListItem);

    const newList = [...webPageList, newListItem];
    setWebPageList(newList);
    localStorage.setItem("scope", JSON.stringify(newList));
  };


  /**
   * Handles editing an item in the evaluation scope.
   *
   * @param {number} index - The index of the item to be edited.
   */
  const handleEditItem = (index:any) => {
    setEditItemIndex(index);
    setNewWebPage(webPageList[index]);
  };


  /**
   * Handles updating an item in the evaluation scope.
   */
  const handleUpdateItem = () => {

    const baseUrl = new URL(window.location.href).origin + "/";

    if(newWebPage.name === ""){
      alert("Wrong web page name");
      return;
    }else if(!newWebPage.url.startsWith(baseUrl)){
      alert("URL must start with: " + baseUrl);
      return;
    }

    const newList = [...webPageList];
    newList[editItemIndex] = newWebPage;
    setWebPageList(newList);
    localStorage.setItem("scope", JSON.stringify(newList));
    setNewWebPage({ name: "", url: "" });
    setEditItemIndex(-1);
  };


  /**
   * Handles deleting an item from the evaluation scope.
   *
   * @param {number} index - The index of the item to be deleted.
   */
  const handleDeleteItem = (index:any) => {
    const newList = [...webPageList];
    newList.splice(index, 1);
    setWebPageList(newList);
    localStorage.setItem("scope", JSON.stringify(newList));
  };

  useEffect(() => { 
    const storedScope = localStorage.getItem("scope");

    if(storedScope === null){
      localStorage.setItem("scope", JSON.stringify(webPageList));
      return;
    }

    if(JSON.parse(storedScope).length > 0){
      setWebPageList(JSON.parse(storedScope));
    }
    
  }, [webPageList]);

  return ( 
    <Dropdown headerText={"Evaluation scope"} classList={"first lineSpaced"}>

      <ul id="extensionScopeInputList">
        {webPageList.map((webPage:any, index:any)=>(
          <li className="scopeInput" key={index}>
            {editItemIndex === index ? (

              <div className="inputWrapper">
                <input
                  type="text"
                  placeholder="Name"
                  value={newWebPage.name}
                  onChange={(e) => setNewWebPage({ ...newWebPage, name: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="URL"
                  value={newWebPage.url}
                  onChange={(e) => setNewWebPage({ ...newWebPage, url: e.target.value })}
                /><br/>
                <Button 
                    classList={"primary small lineSpaced"} 
                    onClickHandler={handleUpdateItem} 
                    innerText={"Save"}   
                    small={true} 
                />
                {(newWebPage.name === "" && newWebPage.url === "")  && ( 
                  <Button 
                    classList={"secondary small spaced lineSpaced"} 
                    onClickHandler={() => handleDeleteItem(index)} 
                    innerText={"Cancel"}  
                    small={true}  
                  />
                )}
              </div>

            ) : (

              <div className="inputWrapper">
                <span onClick={() => { window.open(webPage.url, '_blank'); }}>
                  {webPage.name.length > 20 ?  webPage.name.substring(0, 20) + "... " : webPage.name}
                </span>
                <img 
                  className="icon edit" 
                  alt="edit web page data" 
                  src={getImgSrc("edit")} 
                  onClick={() => handleEditItem(index)} 
                />
                <img 
                  className="icon delete" 
                  alt="remove web page from list" 
                  src={getImgSrc("delete")} 
                  onClick={() => handleDeleteItem(index)} 
                />
              </div>

            )}
          </li>
        ))}
      </ul>
      
      <Button 
          classList={"primary"} 
          onClickHandler={handleAddItem} 
          innerText={"New web page"}    
      />
      
    </Dropdown>
   );
}

