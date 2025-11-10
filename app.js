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
    data.forEach((match, index) => {
      const row = document.createElement("tr");
      row.setAttribute("data-index", index);
      row.style.cursor = "pointer";
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
      row.addEventListener("click", () => showMatchDetail(match));
      tbody.appendChild(row);
    });

  } catch (err) {
    console.error("Erreur de chargement matches.json", err);
    document.getElementById("matchesBody").innerHTML =
      `<tr><td colspan="16">Impossible de charger les données.</td></tr>`;
  }
}
function showMatchDetail(match) {
  app.innerHTML = `
    <h1>Détail du match — ${match.equipe} (${match.journee})</h1>
    <div style="background:white; padding:20px; border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.05); max-width:600px;">
      <p><strong>Points :</strong> ${match.points}</p>
      <p><strong>Field Goals :</strong> ${match.fg} (${match.fg_pct})</p>
      <p><strong>2pts :</strong> ${match["2pts"]}</p>
      <p><strong>3pts :</strong> ${match["3pts"]}</p>
      <p><strong>Passes décisives (AST) :</strong> ${match.ast}</p>
      <p><strong>Interceptions (STL) :</strong> ${match.stl}</p>
      <p><strong>Contres (BLK) :</strong> ${match.blk}</p>
      <p><strong>Rebonds offensifs :</strong> ${match.rbo}</p>
      <p><strong>Rebonds défensifs :</strong> ${match.rbd}</p>
      <p><strong>Ballons perdus (FREC) :</strong> ${match.frec}</p>
      <p><strong>Fautes (TF) :</strong> ${match.tf}</p>
      <p><strong>Différentiel :</strong> ${match.diff}</p>
      <p><strong>Résultat :</strong> ${match.resultat}</p>
      <button id="backToMatches" style="margin-top:20px; padding:10px 16px; background:#2563eb; color:white; border:none; border-radius:8px; cursor:pointer;">← Retour aux matchs</button>
    </div>
  `;

  document.getElementById("backToMatches").addEventListener("click", () => {
    loadView("matches");
  });
}

  // Vue par défaut
  loadView("home");
});
