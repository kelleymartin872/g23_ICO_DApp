
import './App.css';
import { Button, Input, Progress } from 'antd'
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import contract from './contracts/ICO.json'
const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const abi = contract.abi;

function App() {

  const [inputValue, setInputValue] = useState('0.01');
  const [value, setValue] = useState(0);
  const [softcap] = useState(10);
  const [hardcap] = useState(100);
  const [bstate, setbState] = useState("Deposit");
  const [etherBalance, setetherBalance] = useState(null);
  const [currentAccount, setCurrentAccount] = useState(null);

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  }

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
    updatebState();
    if (bstate === "Deposit") {
      depositHandler();
    } else if (bstate === "Withdraw") {
      withdrawHandler();
    } else {
      claimHandler();
    }
    updateTotalDepositAmount();
  }

  const connectWalletButton = () => {
    return (
      <div className="three columns header-col">
        <Button type="link" onClick={connectWalletHandler} disabled={currentAccount ? true : false}> {currentAccount ? "Connected" : "Connect Wallet"}</Button>
      </div>
    )
  }

  useEffect(() => {
    console.log("useEffect");
    checkWalletIsConnected();
    updateTotalDepositAmount();
  }, [])

  const getColor = () => {
    if (value < softcap) {
      return '#ff0000';
    } else if (value >= softcap && value < hardcap) {
      return '#00ff00';
    } else {
      return 'lightblue';
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
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const gmtTime = time.toUTCString();

  const Clock = () => {
    return (
      <div>
        <h3> {gmtTime} </h3>
        
      </div>
    );
  }

  const updatebState = () => {
    const endTime = new Date("2023-05-10 00:00:00")
    if(time > endTime) {
      if(value < softcap) {
        setbState("Withdraw");
      }
      else {
        setbState("Claim");
      }
    } else {
      if(value >= hardcap) {
        setbState("Claim");
      } else {
        setbState("Deposit");
      }
    }
  }

  const depositHandler = async () => {
    console.log("deposit")
    try {
      const { ethereum } = window;
      if (ethereum) {
        
        const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');//Web3Provider(ethereum);
        const signer = provider.getSigner();
        console.log(signer);
        const icoContract = new ethers.Contract(contractAddress, abi, signer);

        let icoTxn = await icoContract.deposit({ value: ethers.utils.parseEther(inputValue) });//ethers.utils.parseEther(amount)});
        await icoTxn.wait();

        console.log(`Mined, see transaction: ${icoTxn.hash}`);

      } else {
        console.log("Ethereum object do not exist!");
      }
    } catch (err) {
      console.log(err);
    }
  }

  const withdrawHandler = async () => {
    console.log("withdraw")
    try {
      const { ethereum } = window;
      if (ethereum) {
        
        const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');//Web3Provider(ethereum);
        const signer = provider.getSigner();
        console.log(signer);
        const icoContract = new ethers.Contract(contractAddress, abi, signer);

        let icoTxn = await icoContract.withdraw(inputValue);
        await icoTxn.wait();

        console.log(`Withdrawn`, inputValue, 'BNB');

      } else {
        console.log("Ethereum object do not exist!");
      }
    } catch (err) {
      console.log(err);
    }
  }

  const claimHandler = async () => {
    console.log("claim")
    try {
      const { ethereum } = window;
      if (ethereum) {
        
        const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');//Web3Provider(ethereum);
        const signer = provider.getSigner();
        console.log(signer);
        const icoContract = new ethers.Contract(contractAddress, abi, signer);

        let icoTxn = await icoContract.claimTokens();
        await icoTxn.wait();

        console.log(`Tokens, claimed successfully`);

      } else {
        console.log("Ethereum object do not exist!");
      }
    } catch (err) {
      console.log(err);
    }
  }

  const updateTotalDepositAmount = async () => {
    console.log('getTotalDepositeAmount')
    try {
      const { ethereum } = window;
      if (ethereum) {
        
        const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');//Web3Provider(ethereum);
        const signer = provider.getSigner();
        console.log(signer);
        const icoContract = new ethers.Contract(contractAddress, abi, signer);

        let tx = await icoContract.totalEtherRaised();
        // console.log(`Total deposit amount: ${totalDepositAmount.toString()}`);
        setetherBalance(parseInt(tx)/1e18);
        setValue(parseInt(tx)/1e18*100);

      } else {
        console.log("Ethereum object do not exist!");
      }
    } catch (err) {
      console.log(err);
    }
  }


  return (
    <div className="App">
      <header />
      <div className="row work">
        <div className='three columns header-col'>
          {Clock()}
        </div>
        <div className="six columns header-col"></div>
        {connectWalletButton()}
      </div>
      <div className="row work">
        <div>
          <div className='eight columns'>
            <div>Total deposit amount : {etherBalance}</div>
            <Input
              type="number"
              placeholder="Deposit Amount Input"
              max="0.05"
              min="0.01"
              step="0.001"
              style={{ width: "50%" }}
              value = {inputValue}
              onChange={handleInputChange}
            />
          </div>
          <div className='one coumns'></div>
          <div className='three columns'>
            <Button type="primary" onClick={handleSubmit}> {bstate} </Button>
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
