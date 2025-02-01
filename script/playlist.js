let token = "";

function getToken() {
    token = window.location.href.split("access_token=")[1];
}

getToken();

const getUserPlaylists = async function () {
    const url = `https://api.spotify.com/v1/me/playlists`;
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        displayPlaylists(data.items); 
    } catch (error) {
        console.error("Error al obtener las playlists:", error);
    }
};

const displayPlaylists = function (playlists) {
    const playlistsContainer = document.getElementById("playlists");
    playlistsContainer.innerHTML = ''; 

    playlists.forEach(playlist => {
        const playlistButton = document.createElement("button");
        playlistButton.textContent = playlist.name;
        playlistButton.classList.add("playlist-button");
        playlistButton.onclick = function () {
            getPlaylistTracks(playlist.id); 
        };
        playlistsContainer.appendChild(playlistButton);
    });
};

const getPlaylistTracks = async function (playlistId) {
    const url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        const tracksContainer = document.getElementById("tracks");
        tracksContainer.innerHTML = ''; 

        if (data.items.length === 0) {
            document.getElementById("mensaje").innerText = "No hi ha cançons";
            document.getElementById("mensaje").style.display = "block"; 
        } else {
            document.getElementById("mensaje").style.display = "none"; 
            displayTracks(data.items, playlistId);
        }
    } catch (error) {
        console.error("Error al obtener las canciones:", error);
    }
};

const displayTracks = function (tracks, playlistId) {
    const tracksContainer = document.getElementById("tracks");

    tracks.forEach(track => {
        const trackItem = document.createElement("div");
        trackItem.classList.add("track-item");

        trackItem.innerHTML = `${track.track.name} - ${track.track.artists[0].name} 
                               <button class="del-button" onclick="confirmDelete('${track.track.uri}', '${playlistId}', this)">DEL</button>`;
        tracksContainer.appendChild(trackItem);
    });
};

const confirmDelete = function (trackUri, playlistId, button) {
    const confirm = window.confirm("¿Estás seguro que quieres eliminar esta canción de la playlist?");
    if (confirm) {
        deleteTrackFromPlaylist(trackUri, playlistId);
        button.parentElement.remove();
    }
};

const deleteTrackFromPlaylist = async function (trackUri, playlistId) {
    const url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`; 
    try {
        const response = await fetch(url, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                tracks: [{ uri: trackUri }] 
            })
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Canción eliminada:", data);
    } catch (error) {
        console.error("Error al eliminar la canción:", error);
    }
};

getUserPlaylists();


const obtenerCancionesDesdeLocalStorage = async function () {
    let trackIds = localStorage.getItem("selectedTracks");

    if (!trackIds) {
      document.getElementById("canciones-container").innerHTML = "No hi ha cançons guardades";
      return;
    }
  
  
    trackIds = trackIds.split(";");
  
  
    const url = `https://api.spotify.com/v1/tracks?ids=${trackIds.join(",")}`;
  
    try {
    
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
  
      const data = await response.json();
      mostrarCancionesEnPantalla(data.tracks);
    } catch (error) {
      console.error("Error al obtener las canciones desde Spotify:", error);
    }
  };
  
  const mostrarCancionesEnPantalla = function (tracks) {
    const cancionesContainer = document.getElementById("canciones-container");
    cancionesContainer.innerHTML = "";
  
  
    tracks.forEach((track) => {
      const divCancion = document.createElement("div");
      divCancion.classList.add("track-item");
      divCancion.innerHTML = `
        <span>${track.name} - ${track.artists[0].name}</span>
        <button class="add-button" data-id="${track.id}" onclick="agregarCancionAPlaylist('${track.id}')">ADD</button>
        <button class="del-button" data-id="${track.id}" onclick="eliminarCancionDeLocalStorage('${track.id}')">DEL</button>
      `;
      cancionesContainer.appendChild(divCancion);
    });
  };
  
 
  const agregarCancionAPlaylist = async function (trackId) {
    const selectedPlayList = document.getElementById("playlist").value;
  
    if (!selectedPlayList) {
      alert("Has de seleccionar una playlist");
      return;
    }
  
    const trackUri = `spotify:track:${trackId}`; 
  
    const url = `https://api.spotify.com/v1/playlists/${selectedPlayList}/tracks`;
  
    try {
    
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          uris: [trackUri], 
        }),
      });
  
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
  
      alert("La cançó s'ha afegit correctament");
  
      eliminarCancionDeLocalStorage(trackId);
  
      obtenerCancionesDesdeLocalStorage();
    } catch (error) {
      console.error("Error al agregar la canción a la playlist:", error);
    }
  };
  
  const eliminarCancionDeLocalStorage = function (trackId) {
    let trackIds = localStorage.getItem("selectedTracks"); 
  
    if (!trackIds) {
      return;
    }
  
    trackIds = trackIds.split(";");
  
    trackIds = trackIds.filter((id) => id !== trackId);
  
    localStorage.setItem("selectedTracks", trackIds.join(";"));
  
    obtenerCancionesDesdeLocalStorage();
  };
  
  obtenerCancionesDesdeLocalStorage();
  