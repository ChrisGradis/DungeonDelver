import { Game } from './Game.js';
import '../styles/main.css';

const game = new Game();

document.addEventListener('DOMContentLoaded', async () => {
  await game.initialize();
});

const helpButton = document.getElementById('help-button');
const helpModal = document.getElementById('help-modal');
const closeHelpButton = document.getElementById('close-help-modal-button');
const settingsButton = document.getElementById('settings-button');
const settingsModal = document.getElementById('settings-modal');
const closeSettingsButton = document.getElementById('close-settings-modal-button');

helpButton?.addEventListener('click', () => {
  helpModal.style.display = 'flex';
});

closeHelpButton?.addEventListener('click', () => {
  helpModal.style.display = 'none';
});

settingsButton?.addEventListener('click', () => {
  settingsModal.style.display = 'flex';
});

closeSettingsButton?.addEventListener('click', () => {
  settingsModal.style.display = 'none';
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    helpModal.style.display = 'none';
    settingsModal.style.display = 'none';
  }
});
