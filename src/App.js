import { useEffect, useState } from 'react';
import useSWR from 'swr'

function Square({ value, onSquareClick }) {
  return (
    <button className="square" onClick={onSquareClick}>
      {value}
    </button>
  );
}

function Board({ xIsNext, squares, onPlay, token }) {
  function handleClick(token, i) {
    console.log(`token: ${token},move: ${i}`);
    move(token, i).then( json => {
      get_board(token).then( json => {
        onPlay(json);
        console.log(json);
      });
    });
    /*
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    //const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[i] = 'X';
    } else {
      nextSquares[i] = 'O';
    }
    */
    //onPlay(nextSquares);
  }

  useSWR(
    token, 
    (token) => get_board(token).then( json => {
      onPlay(json);
      console.log(json);
    }), 
    {refreshInterval: 5000}
  );

  const winner = calculateWinner(squares);
  let status;
  if (winner) {
    status = 'Winner: ' + winner;
  } else {
    status = 'Next player: ' + (xIsNext ? 'X' : 'O');
  }

  return (
    <>
      <div className="status">{status}</div>
      <div className="board-row">
        <Square value={squares[0]} onSquareClick={() => handleClick(token, 0)} />
        <Square value={squares[1]} onSquareClick={() => handleClick(token, 1)} />
        <Square value={squares[2]} onSquareClick={() => handleClick(token, 2)} />
      </div>
      <div className="board-row">
        <Square value={squares[3]} onSquareClick={() => handleClick(token, 3)} />
        <Square value={squares[4]} onSquareClick={() => handleClick(token, 4)} />
        <Square value={squares[5]} onSquareClick={() => handleClick(token, 5)} />
      </div>
      <div className="board-row">
        <Square value={squares[6]} onSquareClick={() => handleClick(token, 6)} />
        <Square value={squares[7]} onSquareClick={() => handleClick(token, 7)} />
        <Square value={squares[8]} onSquareClick={() => handleClick(token, 8)} />
      </div>
    </>
  );
}

function GameList({ setToken }) {  
  const [gameList, setGameList] = useState([]);
  function join(uid) {
    join_game(uid).then( json => {
      setToken(json.game);
      console.log(json.game);
    });
    console.log(`join ${uid}`)
  }
  function update() {
    fetch_games().then( games => setGameList(games));
    console.log("update!");
  }
  useEffect(() => {
    update();
  }, []);
  return (
    <>
    <ol>
    {
      gameList.map((uid) => {
        return (
          <li key={uid}>
            <button onClick={() => join(uid)}>join {uid}</button>
          </li>
        );
      })
    }
    </ol>
    <button onClick={() => update()}>update</button>
    </>
  );
}

export default function Game() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const [token, setToken] = useState('');
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];

  function handlePlay(nextSquares) {
    if(JSON.stringify(nextSquares) != JSON.stringify(history[history.length - 1])){
      const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
      setHistory(nextHistory);
      setCurrentMove(nextHistory.length - 1);
    }
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }

  const moves = history.map((squares, move) => {
    let description;
    if (move > 0) {
      description = 'Go to move #' + move;
    } else {
      description = 'Go to game start';
    }
    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)}>{description}</button>
      </li>
    );
  });


  return (
    <div className="game">
      token="{token}"
      <div className="game-board">
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} token={token} />
      </div>
      <div className="game-list">
        <GameList setToken={(token) => setToken(token)}/>
      </div>
      <div className="game-info">
        <ol>{moves}</ol>
      </div>
    </div>
  );
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

function fetch_games() {
  return fetch( "http://localhost:3000/game.list")
   .then( response => response.json() )
   .then( json =>  {
     console.log(json);
     return json;
   });
}

function join_game(uid) {
  console.log(uid);
  return fetch("http://localhost:3000/game.join", {
    method: "POST",
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(uid)
  })
    .then( response => response.json() )
    .then( json =>  {
      console.log(json);
      return json;
    });
}

function move(token, position) {
  return fetch("http://localhost:3000/game.move", {
    method: "POST",
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({'game': token, 'move': position})
  })
    .then( response => response.json() )
    .then( json =>  {
      console.log(json);
      return json;
    });
}

function get_board(token) {
  return fetch("http://localhost:3000/game.board", {
    method: "POST",
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(token)
  })
    .then( response => response.json() )
    .then( json =>  {
      console.log(json);
      return json;
    });
}
