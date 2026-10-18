(function () {
  'use strict';

  const D = window.WhygeData;
  const KEY_PROFILE = 'whyge.profile.v1';

  const state = {
    profile: null,
    onboarding: {
      branch: null,
      step: 1,
      busy: false,
      token: 0
    },
    creator: {
      busy: false,
      token: 0
    },
    storageOk: true,
    toastTimer: null,
    afterTimer: null
  };

  const dom = {};

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

  function wait(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  // 让每句 NPC 回应之间有可见的思考时间，句越长停得稍久一点。
  function thinkDelay(text, extra) {
    const length = String(text || '').length;
    const base = Math.min(1250, Math.max(650, 540 + length * 12));
    return base + (extra || 0);
  }

  function sanitizeNickname(value) {
    return String(value == null ? '' : value)
      .replace(/[\r\n<>]/g, '')
      .trim()
      .slice(0, 12);
  }

  function initialOf(name) {
    const first = Array.from(String(name || 'W'))[0] || 'W';
    return /[a-z]/i.test(first) ? first.toUpperCase() : first;
  }

  function getPersonality(profile) {
    return D.PERSONALITIES[profile && profile.personality] || D.PERSONALITIES.gentle;
  }

  function getGender(profile) {
    return D.GENDERS.find((gender) => gender.id === (profile && profile.gender)) || D.GENDERS[0];
  }

  function getBranch(profile) {
    return D.ONBOARDING.branches[profile && profile.branch] || D.ONBOARDING.branches.friendly;
  }

  function fill(text, profile) {
    return String(text || '').replace(/\{nickname\}/g, sanitizeNickname(profile && profile.nickname) || '同学');
  }

  function normalizeProfile(raw) {
    if (!raw || typeof raw !== 'object') return null;
    const nickname = sanitizeNickname(raw.nickname);
    const gender = D.GENDERS.some((item) => item.id === raw.gender) ? raw.gender : null;
    const personality = D.PERSONALITIES[raw.personality] ? raw.personality : null;
    const branch = D.ONBOARDING.branches[raw.branch] ? raw.branch : 'friendly';
    if (!nickname || !gender || !personality) return null;
    return {
      nickname: nickname,
      gender: gender,
      personality: personality,
      branch: branch,
      createdAt: Number(raw.createdAt) || Date.now()
    };
  }

  function loadProfile() {
    try {
      const raw = window.localStorage.getItem(KEY_PROFILE);
      if (!raw) return null;
      return normalizeProfile(JSON.parse(raw));
    } catch (error) {
      return null;
    }
  }

  function saveProfile() {
    try {
      window.localStorage.setItem(KEY_PROFILE, JSON.stringify(state.profile));
      state.storageOk = true;
      return true;
    } catch (error) {
      state.storageOk = false;
      showToast('浏览器存储不可用，这次选择只在当前页面有效。');
      return false;
    }
  }

  function clearProfile() {
    try {
      window.localStorage.removeItem(KEY_PROFILE);
    } catch (error) {
      /* 本地存储不可用时无需额外处理 */
    }
    state.profile = null;
  }

  function cacheDom() {
    dom.brandHome = $('#brandHome');
    dom.mainNav = $('#mainNav');
    dom.supportBtn = $('#supportBtn');
    dom.supportFooterBtn = $('#supportFooterBtn');
    dom.userChip = $('#userChip');
    dom.userInitial = $('#userInitial');
    dom.userChipName = $('#userChipName');
    dom.userChipMeta = $('#userChipMeta');
    dom.resetBtn = $('#resetBtn');

    dom.onboardingView = $('#onboardingView');
    dom.homeView = $('#homeView');
    dom.entrySteps = $('#entrySteps');
    dom.entryMode = $('#entryMode');
    dom.entryMessages = $('#entryMessages');
    dom.entryTyping = $('#entryTyping');
    dom.entryChoices = $('#entryChoices');
    dom.entryAfter = $('#entryAfter');
    dom.entryAfterText = $('#entryAfterText');
    dom.profileForm = $('#profileForm');
    dom.formPrompt = $('#formPrompt');
    dom.formHint = $('#formHint');
    dom.nicknameInput = $('#nicknameInput');
    dom.nicknameError = $('#nicknameError');
    dom.formError = $('#formError');
    dom.genderOptions = $('#genderOptions');
    dom.personalityOptions = $('#personalityOptions');
    dom.enterBtn = $('#enterBtn');

    dom.homeNickname = $('#homeNickname');
    dom.homeWelcome = $('#homeWelcome');
    dom.homePersonalityTag = $('#homePersonalityTag');
    dom.homeGenderTag = $('#homeGenderTag');
    dom.runTemptations = $('#runTemptations');
    dom.runOthers = $('#runOthers');
    dom.openCreator = $('#openCreator');
    dom.bookRunBtn = $('#bookRunBtn');

    dom.supportDialog = $('#supportDialog');
    dom.supportIntro = $('#supportIntro');
    dom.supportHotlines = $('#supportHotlines');
    dom.supportEmergency = $('#supportEmergency');
    dom.campusName = $('#campusName');
    dom.campusNote = $('#campusNote');
    dom.campusLink = $('#campusLink');
    dom.supportDisclaimer = $('#supportDisclaimer');

    dom.runDialog = $('#runDialog');
    dom.runDialogNote = $('#runDialogNote');
    dom.runDialogDetails = $('#runDialogDetails');

    dom.creatorDialog = $('#creatorDialog');
    dom.creatorMessages = $('#creatorMessages');
    dom.creatorTyping = $('#creatorTyping');
    dom.creatorOptions = $('#creatorOptions');
    dom.creatorIntro = $('#creatorIntro');
    dom.creatorIntroNote = $('#creatorIntroNote');
    dom.creatorIntroGrid = $('#creatorIntroGrid');
    dom.creatorPlaceholder = $('#creatorPlaceholder');

    dom.resetDialog = $('#resetDialog');
    dom.resetCancelBtn = $('#resetCancelBtn');
    dom.resetConfirmBtn = $('#resetConfirmBtn');
    dom.toast = $('#toast');
  }

  function init() {
    cacheDom();
    renderStaticContent();
    bindEvents();
    bindDialogBehaviors();

    const saved = loadProfile();
    if (saved) {
      state.profile = saved;
      showHome();
    } else {
      showOnboarding();
    }
  }

  function renderStaticContent() {
    renderGenderOptions();
    renderPersonalityOptions();
    renderRunTemptations();
    renderRunOthers();
    renderSupport();
    renderRunDialog();
    renderCreatorIntroCards();
    renderCreatorOptionsForGender('female');
  }

  /* =========================================================
     开场
     ========================================================= */

  function setEntryStep(step) {
    state.onboarding.step = step;
    $$('li', dom.entrySteps).forEach((item) => {
      const value = Number(item.dataset.step);
      item.classList.toggle('is-active', value === step);
      item.classList.toggle('is-done', value < step);
    });
  }

  function setEntryTyping(on) {
    dom.entryTyping.classList.toggle('hidden', !on);
  }

  function scrollEntryBottom() {
    const form = dom.profileForm;
    if (!form.classList.contains('hidden')) {
      form.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'nearest'
      });
    }
  }

  function addEntryMessage(role, text, options) {
    const opts = options || {};
    const row = make('div', 'vn-message ' + (role === 'user' ? 'vn-message--user' : ''));
    if (role === 'npc') {
      row.appendChild(make('span', 'text-avatar text-avatar--message', 'why'));
    } else {
      row.appendChild(make('span', 'vn-message__initial', initialOf(opts.initial || '你')));
    }

    const body = make('div', 'vn-message__body');
    body.appendChild(make('div', 'vn-message__bubble', text));
    if (opts.note) body.appendChild(make('span', 'vn-message__note', opts.note));
    row.appendChild(body);
    dom.entryMessages.appendChild(row);
    return row;
  }

  function renderEntryChoices() {
    dom.entryChoices.innerHTML = '';
    Object.keys(D.ONBOARDING.branches).forEach((key) => {
      const branch = D.ONBOARDING.branches[key];
      const button = make('button', 'dialogue-choice');
      button.type = 'button';
      button.dataset.branch = branch.id;
      button.appendChild(make('span', 'dialogue-choice__index', branch.index));
      button.appendChild(make('span', 'dialogue-choice__label', branch.label));
      button.insertAdjacentHTML('beforeend', icon('icon-arrow', 'icon--small dialogue-choice__arrow'));
      button.addEventListener('click', () => chooseBranch(branch.id));
      dom.entryChoices.appendChild(button);
    });
  }

  function renderInitialGreeting() {
    dom.entryMessages.innerHTML = '';
    dom.entryChoices.innerHTML = '';
    addEntryMessage('npc', D.ONBOARDING.greeting, {
      note: D.ONBOARDING.greetingNote
    });
    renderEntryChoices();
    setEntryStep(1);
  }

  async function chooseBranch(branchId) {
    if (state.onboarding.busy) return;
    const branch = D.ONBOARDING.branches[branchId];
    if (!branch) return;

    const token = state.onboarding.token;
    state.onboarding.busy = true;
    state.onboarding.branch = branch;
    dom.entryMode.textContent = branch.tone;
    dom.entryChoices.innerHTML = '';
    addEntryMessage('user', branch.label);
    setEntryTyping(true);

    await wait(thinkDelay(branch.reaction, 260));
    if (token !== state.onboarding.token) return;
    setEntryTyping(false);
    addEntryMessage('npc', branch.reaction);

    if (branch.pauseBeforeLines) {
      setEntryTyping(true);
      await wait(Math.max(1200, branch.pauseBeforeLines));
      if (token !== state.onboarding.token) return;
      setEntryTyping(false);
    }

    for (let i = 0; i < branch.lines.length; i += 1) {
      setEntryTyping(true);
      await wait(thinkDelay(branch.lines[i], i === 0 ? 180 : 90));
      if (token !== state.onboarding.token) return;
      setEntryTyping(false);
      addEntryMessage('npc', branch.lines[i]);
    }

    if (token !== state.onboarding.token) return;
    showProfileForm(branch);
    state.onboarding.busy = false;
  }

  function showProfileForm(branch) {
    state.onboarding.branch = branch;
    dom.formPrompt.textContent = branch.setupPrompt;
    dom.formHint.textContent = branch.setupHint;
    dom.entryMode.textContent = branch.tone + ' · 认识你';
    dom.profileForm.classList.remove('hidden');
    dom.nicknameError.classList.add('hidden');
    dom.formError.classList.add('hidden');
    setEntryStep(2);
    window.setTimeout(() => {
      dom.nicknameInput.focus({ preventScroll: true });
      scrollEntryBottom();
    }, 80);
  }

  function renderGenderOptions() {
    dom.genderOptions.innerHTML = '';
    D.GENDERS.forEach((gender) => {
      const label = make('label', 'gender-option');
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = 'gender';
      input.value = gender.id;
      const card = make('span', 'gender-card');
      card.appendChild(make('span', 'gender-card__icon', gender.icon));
      const copy = make('span');
      copy.appendChild(make('strong', '', gender.label));
      copy.appendChild(make('small', '', gender.description));
      card.appendChild(copy);
      label.appendChild(input);
      label.appendChild(card);
      dom.genderOptions.appendChild(label);
    });
  }

  function renderPersonalityOptions() {
    dom.personalityOptions.innerHTML = '';
    Object.keys(D.PERSONALITIES).forEach((key) => {
      const personality = D.PERSONALITIES[key];
      const label = make('label', 'personality-option');
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = 'personality';
      input.value = personality.id;
      const card = make('span', 'personality-card');
      const top = make('span', 'personality-card__top');
      top.appendChild(make('span', 'personality-card__icon', personality.icon));
      top.appendChild(make('strong', '', personality.label));
      card.appendChild(top);
      card.appendChild(make('small', '', personality.short + '。' + personality.description));
      label.appendChild(input);
      label.appendChild(card);
      dom.personalityOptions.appendChild(label);
    });
  }

  function validateNickname() {
    const nickname = sanitizeNickname(dom.nicknameInput.value);
    const valid = Boolean(nickname);
    dom.nicknameError.classList.toggle('hidden', valid);
    return valid ? nickname : '';
  }

  function showFormError(message) {
    dom.formError.textContent = message;
    dom.formError.classList.remove('hidden');
  }

  function handleProfileSubmit(event) {
    event.preventDefault();
    if (state.onboarding.busy) return;

    const nickname = validateNickname();
    if (!nickname) {
      dom.nicknameInput.focus();
      return;
    }
    const genderInput = $('input[name="gender"]:checked', dom.genderOptions);
    if (!genderInput) {
      showFormError('先选一个性别，why哥才知道该叫你老妹还是兄弟。');
      $('input[name="gender"]', dom.genderOptions).focus();
      return;
    }
    const personalityInput = $('input[name="personality"]:checked', dom.personalityOptions);
    if (!personalityInput) {
      showFormError('再选一种相处风格，我好知道怎么接你的话。');
      $('input[name="personality"]', dom.personalityOptions).focus();
      return;
    }

    state.onboarding.busy = true;
    dom.formError.classList.add('hidden');
    const branch = state.onboarding.branch || D.ONBOARDING.branches.friendly;
    state.profile = {
      nickname: nickname,
      gender: genderInput.value,
      personality: personalityInput.value,
      branch: branch.id,
      createdAt: Date.now()
    };
    saveProfile();
    dom.enterBtn.disabled = true;
    setEntryStep(3);

    const lines = {
      friendly: '好，' + nickname + '，进屋吧。门没锁。',
      tsundere: '记住了，' + nickname + '。进来吧，别磨蹭。',
      playful: '收到，' + nickname + '！门开了，小心别踩到我的拖鞋。'
    };
    dom.entryAfterText.textContent = lines[branch.id] || lines.friendly;
    dom.profileForm.classList.add('hidden');
    dom.entryAfter.classList.remove('hidden');
    dom.entryMode.textContent = '准备进屋';

    window.clearTimeout(state.afterTimer);
    state.afterTimer = window.setTimeout(() => {
      state.onboarding.busy = false;
      showHome();
      showToast('门开了，' + nickname + '。');
    }, 1150);
  }

  function showOnboarding() {
    state.onboarding.token += 1;
    state.onboarding.busy = false;
    state.onboarding.branch = null;
    state.onboarding.step = 1;
    window.clearTimeout(state.afterTimer);
    dom.onboardingView.classList.remove('hidden');
    dom.homeView.classList.add('hidden');
    dom.mainNav.hidden = true;
    dom.userChip.hidden = true;
    dom.resetBtn.hidden = true;
    dom.profileForm.classList.add('hidden');
    dom.entryAfter.classList.add('hidden');
    dom.entryAfterText.textContent = '';
    dom.entryMode.textContent = '第一次见面';
    dom.profileForm.reset();
    dom.nicknameError.classList.add('hidden');
    dom.formError.classList.add('hidden');
    dom.enterBtn.disabled = false;
    dom.entryTyping.classList.add('hidden');
    renderInitialGreeting();
    document.title = D.BRAND.name;
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  /* =========================================================
     主页
     ========================================================= */

  function showHome() {
    if (!state.profile) {
      showOnboarding();
      return;
    }
    state.onboarding.token += 1;
    dom.onboardingView.classList.add('hidden');
    dom.homeView.classList.remove('hidden');
    dom.mainNav.hidden = false;
    dom.userChip.hidden = false;
    dom.resetBtn.hidden = false;
    renderHome();
    document.title = D.BRAND.name + ' · ' + state.profile.nickname;
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  function renderHome() {
    const profile = state.profile;
    const branch = getBranch(profile);
    const personality = getPersonality(profile);
    const gender = getGender(profile);

    dom.homeNickname.textContent = profile.nickname;
    dom.homeWelcome.textContent = fill(branch.welcome, profile) + ' ' + personality.welcome;
    dom.homePersonalityTag.textContent = personality.label;
    dom.homeGenderTag.textContent = gender.label;
    dom.userInitial.textContent = initialOf(profile.nickname);
    dom.userChipName.textContent = profile.nickname;
    dom.userChipMeta.textContent = personality.label + ' · ' + gender.label;
  }

  function renderRunTemptations() {
    dom.runTemptations.innerHTML = '';
    D.RUN.temptations.forEach((item) => {
      const row = make('div', 'run-temptation');
      const iconBox = make('span', 'run-temptation__icon');
      iconBox.innerHTML = icon('icon-' + item.icon, 'icon--small');
      row.appendChild(iconBox);
      row.appendChild(make('span', '', item.text));
      dom.runTemptations.appendChild(row);
    });
  }

  function renderRunOthers() {
    dom.runOthers.innerHTML = '';
    const icons = ['run', 'calendar'];
    D.RUN.others.forEach((item, index) => {
      const card = make('div', 'mini-card');
      const iconBox = make('span', 'mini-card__icon');
      iconBox.innerHTML = icon('icon-' + icons[index], 'icon--small');
      card.appendChild(iconBox);
      const copy = make('div');
      copy.appendChild(make('strong', '', item.title));
      copy.appendChild(make('small', '', item.note));
      card.appendChild(copy);
      card.appendChild(make('span', 'status-pill', item.status));
      dom.runOthers.appendChild(card);
    });
  }

  function renderRunDialog() {
    dom.runDialogNote.textContent = D.RUN.dialog.note;
    dom.runDialogDetails.innerHTML = '';
    D.RUN.dialog.details.forEach((detail) => {
      dom.runDialogDetails.appendChild(make('li', '', detail));
    });
  }

  function renderSupport() {
    dom.supportIntro.textContent = D.SUPPORT.intro;
    dom.supportHotlines.innerHTML = '';
    D.SUPPORT.hotlines.forEach((item) => {
      const link = document.createElement('a');
      link.className = 'hotline-row';
      link.href = 'tel:' + item.tel;
      const iconBox = make('span', 'hotline-row__icon');
      iconBox.innerHTML = icon('icon-phone', 'icon--small');
      link.appendChild(iconBox);
      const copy = make('span', 'hotline-row__copy');
      copy.appendChild(make('strong', '', item.label));
      copy.appendChild(make('small', '', item.note));
      link.appendChild(copy);
      link.appendChild(make('span', 'hotline-row__number', item.number));
      dom.supportHotlines.appendChild(link);
    });

    dom.supportEmergency.innerHTML = '';
    D.SUPPORT.emergency.forEach((item) => {
      const link = document.createElement('a');
      link.href = 'tel:' + item.tel;
      link.appendChild(document.createTextNode(item.number + ' '));
      link.appendChild(make('span', '', item.label));
      dom.supportEmergency.appendChild(link);
    });

    dom.campusName.textContent = D.SUPPORT.campus.name;
    dom.campusNote.textContent = D.SUPPORT.campus.note;
    dom.campusLink.href = D.SUPPORT.campus.url;
    dom.supportDisclaimer.textContent = D.SUPPORT.disclaimer;
  }

  /* =========================================================
     创作者对话
     ========================================================= */

  function renderCreatorOptionsForGender(genderId) {
    const data = genderId === 'male' ? D.CREATOR.male : D.CREATOR.female;
    dom.creatorOptions.innerHTML = '';
    data.options.forEach((option, index) => {
      const button = make('button', 'creator-option', option.label);
      button.type = 'button';
      button.dataset.index = String(index);
      dom.creatorOptions.appendChild(button);
    });
  }

  function addCreatorMessage(role, text) {
    const row = make('div', 'creator-message ' + (role === 'user' ? 'creator-message--user' : ''));
    if (role === 'npc') {
      row.appendChild(make('span', 'text-avatar text-avatar--message', 'why'));
    } else {
      row.appendChild(make('span', 'vn-message__initial', initialOf(state.profile && state.profile.nickname)));
    }
    const body = make('div', 'creator-message__body');
    body.appendChild(make('div', 'creator-message__bubble', text));
    body.appendChild(make('div', 'creator-message__meta', role === 'user' ? '你' : '王同志'));
    row.appendChild(body);
    dom.creatorMessages.appendChild(row);
    dom.creatorMessages.scrollTop = dom.creatorMessages.scrollHeight;
  }

  function setCreatorTyping(on) {
    dom.creatorTyping.classList.toggle('hidden', !on);
    if (on) {
      dom.creatorMessages.scrollTop = dom.creatorMessages.scrollHeight;
    }
  }

  function resetCreatorDialog() {
    state.creator.token += 1;
    state.creator.busy = false;
    dom.creatorMessages.innerHTML = '';
    dom.creatorOptions.innerHTML = '';
    dom.creatorIntro.classList.add('hidden');
    dom.creatorPlaceholder.classList.add('hidden');
    dom.creatorPlaceholder.querySelector('p').textContent = D.CREATOR.placeholder;
    dom.creatorIntroGrid.innerHTML = '';
    renderCreatorIntroCards();
    setCreatorTyping(false);
  }

  function openCreator() {
    if (!state.profile) return;
    resetCreatorDialog();
    const gender = getGender(state.profile).id;
    const data = gender === 'male' ? D.CREATOR.male : D.CREATOR.female;
    openDialog(dom.creatorDialog);
    addCreatorMessage('npc', data.opening);
    renderCreatorOptionsForGender(gender);
  }

  async function chooseCreatorOption(index) {
    if (state.creator.busy || !state.profile) return;
    const gender = getGender(state.profile).id;
    const data = gender === 'male' ? D.CREATOR.male : D.CREATOR.female;
    const option = data.options[index];
    if (!option) return;

    const token = state.creator.token;
    state.creator.busy = true;
    dom.creatorOptions.innerHTML = '';
    addCreatorMessage('user', option.label);
    setCreatorTyping(true);

    await wait(thinkDelay(option.apology, 320));
    if (token !== state.creator.token) return;
    setCreatorTyping(false);
    addCreatorMessage('npc', option.apology);

    await wait(850);
    if (token !== state.creator.token) return;
    addCreatorMessage('user', D.CREATOR.autoReply);

    await wait(700);
    if (token !== state.creator.token) return;
    revealCreatorIntro();
    state.creator.busy = false;
  }

  function revealCreatorIntro() {
    dom.creatorIntro.classList.remove('hidden');
    dom.creatorIntroNote.textContent = D.CREATOR.introNote;
    dom.creatorIntro.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'nearest'
    });
  }

  function renderCreatorIntroCards() {
    dom.creatorIntroGrid.innerHTML = '';
    D.CREATOR.introCards.forEach((item) => {
      const button = make('button', 'intro-card');
      button.type = 'button';
      button.appendChild(make('strong', '', item.title));
      button.appendChild(make('small', '', item.hint));
      button.addEventListener('click', showCreatorPlaceholder);
      dom.creatorIntroGrid.appendChild(button);
    });
  }

  function showCreatorPlaceholder() {
    dom.creatorPlaceholder.querySelector('p').textContent = D.CREATOR.placeholder;
    dom.creatorPlaceholder.classList.remove('hidden');
    dom.creatorPlaceholder.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'nearest'
    });
  }

  /* =========================================================
     弹窗与事件
     ========================================================= */

  function syncDialogState() {
    document.body.classList.toggle('has-dialog', $$('dialog[open]').length > 0);
  }

  function openDialog(dialog) {
    if (!dialog) return;
    $$('dialog[open]').forEach((item) => {
      if (item !== dialog) item.close();
    });
    if (!dialog.open) {
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
    }
    syncDialogState();
  }

  function closeDialog(dialog) {
    if (dialog && dialog.open) dialog.close();
    syncDialogState();
  }

  function showToast(message) {
    if (!dom.toast) return;
    dom.toast.textContent = message;
    dom.toast.classList.add('is-visible');
    window.clearTimeout(state.toastTimer);
    state.toastTimer = window.setTimeout(() => {
      dom.toast.classList.remove('is-visible');
    }, 2600);
  }

  function bindDialogBehaviors() {
    $$('dialog.modal').forEach((dialog) => {
      dialog.addEventListener('click', (event) => {
        if (event.target === dialog) closeDialog(dialog);
      });
      dialog.addEventListener('close', () => {
        syncDialogState();
        if (dialog === dom.creatorDialog) {
          state.creator.token += 1;
          state.creator.busy = false;
          setCreatorTyping(false);
        }
      });
    });
  }

  function openSupport() {
    openDialog(dom.supportDialog);
  }

  function openRunDialog() {
    openDialog(dom.runDialog);
  }

  function bindEvents() {
    dom.brandHome.addEventListener('click', () => {
      if (state.profile) {
        window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      }
    });

    dom.supportBtn.addEventListener('click', openSupport);
    dom.supportFooterBtn.addEventListener('click', openSupport);
    dom.bookRunBtn.addEventListener('click', openRunDialog);
    dom.openCreator.addEventListener('click', openCreator);
    dom.resetBtn.addEventListener('click', () => openDialog(dom.resetDialog));

    dom.profileForm.addEventListener('submit', handleProfileSubmit);
    dom.nicknameInput.addEventListener('input', () => {
      dom.nicknameError.classList.add('hidden');
      dom.formError.classList.add('hidden');
    });
    dom.genderOptions.addEventListener('change', () => dom.formError.classList.add('hidden'));
    dom.personalityOptions.addEventListener('change', () => dom.formError.classList.add('hidden'));

    dom.creatorOptions.addEventListener('click', (event) => {
      const button = event.target.closest('.creator-option');
      if (!button) return;
      chooseCreatorOption(Number(button.dataset.index));
    });

    dom.resetCancelBtn.addEventListener('click', () => closeDialog(dom.resetDialog));
    dom.resetConfirmBtn.addEventListener('click', () => {
      closeDialog(dom.resetDialog);
      clearProfile();
      showOnboarding();
      showToast('回到门口了，重新打个招呼吧。');
    });

    document.addEventListener('click', (event) => {
      const closeButton = event.target.closest('[data-close-dialog]');
      if (closeButton) {
        const dialog = closeButton.closest('dialog');
        if (dialog) closeDialog(dialog);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
