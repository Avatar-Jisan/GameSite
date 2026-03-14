const parameter = new URLSearchParams(window.location.search);
const gameId = parameter.get("id");

$.getJSON("data/games.json", function(games) {
    const game= games.find(g => g.id === gameId);
    $("#gameTitle1").text(game.name);
    $("#gameTitle").text(game.name);
    $("#gameDeveloper").text(game.developer);
    $("#gameCategory").text(game.category.join(", "));
    $("#gameDescription").text(game.longDescription);
    
    game.rules.forEach(element => {
        $("#gameRules").append(`<li>${element}</li>`);
    });
});