import './App.css'
import Monster from './components/Monster/Monster'
import PlayerList from './components/PlayerList'
import CombatLog from './components/CombatLog/CombatLog';

function App() {

  return (
    <div className="App">
        <Monster />
        <br></br>
        {/* Ajout du composant CombatLog ici */}
        <CombatLog />
        <section className="container-fluid">
          <PlayerList />
        </section >
      </div>
  )
}

export default App
