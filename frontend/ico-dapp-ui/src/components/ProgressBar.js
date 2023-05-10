import React, { useState } from 'react';

import { Progress } from 'antd';

function ProgressBar(props) {

    const [value, setValue] = useState(parseInt(props.value));
    const [softcap, setSoftcap] = useState(10);
    const [hardcap, setHardcap] = useState(100);


    const getColor = () => {
        if (value < softcap) {
            return '#ff0000';
        } else if (value >= softcap && value < hardcap) {
            return '#00ff00';
        } else {
            return '#0000ff';
        }
    };


    return (
        <div>

            <div className='twelve columns'>
                <Progress
                    percent={value}
                    strokeColor={getColor()}
                    trailColor='gray'
                    strokeWidth={20}
                    showInfo={false}
                    status="active"
                />
                <div style={{ marginTop: 10 }}>
                    <span style={{ float: 'left' }}>0 BNB</span>
                    <span style={{ float: 'right' }}>1 BNB</span>
                    <div style={{ float: 'left', position: 'relative', width: '100%' }}>
                        <span style={{ position: 'absolute', left: `${softcap}%`, top: -80 }}>
                            <span style={{ borderLeft: '1px solid #ccc', height: 12, display: 'inline-block', position: 'absolute', left: -1 }}></span>
                            <span style={{ backgroundColor: '#ccc', borderRadius: '50%', width: 10, height: 10, display: 'inline-block', position: 'absolute', left: -5, top: -4 }}></span>
                            <span style={{ position: 'absolute', left: -10, top: -30 }}>SoftCap</span>
                        </span>
                        <span style={{ position: 'absolute', left: `${hardcap}%`, top: -80 }}>
                            <span style={{ borderLeft: '1px solid #ccc', height: 12, display: 'inline-block', position: 'absolute', left: -1 }}></span>
                            <span style={{ backgroundColor: '#ccc', borderRadius: '50%', width: 10, height: 10, display: 'inline-block', position: 'absolute', left: -5, top: -4 }}></span>
                            <span style={{ position: 'absolute', left: -10, top: -30 }}>HardCap</span>
                        </span>
                    </div>
                </div>
            </div>
        </div>

    );
}

export default ProgressBar;