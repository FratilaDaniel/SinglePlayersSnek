import "./App.css";
import Board from "./components/Board";


function App() {
    return (
        <div id="app">  
            <Board/>
            <p>Move: <span>WASD</span></p>
            <p>Restart: <span>F5</span></p>
            <p>The snake cannot move out of bounds or teleport on the other side of the map upon hitting a wall.</p>
        </div>
    );
}

export default App;
