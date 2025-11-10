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

  // Vue par défaut
  loadView("home");
});
