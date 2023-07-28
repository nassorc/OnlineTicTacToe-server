import generateRandomNumber from "./generateRandomNumber";
export default function generateRoundObject(userA: string, userB: string) {
  const num = generateRandomNumber(2);
  let round = {
    playerX: "",
    playerO: "",
  }
  if(num) {
    round.playerX = userA;
    round.playerO = userB;
  }
  else {
    round.playerX = userB;
    round.playerO = userA;
  }
  return round;
}
