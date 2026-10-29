'use strict';
const $ = id => document.getElementById(id);
const pad = value => String(value).padStart(2, '0');
const localDay = (date = new Date()) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const duration = ms => { const seconds = Math.floor(Math.max(0, ms) / 1000); return `${pad(Math.floor(seconds / 3600))}:${pad(Math.floor(seconds / 60) % 60)}:${pad(seconds % 60)}`; };
const announce = message => { $('status').textContent = message; };
const key = 'clockwork-v1';
let state = { sessions: [], reminders: [], diary: [], active: null, perspective: null };
try {
  const saved = JSON.parse(localStorage.getItem(key));
  if (saved && ['sessions', 'reminders', 'diary'].every(name => Array.isArray(saved[name]))) state = { ...state, ...saved };
} catch { announce('Saved data could not be loaded. Changes will be kept for this visit if browser storage is unavailable.'); }
function save() {
  try { localStorage.setItem(key, JSON.stringify(state)); }
  catch { announce('Browser storage is unavailable or full. Your changes only last for this visit.'); }
}
const id = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
function element(tag, text, className) { const node = document.createElement(tag); node.textContent = text; if (className) node.className = className; return node; }
function action(parent, text, handler) { const button = element('button', text); button.type = 'button'; button.addEventListener('click', handler); parent.append(button); }
function empty(list, message) { if (!list.children.length) list.append(element('li', message, 'empty')); }
function renderSessions() {
  const list = $('sessions'); list.replaceChildren();
  for (const session of [...state.sessions].reverse()) {
    const row = element('li', ''); row.append(element('strong', session.title), element('p', `${session.category} · ${duration(session.duration)} · ${new Date(session.ended).toLocaleDateString()}`));
    action(row, 'Delete', () => { state.sessions = state.sessions.filter(item => item.id !== session.id); save(); renderSessions(); }); list.append(row);
  }
  empty(list, 'Your completed sessions will appear here.');
  $('breakdown').replaceChildren();
  for (const category of ['Study', 'Work', 'Personal']) {
    const total = state.sessions.filter(item => item.category === category && localDay(new Date(item.ended)) === localDay()).reduce((sum, item) => sum + item.duration, 0);
    const stat = element('div', '', 'stat'); stat.append(element('strong', duration(total)), element('span', category)); $('breakdown').append(stat);
  }
  $('track-button').textContent = state.active ? 'Finish & save session' : 'Start session';
  $('activity').disabled = $('category').disabled = !!state.active;
  if (state.active) { $('activity').value = state.active.title; $('category').value = state.active.category; }
}
$('tracking-form').addEventListener('submit', event => {
  event.preventDefault();
  if (state.active) {
    state.sessions.push({ ...state.active, ended: Date.now(), duration: Math.max(0, Date.now() - state.active.started) }); state.active = null; $('tracking-form').reset();
  } else { const title = $('activity').value.trim(); if (!title) return; state.active = { id: id(), title, category: $('category').value, started: Date.now() }; }
  save(); renderSessions(); tick();
});
function renderPerspective() {
  if (!state.perspective) return;
  const { birthday, years } = state.perspective;
  const birth = new Date(`${birthday}T00:00:00`); const target = new Date(birth); target.setFullYear(birth.getFullYear() + Number(years));
  const remaining = Math.max(0, Math.ceil((target - Date.now()) / 86400000));
  const percent = Math.min(100, Math.max(0, (Date.now() - birth) / (target - birth) * 100));
  $('lifespan-result').replaceChildren(element('strong', `${remaining.toLocaleString()} days`), element('span', 'until your chosen planning horizon'));
  const progress = document.createElement('progress'); progress.max = 100; progress.value = percent; progress.setAttribute('aria-label', 'Planning horizon elapsed'); $('lifespan-result').append(progress, element('small', `${percent.toFixed(1)}% of this planning horizon elapsed.`));
}
$('birthday').max = localDay(); $('entry-date').value = localDay();
if (state.perspective) { $('birthday').value = state.perspective.birthday; $('lifespan-years').value = state.perspective.years; }
$('lifespan-form').addEventListener('submit', event => { event.preventDefault(); state.perspective = { birthday: $('birthday').value, years: Number($('lifespan-years').value) }; save(); renderPerspective(); });
function renderReminders() {
  const list = $('reminder-list'); list.replaceChildren();
  for (const reminder of [...state.reminders].sort((a, b) => new Date(a.when) - new Date(b.when))) {
    const row = element('li', ''); row.append(element('strong', reminder.title), element('p', `${new Date(reminder.when).toLocaleString()} · ${reminder.done ? 'Completed' : reminder.notified ? 'Due' : 'Scheduled'}`));
    action(row, reminder.done ? 'Reopen' : 'Complete', () => { reminder.done = !reminder.done; reminder.notified = false; save(); renderReminders(); });
    action(row, 'Edit', () => { $('reminder-id').value = reminder.id; $('reminder-title').value = reminder.title; $('reminder-time').value = reminder.when; $('reminder-title').focus(); });
    action(row, 'Delete', () => { state.reminders = state.reminders.filter(item => item.id !== reminder.id); if ($('reminder-id').value === reminder.id) $('reminder-form').reset(); save(); renderReminders(); }); list.append(row);
  }
  empty(list, 'No reminders yet. Make room for your next priority.');
}
$('reminder-form').addEventListener('submit', event => {
  event.preventDefault(); const title = $('reminder-title').value.trim(); if (!title) return;
  const when = $('reminder-time').value;
  if (new Date(when) <= new Date()) { announce('Choose a future time for your reminder.'); return; }
  const reminder = { id: $('reminder-id').value || id(), title, when, done: false, notified: false };
  state.reminders = state.reminders.filter(item => item.id !== reminder.id); state.reminders.push(reminder); save(); $('reminder-form').reset(); renderReminders(); announce('Reminder saved.');
});
$('enable-notifications').addEventListener('click', async () => {
  if (!('Notification' in window)) return announce('This browser does not support notifications. In-page reminders are still available.');
  try { const permission = await Notification.requestPermission(); announce(permission === 'granted' ? 'Notifications enabled while this page is open.' : 'Notifications are blocked. In-page reminders are still available.'); }
  catch { announce('Notifications are unavailable here. In-page reminders are still available.'); }
});
function renderDiary() {
  const list = $('diary-list'); list.replaceChildren();
  for (const entry of [...state.diary].sort((a, b) => b.date.localeCompare(a.date))) {
    const row = element('li', ''); row.append(element('strong', `${new Date(`${entry.date}T12:00:00`).toLocaleDateString()} · ${entry.mood}`), element('p', entry.text));
    action(row, 'Edit', () => { $('diary-id').value = entry.id; $('entry-date').value = entry.date; $('mood').value = entry.mood; $('entry-text').value = entry.text; $('entry-text').focus(); });
    action(row, 'Delete', () => { state.diary = state.diary.filter(item => item.id !== entry.id); if ($('diary-id').value === entry.id) resetDiary(); save(); renderDiary(); }); list.append(row);
  }
  empty(list, 'Your reflections will appear here.');
}
function resetDiary() { $('diary-form').reset(); $('entry-date').value = localDay(); }
$('diary-form').addEventListener('submit', event => {
  event.preventDefault(); const text = $('entry-text').value.trim(); if (!text) return;
  const entry = { id: $('diary-id').value || id(), date: $('entry-date').value, mood: $('mood').value, text };
  state.diary = state.diary.filter(item => item.id !== entry.id); state.diary.push(entry); save(); resetDiary(); renderDiary(); announce('Reflection saved.');
});
let currentDay = localDay();
function tick() {
  const now = new Date(); $('time').textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  $('date-time').textContent = now.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  $('elapsed').textContent = duration(state.active ? Date.now() - state.active.started : 0);
  if (localDay() !== currentDay) { currentDay = localDay(); renderSessions(); renderPerspective(); }
  const due = state.reminders.filter(item => !item.done && !item.notified && new Date(item.when) <= now);
  for (const reminder of due) {
    reminder.notified = true;
    if ('Notification' in window && Notification.permission === 'granted') { try { new Notification('ClockWork reminder', { body: reminder.title }); } catch { /* In-page notice remains available. */ } }
  }
  if (due.length) { announce(`Reminder${due.length > 1 ? 's' : ''} due: ${due.map(item => item.title).join('; ')}`); save(); renderReminders(); }
}
renderSessions(); renderPerspective(); renderReminders(); renderDiary(); tick(); setInterval(tick, 1000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) tick(); });
