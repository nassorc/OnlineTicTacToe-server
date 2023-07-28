/**
 * 
 * @param range (exclusive) Upper limit of a range of random numbers
 * @returns a random number from 0 up until range
 */
export default function generateRandomNumber(range: number) {
  return Math.floor(Math.random() * range);
}