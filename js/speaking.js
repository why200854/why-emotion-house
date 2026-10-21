(function () {
  'use strict';

  const DATA = window.WhygeSpeakingData;
  const SCORE = window.WhygeSpeakingScore;
  const STORAGE_KEY = 'whyge.speaking.v1';

  const state = {
    regionId: 'cn-tradition',
    subId: 'festivals',
    order: 'sequence',
    speed: 'normal',
    blind: false,
    sentences: [],
    index: 0,
    current: null,
    round: 0,
    result: null,
    stars: 0,
    practiced: {},
    micAvailable: false,
    micMessage: '正在检查麦克风…',
    ttsAvailable: true,
    listening: false,
    recognition: null,
    recordTimer: null,
    handledResult: false,
    errorFlag: false,
    toastTimer: null,
    popoverWord: null
  };

  const dom = {};

  function $(selector) {
    return document.querySelector(selector);
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
    dom.regionSelect = $('#regionSelect');
    dom.subSelect = $('#subSelect');
    dom.orderToggle = $('#orderToggle');
    dom.categoryCount = $('#categoryCount');
    dom.phoneticTips = $('#phoneticTips');
    dom.wordList = $('#wordList');
    dom.sentenceCategory = $('#sentenceCategory');
    dom.roundBadge = $('#roundBadge');
    dom.sentenceDisplay = $('#sentenceDisplay');
    dom.playBtn = $('#playBtn');
    dom.speedButtons = Array.from(document.querySelectorAll('[data-speed]'));
    dom.blindToggle = $('#blindToggle');
    dom.translationBox = $('#translationBox');
    dom.translationText = $('#translationText');
    dom.speechStatus = $('#speechStatus');
    dom.recordBtn = $('#recordBtn');
    dom.recordLabel = $('.record-btn__label');
    dom.recordStatus = $('#recordStatus');
    dom.resultCard = $('#resultCard');
    dom.scoreRing = $('#scoreRing');
    dom.scoreValue = $('#scoreValue');
    dom.resultTitle = $('#resultTitle');
    dom.resultFeedback = $('#resultFeedback');
    dom.recognizedText = $('#recognizedText');
    dom.continueBtn = $('#continueBtn');
    dom.nextBtn = $('#nextBtn');
    dom.starCount = $('#starCount');
    dom.starTrack = $('#starTrack');
    dom.starWidget = $('.star-widget');
    dom.resetProgressBtn = $('#resetProgressBtn');
    dom.resetDialog = $('#resetDialog');
    dom.resetCancelBtn = $('#resetCancelBtn');
    dom.resetConfirmBtn = $('#resetConfirmBtn');
    dom.wordPopover = $('#wordPopover');
    dom.wordPopoverClose = $('#wordPopoverClose');
    dom.popoverWord = $('#popoverWord');
    dom.popoverPhonetic = $('#popoverPhonetic');
    dom.popoverMeaning = $('#popoverMeaning');
    dom.rewardLayer = $('#rewardLayer');
    dom.toast = $('#speakingToast');
  }

  function init() {
    cacheDom();
    loadState();
    populateRegions();
    setupRecognition();
    bindEvents();
    loadSavedSelection();
    renderStars();
  }

  /* =========================================================
     本地存储
     ========================================================= */

  function defaultSaved() {
    return {
      stars: 0,
      practiced: {},
      settings: {}
    };
  }

  function loadState() {
    let saved = defaultSaved();
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          saved.stars = Number(parsed.stars) || 0;
          saved.practiced = parsed.practiced && typeof parsed.practiced === 'object' ? parsed.practiced : {};
          saved.settings = parsed.settings && typeof parsed.settings === 'object' ? parsed.settings : {};
        }
      }
    } catch (error) {
      saved = defaultSaved();
    }

    state.stars = Math.max(0, Math.round(saved.stars));
    state.practiced = saved.practiced;
    const settings = saved.settings;
    if (typeof settings.regionId === 'string') state.regionId = settings.regionId;
    if (typeof settings.subId === 'string') state.subId = settings.subId;
    if (settings.order === 'random' || settings.order === 'sequence') state.order = settings.order;
    if (settings.speed === 'slow' || settings.speed === 'normal') state.speed = settings.speed;
    state.blind = Boolean(settings.blind);
  }

  function saveState() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
        stars: state.stars,
        practiced: state.practiced,
        settings: {
          regionId: state.regionId,
          subId: state.subId,
          index: state.index,
          order: state.order,
          speed: state.speed,
          blind: state.blind
        }
      }));
    } catch (error) {
      showToast('浏览器没有允许本地存储，练习记录这次可能不会保存。');
    }
  }

  /* =========================================================
     题库选择
     ========================================================= */

  function getRegion(id) {
    return DATA.categories.find((item) => item.id === id) || DATA.categories[0];
  }

  function getSub(region, id) {
    return region.subs.find((item) => item.id === id) || region.subs[0];
  }

  function sentencesFor(regionId, subId) {
    return DATA.sentences.filter((item) => item.region === regionId && item.sub === subId);
  }

  function populateRegions() {
    dom.regionSelect.innerHTML = '';
    DATA.categories.forEach((region) => {
      const option = make('option', '', region.name);
      option.value = region.id;
      dom.regionSelect.appendChild(option);
    });
  }

  function populateSubs(regionId, preferredSub) {
    const region = getRegion(regionId);
    dom.subSelect.innerHTML = '';
    region.subs.forEach((sub) => {
      const count = sentencesFor(region.id, sub.id).length;
      const option = make('option', '', sub.name + (count ? ' · ' + count + ' 句' : ' · 待补充'));
      option.value = sub.id;
      dom.subSelect.appendChild(option);
    });

    const preferred = region.subs.find((sub) => sub.id === preferredSub);
    const firstWithContent = region.subs.find((sub) => sentencesFor(region.id, sub.id).length);
    const selected = preferred || firstWithContent || region.subs[0];
    dom.subSelect.value = selected.id;
    state.regionId = region.id;
    state.subId = selected.id;
    loadSub();
  }

  function loadSavedSelection() {
    let region = getRegion(state.regionId);
    if (!DATA.categories.some((item) => item.id === state.regionId)) {
      region = DATA.categories[0];
      state.regionId = region.id;
    }
    const sub = getSub(region, state.subId);
    state.subId = sub.id;
    dom.regionSelect.value = region.id;
    populateSubs(region.id, state.subId);
    dom.blindToggle.checked = state.blind;
    updateBlindMode();
    updateSpeedButtons();
    updateOrderButtons();
  }

  function loadSub() {
    state.sentences = sentencesFor(state.regionId, state.subId);
    state.index = 0;
    state.round = 0;
    state.result = null;
    dom.categoryCount.textContent = state.sentences.length
      ? '本分类 ' + state.sentences.length + ' 句'
      : '这一类还没有句子';

    if (!state.sentences.length) {
      showEmptyCategory();
      return;
    }

    selectSentence(0);
    saveState();
  }

  function showEmptyCategory() {
    stopAudio();
    stopRecording(true);
    state.current = null;
    dom.sentenceCategory.textContent = getRegion(state.regionId).name + ' · ' + getSub(getRegion(state.regionId), state.subId).name;
    dom.sentenceDisplay.innerHTML = '';
    const empty = make('p', 'sentence-empty', '这一类的句子还在慢慢补充。先试试其他分类吧，不着急。');
    dom.sentenceDisplay.appendChild(empty);
    dom.phoneticTips.innerHTML = '';
    const tip = make('li', '', '这一类暂时没有句子。');
    dom.phoneticTips.appendChild(tip);
    dom.wordList.innerHTML = '';
    dom.translationText.textContent = '';
    dom.roundBadge.textContent = '本句 0 / 3 轮';
    dom.resultCard.classList.add('hidden');
    dom.playBtn.disabled = true;
    dom.recordBtn.disabled = true;
    dom.recordStatus.textContent = '换一个有内容的分类就可以开始练习。';
    dom.speechStatus.textContent = '';
  }

  function selectSentence(index) {
    stopAudio();
    stopRecording(true);
    state.index = index;
    state.current = state.sentences[index];
    state.round = 0;
    state.result = null;
    dom.resultCard.classList.add('hidden');
    dom.translationBox.open = false;
    dom.blindToggle.checked = state.blind;
    updateBlindMode();
    dom.speechStatus.textContent = state.ttsAvailable ? '' : '当前浏览器不支持语音朗读，可以换 Chrome 或 Edge 试试。';
    dom.recordStatus.textContent = state.micAvailable ? '准备好时，点一下麦克风。' : state.micMessage;
    dom.playBtn.disabled = !state.ttsAvailable;
    dom.recordBtn.disabled = !state.micAvailable;
    dom.continueBtn.classList.remove('hidden');
    dom.nextBtn.textContent = '换下一句';
    dom.roundBadge.textContent = '本句 0 / 3 轮';
    renderSentence();
    renderLeftPanel();
    updateRoundBadge();
    saveState();
  }

  /* =========================================================
     句子的单词、标注与左侧资料
     ========================================================= */

  function renderSentence() {
    const sentence = state.current;
    if (!sentence) return;
    dom.sentenceCategory.textContent = getRegion(sentence.region).name + ' · ' + getSub(getRegion(sentence.region), sentence.sub).name;
    dom.translationText.textContent = sentence.cn;
    dom.sentenceDisplay.innerHTML = '';
    dom.sentenceDisplay.setAttribute('aria-label', sentence.en);

    const tokens = [];
    const parts = sentence.en.match(/([A-Za-z]+(?:['’-][A-Za-z]+)*)|(\s+)|([^A-Za-z\s]+)/g) || [];
    let wordIndex = 0;
    parts.forEach((part) => {
      if (/^[A-Za-z]/.test(part)) {
        const start = sentence.en.indexOf(part, tokens.length ? tokens[tokens.length - 1].end : 0);
        const word = part;
        const button = make('button', 'sentence-word', word);
        button.type = 'button';
        button.dataset.wordIndex = String(wordIndex);
        button.setAttribute('aria-label', '查看 ' + word + ' 的音标和释义');
        dom.sentenceDisplay.appendChild(button);
        tokens.push({
          word: word,
          lower: word.toLowerCase(),
          element: button,
          index: wordIndex,
          start: start < 0 ? 0 : start,
          end: (start < 0 ? 0 : start) + word.length
        });
        wordIndex += 1;
      } else if (/^\s+$/.test(part)) {
        dom.sentenceDisplay.appendChild(document.createTextNode(' '));
      } else {
        dom.sentenceDisplay.appendChild(make('span', 'sentence-punct', part));
      }
    });

    state.wordTokens = tokens;
    const markTypes = tokens.map(() => new Set());
    sentence.marks.forEach((mark) => {
      const markWords = SCORE.tokenize(mark.range);
      if (!markWords.length) return;
      for (let i = 0; i <= tokens.length - markWords.length; i += 1) {
        let matched = true;
        for (let j = 0; j < markWords.length; j += 1) {
          if (tokens[i + j].lower !== markWords[j]) {
            matched = false;
            break;
          }
        }
        if (matched) {
          for (let j = 0; j < markWords.length; j += 1) markTypes[i + j].add(mark.type);
          break;
        }
      }
    });

    tokens.forEach((token, index) => {
      markTypes[index].forEach((type) => token.element.classList.add('mark-' + type));
    });
  }

  function renderLeftPanel() {
    const sentence = state.current;
    if (!sentence) return;
    dom.phoneticTips.innerHTML = '';
    sentence.phoneticTips.forEach((tip) => {
      dom.phoneticTips.appendChild(make('li', '', tip));
    });

    dom.wordList.innerHTML = '';
    sentence.words.forEach((word) => {
      const entry = lookupWord(word);
      const row = make('div', 'word-row');
      row.appendChild(make('strong', '', word));
      row.appendChild(make('em', '', entry.phonetic));
      row.appendChild(make('p', '', entry.pos + ' ' + entry.meaning));
      dom.wordList.appendChild(row);
    });
  }

  function lookupWord(word) {
    const key = String(word || '').toLowerCase();
    const entry = DATA.lexicon[key];
    if (entry) return { phonetic: entry[0], pos: entry[1], meaning: entry[2] };
    return { phonetic: '—', pos: '', meaning: '这个词的详细释义还在补充中。' };
  }

  /* =========================================================
     单词浮窗
     ========================================================= */

  function showWordPopover(button) {
    if (!state.current) return;
    const index = Number(button.dataset.wordIndex);
    const token = state.wordTokens[index];
    if (!token) return;
    const entry = lookupWord(token.word);
    state.popoverWord = token.word;
    dom.popoverWord.textContent = token.word;
    dom.popoverPhonetic.textContent = entry.phonetic;
    dom.popoverMeaning.textContent = [entry.pos, entry.meaning].filter(Boolean).join(' ');
    dom.wordPopover.classList.remove('hidden');

    const rect = button.getBoundingClientRect();
    const width = Math.min(250, window.innerWidth - 24);
    let left = rect.left + rect.width / 2 - width / 2;
    left = Math.max(12, Math.min(left, window.innerWidth - width - 12));
    let top = rect.bottom + 8;
    if (top + 150 > window.innerHeight) top = Math.max(12, rect.top - 150);
    dom.wordPopover.style.left = left + 'px';
    dom.wordPopover.style.top = top + 'px';
  }

  function closeWordPopover() {
    dom.wordPopover.classList.add('hidden');
    state.popoverWord = null;
  }

  /* =========================================================
     朗读
     ========================================================= */

  function setupSpeech() {
    if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
      state.ttsAvailable = false;
      dom.playBtn.disabled = true;
      dom.speechStatus.textContent = '当前浏览器不支持语音朗读，可以换 Chrome 或 Edge 试试。';
    }
  }

  function chooseVoice() {
    if (!('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    return voices.find((voice) => /^en[-_]US/i.test(voice.lang) && voice.localService)
      || voices.find((voice) => /^en[-_]US/i.test(voice.lang))
      || voices.find((voice) => /^en[-_]GB/i.test(voice.lang))
      || voices.find((voice) => /^en/i.test(voice.lang))
      || null;
  }

  function speakSentence() {
    if (!state.current) return;
    if (!('speechSynthesis' in window)) {
      dom.speechStatus.textContent = '当前浏览器不支持语音朗读。';
      return;
    }
    stopRecording(true);
    window.speechSynthesis.cancel();
    clearSpeakingWords();
    const utterance = new window.SpeechSynthesisUtterance(state.current.en);
    utterance.lang = 'en-US';
    utterance.rate = state.speed === 'slow' ? 0.72 : 0.92;
    utterance.pitch = 1;
    const voice = chooseVoice();
    if (voice) utterance.voice = voice;

    let lastIndex = -1;
    utterance.onstart = () => {
      dom.playBtn.classList.add('is-playing');
      dom.playBtn.querySelector('use').setAttribute('href', '#icon-stop');
      dom.speechStatus.textContent = state.speed === 'slow' ? '慢速朗读中，听清每个意群。' : '四级标准语速朗读中。';
    };
    utterance.onboundary = (event) => {
      const charIndex = Number(event.charIndex) || 0;
      let current = -1;
      state.wordTokens.forEach((token, index) => {
        if (token.start <= charIndex) current = index;
      });
      if (current !== lastIndex) {
        lastIndex = current;
        clearSpeakingWords();
        if (state.wordTokens[current]) state.wordTokens[current].element.classList.add('is-speaking');
      }
    };
    utterance.onend = () => {
      dom.playBtn.classList.remove('is-playing');
      dom.playBtn.querySelector('use').setAttribute('href', '#icon-volume');
      clearSpeakingWords();
      dom.speechStatus.textContent = '听完了，轮到你了。';
    };
    utterance.onerror = (event) => {
      dom.playBtn.classList.remove('is-playing');
      dom.playBtn.querySelector('use').setAttribute('href', '#icon-volume');
      clearSpeakingWords();
      if (event.error !== 'canceled' && event.error !== 'interrupted') {
        dom.speechStatus.textContent = '朗读暂时没有播放成功，再点一次试试。';
      }
    };
    window.speechSynthesis.speak(utterance);
  }

  function stopAudio() {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    dom.playBtn.classList.remove('is-playing');
    const use = dom.playBtn.querySelector('use');
    if (use) use.setAttribute('href', '#icon-volume');
    clearSpeakingWords();
  }

  function clearSpeakingWords() {
    dom.sentenceDisplay.querySelectorAll('.is-speaking').forEach((el) => el.classList.remove('is-speaking'));
  }

  /* =========================================================
     麦克风与识别
     ========================================================= */

  function setupRecognition() {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const secure = window.isSecureContext || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    if (!Recognition) {
      state.micMessage = '当前浏览器不支持语音识别。推荐用 Chrome 或 Edge 打开 HTTPS 页面。';
      dom.recordBtn.disabled = true;
      dom.recordStatus.textContent = state.micMessage;
      return;
    }
    if (!secure) {
      state.micMessage = '麦克风需要 HTTPS 或 localhost 环境。部署到 GitHub Pages 后即可使用。';
      dom.recordBtn.disabled = true;
      dom.recordStatus.textContent = state.micMessage;
      return;
    }
    state.Recognition = Recognition;
    state.micAvailable = true;
    state.micMessage = '准备好时，点一下麦克风。';
  }

  function toggleRecording() {
    if (state.listening) {
      stopRecording(false);
      return;
    }
    startRecording();
  }

  function startRecording() {
    if (!state.current || !state.Recognition || !state.micAvailable) {
      dom.recordStatus.textContent = '还没有可以练习的句子，或者当前浏览器不支持语音识别。';
      return;
    }
    if (state.round >= 3) {
      dom.recordStatus.textContent = '本句已经完成 3 轮啦，点“换下一句”继续。';
      return;
    }
    if (state.result) {
      dom.recordStatus.textContent = '先选择“继续练习本句”或“换下一句”。';
      return;
    }

    stopAudio();
    state.handledResult = false;
    state.errorFlag = false;
    state.listening = true;
    dom.recordBtn.classList.add('is-listening');
    dom.recordBtn.querySelector('use').setAttribute('href', '#icon-stop');
    dom.recordLabel.textContent = '停止收音';
    dom.recordStatus.textContent = '正在听… 读完稍等一下，不用急着停下。';
    dom.playBtn.disabled = true;

    const recognition = new state.Recognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.maxAlternatives = 3;
    recognition.continuous = false;

    let finalTranscript = '';

    recognition.onresult = (event) => {
      let interim = '';
      finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalTranscript += transcript + ' ';
        else interim += transcript;
      }
      if (interim) dom.recordStatus.textContent = '听到：' + interim.slice(0, 80) + (interim.length > 80 ? '…' : '');
      if (finalTranscript.trim()) {
        state.handledResult = true;
        finishRecordingUI();
        handleTranscript(finalTranscript.trim());
      }
    };

    recognition.onerror = (event) => {
      if (state.handledResult) return;
      state.errorFlag = true;
      finishRecordingUI();
      dom.recordStatus.textContent = recognitionErrorText(event.error);
    };

    recognition.onend = () => {
      if (!state.handledResult && !state.errorFlag) {
        finishRecordingUI();
        dom.recordStatus.textContent = '没有听到清晰的英文。靠近麦克风；如果环境比较吵，换安静一点的地方，放慢一点再试。';
      }
    };

    state.recognition = recognition;
    try {
      recognition.start();
    } catch (error) {
      finishRecordingUI();
      dom.recordStatus.textContent = '麦克风暂时没有启动成功，再点一次试试。';
      return;
    }

    window.clearTimeout(state.recordTimer);
    state.recordTimer = window.setTimeout(() => {
      if (state.listening) {
        try { recognition.abort(); } catch (error) { /* noop */ }
        state.errorFlag = true;
        finishRecordingUI();
        dom.recordStatus.textContent = '等了一会儿没有听到声音。确认麦克风可用后，再试一次。';
      }
    }, 15000);
  }

  function stopRecording(silent) {
    window.clearTimeout(state.recordTimer);
    if (silent) {
      state.handledResult = true;
      state.errorFlag = true;
    }
    if (state.recognition) {
      try {
        if (silent) state.recognition.abort();
        else state.recognition.stop();
      } catch (error) { /* noop */ }
    }
    finishRecordingUI();
    if (!silent && !state.handledResult) dom.recordStatus.textContent = '已经停止收音。';
  }

  function finishRecordingUI() {
    window.clearTimeout(state.recordTimer);
    state.listening = false;
    dom.recordBtn.classList.remove('is-listening');
    dom.recordBtn.querySelector('use').setAttribute('href', '#icon-mic');
    dom.recordLabel.textContent = '开始跟读';
    dom.playBtn.disabled = !state.ttsAvailable;
    dom.recordBtn.disabled = !state.micAvailable || Boolean(state.result) || state.round >= 3;
  }

  function recognitionErrorText(code) {
    if (code === 'not-allowed' || code === 'service-not-allowed') {
      return '麦克风权限被拒绝了。可以在浏览器地址栏的权限设置里允许麦克风，然后刷新重试。';
    }
    if (code === 'audio-capture') return '没有找到可用的麦克风，检查一下设备是否连接。';
    if (code === 'no-speech') return '没有听到清晰的声音。靠近一点麦克风；如果环境比较吵，换安静一点的地方再试。';
    if (code === 'network') return '语音识别服务暂时没有连上。可以换 Chrome / Edge，或稍后再试。';
    if (code === 'aborted') return '收音已经停止。';
    return '识别没有完成。可以再点一次麦克风试试。';
  }

  function handleTranscript(transcript) {
    if (!state.current) return;
    if (!SCORE.tokenize(transcript).length) {
      dom.recordStatus.textContent = '这次没有识别到英文单词，再慢慢读一遍。';
      dom.recordBtn.disabled = false;
      return;
    }

    const normalizedTranscript = normalizeCompoundWords(transcript, state.current.en);
    const result = SCORE.scoreSentence(state.current.en, normalizedTranscript);
    state.round += 1;
    state.result = {
      transcript: transcript,
      score: result.score,
      matched: result.matched
    };

    state.wordTokens.forEach((token) => {
      token.element.classList.remove('is-matched', 'is-missed');
      token.element.classList.add(result.matched.includes(token.index) ? 'is-matched' : 'is-missed');
    });

    dom.resultCard.classList.remove('hidden');
    dom.scoreRing.style.setProperty('--score', String(result.score));
    dom.scoreValue.textContent = String(result.score);
    dom.resultTitle.textContent = result.score >= 90
      ? '读得很稳，几乎跟上了。'
      : result.score >= 75
        ? '已经很接近啦。'
        : result.score >= 50
          ? '慢慢来，先跟住节奏。'
          : '没关系，再听一遍就好。';
    dom.resultFeedback.textContent = SCORE.feedback(result.score);
    dom.recognizedText.innerHTML = '';
    dom.recognizedText.appendChild(document.createTextNode('识别到：'));
    const strong = make('strong', '', transcript);
    dom.recognizedText.appendChild(strong);
    dom.recordBtn.disabled = true;
    dom.recordStatus.textContent = '这一轮读完了。看看标出来的词，再决定要不要继续。';

    const stat = state.practiced[state.current.id] || { attempts: 0, best: 0 };
    stat.attempts += 1;
    stat.best = Math.max(stat.best || 0, result.score);
    stat.last = result.score;
    state.practiced[state.current.id] = stat;
    saveState();
    updateRoundBadge();

    if (state.round >= 3) {
      dom.continueBtn.classList.add('hidden');
      dom.nextBtn.textContent = '完成并换下一句';
    } else {
      dom.continueBtn.classList.remove('hidden');
      dom.nextBtn.textContent = '换下一句';
    }
  }

  function updateRoundBadge() {
    dom.roundBadge.textContent = '本句 ' + state.round + ' / 3 轮';
  }

  function normalizeCompoundWords(transcript, sentence) {
    let normalized = transcript;
    const compounds = sentence.match(/[A-Za-z]+-[A-Za-z]+/g) || [];
    compounds.forEach((compound) => {
      const parts = compound.split('-').map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
      const pattern = new RegExp('\\b' + parts.join('\\s+') + '\\b', 'gi');
      normalized = normalized.replace(pattern, compound);
    });
    return normalized;
  }

  function continuePractice() {
    if (state.round >= 3) return;
    state.result = null;
    dom.resultCard.classList.add('hidden');
    dom.sentenceDisplay.querySelectorAll('.is-matched, .is-missed').forEach((el) => {
      el.classList.remove('is-matched', 'is-missed');
    });
    dom.recordBtn.disabled = !state.micAvailable;
    dom.recordStatus.textContent = '再读一遍，注意刚才标出来的词。';
    dom.speechStatus.textContent = '';
    closeWordPopover();
  }

  function nextSentence() {
    if (!state.current) return;
    if (state.round >= 3) {
      completePractice();
    } else {
      showToast('本句还没完成 3 轮，这次不计入打卡。');
    }
    advanceSentence();
  }

  function advanceSentence() {
    if (!state.sentences.length) return;
    let nextIndex = state.index;
    if (state.order === 'random' && state.sentences.length > 1) {
      while (nextIndex === state.index) {
        nextIndex = Math.floor(Math.random() * state.sentences.length);
      }
    } else {
      nextIndex = (state.index + 1) % state.sentences.length;
    }
    selectSentence(nextIndex);
  }

  /* =========================================================
     打卡与星星
     ========================================================= */

  function completePractice() {
    state.stars += 1;
    saveState();
    renderStars();
    spawnStarRain(12);
    if (state.stars === 5) showMilestone(5);
    if (state.stars === 10) showMilestone(10);
    showToast('完成 1 次打卡，收到一颗五角星。');
  }

  function renderStars() {
    dom.starCount.textContent = String(state.stars);
    const cycle = state.stars % 10 || (state.stars > 0 ? 10 : 0);
    if (!dom.starTrack.children.length) {
      for (let i = 0; i < 10; i += 1) {
        dom.starTrack.appendChild(make('span', 'star-track__star', '★'));
      }
    }
    Array.from(dom.starTrack.children).forEach((star, index) => {
      star.classList.toggle('is-filled', index < cycle);
    });
    dom.starWidget.setAttribute('aria-label', '五角星收集进度：累计 ' + state.stars + ' 颗，本轮 ' + cycle + ' / 10');
  }

  function spawnStarRain(count) {
    for (let i = 0; i < count; i += 1) {
      const star = make('span', 'reward-star', '★');
      star.style.left = (4 + Math.random() * 92) + 'vw';
      star.style.top = '-20px';
      star.style.setProperty('--size', (10 + Math.random() * 12) + 'px');
      star.style.setProperty('--drift', (Math.random() * 80 - 40) + 'px');
      star.style.setProperty('--delay', (Math.random() * 0.5) + 's');
      star.style.setProperty('--duration', (1.7 + Math.random() * 0.8) + 's');
      dom.rewardLayer.appendChild(star);
      window.setTimeout(() => star.remove(), 2800);
    }
  }

  function showMilestone(level) {
    const burst = make('div', 'reward-burst');
    const count = level === 10 ? 28 : 16;
    for (let i = 0; i < count; i += 1) {
      const star = make('span', 'reward-burst__star', '★');
      const angle = (Math.PI * 2 * i) / count;
      const distance = 80 + Math.random() * 120;
      star.style.setProperty('--x', Math.cos(angle) * distance + 'px');
      star.style.setProperty('--y', Math.sin(angle) * distance + 'px');
      star.style.setProperty('--delay', (i * 0.025) + 's');
      burst.appendChild(star);
    }
    dom.rewardLayer.appendChild(burst);
    if (level === 10) spawnStarRain(32);

    const message = make('div', 'reward-message' + (level === 10 ? ' reward-message--full' : ''),
      level === 10
        ? '🎉恭喜！完成10句打卡，你的口语进步看得见！'
        : '太棒啦！已经完成5句练习，继续保持！');
    dom.rewardLayer.appendChild(message);
    window.setTimeout(() => {
      burst.remove();
      message.remove();
    }, 3800);
  }

  function showToast(text) {
    dom.toast.textContent = text;
    dom.toast.classList.add('is-visible');
    window.clearTimeout(state.toastTimer);
    state.toastTimer = window.setTimeout(() => dom.toast.classList.remove('is-visible'), 2400);
  }

  /* =========================================================
     设置、重置与事件
     ========================================================= */

  function updateBlindMode() {
    document.body.classList.toggle('blind-mode', state.blind);
    dom.blindToggle.checked = state.blind;
  }

  function updateSpeedButtons() {
    dom.speedButtons.forEach((button) => {
      button.classList.toggle('is-active', button.dataset.speed === state.speed);
    });
  }

  function updateOrderButtons() {
    dom.orderToggle.querySelectorAll('[data-order]').forEach((button) => {
      button.classList.toggle('is-active', button.dataset.order === state.order);
    });
  }

  function openResetDialog() {
    if (typeof dom.resetDialog.showModal === 'function') dom.resetDialog.showModal();
    else dom.resetDialog.setAttribute('open', '');
  }

  function resetProgress() {
    stopAudio();
    stopRecording(true);
    try { window.localStorage.removeItem(STORAGE_KEY); } catch (error) { /* noop */ }
    state.stars = 0;
    state.practiced = {};
    state.round = 0;
    state.result = null;
    state.blind = false;
    dom.blindToggle.checked = false;
    updateBlindMode();
    renderStars();
    if (state.current) {
      dom.sentenceDisplay.querySelectorAll('.is-matched, .is-missed').forEach((el) => {
        el.classList.remove('is-matched', 'is-missed');
      });
      dom.resultCard.classList.add('hidden');
      dom.recordBtn.disabled = !state.micAvailable;
      dom.recordStatus.textContent = state.micAvailable ? '准备好时，点一下麦克风。' : state.micMessage;
      dom.roundBadge.textContent = '本句 0 / 3 轮';
      dom.continueBtn.classList.remove('hidden');
      dom.nextBtn.textContent = '换下一句';
    }
    showToast('打卡和星星已经清空，重新开始吧。');
    closeResetDialog();
  }

  function closeResetDialog() {
    if (typeof dom.resetDialog.close === 'function') dom.resetDialog.close();
    else dom.resetDialog.removeAttribute('open');
  }

  function bindEvents() {
    dom.regionSelect.addEventListener('change', () => {
      state.regionId = dom.regionSelect.value;
      populateSubs(state.regionId, null);
      saveState();
    });

    dom.subSelect.addEventListener('change', () => {
      state.subId = dom.subSelect.value;
      loadSub();
    });

    dom.orderToggle.addEventListener('click', (event) => {
      const button = event.target.closest('[data-order]');
      if (!button) return;
      state.order = button.dataset.order;
      updateOrderButtons();
      saveState();
      showToast(state.order === 'random' ? '当前分类内随机播放。' : '当前分类内顺序播放。');
    });

    dom.speedButtons.forEach((button) => {
      button.addEventListener('click', () => {
        state.speed = button.dataset.speed;
        updateSpeedButtons();
        saveState();
        if (dom.playBtn.classList.contains('is-playing')) {
          stopAudio();
          window.setTimeout(speakSentence, 80);
        }
      });
    });

    dom.blindToggle.addEventListener('change', () => {
      state.blind = dom.blindToggle.checked;
      if (state.blind) dom.translationBox.open = false;
      updateBlindMode();
      saveState();
    });

    dom.playBtn.addEventListener('click', () => {
      if (dom.playBtn.classList.contains('is-playing')) stopAudio();
      else speakSentence();
    });

    dom.recordBtn.addEventListener('click', toggleRecording);
    dom.continueBtn.addEventListener('click', continuePractice);
    dom.nextBtn.addEventListener('click', nextSentence);

    dom.sentenceDisplay.addEventListener('click', (event) => {
      const button = event.target.closest('.sentence-word');
      if (button) showWordPopover(button);
    });

    dom.wordPopoverClose.addEventListener('click', closeWordPopover);
    document.addEventListener('click', (event) => {
      if (dom.wordPopover.classList.contains('hidden')) return;
      if (!event.target.closest('.sentence-word') && !event.target.closest('#wordPopover')) closeWordPopover();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeWordPopover();
    });
    window.addEventListener('scroll', closeWordPopover, { passive: true });

    dom.resetProgressBtn.addEventListener('click', openResetDialog);
    dom.resetCancelBtn.addEventListener('click', closeResetDialog);
    dom.resetConfirmBtn.addEventListener('click', resetProgress);
    dom.resetDialog.addEventListener('click', (event) => {
      if (event.target === dom.resetDialog) closeResetDialog();
    });

    if ('speechSynthesis' in window && typeof window.speechSynthesis.addEventListener === 'function') {
      window.speechSynthesis.addEventListener('voiceschanged', () => { /* voices are selected on speak */ });
    }
    setupSpeech();
  }

  /* =========================================================
     调试接口（不参与 UI，只用于自动化测试/本地检查）
     ========================================================= */

  window.WhygeSpeaking = {
    simulateTranscript: handleTranscript,
    getState: () => ({
      regionId: state.regionId,
      subId: state.subId,
      index: state.index,
      round: state.round,
      stars: state.stars,
      sentenceId: state.current && state.current.id,
      en: state.current && state.current.en
    })
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
