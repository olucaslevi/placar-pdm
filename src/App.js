
import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const defaultSettings = {
    numberOfSets: 3,
    duration: 90,
    finishConditions: 'Tempo Esgotado',
  };

  const [teamA, setTeamA] = useState({ name: 'Equipe A', score: 0 });
  const [teamB, setTeamB] = useState({ name: 'Equipe B', score: 0 });
  const [history, setHistory] = useState([]);
  const [undoStack, setUndoStack] = useState([]);
  const [gameSettings, setGameSettings] = useState(defaultSettings);
  const [lastFiveGames, setLastFiveGames] = useState([]);

  const saveGameSettings = () => {
    localStorage.setItem('gameSettings', JSON.stringify(gameSettings));
  };

  const loadGameSettings = () => {
    const savedSettings = localStorage.getItem('gameSettings');
    if (savedSettings) {
      setGameSettings(JSON.parse(savedSettings));
    }
  };

  const updateLastFiveGames = (result) => {
    const updatedGames = [...lastFiveGames, result].slice(-5);
    setLastFiveGames(updatedGames);
    localStorage.setItem('lastFiveGames', JSON.stringify(updatedGames));
  };

  const loadLastFiveGames = () => {
    const savedGames = localStorage.getItem('lastFiveGames');
    if (savedGames) {
      setLastFiveGames(JSON.parse(savedGames));
    }
  };

  const incrementScore = (team) => {
    const updatedTeam = { ...team, score: team.score + 1 };
    setHistory([...history, updatedTeam]);
    setUndoStack([]);
    if (updatedTeam.score >= gameSettings.numberOfSets) {
      alert(`A equipe ${updatedTeam.name} venceu!`);
      updateLastFiveGames(`${teamA.score} x ${teamB.score}`);
    } else {
      if (gameSettings.finishConditions === 'Tempo Esgotado') {
        setTimeout(() => {
          incrementScore(updatedTeam);
        }, gameSettings.duration * 1000);
      }
    }
    return updatedTeam;
  };

  const handleIncrement = (team) => {
    const updatedTeam = incrementScore(team);
    if (team.name === 'Equipe A') {
      setTeamA(updatedTeam);
    } else {
      setTeamB(updatedTeam);
    }
  };

  const handleUndo = () => {
    if (history.length > 0) {
      const lastAction = history[history.length - 1];
      const newHistory = [...history.slice(0, -1)];
      setUndoStack([...undoStack, lastAction]);
      if (lastAction.name === 'Equipe A') {
        setTeamA(lastAction);
      } else {
        setTeamB(lastAction);
      }
      setHistory(newHistory);
    }
  };

  const handleRedo = () => {
    if (undoStack.length > 0) {
      const lastUndo = undoStack[undoStack.length - 1];
      const newUndoStack = [...undoStack.slice(0, -1)];
      const updatedTeam = incrementScore(lastUndo);
      if (lastUndo.name === 'Equipe A') {
        setTeamA(updatedTeam);
      } else {
        setTeamB(updatedTeam);
      }
      setHistory([...history, updatedTeam]);
      setUndoStack(newUndoStack);
    }
  };

  useEffect(() => {
    loadGameSettings();
    loadLastFiveGames();
  }, []);

  useEffect(() => {
    saveGameSettings();
  }, [gameSettings]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [undoStack]);

  const handleKeyPress = (e) => {
    if (e.ctrlKey && e.key === 'z') {
      handleUndo();
    }
  };

  return (
    <div className="App" onTouchStart={handleUndo}>
      <header className="App-header">
        <h1>Placar de Beach Tennis</h1>
      </header>
      <main className="App-main">
        <section className="score-section">
          <div className="team">
            <h2>{teamA.name}</h2>
            <p>{teamA.score}</p>
            <button onClick={() => handleIncrement(teamA)}>+</button>
          </div>
          <div className="team">
            <h2>{teamB.name}</h2>
            <p>{teamB.score}</p>
            <button onClick={() => handleIncrement(teamB)}>+</button>
          </div>
          <div className="undo-redo">
            <button onClick={handleUndo}>Desfazer (Ctrl+Z)</button>
            <button onClick={handleRedo}>Refazer</button>
          </div>
        </section>
        <section className="game-settings">
          <h2>Configurações do Jogo</h2>
          <label>
            Número de Sets:
            <input
              type="number"
              value={gameSettings.numberOfSets}
              onChange={(e) =>
                setGameSettings({ ...gameSettings, numberOfSets: e.target.value })
              }
            />
          </label>
          <label>
            Duração (s):
            <input
              type="number"
              value={gameSettings.duration}
              onChange={(e) =>
                setGameSettings({ ...gameSettings, duration: e.target.value })
              }
            />
          </label>
          <label>
            Condições de Finalização:
            <select
              value={gameSettings.finishConditions}
              onChange={(e) =>
                setGameSettings({ ...gameSettings, finishConditions: e.target.value })
              }
            >
              <option value="Tempo Esgotado">Tempo Esgotado</option>
              <option value="Número de Sets">Número de Sets</option>
            </select>
          </label>
        </section>
        <section className="last-five-games">
          <h2>Últimos 5 Jogos</h2>
          <ul>
            {lastFiveGames.map((game, index) => (
              <li key={index}>{game}</li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}

export default App;