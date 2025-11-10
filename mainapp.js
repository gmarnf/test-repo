/* mainapp.js — SPA Dashboard SM1
   Dépendances: Chart.js (CDN)
   Fichiers: data/saison.json, data/matches.json
*/

let matchesData = [];
let currentMatchIndex = 0;

document.addEventListener("DOMContentLoaded", () => {
  const app = document.getElementById("app");
  const links = document.querySelectorAll("aside a");

  // Navigation (onglets de la sidebar)
  links.forEach(link => {
    link.addEventListener("click", () => {
      links.forEach(l => l.classList.remove("active"));
      link.classList.add("active");
      const view = link.dataset.view;
      loadView(view);
    });
  });

  // Charge une vue
  function loadView(view) {
    switch (view) {
      case "home":
        renderHome();
        break;
      case "calendar":
        renderCalendar();
        break;
      case "saison":
        renderSaison();
        break;
      case "matches":
        renderMatchesView();
        break;
      case "players":
        renderPlayers();
        break;
      default:
        renderHome();
        break;
    }
  }

  // Vue: Accueil
  function renderHome() {
    app.innerHTML = `
      <h1>Accueil</h1>
      <p>Bienvenue sur le tableau de bord SM1 — Saison 2025/2026.</p>
      <p>Utilise la barre latérale pour naviguer entre les vues.</p>
    `;
  }

  // Vue: Calendrier (placeholder)
  function renderCalendar() {
    app.innerHTML = `
      <h1>Calendrier</h1>
      <p>Contenu calendrier à venir.</p>
    `;
  }

  // Vue: Joueurs (placeholder)
  function renderPlayers() {
    app.innerHTML = `
      <h1>Joueurs</h1>
      <p>Contenu joueurs à venir.</p>
    `;
  }

  // Vue: Saison (table alimentée par data/saison.json)
  function renderSaison() {
    app.innerHTML = `
      <h1>Saison — Résultats</h1>
      <table>
        <thead>
          <tr>
            <th>Date</th><th>Adversaire</th><th>Score</th><th>Résultat</th>
          </tr>
        </thead>
        <tbody id="saisonBody"></tbody>
      </table>
    `;
    fetch("data/saison.json")
      .then(res => {
        if (!res.ok) throw new Error("saison.json introuvable");
        return res.json();
      })
      .then(data => {
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
      })
      .catch(err => {
        document.getElementById("saisonBody").innerHTML =
          `<tr><td colspan="4">Erreur: ${err.message}</td></tr>`;
      });
  }

  // Vue: Matches (table + filtre)
  function renderMatchesView() {
    app.innerHTML = `
      <h1>Matchs — Saison 2025/2026</h1>
      <input type="text" id="filterInput" placeholder="Filtrer par équipe ou journée" />
      <table>
        <thead>
          <tr>
            <th>Équipe</th><th>Journée</th><th>Pts</th><th>FG</th><th>FG%</th>
            <th>2pts</th><th>3pts</th><th>AST</th><th>STL</th><th>BLK</th>
            <th>RBO</th><th>RBD</th><th>FREC</th><th>TF</th><th>Diff</th><th>Résultat</th>
          </tr>
        </thead>
        <tbody id="matchesBody"></tbody>
      </table>
    `;
    loadMatches();
  }

  // Charge matches.json et initialise filtre + tableau
  function loadMatches() {
    fetch("data/matches.json")
      .then(res => {
        if (!res.ok) throw new Error("matches.json introuvable");
        return res.json();
      })
      .then(data => {
        matchesData = data;
        renderMatchesTable(matchesData);
        const filterInput = document.getElementById("filterInput");
        filterInput.addEventListener("input", e => {
          const term = e.target.value.toLowerCase().trim();
          const filtered = matchesData.filter(m =>
            m.equipe.toLowerCase().includes(term) || m.journee.toLowerCase().includes(term)
          );
          renderMatchesTable(filtered);
        });
      })
      .catch(err => {
        document.getElementById("matchesBody").innerHTML =
          `<tr><td colspan="16">Erreur: ${err.message}</td></tr>`;
      });
  }

  // Rend le tableau des matches (cliquable)
  function renderMatchesTable(list) {
    const tbody = document.getElementById("matchesBody");
    tbody.innerHTML = "";
    list.forEach((match, index) => {
      const row = document.createElement("tr");
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
      row.addEventListener("click", () => {
        // Déterminer l’index réel du match dans matchesData
        const originalIndex = matchesData.findIndex(m =>
          m.equipe === match.equipe && m.journee === match.journee
        );
        currentMatchIndex = originalIndex >= 0 ? originalIndex : index;
        showMatchDetail(match);
      });
      tbody.appendChild(row);
    });
  }

  // Détail d’un match + navigation + graphique Chart.js
  function showMatchDetail(match) {
    app.innerHTML = `
      <h1>Détail du match — ${match.equipe} (${match.journee})</h1>
      <div style="background:white; padding:20px; border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.05); max-width:700px;">
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <p><strong>Points :</strong> ${match.points}</p>
          <p><strong>FG :</strong> ${match.fg} (${match.fg_pct})</p>
          <p><strong>2pts :</strong> ${match["2pts"]}</p>
          <p><strong>3pts :</strong> ${match["3pts"]}</p>
          <p><strong>AST :</strong> ${match.ast}</p>
          <p><strong>STL :</strong> ${match.stl}</p>
          <p><strong>BLK :</strong> ${match.blk}</p>
          <p><strong>RBO :</strong> ${match.rbo}</p>
          <p><strong>RBD :</strong> ${match.rbd}</p>
          <p><strong>FREC :</strong> ${match.frec}</p>
          <p><strong>TF :</strong> ${match.tf}</p>
          <p><strong>Diff :</strong> ${match.diff}</p>
        </div>

        <canvas id="matchChart"></canvas>

        <div style="margin-top:20px; display:flex; gap:12px;">
          <button id="prevMatch">← Précédent</button>
          <button id="nextMatch">Suivant →</button>
          <button id="backToMatches">Retour</button>
        </div>
      </div>
    `;

    // Boutons
    document.getElementById("backToMatches").onclick = () => renderMatchesView();
    document.getElementById("prevMatch").onclick = () => {
      if (currentMatchIndex > 0) {
        currentMatchIndex--;
        showMatchDetail(matchesData[currentMatchIndex]);
      }
    };
    document.getElementById("nextMatch").onclick = () => {
      if (currentMatchIndex < matchesData.length - 1) {
        currentMatchIndex++;
        showMatchDetail(matchesData[currentMatchIndex]);
      }
    };

    // Graphique
    const ctx = document.getElementById("matchChart").getContext("2d");
    new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Points", "AST", "STL", "BLK", "RBO", "RBD"],
        datasets: [{
          label: "Statistiques",
          data: [match.points, match.ast, match.stl, match.blk, match.rbo, match.rbd],
          backgroundColor: "#2563eb"
        }]
      },
      options: {
        responsive: true,
        scales: { y: { beginAtZero: true } },
        plugins: { legend: { display: false } }
      }
    });
  }

  // Vue par défaut
  renderHome();
});
