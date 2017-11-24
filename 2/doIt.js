const n = 2;
const l = n * 2 - 1
const a = new Array(l);

for (let i = 0; i < l; i++) {
  a[i] = new Array(l);
}

for (let i = 0; i < l; i++) {
  for (let j = 0; j < l; j++) {
    a[i][j] = i + (l - 1) * i + j; // Numbers in ascending order
  }
}

const logArr = arr => {
  arr.forEach(row => {
    let r = '';
    row.forEach(f => {
      r += `\t${f}`;
    })
    console.log(r);
  });
}

const switchDirection = direction => { // Switch movement direction to form correct swirl path
  switch (direction) {
  case 'l':
    return 'd';
  case 'r':
    return 'u';
  case 'u':
    return 'l';
  case 'd':
    return 'r';
  }
}

const superSnakeLog1 = arr => {
  let startField = Math.floor(arr.length / 2); // Start in the center
  let [i, j] = [startField, startField];
  let mult = 1;
  let direction = 'l'; // Start the swirl by going to the left
  const out = [];
  while (i >= 0 && j >= 0) { // Because we go left, down, right ... the end of our path will be at 0,0
    let steps = Math.floor(mult);
    while (steps) {
      out.push(arr[i][j])
      switch (direction) {
      case 'l':
        j--;
        break;
      case 'r':
        j++;
        break;
      case 'u':
        i--;
        break;
      case 'd':
        i++;
        break;
      }
      steps--;
    }
    mult += 0.5;
    direction = switchDirection(direction);
  }
  return out.join(' ');
}


const transpose = a => a[0].map((_, i) => a.map(r => r[i]));
const flip = a => [...a].reverse();
const rotate = a => flip(transpose(a)); // Rotate array counter-clockwise
const superSnakeLog2 = arr => {
  let a = [...arr];
  const out = [];
  while (a.length) { // We could have used recursion, but there would be issues with memory
    out.push(...a[0]);
    a.splice(0, 1); // Put the top layer of the matrix to output and remove it before flipping
    if (!a.length) break;
    a = rotate(a);
  }
  return out.reverse().join(' '); // The output is reversed, one final flip
}

logArr(a);
console.log(superSnakeLog1(a));
console.log(superSnakeLog2(a));
