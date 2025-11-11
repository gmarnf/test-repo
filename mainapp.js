/* mainapp.js — SPA Dashboard SM1 (style maison)
   Dépendances: Chart.js (CDN)
   Données: data/saison.json, data/matches.json
*/

let matchesData = [];
let currentMatchIndex = 0;
let activeChart = null;

document.addEventListener("DOMContentLoaded", () => {
  const app = document.getElementById("app");
  const navLinks = document.querySelectorAll("aside a, .mobile-nav button");

  // Navigation via clic
  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      const view = link.dataset.view || "home";
      setActiveLink(view);
      navigateTo(view);
    });
  });

  // Routage via hash
  window.addEventListener("hashchange", () => {
    const view = location.hash.replace("#", "") || "home";
    setActiveLink(view);
    loadView(view);
  });

  // Initialisation
  const initialView = location.hash.replace("#", "") || "home";
  setActiveLink(initialView);
  loadView(initialView);

  // Helpers
  function setActiveLink(view) {
    document.querySelectorAll("aside a").forEach(l => {
      l.classList.toggle("active", l.dataset.view === view);
    });
  }

  function navigateTo(view) {
    location.hash = view;
  }

  function loadView(view) {
    if (activeChart) {
      activeChart.destroy();
      activeChart = null;
    }
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

  // Accueil — Résumé de saison
function renderHome() {
  app.innerHTML = `
    <h1>Accueil</h1>
    <div class="card">
      <h2>Résumé de la saison</h2>
      <p>Nombre de matchs joués : <span id="nbMatches">0</span></p>
      <p>Victoires : <span id="nbVictoires">0</span></p>
      <p>Défaites : <span id="nbDefaites">0</span></p>
      <canvas id="resumeChart" width="300" height="300"></canvas>
    </div>
  `;

  fetch("data/saison.json")
    .then(res => res.json())
    .then(data => {
      const nbMatches = data.length;
      const nbVictoires = data.filter(m => (m.resultat || "").toLowerCase() === "victoire").length;
      const nbDefaites = data.filter(m => (m.resultat || "").toLowerCase() === "défaite").length;

      document.getElementById("nbMatches").textContent = nbMatches;
      document.getElementById("nbVictoires").textContent = nbVictoires;
      document.getElementById("nbDefaites").textContent = nbDefaites;

      const canvas = document.getElementById("resumeChart");
      if (canvas) {
        const ctx = canvas.getContext("2d");
        new Chart(ctx, {
          type: "doughnut",
          data: {
            labels: ["Victoires", "Défaites"],
            datasets: [{
              data: [nbVictoires, nbDefaites],
              backgroundColor: ["#2563eb", "#ef4444"]
            }]
          },
          options: {
            responsive: true,
            plugins: { legend: { position: "bottom" } }
          }
        });
      }
    })
    .catch(err => {
      app.innerHTML += `<p style="color:red;">Erreur: ${err.message}</p>`;
    });
}

  // Calendrier — placeholder
  function renderCalendar() {
    app.innerHTML = `
      <h1>Calendrier</h1>
      <div class="card">
        <p>Le calendrier sera ajouté bientôt.</p>
        <p>Astuce: tu pourras afficher les journées avec liens vers les détails de match.</p>
      </div>
    `;
  }

  // Joueurs — placeholder
// Vue Joueurs — tableau des joueurs
function renderPlayers() {
  app.innerHTML = `
    <h1>Joueurs — Saison 2025/2026</h1>
    <table>
      <thead>
        <tr>
          <th>Nom</th><th>Poste</th><th>Numéro</th>
          <th>Points</th><th>Passes</th><th>Rebonds</th>
          <th>Interceptions</th><th>Contres</th>
        </tr>
      </thead>
      <tbody id="playersBody"></tbody>
    </table>
  `;

  fetch("data/players.json")
    .then(res => {
      if (!res.ok) throw new Error("players.json introuvable");
      return res.json();
    })
    .then(data => {
      const tbody = document.getElementById("playersBody");
      tbody.innerHTML = "";
      data.forEach(player => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${sanitize(player.nom)}</td>
          <td>${sanitize(player.poste)}</td>
          <td>${sanitize(player.numero)}</td>
          <td>${sanitize(player.points)}</td>
          <td>${sanitize(player.passes)}</td>
          <td>${sanitize(player.rebonds)}</td>
          <td>${sanitize(player.interceptions)}</td>
          <td>${sanitize(player.contres)}</td>
        `;
        tbody.appendChild(row);
      });
    })
    .catch(err => {
      document.getElementById("playersBody").innerHTML =
        `<tr><td colspan="8" style="color:#ef4444;">Erreur: ${err.message}</td></tr>`;
    });
}

  // Saison — tableau des résultats
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
            <td>${sanitize(match.date)}</td>
            <td>${sanitize(match.adversaire)}</td>
            <td>${sanitize(match.score)}</td>
            <td>${sanitize(match.resultat)}</td>
          `;
          tbody.appendChild(row);
        });
      })
      .catch(err => {
        document.getElementById("saisonBody").innerHTML =
          `<tr><td colspan="4" style="color:#ef4444;">Erreur: ${err.message}</td></tr>`;
      });
  }

  // Matches — table + filtre
  function renderMatchesView() {
    app.innerHTML = `
      <h1>Matchs — Saison 2025/2026</h1>
      <input type="text" id="filterInput" placeholder="Filtrer par équipe ou journée" class="filter-input" />
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

  function loadMatches() {
    fetch("data/matches.json")
      .then(res => {
        if (!res.ok) throw new Error("matches.json introuvable");
        return res.json();
      })
      .then(data => {
        matchesData = Array.isArray(data) ? data : [];
        renderMatchesTable(matchesData);
        const filterInput = document.getElementById("filterInput");
        if (filterInput) {
          filterInput.addEventListener("input", e => {
            const term = e.target.value.toLowerCase().trim();
            const filtered = matchesData.filter(m =>
              (m.equipe || "").toLowerCase().includes(term) ||
              (m.journee || "").toLowerCase().includes(term)
            );
            renderMatchesTable(filtered);
          });
        }
      })
      .catch(err => {
        const tbody = document.getElementById("matchesBody");
        if (tbody) {
          tbody.innerHTML = `<tr><td colspan="16" style="color:#ef4444;">Erreur: ${err.message}</td></tr>`;
        }
      });
  }

  function renderMatchesTable(list) {
    const tbody = document.getElementById("matchesBody");
    if (!tbody) return;
    tbody.innerHTML = "";
    list.forEach((match, index) => {
      const row = document.createElement("tr");
      row.style.cursor = "pointer";
      row.innerHTML = `
        <td>${sanitize(match.equipe)}</td>
        <td>${sanitize(match.journee)}</td>
        <td>${sanitize(match.points)}</td>
        <td>${sanitize(match.fg)}</td>
        <td>${sanitize(match.fg_pct)}</td>
        <td>${sanitize(match["2pts"])}</td>
        <td>${sanitize(match["3pts"])}</td>
        <td>${sanitize(match.ast)}</td>
        <td>${sanitize(match.stl)}</td>
        <td>${sanitize(match.blk)}</td>
        <td>${sanitize(match.rbo)}</td>
        <td>${sanitize(match.rbd)}</td>
        <td>${sanitize(match.frec)}</td>
        <td>${sanitize(match.tf)}</td>
        <td>${sanitize(match.diff)}</td>
        <td>${sanitize(match.resultat)}</td>
      `;
      row.addEventListener("click", () => {
        // Trouver l’index réel dans matchesData (utile si filtré)
        const originalIndex = matchesData.findIndex(m =>
          m.equipe === match.equipe && m.journee === match.journee
        );
        currentMatchIndex = originalIndex >= 0 ? originalIndex : index;
        showMatchDetail(matchesData[currentMatchIndex]);
      });
      tbody.appendChild(row);
    });
  }

  // Détail du match — grille + navigation + graphique
  function showMatchDetail(match) {
    app.innerHTML = `
      <h1>Détail du match — ${sanitize(match.equipe)} (${sanitize(match.journee)})</h1>
      <div class="card">
        <div class="stats-grid">
          <p><strong>Points :</strong> ${sanitize(match.points)}</p>
          <p><strong>FG :</strong> ${sanitize(match.fg)} (${sanitize(match.fg_pct)})</p>
          <p><strong>2pts :</strong> ${sanitize(match["2pts"])}</p>
          <p><strong>3pts :</strong> ${sanitize(match["3pts"])}</p>
          <p><strong>AST :</strong> ${sanitize(match.ast)}</p>
          <p><strong>STL :</strong> ${sanitize(match.stl)}</p>
          <p><strong>BLK :</strong> ${sanitize(match.blk)}</p>
          <p><strong>RBO :</strong> ${sanitize(match.rbo)}</p>
          <p><strong>RBD :</strong> ${sanitize(match.rbd)}</p>
          <p><strong>FREC :</strong> ${sanitize(match.frec)}</p>
          <p><strong>TF :</strong> ${sanitize(match.tf)}</p>
          <p><strong>Diff :</strong> ${sanitize(match.diff)}</p>
          <p><strong>Résultat :</strong> ${sanitize(match.resultat)}</p>
        </div>

        <canvas id="matchChart" style="max-width:700px; margin-top:16px;"></canvas>

        <div class="buttons">
          <button id="prevMatch">← Précédent</button>
          <button id="nextMatch">Suivant →</button>
          <button id="backToMatches">Retour</button>
        </div>
      </div>
    `;

    // Boutons
    document.getElementById("backToMatches").onclick = () => navigateTo("matches");
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
    if (activeChart) {
      activeChart.destroy();
      activeChart = null;
    }
    activeChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Points", "AST", "STL", "BLK", "RBO", "RBD"],
        datasets: [{
          label: "Statistiques",
          data: [
            toNumber(match.points),
            toNumber(match.ast),
            toNumber(match.stl),
            toNumber(match.blk),
            toNumber(match.rbo),
            toNumber(match.rbd)
          ],
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

  // Utilitaires
  function sanitize(val) {
    if (val === null || val === undefined) return "";
    return String(val);
  }
  function toNumber(val) {
    const n = Number(val);
    return isNaN(n) ? 0 : n;
  }
});

// Comparaison entre deux joueurs
function renderPlayersComparison() {
  app.innerHTML = `
    <h1>Comparer deux joueurs</h1>
    <div class="card">
      <label>Joueur 1 : <input type="text" id="player1" placeholder="Nom du joueur"></label>
      <label>Joueur 2 : <input type="text" id="player2" placeholder="Nom du joueur"></label>
      <label>Statistique :
        <select id="statSelect">
          <option value="points">Points</option>
          <option value="passes">Passes</option>
          <option value="rebonds">Rebonds</option>
          <option value="interceptions">Interceptions</option>
          <option value="contres">Contres</option>
        </select>
      </label>
      <button id="compareBtn">Comparer</button>
      <canvas id="compareChart"></canvas>
    </div>
  `;

  document.getElementById("compareBtn").onclick = () => {
    const p1 = document.getElementById("player1").value.trim();
    const p2 = document.getElementById("player2").value.trim();
    const stat = document.getElementById("statSelect").value;

    fetch("data/players.json")
      .then(res => res.json())
      .then(players => {
        const player1 = players.find(p => p.nom === p1);
        const player2 = players.find(p => p.nom === p2);

        if (!player1 || !player2) {
          alert("Un des joueurs n'existe pas !");
          return;
        }

        const ctx = document.getElementById("compareChart").getContext("2d");
        new Chart(ctx, {
          type: "bar",
          data: {
            labels: [player1.nom, player2.nom],
            datasets: [{
              label: stat,
              data: [player1[stat], player2[stat]],
              backgroundColor: ["#2563eb", "#ef4444"]
            }]
          },
          options: { responsive: true }
        });
      });
  };
}

// Historique d’un joueur
function renderPlayerHistory() {
  app.innerHTML = `
    <h1>Historique d'un joueur</h1>
    <div class="card">
      <label>Joueur : <input type="text" id="playerName" placeholder="Nom du joueur"></label>
      <label>Statistique :
        <select id="statHistory">
          <option value="points">Points</option>
          <option value="passes">Passes</option>
          <option value="rebonds">Rebonds</option>
        </select>
      </label>
      <button id="historyBtn">Afficher</button>
      <canvas id="historyChart"></canvas>
    </div>
  `;

  document.getElementById("historyBtn").onclick = () => {
    const player = document.getElementById("playerName").value.trim();
    const stat = document.getElementById("statHistory").value;

    fetch("data/players_history.json")
      .then(res => res.json())
      .then(history => {
        if (!history[player]) {
          alert("Joueur introuvable !");
          return;
        }

        const labels = history[player].map(h => h.saison || h.date);
        const values = history[player].map(h => h[stat]);

        const ctx = document.getElementById("historyChart").getContext("2d");
        new Chart(ctx, {
          type: "line",
          data: {
            labels,
            datasets: [{
              label: `${player} — ${stat}`,
              data: values,
              borderColor: "#2563eb",
              fill: false
            }]
          },
          options: { responsive: true }
        });
      });
  };
}

