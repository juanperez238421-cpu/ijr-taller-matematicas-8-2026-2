(() => {
  "use strict";

  const API_URL = "https://rlfxnjbqxbozjdzkbwlz.supabase.co/functions/v1/math8-fraction-vault";
  const JOIN_CODE = "FRACTION8";
  const STORAGE_KEY = "fractionVaultSessionV1";
  const QUEUE_KEY = "fractionVaultQueueV1";
  const VERSION = "2026.08.28-v1";

  const zones = [
    { name: "Forbidden Values", range: [1, 4] },
    { name: "Factor & Simplify", range: [5, 8] },
    { name: "Operations Lab", range: [9, 12] },
    { name: "Error & Mastery", range: [13, 16] },
  ];

  const roles = ["Restriction Guardian", "Factorizer", "Operator", "Verifier"];

  const challenges = [
    {
      no: 1, zone: 1, title: "Find the forbidden value", role: 0,
      instruction: "Determine the restriction from the original denominator.",
      expression: frac("x + 4", "x − 6"),
      fields: [{ key: "restrictions", label: "Restriction(s)", placeholder: "Example: x ≠ 6", help: "Enter every value x cannot take.", wide: true }],
    },
    {
      no: 2, zone: 1, title: "Two restrictions", role: 0,
      instruction: "Identify every restriction created by the denominator.",
      expression: frac("2x", "x(x + 5)"),
      fields: [{ key: "restrictions", label: "Restriction(s)", placeholder: "Example: x ≠ 0, −5", help: "Order does not matter.", wide: true }],
    },
    {
      no: 3, zone: 1, title: "Factor the denominator", role: 1,
      instruction: "Factor the denominator first, then list all forbidden values.",
      expression: frac("x² − 9", "x² − x − 6"),
      fields: [{ key: "restrictions", label: "Restriction(s)", placeholder: "x ≠ …", help: "Both denominator factors matter.", wide: true }],
    },
    {
      no: 4, zone: 1, title: "Restriction survives", role: 3,
      instruction: "Simplify completely, but preserve the restriction from the original expression.",
      expression: frac("x² − 16", "x − 4"),
      fields: [
        { key: "result", label: "Simplified result", placeholder: "Example: x + 4" },
        { key: "restrictions", label: "Restriction(s)", placeholder: "x ≠ …" },
      ],
    },
    {
      no: 5, zone: 2, title: "Trinomial cancellation", role: 1,
      instruction: "Factor the numerator before cancelling.",
      expression: frac("x² + 7x + 12", "x + 4"),
      fields: [
        { key: "result", label: "Simplified result", placeholder: "Enter final expression" },
        { key: "restrictions", label: "Restriction(s)", placeholder: "x ≠ …" },
      ],
    },
    {
      no: 6, zone: 2, title: "Factor both sides", role: 1,
      instruction: "Factor numerator and denominator completely, then simplify.",
      expression: frac("x² − 25", "x² + 2x − 15"),
      fields: [
        { key: "result", label: "Simplified result", placeholder: "Use parentheses around fractions" },
        { key: "restrictions", label: "Restriction(s)", placeholder: "x ≠ …" },
      ],
    },
    {
      no: 7, zone: 2, title: "Common monomial factor", role: 1,
      instruction: "Factor first. Cancel only common factors.",
      expression: frac("2x² + 8x", "2x"),
      fields: [
        { key: "result", label: "Simplified result", placeholder: "Enter final expression" },
        { key: "restrictions", label: "Restriction(s)", placeholder: "x ≠ …" },
      ],
    },
    {
      no: 8, zone: 2, title: "Difference of squares", role: 3,
      instruction: "Factor, simplify, and preserve every original restriction.",
      expression: frac("x² − 4x", "x² − 16"),
      fields: [
        { key: "result", label: "Simplified result", placeholder: "Use ( ) where needed" },
        { key: "restrictions", label: "Restriction(s)", placeholder: "x ≠ …" },
      ],
    },
    {
      no: 9, zone: 3, title: "Different denominators", role: 2,
      instruction: "Find the LCD, add, and simplify completely.",
      expression: `${frac("3", "x")} <span class="op">+</span> ${frac("2", "x + 1")}`,
      fields: [
        { key: "lcd", label: "Least common denominator", placeholder: "Example: x(x + 1)", wide: true },
        { key: "result", label: "Final result", placeholder: "Use parentheses around numerator/denominator" },
        { key: "restrictions", label: "Restriction(s)", placeholder: "x ≠ …" },
      ],
    },
    {
      no: 10, zone: 3, title: "Subtract like denominators", role: 2,
      instruction: "Subtract the numerators, keep the common denominator, then simplify if possible.",
      expression: `${frac("x + 2", "x − 1")} <span class="op">−</span> ${frac("4", "x − 1")}`,
      fields: [
        { key: "result", label: "Final result", placeholder: "Use parentheses where needed" },
        { key: "restrictions", label: "Restriction(s)", placeholder: "x ≠ …" },
      ],
    },
    {
      no: 11, zone: 3, title: "Multiply and cancel", role: 2,
      instruction: "Factor before multiplying. Preserve restrictions from both original denominators.",
      expression: `${frac("x² − 9", "x")} <span class="op">·</span> ${frac("x", "x + 3")}`,
      fields: [
        { key: "result", label: "Final result", placeholder: "Enter simplified expression" },
        { key: "restrictions", label: "Restriction(s)", placeholder: "x ≠ …" },
      ],
    },
    {
      no: 12, zone: 3, title: "Divide by a fraction", role: 2,
      instruction: "Rewrite division as multiplication by the reciprocal. Include restrictions caused by division.",
      expression: `${frac("x² − 16", "x + 1")} <span class="op">÷</span> ${frac("x − 4", "x + 1")}`,
      fields: [
        { key: "result", label: "Final result", placeholder: "Enter simplified expression" },
        { key: "restrictions", label: "Restriction(s)", placeholder: "x ≠ …" },
      ],
    },
    {
      no: 13, zone: 4, title: "Catch the illegal cancellation", role: 3,
      instruction: "Mia claims (x + 5)/x = 5 because she cancels x. Decide whether the cancellation is valid and write the correct form.",
      expression: `${frac("x + 5", "x")} <span class="op">=</span> 5 ?`,
      fields: [
        { key: "valid", label: "Is Mia's cancellation valid?", type: "select", options: [["", "Choose"], ["no", "No"], ["yes", "Yes"]] },
        { key: "result", label: "Correct form", placeholder: "Example format: 1 + 5/x" },
        { key: "restrictions", label: "Restriction(s)", placeholder: "x ≠ …", wide: true },
      ],
    },
    {
      no: 14, zone: 4, title: "Geometry application", role: 2,
      instruction: "A rectangle has area x² + 6x m² and width x m. Find its length and the algebraic restriction.",
      expression: `<span>A = x² + 6x m² &nbsp;&nbsp; W = x m</span>`,
      fields: [
        { key: "result", label: "Length", placeholder: "Enter expression in x" },
        { key: "restrictions", label: "Restriction(s)", placeholder: "x ≠ …" },
      ],
    },
    {
      no: 15, zone: 4, title: "Multi-step simplification", role: 3,
      instruction: "Factor every polynomial before cancelling. Preserve every restriction from the original expression.",
      expression: `${frac("x² − 9", "x² + 5x + 6")} <span class="op">·</span> ${frac("x + 2", "x − 3")}`,
      fields: [
        { key: "result", label: "Final result", placeholder: "Enter simplified result" },
        { key: "restrictions", label: "Restriction(s)", placeholder: "x ≠ …" },
      ],
    },
    {
      no: 16, zone: 4, title: "Master lock", role: 3,
      instruction: "Factor everything, multiply by the reciprocal, simplify, and state every restriction — including values that make the divisor zero.",
      expression: `${frac("x² − 25", "x² − 4x − 5")} <span class="op">÷</span> ${frac("x + 5", "x − 1")}`,
      fields: [
        { key: "result", label: "Final result", placeholder: "Use parentheses around fraction parts" },
        { key: "restrictions", label: "All restrictions", placeholder: "x ≠ …" },
      ],
    },
  ];

  const state = {
    session: loadSession(),
    serverState: null,
    progress: { attempts: 0, hint_used: false },
    leaderboard: [],
    flushInProgress: false,
    leaderboardTimer: null,
  };

  const el = (id) => document.getElementById(id);
  const joinView = el("joinView");
  const gameView = el("gameView");
  const completeView = el("completeView");
  const answerForm = el("answerForm");
  const challengeMessage = el("challengeMessage");
  const hintBox = el("hintBox");

  function frac(top, bottom) {
    return `<span class="frac"><span>${top}</span><span>${bottom}</span></span>`;
  }

  function randomToken() {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  function loadSession() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"); }
    catch { return null; }
  }

  function saveSession(session) {
    state.session = session;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }

  function queueLoad() {
    try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]"); }
    catch { return []; }
  }

  function queueSave(queue) {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  }

  function queuePush(action, payload) {
    const queue = queueLoad();
    if (!queue.some((item) => item.payload?.client_event_id === payload?.client_event_id)) {
      queue.push({ action, payload, created_at: Date.now() });
      queueSave(queue.slice(-30));
    }
  }

  function setNetworkStatus() {
    const strip = el("networkStrip");
    strip.classList.toggle("online", navigator.onLine);
    strip.classList.toggle("offline", !navigator.onLine);
    el("networkText").textContent = navigator.onLine ? "Online · progress sync enabled" : "Offline · answers will wait safely on this device";
  }

  async function request(action, payload = {}, opts = {}) {
    const retries = opts.retries ?? 2;
    let lastError;
    for (let attempt = 0; attempt <= retries; attempt += 1) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 8500);
      try {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Client-Version": VERSION },
          body: JSON.stringify({ action, join_code: JOIN_CODE, ...payload }),
          signal: controller.signal,
          cache: "no-store",
        });
        clearTimeout(timer);
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          const error = new Error(data.error || `http_${response.status}`);
          error.code = data.error || `http_${response.status}`;
          error.status = response.status;
          throw error;
        }
        return data;
      } catch (error) {
        clearTimeout(timer);
        lastError = error;
        if (!navigator.onLine || attempt === retries || [400, 401, 403, 409].includes(error.status)) break;
        await sleep((420 * 2 ** attempt) + Math.floor(Math.random() * 220));
      }
    }
    throw lastError;
  }

  function sleep(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }

  function currentChallenge() {
    const no = state.serverState?.current_challenge || 1;
    return challenges.find((c) => c.no === no) || challenges[challenges.length - 1];
  }

  function setMessage(target, text = "", kind = "") {
    target.textContent = text;
    target.className = `message${kind ? ` ${kind}` : ""}`;
  }

  async function joinGame(event) {
    event.preventDefault();
    const teamName = el("teamName").value.trim();
    const groupCode = el("groupCode").value;
    const joinButton = el("joinButton");
    if (!teamName || !groupCode) return;
    if (!navigator.onLine) {
      setMessage(el("joinMessage"), "An internet connection is needed only for the first team registration.", "pending");
      return;
    }

    joinButton.disabled = true;
    setMessage(el("joinMessage"), "Registering team…", "pending");
    const session = {
      client_join_id: crypto.randomUUID(),
      team_token: randomToken(),
      team_id: null,
      day: null,
    };

    try {
      const data = await request("join", {
        team_name: teamName,
        group_code: groupCode,
        team_token: session.team_token,
        client_join_id: session.client_join_id,
      }, { retries: 3 });
      session.team_id = data.state.team_id;
      session.day = data.day;
      saveSession(session);
      applyServerState(data.state, data.progress);
      setMessage(el("joinMessage"), "Team registered.", "success");
      showGame();
    } catch (error) {
      const message = error.code === "team_name_taken"
        ? "That team name is already being used today. Choose another alias."
        : "Registration could not be completed. Check the connection and try again.";
      setMessage(el("joinMessage"), message, "error");
    } finally {
      joinButton.disabled = false;
    }
  }

  async function resumeGame() {
    if (!state.session?.team_id || !state.session?.team_token) return false;
    if (!navigator.onLine) {
      if (state.session.cached_state) {
        applyServerState(state.session.cached_state, state.session.cached_progress);
        showGame();
        return true;
      }
      return false;
    }
    try {
      const data = await request("resume", {
        team_id: state.session.team_id,
        team_token: state.session.team_token,
      }, { retries: 2 });
      if (state.session.day && data.day && state.session.day !== data.day) {
        localStorage.removeItem(STORAGE_KEY);
        state.session = null;
        return false;
      }
      state.session.day = data.day;
      applyServerState(data.state, data.progress);
      saveCachedState();
      showGame();
      return true;
    } catch (error) {
      if (error.status === 401) {
        localStorage.removeItem(STORAGE_KEY);
        state.session = null;
      }
      return false;
    }
  }

  function saveCachedState() {
    if (!state.session) return;
    state.session.cached_state = state.serverState;
    state.session.cached_progress = state.progress;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.session));
  }

  function applyServerState(serverState, progress) {
    state.serverState = serverState;
    state.progress = progress || { attempts: 0, hint_used: false };
    saveCachedState();
  }

  function showGame() {
    joinView.classList.add("hidden");
    completeView.classList.add("hidden");
    gameView.classList.remove("hidden");
    if (state.serverState?.completed) {
      showComplete();
      return;
    }
    renderState();
    renderChallenge();
    refreshLeaderboard();
    startLeaderboardTimer();
  }

  function showComplete() {
    joinView.classList.add("hidden");
    gameView.classList.add("hidden");
    completeView.classList.remove("hidden");
    const s = state.serverState;
    el("completionSummary").textContent = `${s.team_name} opened all 16 locks with ${s.score} points and ${s.energy} energy remaining.`;
    refreshLeaderboard();
  }

  function renderState() {
    const s = state.serverState;
    if (!s) return;
    el("teamLabel").textContent = s.team_name;
    el("groupLabel").textContent = s.group_code;
    el("scoreValue").textContent = String(s.score);
    el("energyValue").textContent = `${s.energy} ⚡`;
    el("solvedValue").textContent = `${s.solved_count} / 16`;
    el("sessionDay").textContent = state.session?.day || "today";
    renderZoneMap();
  }

  function renderZoneMap() {
    const solved = state.serverState?.solved_count || 0;
    el("zoneMap").innerHTML = zones.map((zone, i) => {
      const [start, end] = zone.range;
      const zoneSolved = Math.max(0, Math.min(4, solved - start + 1));
      const active = solved < end && solved >= start - 1;
      const done = solved >= end;
      return `<div class="zone-row${active ? " active" : ""}${done ? " done" : ""}">
        <span class="zone-index">${i + 1}</span>
        <span class="zone-name">${escapeHtml(zone.name)}</span>
        <span class="zone-count">${zoneSolved}/4</span>
      </div>`;
    }).join("");
  }

  function renderChallenge() {
    const c = currentChallenge();
    el("zoneLabel").textContent = `Zone ${c.zone} · ${zones[c.zone - 1].name}`;
    el("challengeTitle").textContent = c.title;
    el("challengeNumber").textContent = String(c.no).padStart(2, "0");
    el("roleLabel").textContent = roles[c.role];
    el("instructionText").textContent = c.instruction;
    el("expressionBox").innerHTML = c.expression;
    setMessage(challengeMessage);
    hintBox.classList.add("hidden");
    hintBox.textContent = "";

    answerForm.innerHTML = c.fields.map((field) => {
      const wideClass = field.wide ? "wide" : "";
      if (field.type === "select") {
        const options = field.options.map(([value, label]) => `<option value="${escapeAttr(value)}">${escapeHtml(label)}</option>`).join("");
        return `<label class="${wideClass}" data-field-wrap="${escapeAttr(field.key)}">${escapeHtml(field.label)}<select name="${escapeAttr(field.key)}" required>${options}</select></label>`;
      }
      return `<label class="${wideClass}" data-field-wrap="${escapeAttr(field.key)}">${escapeHtml(field.label)}
        <input name="${escapeAttr(field.key)}" type="text" autocomplete="off" placeholder="${escapeAttr(field.placeholder || "")}" required />
        ${field.help ? `<span class="field-help">${escapeHtml(field.help)}</span>` : ""}
      </label>`;
    }).join("");

    const hintButton = el("hintButton");
    hintButton.textContent = state.progress?.hint_used ? "Show hint again" : "Use hint · −3 ⚡";
    renderState();
  }

  function answerObject() {
    const fd = new FormData(answerForm);
    return Object.fromEntries(fd.entries());
  }

  async function submitAnswer(event) {
    event.preventDefault();
    const c = currentChallenge();
    const payload = {
      team_id: state.session.team_id,
      team_token: state.session.team_token,
      client_event_id: crypto.randomUUID(),
      challenge_no: c.no,
      answers: answerObject(),
    };

    el("submitButton").disabled = true;
    setMessage(challengeMessage, navigator.onLine ? "Checking with the vault…" : "Saved on this device. Waiting for connection…", "pending");

    if (!navigator.onLine) {
      queuePush("submit", payload);
      el("submitButton").disabled = false;
      return;
    }

    try {
      const data = await request("submit", payload, { retries: 3 });
      handleSubmissionResult(data, c.no);
    } catch (error) {
      if (!navigator.onLine || error.name === "AbortError" || String(error.message).includes("fetch")) {
        queuePush("submit", payload);
        setMessage(challengeMessage, "Connection interrupted. Your answer is queued and will sync automatically.", "pending");
      } else if (error.code === "out_of_sequence") {
        await resumeGame();
      } else {
        setMessage(challengeMessage, "The answer could not be verified. Try again.", "error");
      }
    } finally {
      el("submitButton").disabled = false;
    }
  }

  function handleSubmissionResult(data, challengeNo) {
    markFieldStatus(data.field_status || {});
    applyServerState(data.state, data.correct ? { attempts: 0, hint_used: false } : { attempts: data.attempts, hint_used: state.progress?.hint_used || false });

    if (data.correct) {
      setMessage(challengeMessage, `Correct. +${data.awarded_points} points. Lock ${challengeNo} opened.`, "success");
      renderState();
      if (data.zone_event) showZoneEvent(data.zone_event);
      if (data.state.completed) {
        setTimeout(showComplete, data.zone_event ? 800 : 500);
      } else {
        setTimeout(() => {
          renderChallenge();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }, data.zone_event ? 1000 : 650);
      }
    } else {
      setMessage(challengeMessage, `Not yet. Attempt ${data.attempts}. Energy −5 ⚡. Check the marked fields.`, "error");
      renderState();
    }
    refreshLeaderboard();
  }

  function markFieldStatus(status) {
    for (const [key, correct] of Object.entries(status)) {
      const wrap = answerForm.querySelector(`[data-field-wrap="${CSS.escape(key)}"]`);
      if (!wrap) continue;
      wrap.classList.remove("field-ok", "field-bad");
      wrap.classList.add(correct ? "field-ok" : "field-bad");
    }
  }

  async function requestHint() {
    const c = currentChallenge();
    const payload = {
      team_id: state.session.team_id,
      team_token: state.session.team_token,
      client_event_id: crypto.randomUUID(),
      challenge_no: c.no,
    };

    el("hintButton").disabled = true;
    if (!navigator.onLine) {
      queuePush("hint", payload);
      hintBox.textContent = "Hint request saved. It will appear once the connection returns.";
      hintBox.classList.remove("hidden");
      el("hintButton").disabled = false;
      return;
    }

    try {
      const data = await request("hint", payload, { retries: 3 });
      applyServerState(data.state, { attempts: state.progress?.attempts || 0, hint_used: true });
      hintBox.textContent = data.hint;
      hintBox.classList.remove("hidden");
      el("hintButton").textContent = "Show hint again";
      renderState();
    } catch {
      setMessage(challengeMessage, "Hint could not be loaded. Try again in a moment.", "error");
    } finally {
      el("hintButton").disabled = false;
    }
  }

  function showZoneEvent(event) {
    const modal = el("eventModal");
    const iconMap = { vault_bonus: "💎", power_cell: "⚡", lucky_cache: "🎁" };
    el("eventIcon").textContent = iconMap[event.type] || "✨";
    el("eventTitle").textContent = event.label || "Zone bonus";
    const parts = [];
    if (event.score_delta) parts.push(`+${event.score_delta} score`);
    if (event.energy_delta) parts.push(`+${event.energy_delta} energy`);
    el("eventText").textContent = `${parts.join(" · ")}. Your team cleared a full zone.`;
    modal.classList.remove("hidden");
  }

  async function refreshLeaderboard() {
    if (!navigator.onLine) return;
    try {
      const data = await request("leaderboard", {}, { retries: 1 });
      state.leaderboard = data.leaderboard || [];
      renderLeaderboard();
      if (data.day) el("sessionDay").textContent = data.day;
    } catch {
      // Keep the last known leaderboard instead of flashing an error.
    }
  }

  function renderLeaderboard() {
    const list = el("leaderboardList");
    if (!state.leaderboard.length) {
      list.innerHTML = `<li class="leaderboard-item"><span class="rank">—</span><div class="leaderboard-name"><strong>No teams yet</strong><span>Be the first to enter.</span></div><div class="leaderboard-score">0<span>points</span></div></li>`;
      return;
    }
    list.innerHTML = state.leaderboard.map((team, i) => `<li class="leaderboard-item">
      <span class="rank">${i + 1}</span>
      <div class="leaderboard-name"><strong>${escapeHtml(team.team_name)}</strong><span>${escapeHtml(team.group_code)} · ${team.solved_count}/16 solved · ${team.energy} ⚡</span></div>
      <div class="leaderboard-score">${team.score}<span>points</span></div>
    </li>`).join("");
  }

  function startLeaderboardTimer() {
    clearInterval(state.leaderboardTimer);
    state.leaderboardTimer = setInterval(refreshLeaderboard, 15000);
  }

  async function flushQueue() {
    if (state.flushInProgress || !navigator.onLine || !state.session?.team_id) return;
    state.flushInProgress = true;
    try {
      let queue = queueLoad();
      while (queue.length && navigator.onLine) {
        const item = queue[0];
        try {
          const data = await request(item.action, item.payload, { retries: 3 });
          queue.shift();
          queueSave(queue);
          if (item.action === "submit") handleSubmissionResult(data, item.payload.challenge_no);
          if (item.action === "hint") {
            applyServerState(data.state, { attempts: state.progress?.attempts || 0, hint_used: true });
            hintBox.textContent = data.hint;
            hintBox.classList.remove("hidden");
            renderState();
          }
        } catch (error) {
          if (error.code === "out_of_sequence" || error.code === "game_completed") {
            queue.shift();
            queueSave(queue);
            await resumeGame();
            continue;
          }
          break;
        }
      }
    } finally {
      state.flushInProgress = false;
    }
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[ch]));
  }

  function escapeAttr(value) { return escapeHtml(value).replace(/'/g, "&#39;"); }

  function registerServiceWorker() {
    if ("serviceWorker" in navigator && location.protocol === "https:") {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    }
  }

  async function init() {
    setNetworkStatus();
    registerServiceWorker();
    el("joinForm").addEventListener("submit", joinGame);
    answerForm.addEventListener("submit", submitAnswer);
    el("hintButton").addEventListener("click", requestHint);
    el("leaderboardButton").addEventListener("click", refreshLeaderboard);
    el("completionLeaderboardButton").addEventListener("click", () => {
      completeView.classList.add("hidden");
      gameView.classList.remove("hidden");
      refreshLeaderboard();
    });
    el("eventClose").addEventListener("click", () => el("eventModal").classList.add("hidden"));

    window.addEventListener("online", async () => {
      setNetworkStatus();
      await flushQueue();
      refreshLeaderboard();
    });
    window.addEventListener("offline", setNetworkStatus);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        setNetworkStatus();
        flushQueue();
        refreshLeaderboard();
      }
    });

    const resumed = await resumeGame();
    if (!resumed) {
      joinView.classList.remove("hidden");
      gameView.classList.add("hidden");
      completeView.classList.add("hidden");
      refreshLeaderboard();
    } else {
      await flushQueue();
    }
  }

  init();
})();
