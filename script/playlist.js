let token = "";

let selectedPlaylistId = null;

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
        mostrarCancionesPlaylist(data.items); 
    } catch (error) {
        console.error("Error al obtener las playlists:", error);
    }
};

const mostrarCancionesPlaylist = function (playlists) {
    const playlistsContainer = document.getElementById("playlists");
    playlistsContainer.innerHTML = ''; 

    playlists.forEach(playlist => {
        const playlistButton = document.createElement("button");
        playlistButton.textContent = playlist.name;
        playlistButton.classList.add("playlist-button");
        playlistButton.onclick = function () {
            selectedPlaylistId = playlist.id;
            obtenerCancionesPlaylist(selectedPlaylistId);
        };
        playlistsContainer.appendChild(playlistButton);
    });
};

const obtenerCancionesPlaylist = async function (playlistId) {
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
            cancionesPlaylist(data.items, playlistId);
        }
    } catch (error) {
        console.error("Error al obtener las canciones:", error);
    }
};

const cancionesPlaylist = function (tracks, playlistId) {
    const tracksContainer = document.getElementById("tracks");

    tracks.forEach(track => {
        const trackItem = document.createElement("div");
        trackItem.classList.add("track-item");

        const addedAt = track.added_at; 
        const formattedDate = new Date(addedAt).toLocaleString(); 

        trackItem.innerHTML = `
            ${track.track.name} - ${track.track.artists[0].name} 
            <span class="added-date">${formattedDate}</span>
            <button class="del-button" onclick="confirmDEL('${track.track.uri}', '${playlistId}', this)">DEL</button>
        `;
        tracksContainer.appendChild(trackItem);
    });
};

const confirmDEL = function (trackUri, playlistId, button) {
    const confirm = window.confirm("Estàs segur que vols eliminar la cançó de la playlist?");
    if (confirm) {
        playlistDEL(trackUri, playlistId);
        button.parentElement.remove();
    }
};

const playlistDEL = async function (trackUri, playlistId) {
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

const cancionesLocalStorage = async function () {
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
        mostrarCanciones(data.tracks);
    } catch (error) {
        console.error("Error al obtener las canciones desde Spotify:", error);
    }
};

const mostrarCanciones = function (tracks) {
    const cancionesContainer = document.getElementById("canciones-container");
    cancionesContainer.innerHTML = "";

    tracks.forEach((track) => {
        const divCancion = document.createElement("div");
        divCancion.classList.add("track-item");
        divCancion.innerHTML = `
            <span>${track.name} - ${track.artists[0].name}</span>
            <button class="add-button" data-id="${track.id}" onclick="playlistADD('${track.id}')">ADD</button>
            <button class="del-button" data-id="${track.id}" onclick="confirmacioDEL('${track.id}')">DEL</button>
        `;
        cancionesContainer.appendChild(divCancion);
    });
};

const playlistADD = async function (trackId) {
    if (!selectedPlaylistId) {
        alert("Has de seleccionar una playlist");
        return;
    }

    const trackUri = `spotify:track:${trackId}`;

    const url = `https://api.spotify.com/v1/playlists/${selectedPlaylistId}/tracks`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                uris: [trackUri]
            }),
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        alert("Estàs segur que vols afegir la cançó a la playlist?");

        LocalStorageDEL(trackId);

        obtenerCancionesPlaylist(selectedPlaylistId);

    } catch (error) {
        console.error("Error al agregar la canción a la playlist:", error);
    }
};

const confirmacioDEL = function (trackId) {
    const confirmacion = window.confirm("Estàs segur que vols eliminar la cançó de la llista de cançons guardades?");
    if (confirmacion) {
        LocalStorageDEL(trackId);
    }
};

const LocalStorageDEL = function (trackId) {
    let trackIds = localStorage.getItem("selectedTracks"); 

    if (!trackIds) {
        return;
    }

    trackIds = trackIds.split(";");

    trackIds = trackIds.filter((id) => id !== trackId);

    localStorage.setItem("selectedTracks", trackIds.join(";"));

    cancionesLocalStorage();
};

cancionesLocalStorage();
