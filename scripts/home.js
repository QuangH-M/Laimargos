// Function to format text in title case
function titleCase(str) {
  if (!str) return str;
  return String(str)
    .toLowerCase()
    .replace(/\b([a-z])/g, function (m, p) {
      return p.toUpperCase();
    });
}

// Automatically load random meals when page loads
document.addEventListener("DOMContentLoaded", function () {
  fetch(`https://www.themealdb.com/api/json/v1/1/random.php`)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      const motd = document.getElementById("motd");
      if (!motd) return;
      motd.innerHTML = "";
      if (data.meals == null) {
        const msgElement = document.getElementById("msg");
        if (msgElement) msgElement.style.display = "block";
      } else {
        const msgElement = document.getElementById("msg");
        if (msgElement) msgElement.style.display = "none";
        data.meals.forEach((meal) => {
          // Limit instructions to maximum 100 words
          let instructions = meal.strInstructions || "";
          const words = instructions.trim().split(/\s+/);
          if (words.length > 100) {
            instructions = words.slice(0, 95).join(" ") + "...";
          }

          const itemDiv = document.createElement("div");
          itemDiv.className = "m-2 singleItem";
          itemDiv.setAttribute("onclick", `details('${meal.idMeal}')`);
          let itemInfo = `
                      <div class="motd-card">
                      <img src="${
                        meal.strMealThumb
                      }" class="motd-card-img" alt="${titleCase(meal.strMeal)}">
                          <div class="motd-card-body">
                              <div class="motd-card-text">${titleCase(
                                meal.strMeal
                              )}</div>
                              <div class="motd-card-info">
                                <div class="motd-instruction"><span>
                                ${instructions}</span><a class="motd-readmore" href="info.html?id=${meal.idMeal}"><b>Read more → </b></a>
                                </div>
                              </div>
                          </div>
                      </div>
                      `;
          itemDiv.innerHTML = itemInfo;
          motd.appendChild(itemDiv);
        });
      }
    })
    .catch((error) => {
      console.error("Error fetching random meal:", error);
    });
});
