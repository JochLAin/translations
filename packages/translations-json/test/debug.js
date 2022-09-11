import { translate } from "../macro";

const count = 1;
const value = translate(
  'diff.ago.year',
  { count },
  { domain: 'times' }
);

console.log(value);
