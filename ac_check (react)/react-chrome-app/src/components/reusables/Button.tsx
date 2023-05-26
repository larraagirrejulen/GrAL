
import '../../styles/button.scss';
import BeatLoader from 'react-spinners/BeatLoader';


export default function Button(
    { classList, onClickHandler, innerText, isLoading = false, animate = false }:any
){

    return(
        <button 
            className={"extensionButton " + classList} 
            onClick={onClickHandler}
            disabled={isLoading}
        >
            {animate && isLoading ?
                <BeatLoader size={8} color="#ffffff" />
            : 
                innerText
            }
        </button>
    );
}
