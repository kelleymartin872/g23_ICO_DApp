import React, { useState } from 'react';

function InputForm() {
    const [inputValue, setInputValue] = useState('');

    const handleInputChange = (event) => {
        setInputValue(event.target.value);
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        // Do something with the input value, such as send it to a server or update state
        console.log(inputValue);
    }

    return (
        <div id="">
            <form onSubmit={handleSubmit}>
                <div className='three columns'></div>
                <div className='two columns'>
                    <label>
                        The amount to deposit:
                        <input type="number" value={inputValue} onChange={handleInputChange} />
                    </label>
                </div>
                <div className='seven columns'><button type="submit">{this.props.states}</button></div>
            </form>
        </div>
    );
}

export default InputForm;