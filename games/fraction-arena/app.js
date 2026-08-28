(() => {
  "use strict";

  const API_URL = "https://rlfxnjbqxbozjdzkbwlz.supabase.co/functions/v1/math8-fraction-battle";
  const VERSION = "2026.08.28-arena-v1";
  const STORAGE_KEY = "fractionArenaSessionV1";
  const PENDING_KEY = "fractionArenaPendingV1";
  const MAX_FEED = 60;

  const state = {
    session: loadJson(STORAGE_KEY, null),
    snapshot: null,
    lastEventId: 0,
    selectedOption: "",
    selectedTarget: "",
    feed: [],
    serverDeltaMs: 0,
    pollTimer: null,
    pollInFlight: false,
    flushing: false,
    currentQuestionRound: 0,
  };

  const $ = (id) => document.getElementById(id);
  const joinView = $("joinView");
  const gameView = $("gameView");
  const joinForm = $("joinForm");
  const optionGrid = $("optionGrid");
  const eventFeed = $("eventFeed");

  if (state.session) state.lastEventId = Number(state.session.last_event_id || 0);

  function loadJson(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || "null") ?? fallback; }
    catch { return fallback; }
  }

  function saveJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function saveSession() {
    if (!state.session) return;
    state.session.last_event_id = state.lastEventId;
    saveJson(STORAGE_KEY, state.session);
  }

  function clearSession() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(PENDING_KEY);
    state.session = null;
    state.snapshot = null;
    state.lastEventId = 0;
  }

  function uuid() {
    if (crypto.randomUUID) return crypto.randomUUID();
    const b = new Uint8Array(16);
    crypto.getRandomValues(b);
    b[6] = (b[6] & 0x0f) | 0x40;
    b[8] = (b[8] & 0x3f) | 0x80;
    const h = [...b].map((x) => x.toString(16).padStart(2, "0")).join("");
    return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`;
  }

  function randomToken() {
    const b = new Uint8Array(32);
    crypto.getRandomValues(b);
    return [...b].map((x) => x.toString(16).padStart(2, "0")).join("");
  }

  function sleep(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }

  async function request(action, payload = {}, opts = {}) {
    const retries = opts.retries ?? 2;
    let lastError;
    for (let attempt = 0; attempt <= retries; attempt += 1) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6500);
      try {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Client-Version": VERSION },
          body: JSON.stringify({ action, ...payload }),
          signal: controller.signal,
          cache: "no-store",
        });
        clearTimeout(timeout);
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          const error = new Error(data.error || `http_${response.status}`);
          error.code = data.error || `http_${response.status}`;
          error.status = response.status;
          throw error;
        }
        return data;
      } catch (error) {
        clearTimeout(timeout);
        lastError = error;
        const hard = [400, 401, 403, 409, 413].includes(error.status);
        if (!navigator.onLine || hard || attempt === retries) break;
        await sleep(350 * (2 ** attempt) + Math.floor(Math.random() * 250));
      }
    }
    throw lastError;
  }

  function setMessage(node, text = "", kind = "") {
    node.textContent = text;
    node.className = `message${kind ? ` ${kind}` : ""}`;
  }

  function setNetworkStatus() {
    const strip = $("networkStrip");
    strip.classList.toggle("online", navigator.onLine);
    strip.classList.toggle("offline", !navigator.onLine);
    $("networkText").textContent = navigator.onLine
      ? "ONLINE · synchronized battle state"
      : "OFFLINE · your timed action will retry if the phase is still open";
  }

  function serverNow() { return Date.now() + state.serverDeltaMs; }

  function syncServerClock(serverTime) {
    const parsed = Date.parse(serverTime || "");
    if (Number.isFinite(parsed)) state.serverDeltaMs = parsed - Date.now();
  }

  function remainingMs() {
    const room = state.snapshot?.room;
    if (!room) return 0;
    const deadline = room.phase === "lobby" ? room.lobby_ends_at : room.phase_ends_at;
    if (!deadline) return 0;
    return Math.max(0, Date.parse(deadline) - serverNow());
  }

  function updateTimer() {
    const room = state.snapshot?.room;
    const timer = $("timer");
    if (!room) { timer.textContent = "--"; return; }
    const ms = remainingMs();
    if ((room.phase === "lobby" && !room.lobby_ends_at) || room.phase === "finished") {
      timer.textContent = room.phase === "finished" ? "END" : "--";
      timer.classList.remove("danger");
      return;
    }
    const seconds = Math.max(0, Math.ceil(ms / 1000));
    timer.textContent = `${seconds}s`;
    timer.classList.toggle("danger", seconds <= 5 && seconds > 0);
  }

  function pendingItems() { return loadJson(PENDING_KEY, []); }
  function savePending(items) { saveJson(PENDING_KEY, items.slice(-8)); }

  function queueTimedAction(action, payload) {
    const room = state.snapshot?.room;
    if (!room?.phase_ends_at) return;
    const items = pendingItems();
    if (!items.some((x) => x.payload?.client_event_id === payload.client_event_id)) {
      items.push({ action, payload, round_no: room.current_round, phase: room.phase, expires_at: room.phase_ends_at, created_at: Date.now() });
      savePending(items);
    }
  }

  function removePending(eventId) {
    savePending(pendingItems().filter((x) => x.payload?.client_event_id !== eventId));
  }

  async function flushPending() {
    if (state.flushing || !navigator.onLine || !state.session || !state.snapshot) return;
    state.flushing = true;
    try {
      const now = serverNow();
      const room = state.snapshot.room;
      const items = pendingItems();
      const keep = [];
      for (const item of items) {
        const expired = Date.parse(item.expires_at) + 1200 < now;
        const phaseMismatch = room.current_round !== item.round_no || room.phase !== item.phase;
        if (expired || phaseMismatch) continue;
        try {
          await request(item.action, item.payload, { retries: 1 });
        } catch (error) {
          if (!navigator.onLine || ![400,401,403,409].includes(error.status)) keep.push(item);
        }
      }
      savePending(keep);
    } finally {
      state.flushing = false;
    }
  }

  async function joinGame(event) {
    event.preventDefault();
    if (!navigator.onLine) {
      setMessage($("joinMessage"), "Internet is required for the initial team registration.", "pending");
      return;
    }

    const teamName = $("teamName").value.trim();
    const groupCode = $("groupCode").value.trim().toUpperCase();
    const joinCode = $("joinCode").value.trim().toUpperCase().replace(/[^A-Z0-9-]/g, "");
    if (teamName.length < 2 || !groupCode || joinCode.length < 4) return;

    const teamToken = randomToken();
    const clientJoinId = uuid();
    const button = $("joinButton");
    button.disabled = true;
    setMessage($("joinMessage"), "Registering your team…", "pending");

    try {
      const data = await request("join", {
        team_name: teamName,
        group_code: groupCode,
        join_code: joinCode,
        team_token: teamToken,
        client_join_id: clientJoinId,
      });
      state.session = {
        team_id: data.session.team_id,
        team_token: teamToken,
        join_code: joinCode,
        group_code: groupCode,
        team_name: teamName,
        client_join_id: clientJoinId,
        last_event_id: 0,
      };
      state.lastEventId = 0;
      saveSession();
      applySnapshot(data.snapshot);
      showGame();
      schedulePoll(100);
    } catch (error) {
      const messages = {
        team_name_taken: "That team name is already in this room. Choose another one.",
        game_in_progress: "That battle has already started. Use a new game code.",
        room_full: "This room already has 12 teams.",
        invalid_join_data: "Check the team name, class, and game code.",
      };
      setMessage($("joinMessage"), messages[error.code] || "Could not join the arena. Check the connection and try again.", "bad");
    } finally {
      button.disabled = false;
    }
  }

  async function resumeGame() {
    if (!state.session) return;
    if (!navigator.onLine) {
      showGame();
      return;
    }
    try {
      const data = await request("snapshot", authPayload({ last_event_id: state.lastEventId }), { retries: 2 });
      applySnapshot(data);
      showGame();
      schedulePoll(200);
    } catch (error) {
      if (error.code === "invalid_session") {
        clearSession();
        showJoin();
      } else {
        showGame();
        schedulePoll(1500);
      }
    }
  }

  function authPayload(extra = {}) {
    return {
      team_id: state.session?.team_id,
      team_token: state.session?.team_token,
      ...extra,
    };
  }

  function showGame() {
    joinView.classList.add("hidden");
    gameView.classList.remove("hidden");
    render();
  }

  function showJoin() {
    gameView.classList.add("hidden");
    joinView.classList.remove("hidden");
  }

  function applySnapshot(snapshot) {
    if (!snapshot) return;
    syncServerClock(snapshot.server_time);
    const previous = state.snapshot;
    state.snapshot = snapshot;
    processEvents(snapshot.events || []);

    const round = Number(snapshot.room?.current_round || 0);
    if (round !== state.currentQuestionRound) {
      state.currentQuestionRound = round;
      state.selectedOption = "";
      state.selectedTarget = "";
    }

    if (snapshot.room?.phase === "attack" && !state.selectedTarget) {
      const rivals = (snapshot.teams || []).filter((t) => t.id !== snapshot.me?.id);
      if (rivals.length) state.selectedTarget = rivals[0].id;
    }

    if (previous?.me && snapshot.me && snapshot.me.hp < previous.me.hp) {
      animateDamage(previous.me.hp - snapshot.me.hp);
    }

    render();
  }

  function processEvents(events) {
    for (const event of events) {
      const id = Number(event.id || 0);
      if (!id || id <= state.lastEventId) continue;
      state.lastEventId = id;
      state.feed.unshift(event);
      if (state.feed.length > MAX_FEED) state.feed.length = MAX_FEED;

      if (event.event_type === "attack" && event.target_team_id === state.session?.team_id && Number(event.payload?.damage || 0) > 0) {
        animateDamage(Number(event.payload.damage));
      }
    }
    saveSession();
  }

  function animateDamage(amount) {
    if (!amount) return;
    document.body.classList.remove("hit");
    void document.body.offsetWidth;
    document.body.classList.add("hit");
    const node = document.createElement("div");
    node.className = "damage-float";
    node.textContent = `−${amount} HP`;
    $("damageLayer").appendChild(node);
    setTimeout(() => node.remove(), 950);
  }

  function schedulePoll(delay) {
    clearTimeout(state.pollTimer);
    state.pollTimer = setTimeout(poll, delay);
  }

  function pollDelay() {
    if (document.hidden) return 5000;
    const phase = state.snapshot?.room?.phase;
    if (phase === "attack") return 1000;
    if (phase === "solve") return 1400;
    if (phase === "lobby") return 1800;
    return 5000;
  }

  async function poll() {
    if (state.pollInFlight || !state.session) return schedulePoll(pollDelay());
    if (!navigator.onLine) return schedulePoll(1800);
    state.pollInFlight = true;
    try {
      const data = await request("snapshot", authPayload({ last_event_id: state.lastEventId }), { retries: 1 });
      applySnapshot(data);
      await flushPending();
    } catch (error) {
      if (error.code === "invalid_session") {
        clearSession();
        showJoin();
        return;
      }
    } finally {
      state.pollInFlight = false;
      if (state.session) schedulePoll(pollDelay());
    }
  }

  function render() {
    const snap = state.snapshot;
    if (!snap) return;
    const { room, me, teams = [], submission, action, question } = snap;

    $("roomLabel").textContent = `${room.group_code} · CODE ${room.join_code}`;
    $("teamLabel").textContent = me.team_name;
    $("hpValue").textContent = me.hp;
    $("shieldValue").textContent = me.shield;
    $("chargeValue").textContent = me.attack_charge;
    $("scoreValue").textContent = Number(me.score).toLocaleString();
    $("hpBar").style.width = `${Math.max(0, Math.min(100, me.hp))}%`;

    $("phaseTag").textContent = room.phase.toUpperCase();
    if (room.phase === "lobby") $("roundText").textContent = room.lobby_ends_at ? "Battle starts when the countdown reaches zero" : "Waiting for another team";
    else if (room.phase === "finished") $("roundText").textContent = "Final standings";
    else $("roundText").textContent = `Round ${room.current_round} of ${room.round_count} · ${room.phase === "solve" ? "Solve the problem" : "Attack or defend"}`;

    $("lobbyPanel").classList.toggle("hidden", room.phase !== "lobby");
    $("questionPanel").classList.toggle("hidden", room.phase !== "solve");
    $("attackPanel").classList.toggle("hidden", room.phase !== "attack");
    $("finishedPanel").classList.toggle("hidden", room.phase !== "finished");

    renderLobby(room, teams);
    renderQuestion(question, submission, room);
    renderAttack(question, action, room, me);
    renderTeams(teams, room, me);
    renderFeed();
    if (room.phase === "finished") renderFinished(teams, me);
    updateTimer();
  }

  function renderLobby(room, teams) {
    const count = teams.length;
    $("teamCount").textContent = `${count} team${count === 1 ? "" : "s"} connected`;
    if (room.lobby_ends_at) {
      $("lobbyTitle").textContent = "Opponents found. Prepare!";
      $("lobbyText").textContent = "Teams can still join until the server begins Round 1.";
    } else {
      $("lobbyTitle").textContent = "Waiting for an opponent…";
      $("lobbyText").textContent = "Share this game code with at least one other team in the same class.";
    }
  }

  function renderQuestion(question, submission, room) {
    if (room.phase !== "solve" || !question) return;
    $("skillChip").textContent = question.skill;
    $("questionPrompt").textContent = question.prompt;
    $("questionExpression").textContent = question.expression;
    $("answerStatus").textContent = submission ? "ANSWER LOCKED" : "Choose A, B, C or D";

    optionGrid.innerHTML = "";
    for (const key of ["A","B","C","D"]) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `option-btn${state.selectedOption === key ? " selected" : ""}`;
      button.disabled = Boolean(submission);
      button.innerHTML = `<span class="option-key">${key}</span><span class="option-text">${escapeHtml(question.options[key])}</span>`;
      button.addEventListener("click", () => {
        if (submission) return;
        state.selectedOption = key;
        renderQuestion(question, submission, room);
      });
      optionGrid.appendChild(button);
    }

    const lock = $("lockAnswerBtn");
    lock.disabled = Boolean(submission) || !state.selectedOption;
    if (submission) {
      setMessage($("answerMessage"), submission.correct ? `Correct! +${submission.awarded_points} points · +${submission.awarded_charge} charge` : "Incorrect. Your base lost 3 HP — prepare for the battle phase.", submission.correct ? "good" : "bad");
    } else if (pendingItems().some((x) => x.action === "submit" && x.round_no === room.current_round)) {
      setMessage($("answerMessage"), "Answer queued. Reconnecting before the solve phase closes…", "pending");
    } else {
      setMessage($("answerMessage"), "Your first locked answer is final for this round.");
    }
  }

  function renderAttack(question, action, room, me) {
    if (room.phase !== "attack") return;
    const reveal = $("revealCard");
    if (question?.correct_option) {
      reveal.innerHTML = `<strong>Correct answer: ${escapeHtml(question.correct_option)}</strong><br>${escapeHtml(question.explanation || "")}`;
    } else reveal.textContent = "Round answer locked.";

    const target = (state.snapshot?.teams || []).find((t) => t.id === state.selectedTarget);
    $("targetChip").textContent = target ? `TARGET · ${target.team_name}` : "Select a rival on the battlefield";

    document.querySelectorAll(".action-btn").forEach((button) => {
      const kind = button.dataset.action;
      const cost = kind === "quick" ? 10 : kind === "power" ? 18 : 12;
      const needsTarget = kind !== "shield";
      button.disabled = Boolean(action) || me.attack_charge < cost || (needsTarget && !target);
    });

    if (action) {
      const text = action.action_type === "shield"
        ? `Shield deployed: +${action.shield_added}.`
        : `Attack locked: ${action.damage} HP damage${action.absorbed ? `, ${action.absorbed} absorbed by shield` : ""}.`;
      setMessage($("actionMessage"), text, "good");
    } else if (pendingItems().some((x) => x.action === "battle_action" && x.round_no === room.current_round)) {
      setMessage($("actionMessage"), "Battle action queued. Reconnecting…", "pending");
    } else if (me.attack_charge < 10) {
      setMessage($("actionMessage"), "Not enough charge yet. Correct answers build attack energy.");
    } else {
      setMessage($("actionMessage"), "You may perform one battle action this round.");
    }
  }

  function renderTeams(teams, room, me) {
    $("onlineCount").textContent = `${teams.length} team${teams.length === 1 ? "" : "s"}`;
    const list = $("teamsList");
    list.innerHTML = "";
    teams.forEach((team, index) => {
      const card = document.createElement("div");
      const isMe = team.id === me.id;
      const canTarget = room.phase === "attack" && !isMe && !state.snapshot.action;
      card.className = `team-card${isMe ? " me" : ""}${canTarget ? " targetable" : ""}${state.selectedTarget === team.id ? " targeted" : ""}`;
      card.innerHTML = `
        <div class="team-line">
          <span class="team-name">${index + 1}. ${escapeHtml(team.team_name)}${isMe ? " · YOU" : ""}</span>
          <span class="team-score">${Number(team.score).toLocaleString()}</span>
        </div>
        <div class="mini-bars">
          ${barLine("HP", team.hp, 100, "hp")}
          ${barLine("SH", team.shield, 40, "shield")}
          ${barLine("EN", team.attack_charge, 60, "charge")}
        </div>
        <div class="team-meta"><span>✓ ${team.correct_count}</span><span>Streak ${team.streak}</span><span>Hits ${team.hits_taken}</span></div>`;
      if (canTarget) card.addEventListener("click", () => { state.selectedTarget = team.id; render(); });
      list.appendChild(card);
    });
  }

  function barLine(label, value, max, kind) {
    const pct = Math.max(0, Math.min(100, (Number(value) / max) * 100));
    return `<div class="bar-line"><span>${label}</span><div class="bar ${kind}"><i style="width:${pct}%"></i></div><strong>${value}</strong></div>`;
  }

  function eventText(event) {
    const p = event.payload || {};
    switch (event.event_type) {
      case "team_joined": return `${p.team_name || "A team"} entered the arena.`;
      case "lobby_countdown": return "Opponent found — lobby countdown started.";
      case "round_start": return `Round ${event.round_no} started. Solve!`;
      case "attack_phase": return `Round ${event.round_no}: battle phase is open.`;
      case "answer_correct": return `${p.team_name || "A team"} solved the problem and charged ${p.charge || 0} energy.`;
      case "answer_wrong": return `${p.team_name || "A team"} missed the answer and took 3 self-damage.`;
      case "attack": return `${p.team_name || "A team"} hit ${p.target_name || "a rival"} for ${p.damage || 0} HP${p.absorbed ? ` (${p.absorbed} shield absorbed)` : ""}.`;
      case "shield": return `${p.team_name || "A team"} raised a +${p.shield_added || 0} shield.`;
      case "game_finished": return "The arena is closed. Final scores are locked.";
      default: return event.event_type.replace(/_/g, " ");
    }
  }

  function renderFeed() {
    eventFeed.innerHTML = "";
    for (const event of state.feed) {
      const node = document.createElement("div");
      const kind = event.event_type === "attack" ? " attack" : event.event_type === "answer_correct" ? " good" : "";
      node.className = `feed-item${kind}`;
      const time = event.created_at ? new Date(event.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "";
      node.innerHTML = `<span class="feed-time">${escapeHtml(time)}</span>${escapeHtml(eventText(event))}`;
      eventFeed.appendChild(node);
    }
  }

  function renderFinished(teams, me) {
    const sorted = [...teams].sort((a,b) => b.score-a.score || b.hp-a.hp || b.correct_count-a.correct_count);
    const winner = sorted[0];
    $("winnerTitle").textContent = winner ? `${winner.team_name} wins the arena!` : "Final standings";
    const podium = $("podium");
    podium.innerHTML = "";
    sorted.forEach((team, index) => {
      const row = document.createElement("div");
      row.className = "podium-row";
      row.innerHTML = `<span class="rank">${index + 1}</span><strong>${escapeHtml(team.team_name)}${team.id === me.id ? " · YOU" : ""}</strong><span>${Number(team.score).toLocaleString()} pts</span><span class="hp-final">${team.hp} HP</span>`;
      podium.appendChild(row);
    });
  }

  async function lockAnswer() {
    const snap = state.snapshot;
    if (!snap || snap.room.phase !== "solve" || snap.submission || !state.selectedOption) return;
    const eventId = uuid();
    const payload = authPayload({
      client_event_id: eventId,
      round_no: snap.room.current_round,
      selected_option: state.selectedOption,
    });
    queueTimedAction("submit", payload);
    $("lockAnswerBtn").disabled = true;
    setMessage($("answerMessage"), "Locking answer on the server…", "pending");
    try {
      const result = await request("submit", payload, { retries: 2 });
      removePending(eventId);
      setMessage($("answerMessage"), result.correct ? `Correct! +${result.awarded_points} points · +${result.awarded_charge} charge` : "Incorrect. −3 HP.", result.correct ? "good" : "bad");
      schedulePoll(80);
    } catch (error) {
      if ([400,401,403,409].includes(error.status)) removePending(eventId);
      if (!navigator.onLine || !error.status) {
        setMessage($("answerMessage"), "Connection lost. Your answer is queued and will retry while this round is open.", "pending");
      } else {
        setMessage($("answerMessage"), friendlyError(error.code), "bad");
        schedulePoll(100);
      }
    }
  }

  async function performBattleAction(kind) {
    const snap = state.snapshot;
    if (!snap || snap.room.phase !== "attack" || snap.action) return;
    const targetId = kind === "shield" ? null : state.selectedTarget;
    if (kind !== "shield" && !targetId) {
      setMessage($("actionMessage"), "Select a rival team first.", "bad");
      return;
    }

    const eventId = uuid();
    const payload = authPayload({
      client_event_id: eventId,
      round_no: snap.room.current_round,
      battle_action: kind,
      target_team_id: targetId,
    });
    queueTimedAction("battle_action", payload);
    document.querySelectorAll(".action-btn").forEach((b) => b.disabled = true);
    setMessage($("actionMessage"), "Sending battle action…", "pending");

    try {
      const result = await request("battle_action", payload, { retries: 2 });
      removePending(eventId);
      const text = kind === "shield" ? `Shield deployed: +${result.shield_added}.` : `Hit confirmed: ${result.damage} HP damage.`;
      setMessage($("actionMessage"), text, "good");
      schedulePoll(80);
    } catch (error) {
      if ([400,401,403,409].includes(error.status)) removePending(eventId);
      if (!navigator.onLine || !error.status) {
        setMessage($("actionMessage"), "Connection lost. Action queued while the battle phase remains open.", "pending");
      } else {
        setMessage($("actionMessage"), friendlyError(error.code), "bad");
        schedulePoll(100);
      }
    }
  }

  function friendlyError(code) {
    const map = {
      already_submitted: "Your answer is already locked.",
      solve_phase_closed: "The solve phase has ended.",
      already_acted: "Your team already used its battle action this round.",
      attack_phase_closed: "The battle phase has ended.",
      not_enough_charge: "Your team does not have enough attack charge.",
      invalid_target: "Choose another team as the target.",
      invalid_session: "This team session is no longer valid.",
    };
    return map[code] || "The server rejected this action. State will refresh automatically.";
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>\"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[ch]));
  }

  function registerServiceWorker() {
    if ("serviceWorker" in navigator && location.protocol === "https:") {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    }
  }

  function init() {
    setNetworkStatus();
    registerServiceWorker();
    joinForm.addEventListener("submit", joinGame);
    $("lockAnswerBtn").addEventListener("click", lockAnswer);
    $("leaveButton").addEventListener("click", () => { clearSession(); location.reload(); });
    $("joinCode").addEventListener("input", (e) => { e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ""); });
    document.querySelectorAll(".action-btn").forEach((button) => button.addEventListener("click", () => performBattleAction(button.dataset.action)));

    window.addEventListener("online", () => { setNetworkStatus(); flushPending(); schedulePoll(50); });
    window.addEventListener("offline", setNetworkStatus);
    document.addEventListener("visibilitychange", () => { if (state.session) schedulePoll(document.hidden ? 4000 : 80); });
    document.addEventListener("keydown", (event) => {
      const snap = state.snapshot;
      if (!snap || snap.room?.phase !== "solve" || snap.submission) return;
      const key = event.key.toUpperCase();
      if (["A","B","C","D"].includes(key)) {
        state.selectedOption = key;
        renderQuestion(snap.question, snap.submission, snap.room);
      } else if (event.key === "Enter" && state.selectedOption) {
        event.preventDefault();
        lockAnswer();
      }
    });

    setInterval(updateTimer, 250);
    if (state.session) resumeGame(); else showJoin();
  }

  init();
})();