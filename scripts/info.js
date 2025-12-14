const params = new URLSearchParams(window.location.search);
const id = params.get("id");

if (id) {
  loadDetails(id);
}

async function loadDetails(id) {
  const main = document.getElementById("main");
  if (!main) return;
  main.innerHTML = `<div class="loading">Loading...</div>`;

  try {
    const res = await fetch(
      `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${encodeURIComponent(
        id
      )}`
    );
    const data = await res.json();
    const meal = data && data.meals && data.meals[0];

    if (!meal) {
      main.innerHTML = `<p>Meal not found.</p>`;
      return;
    }

    console.log(meal);

    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ing = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];
      if (ing && ing.trim()) {
        ingredients.push(
          measure && measure.trim()
            ? `${ing.trim()} - ${measure.trim()}`
            : ing.trim()
        );
      }
    }

    const tags = meal.strTags
      ? meal.strTags
          .split(",")
          .map((t) => t.trim())
          .join(", ")
      : "N/A";

    // Extract YouTube ID (supports youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID)
    let youtubeID = "";
    if (meal.strYoutube) {
      try {
        const u = new URL(meal.strYoutube);
        youtubeID =
          u.searchParams.get("v") ||
          (u.pathname ? u.pathname.split("/").pop() : "");
      } catch (e) {
        const m = meal.strYoutube.match(
          /(?:v=|\/embed\/|youtu\.be\/)([A-Za-z0-9_-]{11})/i
        );
        youtubeID = m ? m[1] : "";
      }
    }

    const youtube = youtubeID
      ? `<a href="https://www.youtube.com/watch?v=${youtubeID}" target="_blank" rel="noopener">${escapeHtml(
          youtubeID
        )}</a>`
      : meal.strYoutube
      ? `<a href="${
          meal.strYoutube
        }" target="_blank" rel="noopener">${escapeHtml(meal.strYoutube)}</a>`
      : "N/A";

    main.innerHTML = `
            <div class="overview" style="height:850px; background-image: linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url('${escapeHtml(
              meal.strMealThumb
            )}'); background-size: cover; background-position: center; color: #fff; padding: 32px; border-radius:8px; display:flex; flex-wrap:nowrap; gap:20px; align-items:center">
            <img src="${escapeHtml(meal.strMealThumb)}" alt="${escapeHtml(
      meal.strMeal
    )}" class="meal-thumb" style="margin-right:20px"/>
            <div class="movie-info">
                <h1 class="title">${titleCase(escapeHtml(meal.strMeal))}</h1>
                <p class="origin">Origin: ${escapeHtml(
                  meal.strArea || "N/A"
                )}</p>
                <p class="category">Category: ${escapeHtml(
                  meal.strCategory || "N/A"
                )}</p>
                <p class="ingredients"><span>Ingredients: </span>${escapeHtml(
                  ingredients.join(", ") || "N/A"
                )}</p>
                <p class="instructions"><span>Instructions: </span>${escapeHtml(
                  meal.strInstructions || "N/A"
                )}</p>
            </div>
            </div>

            <div class="video">
                ${
                  youtubeID
                    ? `<div class="video-wrapper"><iframe src="https://www.youtube.com/embed/${youtubeID}" title="${escapeHtml(
                        meal.strMeal
                      )}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>`
                    : ""
                }</div>
        `;

    // Render similar category meals (up to 5)
    try {
      const similarEl = document.getElementById("similar-category");
      if (similarEl && meal.strCategory) {
        similarEl.innerHTML = `<h2 class="similar-title">Food with similar category</h2>`;

        const resSimilar = await fetch(
          `https://www.themealdb.com/api/json/v1/1/filter.php?c=${encodeURIComponent(
            meal.strCategory
          )}`
        );
        const dataSimilar = await resSimilar.json();
        let similarMeals = (dataSimilar && dataSimilar.meals) || [];

        // Remove the current meal from the list if present
        similarMeals = similarMeals.filter((m) => m.idMeal !== meal.idMeal);

        // Take up to 5 meals
        similarMeals = similarMeals.slice(0, 5);

        if (similarMeals.length > 0) {
          const cardsHtml = similarMeals
            .map(
              (m) => `
            <a class="similar-card" href="info.html?id=${m.idMeal}">
              <img src="${escapeHtml(
                m.strMealThumb
              )}" alt="${escapeHtml(m.strMeal)}" />
              <div class="similar-card-body">
                <h3>${titleCase(escapeHtml(m.strMeal))}</h3>
              </div>
            </a>
          `
            )
            .join("");

          similarEl.innerHTML += `<div class="similar-grid">${cardsHtml}</div>`;
        }
      }
    } catch (e) {
      console.warn("Similar category section unavailable", e);
    }

    // Render comment section for this meal
    try {
      const commentsEl = document.getElementById("comments");
      if (commentsEl) {
        commentsEl.innerHTML = `
                    <section class="comments-card">
                        <h3>Comments</h3>
                        <form id="commentForm">
                            <input id="commentName" type="text" placeholder="Your name" required />
                            <textarea id="commentText" rows="4" placeholder="Write a comment..." required></textarea>
                            <div style="display:flex;gap:8px;align-items:center"><button type="submit" class="btn-comment">Post Comment</button><small id="commentCount" style="color:var(--gray-200)"></small></div>
                        </form>
                        <div id="commentList" class="comment-list"></div>
                    </section>
                `;

        const storageKey = `comments_${id}`;

        function loadComments() {
          try {
            const raw = localStorage.getItem(storageKey);
            return raw ? JSON.parse(raw) : [];
          } catch (e) {
            return [];
          }
        }

        function saveComments(list) {
          try {
            localStorage.setItem(storageKey, JSON.stringify(list));
          } catch (e) {}
        }

        function renderComments() {
          const list = loadComments();
          const listEl = document.getElementById("commentList");
          const countEl = document.getElementById("commentCount");
          if (countEl) countEl.textContent = `(${list.length})`;
          if (!listEl) return;
          if (list.length === 0) {
            listEl.innerHTML =
              '<p class="no-comments">No comments yet — be the first!</p>';
            return;
          }
          listEl.innerHTML = list
            .map(
              (c) => `
                        <div class="comment-item">
                            <div class="comment-meta"><strong>${escapeHtml(
                              c.name
                            )}</strong> <span class="comment-time">${escapeHtml(
                c.time
              )}</span></div>
                            <div class="comment-body">${escapeHtml(
                              c.text
                            )}</div>
                        </div>
                    `
            )
            .join("");
        }

        const form = document.getElementById("commentForm");
        if (form) {
          form.addEventListener("submit", function (e) {
            e.preventDefault();
            const name = document.getElementById("commentName");
            const text = document.getElementById("commentText");
            if (!name || !text) return;
            const comment = {
              name: name.value.trim() || "Anonymous",
              text: text.value.trim(),
              time: new Date().toLocaleString(),
            };
            const list = loadComments();
            list.unshift(comment);
            saveComments(list);
            renderComments();
            form.reset();
          });
        }

        renderComments();
      }
    } catch (e) {
      console.warn("Comments unavailable", e);
    }
  } catch (err) {
    console.error("Failed to load meal details", err);
    main.innerHTML = `<p>Error loading details.</p>`;
  }
}

function escapeHtml(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function titleCase(str) {
  if (!str) return "";
  return String(str)
    .toLowerCase()
    .replace(/\b([a-z])/g, function (m, p) {
      return p.toUpperCase();
    });
}
