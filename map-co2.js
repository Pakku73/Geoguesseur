let map = L.map("map").setView([20, 0], 2);
L.tileLayer.provider("CartoDB.VoyagerNoLabels").addTo(map);

let selectedCategory = "city";
let score = 0;
let roundData = {};

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("category-select").addEventListener("change", (e) => {
    selectedCategory = e.target.value;
    newRound();
  });

  newRound();
});

function newRound() {
  map.eachLayer((layer) => {
    if (layer instanceof L.Marker || layer instanceof L.Polyline)
      map.removeLayer(layer);
  });

  document.querySelector(".guess")?.remove();

  fetch("https://restcountries.com/v3.1/all")
    .then((res) => res.json())
    .then((data) => {
      const filtered = data.filter((c) => c.population > 100000);
      const rand = filtered[Math.floor(Math.random() * filtered.length)];

      if (selectedCategory === "country") {
        roundData = {
          name: rand.name.common,
          capital: null,
          lat: rand.latlng[0],
          lng: rand.latlng[1],
        };
      } else {
        roundData = {
          name: rand.capital?.[0] || "N/A",
          country: rand.name.common,
          lat: rand.capitalInfo?.latlng?.[0] || rand.latlng[0],
          lng: rand.capitalInfo?.latlng?.[1] || rand.latlng[1],
        };
      }

      showGuessPanel();
      map.once("click", handleMapClick);
    });
}

// function showGuessPanel() {
//   const panel = document.createElement("div");
//   panel.className = "guess";

//   const showName = selectedCategory === "country" ? roundData.name : "???";

//   const showCapital =
//     selectedCategory === "city"
//       ? "???"
//       : selectedCategory === "region"
//       ? "???"
//       : roundData.name;

//   panel.innerHTML = `
//     <h2 class='location'>${showName}</h2>
//     <h2 class='capital'>${showCapital}</h2>
//     <h2 class='distance'>Distance: ...</h2>
//     <h2 class='score'>Score: ${score}</h2>
//     <button class="next" style="display:none;">Suivant</button>
//   `;

//   document.body.appendChild(panel);
//   panel.querySelector(".next").addEventListener("click", newRound);
// }

function showGuessPanel() {
  const panel = document.createElement("div");
  panel.className = "guess";

  let showName = "???";
  let showInfo = "";

  if (selectedCategory === "city") {
    showName = roundData.name; // nom de la capitale
    showInfo = `Pays : ${roundData.country}`;
  } else if (selectedCategory === "country") {
    showName = roundData.name; // nom du pays
    showInfo = ""; // pas besoin d'info supplémentaire
  } else if (selectedCategory === "region") {
    showName = "???"; // on pourrait adapter ça si on a les régions
    showInfo = "";
  }

  panel.innerHTML = `
    <h2 class="location">${showName}</h2>
    <h2 class="info">${showInfo}</h2>
    <h2 class="distance">...</h2>
    <h2 class="score">${score}</h2>
  `;

  document.body.appendChild(panel);
}

function handleMapClick(e) {
  const guessCoords = e.latlng;
  const trueCoords = L.latLng(roundData.lat, roundData.lng);

  const userMarker = L.marker(guessCoords).addTo(map);
  const trueMarker = L.marker(trueCoords).addTo(map);

  // Ligne pointillée
  L.polyline([guessCoords, trueCoords], {
    color: "blue",
    dashArray: "5, 10",
  }).addTo(map);

  const dist = Math.floor(calculateDistance(guessCoords, trueCoords));
  const points = Math.max(0, 5000 - dist);
  score += points;

  const panel = document.querySelector(".guess");
  panel.querySelector(".distance").textContent = `Distance: ${dist} km`;
  panel.querySelector(".score").textContent = `Score: ${score}`;
  panel.querySelector(".next").style.display = "inline-block";

  if (selectedCategory === "country") {
    panel.querySelector(".location").textContent = roundData.name;
  } else {
    panel.querySelector(".location").textContent = roundData.name;
    panel.querySelector(".capital").textContent = `Pays : ${roundData.country}`;
  }
}

function calculateDistance(coord1, coord2) {
  const R = 6371;
  const dLat = toRad(coord2.lat - coord1.lat);
  const dLon = toRad(coord2.lng - coord1.lng);
  const lat1 = toRad(coord1.lat);
  const lat2 = toRad(coord2.lat);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg) {
  return (deg * Math.PI) / 180;
}
