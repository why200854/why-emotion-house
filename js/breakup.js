(function () {
  'use strict';

  const DATA = window.WhygeBreakup;
  const state = {
    dayIndex: 0,
    beatIndex: 0,
    busy: false,
    token: 0,
    phase: 'story',
    styles: {},
    nextAction: null,
    monoIndex: 0,
    monoBusy: false,
    monoLocked: false
  };

  const dom = {};

  const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $$(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function make(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  function icon(id, className) {
    return '<svg class="icon ' + (className || '') + '" aria-hidden="true"><use href="#' + id + '"></use></svg>';
  }

  function cacheDom() {
    dom.storyView = $('#storyView');
    dom.monologueView = $('#monologueView');
    dom.closingView = $('#closingView');
    dom.dayLabel = $('#dayLabel');
    dom.sceneTime = $('#sceneTime');
    dom.scenePlace = $('#scenePlace');
    dom.sceneNote = $('#sceneNote');
    dom.heartStage = $('#heartStage');
    dom.heartCaption = $('#heartCaption');
    dom.dayProgress = $('#dayProgress');
    dom.speakerState = $('#speakerState');
    dom.dialogueMessages = $('#dialogueMessages');
    dom.typing = $('#typing');
    dom.choices = $('#choices');
    dom.nextBtn = $('#nextBtn');
    dom.dayBanner = $('#dayBanner');
    dom.bannerDay = $('#bannerDay');
    dom.bannerTime = $('#bannerTime');
    dom.bannerPlace = $('#bannerPlace');
    dom.monologueKicker = $('#monologueKicker');
    dom.monologueTitle = $('#monologueTitle');
    dom.monologueText = $('#monologueText');
    dom.monologueProgress = $('#monologueProgress');
    dom.monologueNext = $('#monologueNext');
    dom.closingEyebrow = $('#closingEyebrow');
    dom.closingTitle = $('#closingTitle');
    dom.closingLines = $('#closingLines');
    dom.closingThanks = $('#closingThanks');
    dom.leaveBtn = $('#leaveBtn');
    dom.disclaimerText = $('#disclaimerText');
  }

  function init() {
    cacheDom();
    dom.disclaimerText.textContent = DATA.disclaimer;
    renderProgress(0);
    bindEvents();
    startStory();
  }

  function bindEvents() {
    dom.nextBtn.addEventListener('click', handleNext);
    dom.monologueNext.addEventListener('click', advanceMonologue);
    dom.leaveBtn.addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  }

  function thinkTime(text) {
    return Math.min(1050, Math.max(620, 420 + String(text || '').length * 14));
  }

  function scrollMessages() {
    dom.dialogueMessages.scrollTop = dom.dialogueMessages.scrollHeight;
  }

  function setTyping(on) {
    dom.typing.classList.toggle('hidden', !on);
    if (on) scrollMessages();
  }

  function addNpcLine(text) {
    const row = make('div', 'message');
    row.appendChild(make('span', 'message__who', 'why'));
    const bubble = make('div', 'message__bubble', text);
    row.appendChild(bubble);
    dom.dialogueMessages.appendChild(row);
    scrollMessages();
  }

  function addUserLine(text) {
    const row = make('div', 'message message--user');
    row.appendChild(make('span', 'message__who', '你'));
    row.appendChild(make('div', 'message__bubble', text));
    dom.dialogueMessages.appendChild(row);
    scrollMessages();
  }

  function addNarration(text) {
    dom.dialogueMessages.appendChild(make('p', 'narration', text));
    scrollMessages();
  }

  function addChoicePrompt(text) {
    dom.dialogueMessages.appendChild(make('p', 'choice-prompt', text));
    scrollMessages();
  }

  async function addNpcSequence(lines, token) {
    for (let i = 0; i < lines.length; i += 1) {
      setTyping(true);
      await wait(thinkTime(lines[i]));
      if (token !== state.token) return false;
      setTyping(false);
      addNpcLine(lines[i]);
      await wait(140);
      if (token !== state.token) return false;
    }
    return true;
  }

  function renderProgress(activeIndex) {
    dom.dayProgress.innerHTML = '';
    for (let i = 0; i < DATA.meta.days; i += 1) {
      const bar = make('span');
      if (i < activeIndex) bar.classList.add('is-done');
      if (i === activeIndex) bar.classList.add('is-active');
      dom.dayProgress.appendChild(bar);
    }
  }

  function setHeart(stage, caption) {
    dom.heartStage.className = 'heart-stage heart-stage--' + stage;
    dom.heartCaption.textContent = caption;
  }

  function updateDayMeta(day) {
    dom.dayLabel.textContent = day.label;
    dom.sceneTime.textContent = day.time;
    dom.scenePlace.textContent = day.place;
    dom.sceneNote.textContent = day.note;
    dom.speakerState.textContent = '失恋第 ' + (state.dayIndex + 1) + ' 天 · 正在难过';
    dom.bannerDay.textContent = day.label;
    dom.bannerTime.textContent = day.time + ' · ' + day.place;
    dom.bannerPlace.textContent = day.note;
  }

  async function startStory() {
    await showDay(0);
  }

  async function showDay(index) {
    if (index >= DATA.days.length) {
      showFarewell();
      return;
    }

    const token = ++state.token;
    state.dayIndex = index;
    state.beatIndex = 0;
    state.phase = 'story';
    state.busy = true;
    state.nextAction = null;

    const day = DATA.days[index];
    window.scrollTo(0, 0);
    updateDayMeta(day);
    renderProgress(index);
    dom.dialogueMessages.innerHTML = '';
    dom.choices.innerHTML = '';
    dom.nextBtn.classList.add('hidden');
    setTyping(false);

    dom.dayBanner.classList.remove('hidden');
    await wait(1250);
    if (token !== state.token) return;
    dom.dayBanner.classList.add('hidden');
    setHeart(day.heart, day.caption);

    state.busy = false;
    await playBeat(0);
  }

  async function playBeat(beatIndex) {
    const day = DATA.days[state.dayIndex];
    const beat = day.beats[beatIndex];
    if (!beat) {
      finishDay();
      return;
    }

    const token = state.token;
    state.beatIndex = beatIndex;
    state.busy = true;
    state.nextAction = null;
    dom.choices.innerHTML = '';
    dom.nextBtn.classList.add('hidden');

    const ok = await addNpcSequence(beat.lines, token);
    if (!ok) return;

    addChoicePrompt(beat.prompt);
    renderChoices(beat.options);
    state.busy = false;
  }

  function renderChoices(options) {
    dom.choices.innerHTML = '';
    options.forEach((option) => {
      const button = make('button', 'choice');
      button.type = 'button';
      button.appendChild(make('span', 'choice__heart', '♥'));
      button.appendChild(make('span', 'choice__label', option.label));
      button.insertAdjacentHTML('beforeend', icon('bu-arrow', 'icon--small choice__arrow'));
      button.addEventListener('click', () => chooseOption(option));
      dom.choices.appendChild(button);
    });
    scrollMessages();

    if (window.matchMedia('(max-width: 640px)').matches) {
      window.setTimeout(() => {
        dom.choices.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 120);
    }
  }

  async function chooseOption(option) {
    if (state.busy) return;
    state.busy = true;
    state.phase = state.phase === 'farewell' ? 'farewell' : 'story';

    const token = state.token;
    const isFarewell = state.phase === 'farewell';
    dom.choices.innerHTML = '';
    addUserLine(option.label);

    state.styles[option.style] = (state.styles[option.style] || 0) + 1;

    setTyping(true);
    await wait(thinkTime(option.label));
    if (token !== state.token) return;
    setTyping(false);

    const replied = await addNpcSequence(option.reply, token);
    if (!replied) return;

    if (isFarewell) {
      setTyping(true);
      await wait(thinkTime(DATA.farewell.followUp));
      if (token !== state.token) return;
      setTyping(false);
      addNpcLine(DATA.farewell.followUp);
      state.nextAction = 'startMonologue';
      dom.nextBtn.querySelector('span').textContent = '听他讲讲';
    } else {
      const day = DATA.days[state.dayIndex];
      state.nextAction = state.beatIndex < day.beats.length - 1 ? 'nextBeat' : 'finishDay';
      dom.nextBtn.querySelector('span').textContent = state.nextAction === 'nextBeat' ? '继续' : '继续这一天';
    }

    dom.nextBtn.classList.remove('hidden');
    state.busy = false;
    scrollMessages();
  }

  async function handleNext() {
    if (state.busy) return;
    const action = state.nextAction;
    state.nextAction = null;
    dom.nextBtn.classList.add('hidden');

    if (action === 'nextBeat') {
      await playBeat(state.beatIndex + 1);
    } else if (action === 'finishDay') {
      await finishDay();
    } else if (action === 'startMonologue') {
      startMonologue();
    }
  }

  async function finishDay() {
    state.busy = true;
    const token = state.token;
    const day = DATA.days[state.dayIndex];
    dom.choices.innerHTML = '';
    dom.nextBtn.classList.add('hidden');

    for (let i = 0; i < day.outro.length; i += 1) {
      await wait(360);
      if (token !== state.token) return;
      addNarration(day.outro[i]);
    }

    await wait(650);
    if (token !== state.token) return;

    if (state.dayIndex < DATA.days.length - 1) {
      await showDay(state.dayIndex + 1);
    } else {
      showFarewell();
    }
  }

  async function showFarewell() {
    const token = ++state.token;
    window.scrollTo(0, 0);
    state.phase = 'farewell';
    state.busy = true;
    dom.choices.innerHTML = '';
    dom.nextBtn.classList.add('hidden');
    dom.dialogueMessages.innerHTML = '';
    dom.speakerState.textContent = '失恋第 5 天 · 准备向前';
    setHeart('healed', DATA.days[DATA.days.length - 1].caption);
    setTyping(false);

    const ok = await addNpcSequence(DATA.farewell.lines, token);
    if (!ok) return;
    addChoicePrompt(DATA.farewell.prompt);
    renderChoices(DATA.farewell.options);
    state.busy = false;
  }

  function startMonologue() {
    state.token += 1;
    state.monoIndex = 0;
    state.monoBusy = false;
    state.monoLocked = false;
    window.scrollTo(0, 0);
    document.body.classList.add('monologue-mode');
    dom.storyView.classList.add('hidden');
    dom.monologueView.classList.remove('hidden');
    dom.closingView.classList.add('hidden');
    dom.monologueKicker.textContent = DATA.monologue.kicker;
    dom.monologueTitle.textContent = DATA.monologue.title;
    dom.monologueText.innerHTML = '';
    dom.monologueNext.querySelector('span').textContent = '继续';
    renderMonologueParagraph(0);
  }

  function renderMonologueParagraph(index) {
    const paragraphs = DATA.monologue.paragraphs;
    if (index >= paragraphs.length) {
      showClosing();
      return;
    }

    const paragraph = make('p', 'monologue-paragraph', paragraphs[index]);
    if (index === paragraphs.length - 1) paragraph.classList.add('monologue-paragraph--accent');
    dom.monologueText.appendChild(paragraph);
    dom.monologueProgress.textContent = String(index + 1).padStart(2, '0') + ' / ' + String(paragraphs.length).padStart(2, '0');
    dom.monologueNext.querySelector('span').textContent = index === paragraphs.length - 1 ? '听完了' : '继续';
    dom.monologueText.scrollTop = dom.monologueText.scrollHeight;
  }

  function advanceMonologue() {
    if (state.monoBusy) return;
    const paragraphs = DATA.monologue.paragraphs;
    if (state.monoIndex >= paragraphs.length - 1) {
      showClosing();
      return;
    }
    state.monoIndex += 1;
    renderMonologueParagraph(state.monoIndex);
  }

  function styleClosingLine() {
    const styles = state.styles;
    const entries = Object.keys(styles).map((key) => [key, styles[key]]).sort((a, b) => b[1] - a[1]);
    if (!entries.length) return '你陪他把这五天走完了。';
    const dominant = entries[0][0];
    if (dominant === 'listen' || dominant === 'comfort') {
      return '你一直在听。没有急着把他拉出来，这很重要。';
    }
    if (dominant === 'action' || dominant === 'connect' || dominant === 'ground') {
      return '你给了他很多具体的下一步，让他没有一直沉下去。';
    }
    if (dominant === 'humor') {
      return '你让他在最难受的时候，还能笑一下。';
    }
    if (dominant === 'steady' || dominant === 'honest') {
      return '你一直很诚实，也没有让他觉得自己很糟。';
    }
    return '你陪他把这五天走完了。';
  }

  function showClosing() {
    state.monoLocked = true;
    window.scrollTo(0, 0);
    document.body.classList.remove('monologue-mode');
    dom.storyView.classList.add('hidden');
    dom.monologueView.classList.add('hidden');
    dom.closingView.classList.remove('hidden');
    dom.closingEyebrow.textContent = DATA.closing.eyebrow;
    dom.closingTitle.textContent = DATA.closing.title;
    dom.closingLines.innerHTML = '';
    DATA.closing.lines.forEach((line) => {
      dom.closingLines.appendChild(make('p', '', line));
    });
    dom.closingLines.appendChild(make('p', '', styleClosingLine()));
    dom.closingThanks.textContent = DATA.closing.thanks;
    dom.leaveBtn.classList.add('hidden');
    dom.leaveBtn.textContent = DATA.closing.leave;

    window.setTimeout(() => {
      dom.leaveBtn.classList.remove('hidden');
    }, 1050);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
