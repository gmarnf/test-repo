document.addEventListener("DOMContentLoaded", () => {
  const app = document.getElementById("app");
  const links = document.querySelectorAll("aside a");

  // Navigation SPA
  links.forEach(link => {
    link.addEventListener("click", () => {
      links.forEach(l => l.classList.remove("active"));
      link.classList.add("active");
      const view = link.dataset.view;
      loadView(view);
    });
  });

  // Vues
  function loadView(view) {
    if (view === "home") {
      app.innerHTML = `
        <h1>Accueil</h1>
        <p>Bienvenue sur le tableau de bord SM1.</p>
      `;
    }
    else if (view === "saison") {
      app.innerHTML = `<h1>Saison — Résultats</h1>
        <table>
          <thead>
            <tr><th>Date</th><th>Adversaire</th><th>Score</th><th>Résultat</th></tr>
          </thead>
          <tbody id="saisonBody"></tbody>
        </table>`;
      loadSaison();
    }
    else if (view === "matches") {
      app.innerHTML = `<h1>Matchs — Saison 2025/2026</h1>
        <table>
          <thead>
            <tr>
              <th>Équipe</th><th>Journée</th><th>Pts</th><th>FG</th><th>FG%</th>
              <th>2pts</th><th>3pts</th><th>AST</th><th>STL</th><th>BLK</th>
              <th>RBO</th><th>RBD</th><th>FREC</th><th>TF</th><th>Diff</th><th>Résultat</th>
            </tr>
          </thead>
          <tbody id="matchesBody"></tbody>
        </table>`;
      loadMatches();
}
    else {
      app.innerHTML = `<h1>${view}</h1><p>Contenu à venir...</p>`;
    }
  }

  // Charger saison.json
  async function loadSaison() {
    try {
      const res = await fetch("saison.json");
      const data = await res.json();
      const tbody = document.getElementById("saisonBody");
      tbody.innerHTML = "";
      data.forEach(match => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${match.date}</td>
          <td>${match.adversaire}</td>
          <td>${match.score}</td>
          <td>${match.resultat}</td>
        `;
        tbody.appendChild(row);
      });
    } catch (err) {
      console.error("Erreur de chargement saison.json", err);
      document.getElementById("saisonBody").innerHTML =
        `<tr><td colspan="4">Impossible de charger les données.</td></tr>`;
    }
  }
async function loadMatches() {
  try {
    const res = await fetch("matches.json");
    const data = await res.json();
    const tbody = document.getElementById("matchesBody");
    tbody.innerHTML = "";
    data.forEach(match => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${match.equipe}</td>
        <td>${match.journee}</td>
        <td>${match.points}</td>
        <td>${match.fg}</td>
        <td>${match.fg_pct}</td>
        <td>${match["2pts"]}</td>
        <td>${match["3pts"]}</td>
        <td>${match.ast}</td>
        <td>${match.stl}</td>
        <td>${match.blk}</td>
        <td>${match.rbo}</td>
        <td>${match.rbd}</td>
        <td>${match.frec}</td>
        <td>${match.tf}</td>
        <td>${match.diff}</td>
        <td>${match.resultat}</td>
      `;
      tbody.appendChild(row);
    });
  } catch (err) {
    console.error("Erreur de chargement matches.json", err);
    document.getElementById("matchesBody").innerHTML =
      `<tr><td colspan="16">Impossible de charger les données.</td></tr>`;
  }
}

  // Vue par défaut
  loadView("home");
});
