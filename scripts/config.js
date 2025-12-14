document.getElementById("button").addEventListener("click", () => {
  let inputValue = document.getElementById("inputName").value;
  fetch(`https:www.themealdb.com/api/json/v1/1/search.php?s=${inputValue}`)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      const listfood = document.getElementById("listfood");
      listfood.innerHTML = "";
      if (data.meals == null) {
        document.getElementById("msg").style.display = "block";
      } else {
        document.getElementById("msg").style.display = "none";
        data.meals.forEach((meal) => {
          const itemDiv = document.createElement("div");
          itemDiv.className = "m-2 singleItem";
          itemDiv.setAttribute("onclick", `details('${meal.idMeal}')`);
          let itemInfo = `
                    <div class="card">
                    <a href="info.html?id=${meal.idMeal}">
                    <img src="${
                      meal.strMealThumb
                    }" class="card-img-top" alt="${titleCase(meal.strMeal)}">
                        <div class="card-body text-center">
                            <h5 class="card-text">${titleCase(
                              meal.strMeal
                            )}</h5>
                        </div>
                    </a>
                    </div>
                    `;
          itemDiv.innerHTML = itemInfo;
          listfood.appendChild(itemDiv);
        });
      }
    });
});

const searchForm = document.querySelector("form");
if (searchForm) {
  searchForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const btn = document.getElementById("button");
    if (btn) btn.click();
  });
}

function titleCase(str) {
  if (!str) return str;
  return String(str)
    .toLowerCase()
    .replace(/\b([a-z])/g, function (m, p) {
      return p.toUpperCase();
    });
}
