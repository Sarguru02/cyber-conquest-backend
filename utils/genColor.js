const hexCharacters = [
    0,
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
  ];


  function getCharacter(index) {
    return hexCharacters[index];
  }

  module.exports.generateNewColor = ()=> {
    let hexColorRep = "#";

    for (let index = 0; index < 6; index++) {
      const randomPosition = Math.floor(Math.random() * hexCharacters.length);
      hexColorRep += getCharacter(randomPosition);
    }

    return hexColorRep;
  }