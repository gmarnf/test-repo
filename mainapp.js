let matchesData = [];
let currentMatchIndex = 0;

document.addEventListener("DOMContentLoaded", () => {
  const app = document.getElementById("app");
  const links = document.querySelectorAll("aside a, .mobile-nav button");

  links.forEach(link => {
    link.addEventListener("click", () => {
      links.forEach(l => l.classList.remove("active"));
      link.classList.add("active");
      const view = link.dataset.view;
      loadView(view);
    });
  });

  function loadView(view) {
    if (view === "home") {
      app.innerHTML = `<h1>Accueil</h1><p>Bienvenue sur le tableau de bord SM1.</p>`;
    }
    else if (view === "saison") {
      renderSaison();
    }
    else if (view === "matches") {
      renderMatchesView();
    }
    else {
      app.innerHTML = `<h1>${view}</h1><p>Contenu à venir...</p>`;
    }
  }

  // Vue Saison
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
      </table>`;
    fetch("data/saison.json")
      .then(res => res.json())
      .then(data => {
        const tbody = document.getElementById("saisonBody");
        tbody.innerHTML = "";
        data.forEach(match => {
          const row = document.createElement("tr");
          row.innerHTML = `<td>${match.date}</td><td>${match.adversaire}</td><td>${match.score}</td><td>${match.resultat}</td>`;
          tbody.appendChild(row);
        });
      });
  }

  // Vue Matches
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
      </table>`;
    loadMatches();
  }

  function loadMatches() {
    fetch("data/matches.json")
      .then(res => res.json())
      .then(data => {
        matchesData = data;
        renderMatchesTable(matchesData);
        document.getElementById("filterInput").addEventListener("input", e => {
          const term = e.target.value.toLowerCase();
          const filtered = matchesData.filter(m =>
            m.equipe.toLowerCase().includes(term) || m.journee.toLowerCase().includes(term)
          );
          renderMatchesTable(filtered);
        });
      });
  }

  function renderMatchesTable(list) {
    const tbody = document.getElementById("matchesBody");
    tbody.innerHTML = "";
    list.forEach((match, index) => {
      const row = document.createElement("tr");
      row.style.cursor = "pointer";
      row.innerHTML = `
        <td>${match.equipe}</td><td>${match.journee}</td><td>${match.points}</td><td>${match.fg}</td><td>${match.fg_pct}</td>
        <td>${match["2pts"]}</td><td>${match["3pts"]}</td><td>${match.ast}</td><td>${match.stl}</td><td>${match.blk}</td>
        <td>${match.rbo}</td><td>${match.rbd}</td><td>${match.frec}</td><td>${match.tf}</td><td>${match.diff}</td><td>${match.resultat}</td>
      `;
      row.onclick = () => {
        currentMatchIndex = index;
        showMatchDetail(match);
      };
      tbody.appendChild(row);
    });
  }

  function showMatchDetail(match) {
    app.innerHTML = `
      <h1>Détail du match — ${match.equipe} (${match.journee})</h1>
      <div class="card">
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
        <p><strong>Résultat :</strong> ${match.resultat}</p>
        <canvas id="matchChart"></canvas>
        <div class="buttons">
          <button id="prevMatch">← Précédent</button>
          <button id="nextMatch">Suivant →</button>
          <button id="backToMatches">Retour</button>
        </div>
      </div>
    `;

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
  loadView("home");
});
