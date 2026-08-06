import { defineComponent as U, computed as $, openBlock as m, createElementBlock as h, createElementVNode as d, toDisplayString as v, createTextVNode as S, Fragment as k, createCommentVNode as _, renderList as M, normalizeStyle as O, ref as E, withDirectives as z, vModelText as B, unref as x, normalizeClass as F, shallowRef as ee, watch as te, onBeforeUnmount as ne } from "vue";
const se = `
.ev-page { padding: 1rem 1.25rem 2rem; color: var(--color-content); }
.ev-head { display: flex; align-items: baseline; gap: 0.75rem; flex-wrap: wrap; }
.ev-title { font-size: 1.05rem; font-weight: 600; }
.ev-muted { color: var(--color-muted); }
.ev-small { font-size: 0.75rem; }
.ev-stats { display: flex; gap: 1.75rem; flex-wrap: wrap; margin: 1rem 0 1.25rem; }
.ev-stat-value { font-size: 1.35rem; font-weight: 600; font-variant-numeric: tabular-nums; line-height: 1.2; }
.ev-stat-label { font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-muted); }
.ev-toolbar { display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; margin-bottom: 0.75rem; }
.ev-input {
    border: 1px solid var(--color-line); background: transparent; color: inherit;
    border-radius: 0.375rem; padding: 0.35rem 0.6rem; font: inherit; min-width: 12rem;
}
.ev-input:focus { outline: 2px solid color-mix(in srgb, var(--color-content) 35%, transparent); outline-offset: 1px; }
.ev-scroll { overflow: auto; max-height: calc(100vh - 14rem); border: 1px solid var(--color-line); border-radius: 0.5rem; }
.ev-table { border-collapse: collapse; width: 100%; font-variant-numeric: tabular-nums; font-size: 0.85rem; }
.ev-table th {
    position: sticky; top: 0; z-index: 1; background: var(--color-card); text-align: left; white-space: nowrap;
    padding: 0.45rem 0.7rem; border-bottom: 1px solid var(--color-line); cursor: pointer; user-select: none;
}
.ev-table th:hover { color: var(--color-content); }
.ev-table td { padding: 0.35rem 0.7rem; border-bottom: 1px solid color-mix(in srgb, var(--color-line) 60%, transparent); }
.ev-table tbody tr:hover { background: color-mix(in srgb, var(--color-content) 6%, transparent); }
.ev-num { text-align: right; }
.ev-day { margin-top: 1.25rem; font-weight: 600; font-size: 0.8rem; letter-spacing: 0.03em; text-transform: uppercase; color: var(--color-muted); }
/* Wide enough for a 12-hour range with both meridiems ("09:00 AM – 09:30 AM"), which is the longest a time
 * column gets and what it wrapped to two lines at 7rem. */
.ev-event { display: grid; grid-template-columns: 9rem 1fr; gap: 0.75rem; padding: 0.5rem 0; border-bottom: 1px solid color-mix(in srgb, var(--color-line) 60%, transparent); }
.ev-cue { display: grid; grid-template-columns: 10rem 1fr; gap: 0.75rem; padding: 0.35rem 0; border-bottom: 1px solid color-mix(in srgb, var(--color-line) 60%, transparent); }
.ev-cue:hover { background: color-mix(in srgb, var(--color-content) 5%, transparent); }
.ev-mark { background: color-mix(in srgb, orange 45%, transparent); border-radius: 0.15rem; }
.ev-specimen { border: 1px solid var(--color-line); border-radius: 0.5rem; padding: 1rem 1.25rem; margin-bottom: 0.75rem; }
.ev-track { display: flex; gap: 2rem; flex-wrap: wrap; align-items: flex-start; }
.ev-note { color: var(--color-muted); font-size: 0.8rem; margin-top: 1rem; }
/* A font's embedded licence is often the entire GPL. It belongs on the page — it is the one place a person
 * finds out what they may do with the file — but not as twelve lines under the specimen; the full text is one
 * hover away. */
.ev-license { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
`, oe = () => {
  const t = document.createElement("style");
  return t.dataset.owner = "intentic.everyday-viewers", t.textContent = se, document.head.append(t), { dispose: () => t.remove() };
}, an = (t, s) => {
  s.subscriptions.push(
    oe(),
    t.viewers.register({ id: "calendar", component: async () => (await Promise.resolve().then(() => Ne)).default }),
    t.viewers.register({ id: "table", component: async () => (await Promise.resolve().then(() => Ke)).default }),
    t.viewers.register({ id: "track", component: async () => (await Promise.resolve().then(() => Lt)).default }),
    t.viewers.register({ id: "subtitles", component: async () => (await Promise.resolve().then(() => zt)).default }),
    t.viewers.register({ id: "font", component: async () => (await Promise.resolve().then(() => sn)).default })
  );
}, Y = (t) => {
  const s = Math.max(0, Math.floor(t)), e = Math.floor(s / 3600), o = Math.floor(s % 3600 / 60), n = s % 60, c = `${String(o).padStart(2, "0")}:${String(n).padStart(2, "0")}`;
  return e > 0 ? `${e}:${c}` : c;
}, Q = (t) => {
  const s = Math.max(0, Math.round(t));
  if (s < 90)
    return `${s} s`;
  const e = Math.round(s / 60);
  return e < 90 ? `${e} min` : `${Math.floor(e / 60)} h ${String(e % 60).padStart(2, "0")} min`;
}, q = (t) => t >= 1e3 ? `${(t / 1e3).toFixed(t >= 1e4 ? 1 : 2)} km` : `${Math.round(t)} m`, N = (t) => t.toLocaleString(), X = (t) => new Date(Date.UTC(t.year, t.month - 1, t.day, t.hour ?? 0, t.minute ?? 0)), ae = (t) => X(t).toLocaleDateString(void 0, { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }), H = (t) => t.hour === void 0 ? "All day" : X(t).toLocaleTimeString(void 0, { hour: "2-digit", minute: "2-digit", timeZone: "UTC" }), re = (t) => `${t.year}-${String(t.month).padStart(2, "0")}-${String(t.day).padStart(2, "0")}`, ie = (t) => {
  if (t < 1024)
    return `${t} B`;
  const s = ["kB", "MB", "GB"];
  let e = t / 1024, o = 0;
  for (; e >= 1024 && o < s.length - 1; )
    e /= 1024, o += 1;
  return `${e.toFixed(e >= 10 ? 0 : 1)} ${s[o]}`;
}, le = (t) => {
  const s = [];
  for (const e of t.replace(/\r\n?/g, `
`).split(`
`)) {
    if ((e.startsWith(" ") || e.startsWith("	")) && s.length > 0) {
      s[s.length - 1] += e.slice(1);
      continue;
    }
    s.push(e);
  }
  return s;
}, A = (t) => t.replace(/\\([\\;,nN])/g, (s, e) => e === "n" || e === "N" ? `
` : e), ce = (t) => {
  let s = !1, e = -1;
  for (let a = 0; a < t.length; a += 1) {
    const i = t[a];
    if (i === '"')
      s = !s;
    else if (i === ":" && !s) {
      e = a;
      break;
    }
  }
  if (e < 0)
    return;
  const o = t.slice(0, e), n = t.slice(e + 1), [c, ...r] = o.split(";"), l = {};
  for (const a of r) {
    const i = a.indexOf("=");
    i > 0 && (l[a.slice(0, i).toUpperCase()] = a.slice(i + 1).replace(/^"|"$/g, ""));
  }
  return { name: (c ?? "").toUpperCase(), params: l, value: n };
}, P = (t, s = {}) => {
  const e = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?(Z)?)?$/.exec(t.trim());
  if (e === null)
    return;
  const [, o, n, c, r, l, , a] = e, i = a === "Z";
  return {
    year: Number(o),
    month: Number(n),
    day: Number(c),
    hour: r === void 0 ? void 0 : Number(r),
    minute: l === void 0 ? void 0 : Number(l),
    zone: i ? "UTC" : s.TZID,
    utc: i
  };
}, ue = {
  MO: "Mon",
  TU: "Tue",
  WE: "Wed",
  TH: "Thu",
  FR: "Fri",
  SA: "Sat",
  SU: "Sun"
}, de = {
  DAILY: { one: "daily", many: "days" },
  WEEKLY: { one: "weekly", many: "weeks" },
  MONTHLY: { one: "monthly", many: "months" },
  YEARLY: { one: "yearly", many: "years" },
  HOURLY: { one: "hourly", many: "hours" },
  MINUTELY: { one: "every minute", many: "minutes" }
}, ve = (t) => {
  const s = /* @__PURE__ */ new Map();
  for (const a of t.split(";")) {
    const i = a.indexOf("=");
    i > 0 && s.set(a.slice(0, i).toUpperCase(), a.slice(i + 1));
  }
  const e = de[(s.get("FREQ") ?? "").toUpperCase()], o = Number(s.get("INTERVAL") ?? "1"), n = ["Repeats"];
  e === void 0 ? n.push("on a schedule this viewer doesn't recognise") : o > 1 ? n.push(`every ${o} ${e.many}`) : n.push(e.one);
  const c = s.get("BYDAY");
  if (c !== void 0 && c !== "") {
    const a = c.split(",").map((i) => ue[i.slice(-2).toUpperCase()] ?? i).join(", ");
    n.push(`on ${a}`);
  }
  const r = s.get("COUNT"), l = s.get("UNTIL");
  if (r !== void 0)
    n.push(`· ${r} times`);
  else if (l !== void 0) {
    const a = P(l);
    n.push(a === void 0 ? `· until ${l}` : `· until ${a.year}-${String(a.month).padStart(2, "0")}-${String(a.day).padStart(2, "0")}`);
  }
  return n.join(" ");
}, me = (t) => {
  const s = [], e = [];
  let o, n;
  for (const c of le(t)) {
    const r = ce(c);
    if (r !== void 0) {
      if (r.name === "BEGIN") {
        r.value.toUpperCase() === "VEVENT" ? n = {} : ["VCALENDAR", "VTIMEZONE", "STANDARD", "DAYLIGHT", "VALARM"].includes(r.value.toUpperCase()) || e.push(r.value.toUpperCase());
        continue;
      }
      if (r.name === "END") {
        r.value.toUpperCase() === "VEVENT" && n?.start !== void 0 && s.push({
          summary: n.summary ?? "(no title)",
          start: n.start,
          end: n.end,
          allDay: n.allDay === !0,
          location: n.location,
          description: n.description,
          repeats: n.repeats,
          status: n.status
        }), r.value.toUpperCase() === "VEVENT" && (n = void 0);
        continue;
      }
      if (n === void 0) {
        r.name === "X-WR-CALNAME" && (o = A(r.value));
        continue;
      }
      switch (r.name) {
        case "SUMMARY":
          n.summary = A(r.value);
          break;
        case "DTSTART": {
          const l = P(r.value, r.params);
          l !== void 0 && (n.start = l, n.allDay = r.params.VALUE === "DATE" || l.hour === void 0);
          break;
        }
        case "DTEND":
        case "DUE": {
          const l = P(r.value, r.params);
          l !== void 0 && (n.end = l);
          break;
        }
        case "LOCATION":
          n.location = A(r.value);
          break;
        case "DESCRIPTION":
          n.description = A(r.value);
          break;
        case "RRULE":
          n.repeats = ve(r.value);
          break;
        case "STATUS":
          n.status = r.value.toUpperCase();
          break;
      }
    }
  }
  return { name: o, events: he(s), otherComponents: [...new Set(e)] };
}, he = (t) => [...t].sort((s, e) => W(s.start) - W(e.start)), W = (t) => t.year * 1e8 + t.month * 1e6 + t.day * 1e4 + (t.hour ?? 0) * 100 + (t.minute ?? 0), pe = { class: "ev-page" }, fe = { class: "ev-head" }, ge = { class: "ev-title" }, be = { class: "ev-muted ev-small" }, ye = {
  key: 0,
  class: "ui-card ui-card-dashed",
  style: { marginTop: "1rem" }
}, _e = { class: "ev-muted" }, we = { class: "ev-day" }, $e = { class: "ev-muted ev-small" }, xe = {
  key: 0,
  class: "ev-muted ev-small"
}, ke = {
  key: 1,
  class: "ev-muted ev-small"
}, Se = {
  key: 2,
  class: "ev-muted ev-small"
}, Me = {
  key: 3,
  class: "ev-muted ev-small",
  style: { whiteSpace: "pre-wrap", marginTop: "0.25rem" }
}, Te = /* @__PURE__ */ U({
  __name: "CalendarViewer",
  props: {
    path: {},
    text: {}
  },
  setup(t) {
    const s = t, e = $(() => me(s.text)), o = $(() => {
      const l = /* @__PURE__ */ new Map();
      for (const a of e.value.events) {
        const i = re(a.start), u = l.get(i);
        if (u === void 0) {
          l.set(i, [a]);
          continue;
        }
        u.push(a);
      }
      return [...l.entries()].map(([a, i]) => ({ key: a, label: ae(i[0].start), events: i }));
    }), n = $(() => s.path.slice(s.path.lastIndexOf("/") + 1)), c = (l) => {
      const a = H(l.start);
      if (l.allDay || l.end === void 0)
        return a;
      const i = H(l.end);
      return i === a ? a : `${a} – ${i}`;
    }, r = (l) => l.start.zone === void 0 || l.allDay ? void 0 : l.start.zone;
    return (l, a) => (m(), h("div", pe, [
      d("div", fe, [
        d("span", ge, v(e.value.name ?? n.value), 1),
        d("span", be, [
          S(v(e.value.events.length) + " event" + v(e.value.events.length === 1 ? "" : "s") + " ", 1),
          o.value.length > 1 ? (m(), h(k, { key: 0 }, [
            S(" · " + v(o.value.length) + " days", 1)
          ], 64)) : _("", !0)
        ])
      ]),
      e.value.events.length === 0 ? (m(), h("div", ye, [
        d("p", _e, [
          a[0] || (a[0] = S(" No events in this file. ", -1)),
          e.value.otherComponents.length > 0 ? (m(), h(k, { key: 0 }, [
            S(" It holds " + v(e.value.otherComponents.join(", ")) + " entries, which this viewer doesn't render. ", 1)
          ], 64)) : _("", !0)
        ])
      ])) : _("", !0),
      (m(!0), h(k, null, M(o.value, (i) => (m(), h(k, {
        key: i.key
      }, [
        d("div", we, v(i.label), 1),
        (m(!0), h(k, null, M(i.events, (u, p) => (m(), h("div", {
          key: `${i.key}-${p}`,
          class: "ev-event"
        }, [
          d("div", $e, v(c(u)), 1),
          d("div", null, [
            d("div", {
              style: O({ textDecoration: u.status === "CANCELLED" ? "line-through" : void 0 })
            }, v(u.summary), 5),
            u.location ? (m(), h("div", xe, v(u.location), 1)) : _("", !0),
            r(u) ? (m(), h("div", ke, "Times as written in the file (" + v(r(u)) + ")", 1)) : _("", !0),
            u.repeats ? (m(), h("div", Se, v(u.repeats), 1)) : _("", !0),
            u.description ? (m(), h("div", Me, v(u.description), 1)) : _("", !0)
          ])
        ]))), 128))
      ], 64))), 128))
    ]));
  }
}), Ne = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Te
}, Symbol.toStringTag, { value: "Module" })), Ee = [",", "	", ";", "|"], Ce = (t) => {
  const s = Le(t);
  let e = ",", o = 0;
  for (const n of Ee) {
    const c = Ue(s, n);
    c > o && (e = n, o = c);
  }
  return e;
}, Le = (t) => {
  let s = !1;
  for (let e = 0; e < t.length; e += 1) {
    const o = t[e];
    if (o === '"')
      s = !s;
    else if (o === `
` && !s)
      return t.slice(0, e);
  }
  return t;
}, Ue = (t, s) => {
  let e = !1, o = 0;
  for (const n of t)
    n === '"' ? e = !e : n === s && !e && (o += 1);
  return o;
}, De = (t, s) => {
  const e = [];
  let o = [], n = "", c = !1, r = 0;
  const l = t.replace(/\r\n?/g, `
`);
  for (; r < l.length; ) {
    const a = l[r];
    if (c) {
      if (a === '"') {
        if (l[r + 1] === '"') {
          n += '"', r += 2;
          continue;
        }
        c = !1, r += 1;
        continue;
      }
      n += a, r += 1;
      continue;
    }
    if (a === '"' && n === "") {
      c = !0, r += 1;
      continue;
    }
    if (a === s) {
      o.push(n), n = "", r += 1;
      continue;
    }
    if (a === `
`) {
      o.push(n), e.push(o), o = [], n = "", r += 1;
      continue;
    }
    n += a, r += 1;
  }
  return (n !== "" || o.length > 0) && (o.push(n), e.push(o)), e.filter((a) => a.length > 1 || (a[0] ?? "").trim() !== "");
}, I = (t) => {
  const s = t.trim();
  if (s === "")
    return;
  const e = s.replace(/^[-+]?[$€£¥]\s?/, (n) => n.replace(/[$€£¥\s]/g, "")).replace(/,(?=\d{3}\b)/g, ""), o = Number(e.replace(/%$/, ""));
  return Number.isFinite(o) ? o : void 0;
}, Ae = (t) => {
  const s = Ce(t), e = De(t, s), [o, ...n] = e, c = (o ?? []).map((i, u) => i.trim() === "" ? `Column ${u + 1}` : i.trim()), r = Math.max(c.length, ...n.map((i) => i.length), 0), l = n.map((i) => i.length === r ? i : [...i, ...Array(r - i.length).fill("")]), a = Array.from({ length: r }, (i, u) => {
    const p = l.map((f) => f[u] ?? "").filter((f) => f.trim() !== "");
    return p.length > 0 && p.every((f) => I(f) !== void 0);
  });
  return {
    columns: c.length === r ? c : [...c, ...Array.from({ length: r - c.length }, (i, u) => `Column ${c.length + u + 1}`)],
    rows: l,
    delimiter: s,
    numeric: a
  };
}, Ie = (t, s) => {
  const e = t.map((n) => I(n[s] ?? "")).filter((n) => n !== void 0);
  if (e.length === 0)
    return;
  const o = e.reduce((n, c) => n + c, 0);
  return { min: Math.min(...e), max: Math.max(...e), sum: o, mean: o / e.length, filled: e.length };
}, Re = { class: "ev-page" }, Ve = { class: "ev-toolbar" }, Oe = { class: "ev-muted ev-small" }, Fe = {
  key: 0,
  class: "ui-card ui-card-dashed"
}, Pe = {
  key: 1,
  class: "ev-scroll"
}, ze = { class: "ev-table" }, Be = ["title", "onClick"], je = {
  key: 2,
  class: "ev-note"
}, Ye = {
  key: 3,
  class: "ev-stats"
}, qe = { class: "ev-stat-value" }, He = { class: "ev-stat-label" }, We = { class: "ev-muted ev-small" }, Ze = 1e3, Ge = /* @__PURE__ */ U({
  __name: "TableViewer",
  props: {
    path: {},
    text: {}
  },
  setup(t) {
    const s = t, e = $(() => Ae(s.text)), o = E(""), n = E(void 0), c = E(!1), r = $(() => {
      const g = o.value.trim().toLowerCase();
      return g === "" ? e.value.rows : e.value.rows.filter((w) => w.some((y) => y.toLowerCase().includes(g)));
    }), l = $(() => {
      const g = n.value;
      if (g === void 0)
        return r.value;
      const w = e.value.numeric[g] === !0, y = c.value ? -1 : 1;
      return [...r.value].sort((T, D) => {
        const C = T[g] ?? "", j = D[g] ?? "";
        return w ? ((I(C) ?? 0) - (I(j) ?? 0)) * y : C.localeCompare(j, void 0, { numeric: !0, sensitivity: "base" }) * y;
      });
    }), a = $(() => l.value.slice(0, Ze)), i = (g) => {
      if (n.value !== g) {
        n.value = g, c.value = !1;
        return;
      }
      if (!c.value) {
        c.value = !0;
        return;
      }
      n.value = void 0, c.value = !1;
    }, u = (g) => n.value === g ? c.value ? " ↓" : " ↑" : "", p = $(
      () => e.value.columns.map((g, w) => ({ name: g, column: w, stats: e.value.numeric[w] === !0 ? Ie(r.value, w) : void 0 })).filter((g) => g.stats !== void 0)
    ), f = $(() => ({ ",": "comma", "	": "tab", ";": "semicolon", "|": "pipe" })[e.value.delimiter] ?? "comma"), b = (g) => Number.isInteger(g) ? g.toLocaleString() : g.toLocaleString(void 0, { maximumFractionDigits: 2 });
    return (g, w) => (m(), h("div", Re, [
      d("div", Ve, [
        z(d("input", {
          "onUpdate:modelValue": w[0] || (w[0] = (y) => o.value = y),
          class: "ev-input",
          type: "search",
          placeholder: "Filter rows…",
          "aria-label": "Filter rows"
        }, null, 512), [
          [B, o.value]
        ]),
        d("span", Oe, v(x(N)(r.value.length)) + " of " + v(x(N)(e.value.rows.length)) + " rows · " + v(e.value.columns.length) + " columns · " + v(f.value) + "-separated ", 1)
      ]),
      e.value.rows.length === 0 ? (m(), h("div", Fe, [...w[1] || (w[1] = [
        d("p", { class: "ev-muted" }, "This file has a header row and nothing under it.", -1)
      ])])) : (m(), h("div", Pe, [
        d("table", ze, [
          d("thead", null, [
            d("tr", null, [
              (m(!0), h(k, null, M(e.value.columns, (y, T) => (m(), h("th", {
                key: T,
                class: F({ "ev-num": e.value.numeric[T] }),
                title: `Sort by ${y}`,
                onClick: (D) => i(T)
              }, v(y) + v(u(T)), 11, Be))), 128))
            ])
          ]),
          d("tbody", null, [
            (m(!0), h(k, null, M(a.value, (y, T) => (m(), h("tr", { key: T }, [
              (m(!0), h(k, null, M(y, (D, C) => (m(), h("td", {
                key: C,
                class: F({ "ev-num": e.value.numeric[C] })
              }, v(D), 3))), 128))
            ]))), 128))
          ])
        ])
      ])),
      l.value.length > a.value.length ? (m(), h("p", je, " Showing the first " + v(x(N)(a.value.length)) + " rows of " + v(x(N)(l.value.length)) + " — narrow it with the filter. ", 1)) : _("", !0),
      p.value.length > 0 ? (m(), h("div", Ye, [
        (m(!0), h(k, null, M(p.value, (y) => (m(), h("div", {
          key: y.column
        }, [
          d("div", qe, v(b(y.stats.sum)), 1),
          d("div", He, v(y.name) + " · sum", 1),
          d("div", We, " min " + v(b(y.stats.min)) + " · max " + v(b(y.stats.max)) + " · mean " + v(b(y.stats.mean)), 1)
        ]))), 128))
      ])) : _("", !0)
    ]));
  }
}), Ke = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Ge
}, Symbol.toStringTag, { value: "Module" })), R = (t, s) => {
  const e = new RegExp(`${s}\\s*=\\s*"([^"]+)"`).exec(t), o = e === null ? Number.NaN : Number(e[1]);
  return Number.isFinite(o) ? o : void 0;
}, V = (t, s) => {
  const e = new RegExp(`<${s}[^>]*>([\\s\\S]*?)</${s}>`).exec(t);
  return e === null ? void 0 : e[1]?.trim();
}, Z = (t, s) => {
  const e = [], o = new RegExp(`<${s}\\b([^>]*)(?:/>|>([\\s\\S]*?)</${s}>)`, "g");
  for (const n of t.matchAll(o)) {
    const [, c = "", r = ""] = n, l = R(c, "lat"), a = R(c, "lon");
    if (l === void 0 || a === void 0)
      continue;
    const i = Number(V(r, "ele")), u = V(r, "time"), p = u === void 0 ? Number.NaN : Date.parse(u);
    e.push({
      lat: l,
      lon: a,
      ele: Number.isFinite(i) ? i : void 0,
      at: Number.isFinite(p) ? p : void 0
    });
  }
  return e;
}, Qe = 63710088e-1, L = (t) => t * Math.PI / 180, J = (t, s) => {
  const e = L(s.lat - t.lat), o = L(s.lon - t.lon), n = Math.sin(e / 2) ** 2 + Math.cos(L(t.lat)) * Math.cos(L(s.lat)) * Math.sin(o / 2) ** 2;
  return 2 * Qe * Math.asin(Math.min(1, Math.sqrt(n)));
}, Xe = 3, Je = (t) => {
  let s = 0, e = 0, o;
  for (const n of t) {
    if (n.ele === void 0)
      continue;
    if (o === void 0) {
      o = n.ele;
      continue;
    }
    const c = n.ele - o;
    Math.abs(c) < Xe || (c > 0 ? s += c : e -= c, o = n.ele);
  }
  return { ascent: s, descent: e };
}, et = (t) => {
  const s = Z(t, "trkpt"), e = s.length > 0 ? s : Z(t, "rtept"), o = [...t.matchAll(/<wpt\b([^>]*)(?:\/>|>([\s\S]*?)<\/wpt>)/g)].flatMap((u) => {
    const [, p = "", f = ""] = u, b = R(p, "lat"), g = R(p, "lon");
    return b === void 0 || g === void 0 ? [] : [{ lat: b, lon: g, name: V(f, "name") }];
  });
  let n = 0;
  for (let u = 1; u < e.length; u += 1)
    n += J(e[u - 1], e[u]);
  const { ascent: c, descent: r } = Je(e), l = e.map((u) => u.at).filter((u) => u !== void 0), a = e.map((u) => u.lat), i = e.map((u) => u.lon);
  return {
    // <name> appears in <metadata>, <trk> and each <wpt>; the first is the track's own in every exporter.
    name: V(t, "name"),
    points: e,
    distanceMeters: n,
    ascentMeters: c,
    descentMeters: r,
    durationSeconds: l.length > 1 ? (Math.max(...l) - Math.min(...l)) / 1e3 : void 0,
    bounds: e.length === 0 ? void 0 : { minLat: Math.min(...a), maxLat: Math.max(...a), minLon: Math.min(...i), maxLon: Math.max(...i) },
    waypoints: o
  };
}, tt = (t, s, e) => {
  const { bounds: o, points: n } = t;
  if (o === void 0 || n.length < 2)
    return { path: "", width: s, height: s };
  const c = (o.minLat + o.maxLat) / 2, r = Math.cos(L(c)), l = Math.max((o.maxLon - o.minLon) * r, 1e-9), a = Math.max(o.maxLat - o.minLat, 1e-9), i = (s - e * 2) / Math.max(l, a), u = l * i + e * 2, p = a * i + e * 2;
  return { path: n.map((b, g) => {
    const w = e + (b.lon - o.minLon) * r * i, y = e + (o.maxLat - b.lat) * i;
    return `${g === 0 ? "M" : "L"}${w.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" "), width: u, height: p };
}, nt = (t, s, e) => {
  const o = t.points.filter((a) => a.ele !== void 0);
  if (o.length < 2 || t.distanceMeters <= 0)
    return "";
  const n = o.map((a) => a.ele), c = Math.min(...n), r = Math.max(Math.max(...n) - c, 1);
  let l = 0;
  return o.map((a, i) => {
    i > 0 && (l += J(o[i - 1], a));
    const u = l / t.distanceMeters * s, p = e - (a.ele - c) / r * e;
    return `${i === 0 ? "M" : "L"}${u.toFixed(1)} ${p.toFixed(1)}`;
  }).join(" ");
}, st = { class: "ev-page" }, ot = { class: "ev-head" }, at = { class: "ev-title" }, rt = { class: "ev-muted ev-small" }, it = {
  key: 0,
  class: "ui-card ui-card-dashed",
  style: { marginTop: "1rem" }
}, lt = { class: "ev-stats" }, ct = { class: "ev-stat-value" }, ut = { key: 0 }, dt = { class: "ev-stat-value" }, vt = { key: 1 }, mt = { class: "ev-stat-value" }, ht = { class: "ev-stat-label" }, pt = { key: 2 }, ft = { class: "ev-stat-value" }, gt = { class: "ev-stat-label" }, bt = { key: 3 }, yt = { class: "ev-stat-value" }, _t = { class: "ev-track" }, wt = ["viewBox", "width", "height", "aria-label"], $t = ["d"], xt = { key: 0 }, kt = ["viewBox", "width", "height"], St = ["d"], Mt = ["d"], Tt = {
  key: 0,
  class: "ev-note"
}, Nt = 420, Et = 12, Ct = /* @__PURE__ */ U({
  __name: "TrackViewer",
  props: {
    path: {},
    text: {}
  },
  setup(t) {
    const s = t, e = { width: 420, height: 70 }, o = $(() => et(s.text)), n = $(() => tt(o.value, Nt, Et)), c = $(() => nt(o.value, e.width, e.height)), r = $(() => s.path.slice(s.path.lastIndexOf("/") + 1)), l = $(() => {
      const { distanceMeters: i, durationSeconds: u } = o.value;
      if (u === void 0 || u <= 0 || i <= 0)
        return;
      const p = u / (i / 1e3), f = Math.floor(p / 60), b = Math.round(p % 60);
      return {
        perKm: `${f}:${String(b).padStart(2, "0")} /km`,
        kmh: `${(i / 1e3 / (u / 3600)).toFixed(1)} km/h`
      };
    }), a = $(() => o.value.points.map((i) => i.ele).filter((i) => i !== void 0));
    return (i, u) => (m(), h("div", st, [
      d("div", ot, [
        d("span", at, v(o.value.name ?? r.value), 1),
        d("span", rt, v(x(N)(o.value.points.length)) + " points", 1)
      ]),
      o.value.points.length < 2 ? (m(), h("div", it, [...u[0] || (u[0] = [
        d("p", { class: "ev-muted" }, "No track points in this file — it may hold only waypoints, or be a route this viewer can't read.", -1)
      ])])) : (m(), h(k, { key: 1 }, [
        d("div", lt, [
          d("div", null, [
            d("div", ct, v(x(q)(o.value.distanceMeters)), 1),
            u[1] || (u[1] = d("div", { class: "ev-stat-label" }, "Distance", -1))
          ]),
          o.value.durationSeconds !== void 0 ? (m(), h("div", ut, [
            d("div", dt, v(x(Q)(o.value.durationSeconds)), 1),
            u[2] || (u[2] = d("div", { class: "ev-stat-label" }, "Elapsed", -1))
          ])) : _("", !0),
          l.value ? (m(), h("div", vt, [
            d("div", mt, v(l.value.perKm), 1),
            d("div", ht, v(l.value.kmh), 1)
          ])) : _("", !0),
          a.value.length > 0 ? (m(), h("div", pt, [
            d("div", ft, v(Math.round(o.value.ascentMeters)) + " m", 1),
            d("div", gt, "Ascent · " + v(Math.round(o.value.descentMeters)) + " m down", 1)
          ])) : _("", !0),
          a.value.length > 0 ? (m(), h("div", bt, [
            d("div", yt, v(Math.round(Math.max(...a.value))) + " m", 1),
            u[3] || (u[3] = d("div", { class: "ev-stat-label" }, "Highest", -1))
          ])) : _("", !0)
        ]),
        d("div", _t, [
          (m(), h("svg", {
            viewBox: `0 0 ${n.value.width} ${n.value.height}`,
            width: n.value.width,
            height: n.value.height,
            role: "img",
            "aria-label": `The recorded route, ${x(q)(o.value.distanceMeters)} long`
          }, [
            d("path", {
              d: n.value.path,
              fill: "none",
              stroke: "currentColor",
              "stroke-width": "2.5",
              "stroke-linejoin": "round",
              "stroke-linecap": "round"
            }, null, 8, $t)
          ], 8, wt)),
          c.value !== "" ? (m(), h("div", xt, [
            (m(), h("svg", {
              viewBox: `0 0 ${e.width} ${e.height}`,
              width: e.width,
              height: e.height,
              role: "img",
              "aria-label": "Elevation profile"
            }, [
              d("path", {
                d: `${c.value} L ${e.width} ${e.height} L 0 ${e.height} Z`,
                fill: "currentColor",
                opacity: "0.12"
              }, null, 8, St),
              d("path", {
                d: c.value,
                fill: "none",
                stroke: "currentColor",
                "stroke-width": "1.5"
              }, null, 8, Mt)
            ], 8, kt)),
            u[4] || (u[4] = d("div", { class: "ev-stat-label" }, "Elevation over distance", -1))
          ])) : _("", !0)
        ]),
        o.value.waypoints.length > 0 ? (m(), h("p", Tt, v(o.value.waypoints.length) + " waypoint" + v(o.value.waypoints.length === 1 ? "" : "s") + ": " + v(o.value.waypoints.map((p) => p.name).filter(Boolean).join(", ") || "unnamed"), 1)) : _("", !0),
        u[5] || (u[5] = d("p", { class: "ev-note" }, "No basemap by design — the shape is drawn from the file alone, so nothing here reaches a tile server.", -1))
      ], 64))
    ]));
  }
}), Lt = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Ct
}, Symbol.toStringTag, { value: "Module" })), G = (t) => {
  const s = /^(?:(\d+):)?(\d{1,2}):(\d{2})(?:[.,](\d{1,3}))?$/.exec(t.trim());
  if (s === null)
    return;
  const [, e, o, n, c] = s;
  return Number(e ?? 0) * 3600 + Number(o) * 60 + Number(n) + +`0.${c ?? "0"}`;
}, K = /^(.+?)\s*-->\s*(\S+)/, Ut = (t) => t.replace(/<[^>]*>/g, "").replace(/\{\\[^}]*\}/g, "").trim(), Dt = (t) => {
  const s = t.replace(/^﻿/, "").replace(/\r\n?/g, `
`), e = /^WEBVTT/.test(s.trimStart()) ? "vtt" : "srt", o = [];
  for (const n of s.split(/\n{2,}/)) {
    const c = n.split(`
`).filter((p) => p.trim() !== "");
    if (c.length === 0)
      continue;
    const r = c.findIndex((p) => K.test(p) && p.includes("-->"));
    if (r < 0 || r > 1)
      continue;
    const l = K.exec(c[r]), a = G(l?.[1] ?? ""), i = G(l?.[2] ?? "");
    if (a === void 0 || i === void 0)
      continue;
    const u = Ut(c.slice(r + 1).join(`
`));
    u !== "" && o.push({ index: o.length + 1, startSeconds: a, endSeconds: i, text: u });
  }
  return {
    cues: o,
    kind: e,
    durationSeconds: o.reduce((n, c) => Math.max(n, c.endSeconds), 0),
    wordCount: o.reduce((n, c) => n + c.text.split(/\s+/).filter((r) => r !== "").length, 0)
  };
}, At = { class: "ev-page" }, It = { class: "ev-toolbar" }, Rt = { class: "ev-muted ev-small" }, Vt = {
  key: 0,
  class: "ui-card ui-card-dashed"
}, Ot = { class: "ev-muted ev-small" }, Ft = { style: { whiteSpace: "pre-wrap" } }, Pt = /* @__PURE__ */ U({
  __name: "SubtitleViewer",
  props: {
    path: {},
    text: {}
  },
  setup(t) {
    const s = t, e = $(() => Dt(s.text)), o = E(""), n = $(() => {
      const r = o.value.trim().toLowerCase();
      return r === "" ? e.value.cues : e.value.cues.filter((l) => l.text.toLowerCase().includes(r));
    }), c = (r) => {
      const l = o.value.trim();
      if (l === "")
        return [{ value: r, hit: !1 }];
      const a = [], i = r.toLowerCase(), u = l.toLowerCase();
      let p = 0;
      for (; ; ) {
        const f = i.indexOf(u, p);
        if (f < 0)
          return a.push({ value: r.slice(p), hit: !1 }), a;
        f > p && a.push({ value: r.slice(p, f), hit: !1 }), a.push({ value: r.slice(f, f + l.length), hit: !0 }), p = f + l.length;
      }
    };
    return (r, l) => (m(), h("div", At, [
      d("div", It, [
        z(d("input", {
          "onUpdate:modelValue": l[0] || (l[0] = (a) => o.value = a),
          class: "ev-input",
          type: "search",
          placeholder: "Search the transcript…",
          "aria-label": "Search cues"
        }, null, 512), [
          [B, o.value]
        ]),
        d("span", Rt, v(x(N)(n.value.length)) + " of " + v(x(N)(e.value.cues.length)) + " cues · " + v(x(Q)(e.value.durationSeconds)) + " · " + v(x(N)(e.value.wordCount)) + " words · " + v(e.value.kind.toUpperCase()), 1)
      ]),
      e.value.cues.length === 0 ? (m(), h("div", Vt, [...l[1] || (l[1] = [
        d("p", { class: "ev-muted" }, "No cues in this file.", -1)
      ])])) : _("", !0),
      (m(!0), h(k, null, M(n.value, (a) => (m(), h("div", {
        key: a.index,
        class: "ev-cue"
      }, [
        d("div", Ot, v(x(Y)(a.startSeconds)) + " → " + v(x(Y)(a.endSeconds)), 1),
        d("div", Ft, [
          (m(!0), h(k, null, M(c(a.text), (i, u) => (m(), h("span", {
            key: u,
            class: F({ "ev-mark": i.hit })
          }, v(i.value), 3))), 128))
        ])
      ]))), 128))
    ]));
  }
}), zt = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Pt
}, Symbol.toStringTag, { value: "Module" })), Bt = {
  0: "copyright",
  1: "family",
  2: "subfamily",
  5: "version",
  13: "license"
}, jt = /* @__PURE__ */ new Set([65536, 1330926671, 1953658213]), Yt = (t) => {
  const s = new DataView(t.buffer, t.byteOffset, t.byteLength);
  if (s.byteLength < 12)
    return {};
  const e = s.getUint32(0) === 1953784678 ? s.getUint32(12) : 0;
  if (e + 12 > s.byteLength || !jt.has(s.getUint32(e)))
    return {};
  const o = s.getUint16(e + 4);
  let n;
  for (let a = 0; a < o; a += 1) {
    const i = e + 12 + a * 16;
    if (i + 16 > s.byteLength)
      return {};
    if (s.getUint32(i) === 1851878757) {
      n = s.getUint32(i + 8);
      break;
    }
  }
  if (n === void 0 || n + 6 > s.byteLength)
    return {};
  const c = s.getUint16(n + 2), r = n + s.getUint16(n + 4), l = {};
  for (let a = 0; a < c; a += 1) {
    const i = n + 6 + a * 12;
    if (i + 12 > s.byteLength)
      break;
    const u = s.getUint16(i), p = s.getUint16(i + 6), f = s.getUint16(i + 8), b = r + s.getUint16(i + 10), g = Bt[p];
    if (g === void 0 || b + f > s.byteLength)
      continue;
    const w = u === 1 ? String.fromCharCode(...t.subarray(b, b + f)) : qt(t.subarray(b, b + f));
    w.trim() !== "" && l[g] === void 0 && (l[g] = w.trim());
  }
  return l;
}, qt = (t) => {
  let s = "";
  for (let e = 0; e + 1 < t.length; e += 2)
    s += String.fromCharCode(t[e] << 8 | t[e + 1]);
  return s;
}, Ht = { class: "ev-page" }, Wt = { class: "ev-head" }, Zt = { class: "ev-title" }, Gt = { class: "ev-muted ev-small" }, Kt = {
  key: 0,
  class: "ui-card ui-card-dashed",
  style: { marginTop: "1rem" }
}, Qt = {
  class: "ev-toolbar",
  style: { marginTop: "1rem" }
}, Xt = { class: "ev-stat-label" }, Jt = { class: "ev-specimen" }, en = {
  key: 0,
  class: "ev-note"
}, tn = ["title"], nn = /* @__PURE__ */ U({
  __name: "FontViewer",
  props: {
    path: {},
    blob: {}
  },
  setup(t) {
    const s = t, e = s.path.slice(s.path.lastIndexOf("/") + 1), o = `ev-font-${Math.random().toString(36).slice(2, 10)}`, n = ee({}), c = E(!1), r = E("The quick brown fox jumps over the lazy dog");
    let l;
    const a = [12, 16, 24, 36, 56, 80], i = async (p) => {
      const f = new Uint8Array(await p.arrayBuffer());
      n.value = Yt(f);
      try {
        const b = new FontFace(o, f);
        await b.load(), document.fonts.add(b), l = b, c.value = !1;
      } catch {
        c.value = !0;
      }
    }, u = () => {
      l !== void 0 && (document.fonts.delete(l), l = void 0);
    };
    return te(
      () => s.blob,
      (p) => {
        u(), i(p);
      },
      { immediate: !0 }
    ), ne(u), (p, f) => (m(), h("div", Ht, [
      d("div", Wt, [
        d("span", Zt, v(n.value.family ?? x(e)), 1),
        d("span", Gt, [
          n.value.subfamily ? (m(), h(k, { key: 0 }, [
            S(v(n.value.subfamily) + " · ", 1)
          ], 64)) : _("", !0),
          S(v(x(ie)(s.blob.size)) + " ", 1),
          n.value.version ? (m(), h(k, { key: 1 }, [
            S(" · " + v(n.value.version), 1)
          ], 64)) : _("", !0)
        ])
      ]),
      c.value ? (m(), h("div", Kt, [...f[1] || (f[1] = [
        d("p", { class: "ev-muted" }, "The browser refused to load this font — the file may be corrupt, or a format it doesn't support.", -1)
      ])])) : (m(), h(k, { key: 1 }, [
        d("div", Qt, [
          z(d("input", {
            "onUpdate:modelValue": f[0] || (f[0] = (b) => r.value = b),
            class: "ev-input",
            style: { minWidth: "24rem" },
            "aria-label": "Sample text"
          }, null, 512), [
            [B, r.value]
          ])
        ]),
        (m(), h(k, null, M(a, (b) => d("div", {
          key: b,
          class: "ev-specimen"
        }, [
          d("div", Xt, v(b) + " px", 1),
          d("div", {
            style: O({ fontFamily: o, fontSize: `${b}px`, lineHeight: 1.3, wordBreak: "break-word" })
          }, v(r.value), 5)
        ])), 64)),
        d("div", Jt, [
          f[3] || (f[3] = d("div", { class: "ev-stat-label" }, "Characters", -1)),
          d("div", {
            style: O({ fontFamily: o, fontSize: "20px", lineHeight: 1.6, wordBreak: "break-word" })
          }, [...f[2] || (f[2] = [
            S(" ABCDEFGHIJKLMNOPQRSTUVWXYZ", -1),
            d("br", null, null, -1),
            S("abcdefghijklmnopqrstuvwxyz", -1),
            d("br", null, null, -1),
            S("0123456789 & @ # $ % ( ) [ ] { } ? ! “ ” — – ", -1)
          ])], 4)
        ]),
        n.value.copyright ? (m(), h("p", en, v(n.value.copyright), 1)) : _("", !0),
        n.value.license ? (m(), h("p", {
          key: 1,
          class: "ev-note ev-license",
          title: n.value.license
        }, v(n.value.license), 9, tn)) : _("", !0)
      ], 64))
    ]));
  }
}), sn = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: nn
}, Symbol.toStringTag, { value: "Module" }));
export {
  an as activate
};
