
import './App.css';
import Clock from "./components/Clock.js"
//import Deposit from "./components/Deposit.js"
//import ProgressBar from "./components/ProgressBar";
import { Button, Input, Progress } from 'antd'
import { useState, useEffect } from 'react';


//import { ethers } from 'ethers'


function App() {

  //const contractAddress = "0x355638a4eCcb777794257f22f50c289d4189F2";
  

  const [value, setValue] = useState(100);
  const [softcap] = useState(10);
  const [hardcap] = useState(100);

  const [currentAccount, setCurrentAccount] = useState(null);

  const checkWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have Metamask installed.");
    }
    else {
      console.log("Wallet exists! We're ready to go!");
    }

    const accounts = await ethereum.request({ method: 'eth_accounts' });
    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account: ", account);
      setCurrentAccount(account);
    } else {
      console.log("No Authorized account found.");
    }
  }

  const connectWalletHandler = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      alert("Please install Metamask!");
    }

    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      console.log("Found an account! Address : ", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (err) {
      console.log(err);
    }
  }

  const handleSubmit = async () => {
    setValue(50);
  }

  const connectWalletButton = () => {
    return (
      <div className="three columns header-col">
        <Button type="link" onClick={connectWalletHandler} disabled={currentAccount ? true : false}> {currentAccount ? "Connected" : "Connect Wallet"}</Button>
      </div>
    )
  }

  useEffect(() => {
    checkWalletIsConnected();
  }, [])

  const getColor = () => {
    if (value < softcap) {
      return '#ff0000';
    } else if (value >= softcap && value < hardcap) {
      return '#00ff00';
    } else {
      return '#0000ff';
    }
  };

  const ProgressBar = () => {
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

  return (
    <div className="App">
      <header />
      <div className="row work">
        <div className='three columns header-col'>
          <Clock />
        </div>
        <div className="six columns header-col"></div>
        {connectWalletButton()}
      </div>
      <div className="row work">
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
            <Button type="primary" onClick={handleSubmit}> {"Deposit"} </Button>
          </div>
        </div>
      </div>
      <div className="row work">
        {ProgressBar()}
      </div>
      <div className='row'>
        <div className="four columns header-col"> <h3>Start Time :2023/05/09 00:00:00 GMT</h3> </div>
        <div className="four columns header-col"> </div>
        <div className="four columns header-col"><h3>End Time :2023/05/10 00:00:00 GMT</h3></div>
      </div>
    </div>
  );
}

export default App;
