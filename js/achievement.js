$(document).ready(async function () {

  const userId = localStorage.getItem("userId");

  const user = await $.get(`http://localhost:3000/api/user/${userId}`);

  // 🔷 USER INFO
  $("#userName").text(user.username);
  $("#userLevel").text("Level " + user.level);
  $("#userAvatar").attr("src", user.profileImage);

  const achievements = user.achievements || [];

  let completed = 0;

  const grid = $("#achievementGrid");
  grid.empty();

  const achievementList = [
    { name: "First Blood", desc: "Play your first game", xp: 100 },
    { name: "Grinder", desc: "Play 10 games", xp: 200 },
    { name: "Veteran", desc: "Play 100 games", xp: 500 },
    { name: "Champion", desc: "Win your first game", xp: 150 },
    { name: "Unstoppable", desc: "Win 5 games in a row", xp: 300 },
    { name: "Legend", desc: "Reach level 10", xp: 500 },
    { name: "Memory Master", desc: "Win 20 Memory Card Game", xp: 400 },
    { name: "Ludo King", desc: "Win 10 Ludo matches", xp: 400 },
    { name: "Night Owl", desc: "Play after 10 PM", xp: 200 },
    { name: "Daily Player", desc: "3-day streak", xp: 250 }
  ];

  achievementList.forEach((a, index) => {

    const progress = achievements[index]?.progress || 0;

    if (progress >= 100) completed++;

    const card = `
      <div class="achievement-card ${progress >= 100 ? "completed" : ""}">
        <div class="achievement-title">${a.name}</div>
        <div class="achievement-desc">${a.desc}</div>

        <div class="progress-wrapper">
          <div class="progress-bar">
            <div class="progress-fill" style="width:${progress}%"></div>
          </div>
          <div class="progress-text">${progress}%</div>
        </div>

        <div class="xp-reward">
          ${progress >= 100 ? `✔ ${a.xp} XP Earned` : `Reward: ${a.xp} XP`}
        </div>
      </div>
    `;

    grid.append(card);
  });

  // 🔷 BANNER PROGRESS
  const percent = (completed / achievementList.length) * 100;

  $("#achievementProgress").css("width", percent + "%");
  $("#achievementText").text(`${completed} / ${achievementList.length} Completed`);

});