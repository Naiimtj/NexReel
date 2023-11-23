import PropTypes from 'prop-types';

const SplitLongWords = (text) => {
  const words = text.split(" ");
  const result = [];
  for (let i = 0; i < words.length; i += 1) {
    if (words[i].length > 20) {
      const longWord = words[i];
      const splitWord = [];
      let start = 0;
      while (start < longWord.length) {
        if (start + 20 < longWord.length) {
          splitWord.push(`${longWord.substr(start, 20)}-`);
          start += 20;
        } else {
          const remaining = longWord.length - start;
          splitWord.push(longWord.substr(start, remaining));
          start = longWord.length;
        }
      }
      result.push(...splitWord);
    } else {
      result.push(words[i]);
    }
  }
  const resultwordsLong = [];
  if (result.length > 1) {
    let i = 0;
    while (i < result.length) {
      let temp = result[i];
      let j = i + 1;
      while (j < result.length) {
        if (temp.length + result[j].length + 1 <= 20) {
          // Comprueba si la suma de las longitudes es menor o igual a 20
          temp += ` ${result[j]}`;
          j += 1;
        } else {
          break;
        }
      }
      resultwordsLong.push(temp);
      i = j;
    }
  }
  return resultwordsLong;
};

export default SplitLongWords;

SplitLongWords.propTypes = {
  date: PropTypes.any,
  time: PropTypes.any,
};
