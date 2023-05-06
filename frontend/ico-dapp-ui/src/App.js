
import './App.css';
import Clock from "./components/Clock.js"
import InputForm from './components/InputForm';


function App() {
  return (
      <div className="App">
        <header>

        </header>
        asdfadf
        <div className="row work">
          <div className='three columns header-col'>
            <Clock />
          </div>
          <div className="six columns header-col"></div>
          <div className="three columns header-col">
            <a href = " " target = '_blank'><h3>Connect Wallet</h3></a>
          </div>
        </div>
        <div className = "row">
          <InputForm/>
        </div>
      </div>
  );
}

export default App;
