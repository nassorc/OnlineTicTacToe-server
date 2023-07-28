
export default function checkWinner(board: string[]) {
  const winningMoves = [
    [0,1,2],
    [3,4,5],
    [6,7,8],
    [0,3,6],
    [1,4,7],
    [2,5,8],
    [0,4,8],
    [2,4,6],
  ]
  let winner: {winner: string, tiles: number[]} = {
    winner: '',
    tiles: [],
  };
  let hasWinner = false;
  winningMoves.forEach(move => {
    const [a, b, c] = move;
    if(
      !hasWinner
      && (board[a].toUpperCase() === "X" || board[a].toUpperCase() === "O") 
      && board[a] && board[a] == board[b] && board[a] === board[c]) 
    {
      winner.winner = board[a];
      winner.tiles.push(a,b,c);
      hasWinner = true;
    }
  })
  // check for draw
  let isNotGameDraw = board.includes("N");
  if(winner.winner) { // winner
    return winner;
  }
  else if(!isNotGameDraw) { // draw
    return {
      winner: "draw",
      tiles: []
    }
  }
  else { // no winner
    return {
      winner: '',
      tiles: []
    }

  }
}