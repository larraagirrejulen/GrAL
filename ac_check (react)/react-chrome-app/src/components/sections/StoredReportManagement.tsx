
import '../../styles/sections/storedReportManagement.scss';

import { useEffect, useState } from "react";
import Button from '../reusables/Button';

import { loadStoredReport, getStoredReports, removeStoredReport } from '../../scripts/reportStorageOptions.js';


/**
 * Component for managing stored reports.
 * @param {Object} props - The component props.
 * @param {Function} props.setManageStoredReports - Function to set the manageStoredReports state.
 * @param {string} props.authenticationState - The authentication state.
 * @returns {JSX.Element} The rendered JSX element.
 */
export default function StoredReportManagement({setManageStoredReports, authenticationState}:any) : JSX.Element {

  const [paginatedData, setPaginatedData] = useState([[]]);

  const [selectedIndex, setSelectedIndex] = useState(-1);

  const [currentPage, setCurrentPage] = useState(0);


  useEffect( ()=>{
    getStoredReports(setPaginatedData);
  }, []);

  /**
    * Event handler for loading the selected stored report.
    */
  const loadHandler = () => {
    const selected:any = paginatedData[currentPage][selectedIndex];
    localStorage.setItem("parentId", selected.id);
    loadStoredReport(selected.id);
  }

  /**
    * Event handler for deleting the selected stored report.
    */
  const deleteHandler = () => {
    const selected:any = paginatedData[currentPage][selectedIndex];
    if(authenticationState !== selected.uploadedBy){
      alert("You can not delete reports uploaded by other users");
      return;
    }
    removeStoredReport(selected.id, setPaginatedData);
  }
    
  return (
      <div id="reportLoadingWrapper">
      
        <p>Stored reports for {new URL(window.location.href).origin + "/"} website:</p>

        <div className='tableWrapper'>
          <table className='websiteStoredReports'>
            <thead>
              <tr>
                <th style={{width: "50px"}}>Id</th>
                <th style={{width: "60px"}}>Version</th>
                <th style={{width: "80px"}}>Uploaded by</th>
                <th style={{width: "60px"}}>Parent Id</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData[currentPage].map((report: any, index: number) => (
                <tr
                  className={`${selectedIndex === index && 'selected'}`}
                  onClick={() => setSelectedIndex(selectedIndex === index ? -1 : index)}
                  key={report.id}
                >
                  <td>{report.id}</td>
                  <td>{report.version}</td>
                  <td>{report.uploadedBy}</td>
                  <td>{report.parentId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 0}
          >
            Previous
          </button>
          {paginatedData.length > 3 ? <>
            <button
              key={0}
              onClick={() => setCurrentPage(0)}
              disabled={currentPage === 0}
            >
              1
            </button>

            {currentPage === 0 ? <>
              <button
                key={1}
                onClick={() => setCurrentPage(1)}
              >
                2
              </button>
              <span>...</span>
            </>:<>
              {currentPage === paginatedData.length-1 ? <>
                <span>...</span>
                <button
                  key={paginatedData.length-2}
                  onClick={() => setCurrentPage(paginatedData.length-2)}
                >
                  {paginatedData.length-1}
                </button>
              </>:<>
                <span> ... {currentPage+1} ... </span>
              </>}
            </>}

            <button
              key={0}
              onClick={() => setCurrentPage(paginatedData.length-1)}
              disabled={currentPage === paginatedData.length-1}
            >
              {paginatedData.length}
            </button>
          </> : <>
            {Array.from({ length: paginatedData.length }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index)}
                disabled={currentPage === index}
              >
                {index + 1}
              </button>
            ))}
          </>}
          
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === paginatedData.length - 1}
          >
            Next
          </button>
        </div>
        
        {selectedIndex !== -1 && (<>
          <Button 
            classList={"primary"} 
            onClickHandler={loadHandler} 
            innerText={"Load"} 
            disabled={selectedIndex === -1}
          />
          <Button 
            classList={"secondary spaced delete"} 
            onClickHandler={deleteHandler} 
            innerText={"Delete"} 
            disabled={selectedIndex === -1}
          />
        </>)}

        <Button 
          classList={"secondary spaced"} 
          onClickHandler={() => setManageStoredReports(false)} 
          innerText={"Cancel"}  
        />

      </div>
  );
}