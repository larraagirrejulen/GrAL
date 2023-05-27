
import { useState } from 'react';
import '../../styles/reusables/dropdownSection.scss';
import { getImgSrc } from '../../js/utils/chromeUtils';


export default function Dropdown(
    { headerText, children, classList }:any
){

    const [isOpen, setIsOpen] = useState(localStorage.getItem("evaluated") !== "true");

    return(
        <div className={"extensionDropdown " + classList}>
            <div className="header" onClick={() => setIsOpen((prev:any) => !prev) }>
                <img src = { isOpen ? getImgSrc("extendedArrow") : getImgSrc("contractedArrow") } alt="dropdown_arrow" />
                <span>{headerText}</span>
            </div>

            <div className="body" style={isOpen ? {display: "block"} : {display: "none"}}>
                { children }
            </div>
        </div>
    );
}