// PROVIDED CODE BELOW (LINES 1 - 80) DO NOT REMOVE

// The store will hold all information needed globally
var store = {
  track_id: undefined,
  player_id: undefined,
  race_id: undefined,
};

// We need our javascript to wait until the DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  onPageLoad();
  setupClickHandlers();
});

function updateStore(updates, cb) {
  store = {
    ...store,
    ...updates,
  };

  if (cb) {
    return cb(store);
  }

  return store;
}

async function onPageLoad() {
  const page = window.location.href.split("/").pop();

  if (page === "race") {
    getTracks().then((tracks) => {
      console.log(tracks);
      const html = renderTrackCards(tracks);
      renderAt("#tracks", html);
      console.log(tracks);
    });

    getRacers().then((racers) => {
      console.log(racers);
      const html = renderRacerCars(racers);
      renderAt("#racers", html);
    });
  }
}

function setupClickHandlers() {
  document.addEventListener(
    "click",
    function (event) {
      const { target } = event;

      // Race track form field
      if (target.matches(".card.track")) {
        handleSelectTrack(target);
      }

      // Podracer form field
      if (target.matches(".card.podracer")) {
        handleSelectPodRacer(target);
      }

      // Submit create race form
      if (target.matches("#submit-create-race")) {
        event.preventDefault();

        // start race
        race();
      }

      // Handle acceleration click
      if (target.matches("#gas-peddle")) {
        handleAccelerate(target);
      }
    },
    false
  );
}

async function delay(ms) {
  return await new Promise((resolve) => setTimeout(resolve, ms));
}
// ^ PROVIDED CODE ^ DO NOT REMOVE

// This async function controls the flow of the race
async function race() {
  // render starting UI
  renderAt("#race", renderRaceStartView());

  // TODO - Get player_id and track_id from the store

  await createRace(store.player_id, store.track_id);
  await runCountdown();
  await startRace(store.race_id - 1);
  await runRace(store.race_id - 1);

  // TODO - invoke the API call to create the race, then save the result
  // TODO - update the store with the race id
  // The race has been created, now start the countdown
  // TODO - call the async function runCountdown

  // TODO - call the async function startRace
  // TODO - call the async function runRace
}
async function runCountdown() {
  //   // wait for the DOM to load
  await onPageLoad();

  var timer = 3;
  // TODO - use Javascript's built in setInterval method to count down once per second
  return new Promise((resolve) => {
    const countdown = setInterval(() => {
      document.getElementById("big-numbers").innerHTML = --timer;
      if (timer <= 0) {
        clearInterval(countdown);
        resolve();
      }
    }, 1000);
    // run this DOM manipulation to decrement the countdown for the user

    // TODO - if the countdown is done, clear the interval, resolve the promise, and return
  });
}

async function runRace(raceID) {
  console.log(raceID);

  return new Promise((resolve) => {
    const counter = setInterval(async () => {
      await fetch(`${SERVER}/api/races/${raceID}`, {
        method: "GET",
        mode: "cors",
      })
        .then((res) => res.json())
        .then((res) => {
          console.log(res);
          if (res.status === "in-progress") {
            renderAt("#leaderBoard", raceProgress(res.positions));
          }
          if (res.status === "finished") {
            clearInterval(counter);
            renderAt("#race", resultsView(res.positions));
            resolve();
          }
        });
    }, 500);
  });
  // TODO - use Javascript's built in setInterval method to get race info twice a second

  /* 
		TODO - if the race info status property is "in-progress", update the leaderboard by calling:
		renderAt('#leaderBoard', raceProgress(res.positions))
	*/

  /* 
		TODO - if the race info status property is "finished", run the following:
		clearInterval(raceInterval) // to stop the interval from repeating
		renderAt('#race', resultsView(res.positions)) // to render the results view
		reslove(res) // resolve the promise
	*/
}

function handleSelectPodRacer(target) {
  console.log("selected a pod", target.id);

  // remove class selected from all racer options
  const selected = document.querySelector("#racers .selected");
  if (selected) {
    selected.classList.remove("selected");
  }

  // add class selected to current target
  target.classList.add("selected");
  updateStore((track_id = target.id));
  // TODO - save the selected track to the store
}

function handleSelectTrack(target) {
  console.log("selected a track", target.id);

  // remove class selected from all track options
  const selected = document.querySelector("#tracks .selected");
  if (selected) {
    selected.classList.remove("selected");
  }

  // add class selected to current target
  target.classList.add("selected");

  // TODO - save the selected track id to the store
  updateStore((track_id = target.id));
}

function handleAccelerate() {
  console.log("accelerate button clicked");
  // TODO - Invoke the API call to accelerate
  accelerate(store.race_id - 1);
}

// HTML VIEWS ------------------------------------------------
// Provided code - do not remove

function renderRacerCars(racers) {
  if (!tracks.length) {
    return `
			  <h4>Loading Racers...</4>
		  `;
  }

  const results = racers.map(renderRacerCard).join("");

  return `
		  <ul id="racers">
			  ${results}
		  </ul>
	  `;
}

function renderRacerCard(racer) {
  const { id, driver_name, top_speed, acceleration, handling } = racer;

  return `
		  <li class="card podracer" id="${id}">
			  <h3>${driver_name}</h3>
			  <p>${top_speed}</p>
			  <p>${acceleration}</p>
			  <p>${handling}</p>
		  </li>
	  `;
}

function renderTrackCards(tracks) {
  if (!tracks.length) {
    return `
			  <h4>Loading Tracks...</4>
		  `;
  }

  const results = tracks.map(renderTrackCard).join("");

  return `
		  <ul id="tracks">
			  ${results}
		  </ul>
	  `;
}

function renderTrackCard(track) {
  const { id, name } = track;

  return `
		  <li id="${id}" class="card track">
			  <h3>${name}</h3>
		  </li>
	  `;
}

function renderCountdown(count) {
  return `
		  <h2>Race Starts In...</h2>
		  <p id="big-numbers">${count}</p>
	  `;
}

function renderRaceStartView(track, racers) {
  return `
		  <header>
			  <h1>Race: ${track ? track.name : ""}</h1>
		  </header>
		  <main id="two-columns">
			  <section id="leaderBoard">
				  ${renderCountdown(3)}
			  </section>
  
			  <section id="accelerate">
				  <h2>Directions</h2>
				  <p>Click the button as fast as you can to make your racer go faster!</p>
				  <button id="gas-peddle">Click Me To Win!</button>
			  </section>
		  </main>
		  <footer></footer>
	  `;
}

function resultsView(positions) {
  positions.sort((a, b) => (a.final_position > b.final_position ? 1 : -1));

  return `
		  <header>
			  <h1>Race Results</h1>
		  </header>
		  <main>
			  ${raceProgress(positions)}
			  <a href="/race">Start a new race</a>
		  </main>
	  `;
}

function raceProgress(positions) {
  let userPlayer = positions.find((e) => e.id === store.player_id);
  if (userPlayer) {
    userPlayer.driver_name += " (you)";
  }
  const results = positions.map((p) => {
    return `
			  <tr>
				  <td>
					  <h3>${p.final_position ? p.final_position : "not yet"} - ${p.driver_name}</h3>
				  </td>
			  </tr>
		  `;
  });

  return `
		  <header>
			  <h1>Race Results</h1>
		  </header>
		  <main>
			  <section id="leaderBoard">
				  ${results}
			  </section>
		  </main>
	  `;
}

function renderAt(element, html) {
  let node = null;
  if (element.match(/^\./) != null) {
    node = document.getElementsByClassName(element.substring(1));
  }

  node = document.getElementById(element);
  if (element.match(/^\#/) != null) {
    node = document.getElementById(element.substring(1));
  }
  if (node) {
    node.innerHTML = html;
  }
}

// ^ Provided code ^ do not remove

// API CALLS ------------------------------------------------

const SERVER = "http://localhost:8000";

function defaultFetchOpts() {
  return {
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": SERVER,
    },
  };
}

// TODO - Make a fetch call to each of the following API endpoints

function getTracks() {
  // GET request to `${SERVER}/api/tracks`
  // fetch(`${SERVER}/api/tracks`)
  //   .then((response) => response.json())
  //   .then((data) => console.log(data));
  return fetch(`${SERVER}/api/tracks`, {
    ...defaultFetchOpts(),
    method: "Get",
    mode: "cors",
  }).then((res) => res.json());
}
function getRacers() {
  // GET request to `${SERVER}/api/cars`
  return fetch(`${SERVER}/api/cars`, {
    ...defaultFetchOpts(),
    method: "GET",
    mode: "cors",
  }).then((res) => res.json());
}

function createRace(player_id, track_id) {
  const body = { player_id, track_id };
  return fetch(`${SERVER}/api/races`, {
    ...defaultFetchOpts(),
    method: "POST",
    dataType: "jsonp",
    body: JSON.stringify(body),
  })
    .then((res) => {
      return res.json();
    })
    .then((res) => {
      updateStore((store.race_id = res.ID));
      console.log(store.race_id);
    });
}

function startRace(id) {
  return fetch(`${SERVER}/api/races/${id}/start`, {
    ...defaultFetchOpts(),
    method: "POST",
    mode: "cors",
  });
}

function accelerate(id) {
  // POST request to `${SERVER}/api/races/${id}/accelerate`
  // options parameter provided as defaultFetchOpts
  // no body, datatype, or cors needed for this request
  return fetch(`${SERVER}/api/races/${id}/accelerate`, {
    ...defaultFetchOpts(),
    method: "POST",
  });
}
