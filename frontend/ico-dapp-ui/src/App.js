
import './App.css';
import Clock from "./components/Clock.js"
import Deposit from "./components/Deposit.js"
import ProgressBar from "./components/ProgressBar";


function App() {

  return (
    <div className="App">
      <header />
      <div className="row work">
        <div className='three columns header-col'>
          <Clock />
        </div>
        <div className="six columns header-col"></div>
        <div className="three columns header-col">
          <a href=" " target='_blank'><h3>Connect Wallet</h3></a>
        </div>
      </div>
      <div className="row work">
        <Deposit buttontext="Deposit" />
      </div>
      <div className="row work">
        <ProgressBar />
      </div>
      <div className='row'>
        <div className="four columns header-col"> <h3>Start Time :2023/05/08 00:00:00 GMT</h3> </div>
        <div className="four columns header-col"> </div>
        <div className="four columns header-col"><h3>End Time :2023/05/09 00:00:00 GMT</h3></div>
      </div>
    </div>
  );
}

export default App;
