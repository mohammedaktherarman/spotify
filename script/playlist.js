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
