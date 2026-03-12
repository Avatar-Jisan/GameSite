const parameter = new URLSearchParams(window.location.search);
const gameId = parameter.get("id");
console.log(gameId);