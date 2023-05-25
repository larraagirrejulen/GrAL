
import '../styles/button.scss';
import BeatLoader from 'react-spinners/BeatLoader';


export default function ExtensionButton(
    { classList, onClickHandler, innerText, isLoading = false }:any
){

    return(
        <button 
            className={"extensionButton " + classList} 
            onClick={onClickHandler}
            disabled={isLoading}
        >
            {isLoading && classList.includes("primary") ?
                <BeatLoader size={8} color="#ffffff" />
            : 
                innerText
            }
        </button>
    );
}
