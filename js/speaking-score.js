(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.WhygeSpeakingScore = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  function tokenize(text) {
    const value = String(text || '')
      .toLowerCase()
      .replace(/[’]/g, "'");
    return value.match(/[a-z]+(?:['-][a-z]+)*/g) || [];
  }

  function lcsMatrix(a, b) {
    const rows = a.length + 1;
    const cols = b.length + 1;
    const dp = Array.from({ length: rows }, () => new Array(cols).fill(0));
    for (let i = 1; i < rows; i += 1) {
      for (let j = 1; j < cols; j += 1) {
        if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
        else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
    return dp;
  }

  function matchedIndexes(a, b) {
    const dp = lcsMatrix(a, b);
    const matched = new Set();
    let i = a.length;
    let j = b.length;
    while (i > 0 && j > 0) {
      if (a[i - 1] === b[j - 1]) {
        matched.add(i - 1);
        i -= 1;
        j -= 1;
      } else if (dp[i - 1][j] >= dp[i][j - 1]) {
        i -= 1;
      } else {
        j -= 1;
      }
    }
    return matched;
  }

  function scoreSentence(original, transcript) {
    const target = tokenize(original);
    const said = tokenize(transcript);
    if (!target.length) return { score: 0, target: target, said: said, matched: [] };
    const matched = matchedIndexes(target, said);
    const score = Math.max(0, Math.min(100, Math.round((matched.size / target.length) * 100)));
    return {
      score: score,
      target: target,
      said: said,
      matched: Array.from(matched).sort((a, b) => a - b)
    };
  }

  function feedback(score) {
    if (score >= 95) return '太稳了，这一句已经很自然啦。';
    if (score >= 85) return '很好，再放松一点就更像日常说话了。';
    if (score >= 70) return '已经很接近了，注意听一下标色的词。';
    if (score >= 50) return '慢慢来，先跟读短一点的意群，再连起来。';
    return '没关系，戴上耳机再听一遍，跟着节奏轻轻读。';
  }

  return {
    tokenize: tokenize,
    scoreSentence: scoreSentence,
    feedback: feedback
  };
});
