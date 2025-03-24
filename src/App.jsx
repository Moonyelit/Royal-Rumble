import './App.css'
import Monster from './components/Monster/Monster'
import PlayerList from './components/PlayerList'
import CombatLog from './components/CombatLog/CombatLog';
import AutoAttackButton from './components/AutoAttackButton/AutoAttackButton';

function App() {
  return (
    <div className="App">
      <Monster />
      <br></br>
      {/* Ajouter le bouton d'attaque automatique ici */}
      <AutoAttackButton />
      {/* Composant CombatLog */}
      <CombatLog />
      <section className="container-fluid">
        <PlayerList />
      </section>
    </div>
  )
}

export default App
