import React from 'react';
import { Input, Button } from 'antd';

function Deposit(props) {

    const handleSubmit = async () => {
    }

    return (
        <div>
            <div className='eight columns'>
                <Input
                    type="number"
                    placeholder="Deposit Amount Input"
                    max="0.05"
                    min="0.01"
                    step="0.001"
                    style={{ width: "50%" }}
                />
            </div>
            <div className='one coumns'></div>
            <div className='three columns'>
                <Button type="primary" onClick={handleSubmit}> {props.buttontext} </Button>
            </div>
        </div>
    );
}

export default Deposit;