import { clientId, clientSecret } from "../env/env.js";

let token = "";

let botoCercar = document.getElementById("buscar");
let botoEsborrar = document.getElementById("borrar");
let entrada = document.getElementById("input");
let missatge = document.getElementById("message");





//funcio per obtenir el token d'acces de Spotify
function obtenirTokenSpotify(clientId, clientSecret) {
  const url = "https://accounts.spotify.com/api/token";
  const credencials = btoa(clientId + ":" + clientSecret);

  fetch(url, {
    method: "POST",
    headers: {
      Authorization: "Basic " + credencials,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  })
    .then((resposta) => {
      if (!resposta.ok) {
        throw new Error(`Error: ${resposta.status} - ${resposta.statusText}`);
      }
      return resposta.json();
    })
    .then((dades) => {
      token = dades.access_token;

      //habilita els botons si funciona el token
      botoCercar.disabled = false;
      botoEsborrar.disabled = false;

      console.log("Token obtingut:", token);
    })
    .catch((error) => {
      console.error("Error obtenint el token:", error);
    });
}








//funcio per obtenir les 3 canciones mes populars de l'artista
function getTopTracks(artistId) {
  const urlTopTracks = `https://api.spotify.com/v1/artists/${artistId}/top-tracks`;
  const capcalera = {
    Authorization: `Bearer ${token}`,
  };

  fetch(urlTopTracks, { method: "GET", headers: capcalera })
    .then((resposta) => resposta.json())
    .then((dades) => {
      const divTopCanciones = document.getElementById("topTracks");
      divTopCanciones.innerHTML = "<h3>Top 3 Cançons Populars</h3>";

      //agafa el div
      const topCancionContenedor = document.createElement("div");

      //crea i posa en el div les tres primeres cancions donades en el html
      dades.tracks.slice(0, 3).forEach((cancion) => {
        const cancionElemento = document.createElement("p");
        cancionElemento.innerText = `Cancion: ${cancion.name}`;
        topCancionContenedor.appendChild(cancionElemento);
      });
      divTopCanciones.appendChild(topCancionContenedor);
    })
    .catch((error) => {
      console.error(error);
    });
}








//funcio per obtenir la informacio de l'artista
function getArtista(artistId) {
  const urlArtista = `https://api.spotify.com/v1/artists/${artistId}`;
  const capcalera = {
    Authorization: `Bearer ${token}`,
  };

  fetch(urlArtista, { method: "GET", headers: capcalera })
    .then((resposta) => resposta.json())
    .then((dades) => {
      
      //agafa el div 
      const divInfoArtista = document.getElementById("artistInfo");

      //del div agafat crea a dins del div afageix el contingut de la api i la posa al html per el artista pasada
      divInfoArtista.innerHTML = `
        <img src="${dades.images[0]?.url}" alt="${dades.name}" style="width: 200px; height: 200px;">
        <h2>${dades.name}</h2>
        <p><strong>Popularitat:</strong> ${dades.popularity}</p>
        <p><strong>Generes:</strong> ${dades.genres.join(", ")}</p>
        <p><strong>Seguidors:</strong> ${dades.followers.total}</p>
      `;
      getTopTracks(artistId);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}









// funcio del boto cerca 
const cercar = function () {
  const valor = entrada.value.trim();


  //validacions del imput posat
  if (!valor) {
    alert("Has d'introduir un nom d’una canço");
    return;
  }

  if (valor.length < 2) {
    alert("Has d’introduir almenys 2 caracters");
    return;
  }

  //la frase desapareix al pulsa el boto cerca
  if (missatge) {
    missatge.style.display = "none";
  }

  // Endpoint SEARCH de Spotify
  const cercarSpotifyCançons = function (consulta, accessToken) {
    const urlCerca = `https://api.spotify.com/v1/search?q=${encodeURIComponent(consulta)}&type=track&limit=12`;

    fetch(urlCerca, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })
      .then((resposta) => {
        if (!resposta.ok) {
          throw new Error(`Error: ${resposta.status} - ${resposta.statusText}`);
        }
        return resposta.json();
      })
      .then((dades) => {
        console.log("Resultats de la cerca:", dades);

        const divResultat = document.getElementById("result");

        const llistaCançons = document.getElementById("songList");

        if (llistaCançons) {
          llistaCançons.innerHTML = "";
        }

        if (dades.tracks.items.length === 0) {
          divResultat.innerHTML = "<p>No hi ha resultats</p>";
          return;
        }

        const songGrid = document.createElement("div");
        songGrid.classList.add("song-grid");



        //per cada canço crea el seu div per cada cancion
        dades.tracks.items.forEach((canço) => {
          const divCanço = document.createElement("div");
          divCanço.classList.add("track-item");

          const infoCanço = ` 
            <img src="${canço.album.images[0]?.url}" alt="${canço.name}" style="width: 100px; height: 100px;">
            <p><strong>Cançó:</strong> ${canço.name}</p>
            <p><strong>Artista:</strong> ${canço.artists[0].name}</p>
            <p><strong>Àlbum:</strong> ${canço.album.name}</p>
            <button class="afegir-canço" data-id="${canço.id}">Afegir cançó</button>
          `;

          divCanço.innerHTML = infoCanço;
          songGrid.appendChild(divCanço);




          //aqui agafa el id del artista clickad i truca la funcio getArtista
          divCanço.addEventListener("click", function () {
            const artistId = canço.artists[0].id;
            getArtista(artistId);
          });



          //els botons de les cançons que es guarden en el localStorage
          const afegirBotons = divCanço.querySelectorAll(".afegir-canço");
          afegirBotons.forEach((botó) => {
            botó.addEventListener("click", function (event) {

              let cancionGuardar = localStorage.getItem("selectedTracks");

              if (!cancionGuardar) {
                cancionGuardar = [];
              } else {
                cancionGuardar = cancionGuardar.split(";");
              }

              const cançoId = event.target.getAttribute("data-id");

              if (!cancionGuardar.includes(cançoId)) {
                cancionGuardar.push(cançoId);
                localStorage.setItem("selectedTracks", cancionGuardar.join(";"));
              }
            });
          });
        });
        divResultat.innerHTML = "";
        divResultat.appendChild(songGrid);
      })
      .catch((error) => {
        console.error("Error al busca cançons:", error);
      });
  };
  cercarSpotifyCançons(valor, token);
};








// funcio del boto borrar on borro tot el que esta en pantalla 
const esborrarCerca = function () {
  entrada.value = "";

  const divResultat = document.getElementById("result");

  if (divResultat) {
    divResultat.innerHTML = "";
  }

  const divInfoArtista = document.getElementById("artistInfo");
  if (divInfoArtista) {
    divInfoArtista.innerHTML = "";
  }

  const divTopCanciones = document.getElementById("topTracks");
  if (divTopCanciones) {
    divTopCanciones.innerHTML = "";
  }

  if (missatge) {
    missatge.style.display = "block";
  }
};



obtenirTokenSpotify(clientId, clientSecret);

botoCercar.addEventListener("click", cercar);
botoEsborrar.addEventListener("click", esborrarCerca);