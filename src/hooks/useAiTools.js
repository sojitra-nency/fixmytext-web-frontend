import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useTransformTextMutation } from '../store/api/textApi';
import { ENDPOINTS } from '../constants/endpoints';

export default function useAiTools(
  text,
  setText,
  setMarkdownMode,
  setPreviewMode,
  showAlert,
  pushHistory
) {
  const { accessToken } = useSelector((s) => s.auth);
  const [aiResult, setAiResult] = useState(null);
  const [toneSetting, setToneSetting] = useState('formal');
  const [formatSetting, setFormatSetting] = useState('paragraph');
  const [translateLang, setTranslateLang] = useState('Spanish');
  const [translitLang, setTranslitLang] = useState('Hindi');
  const [splitDelimiter, setSplitDelimiter] = useState(',');
  const [joinSeparator, setJoinSeparator] = useState(', ');
  const [padAlign, setPadAlign] = useState('left');
  const [autoDetectLang, setAutoDetectLang] = useState(false);
  const [detectedLang, setDetectedLang] = useState(null);
  const [caesarShift, setCaesarShift] = useState('3');
  const [railCount, setRailCount] = useState('3');
  const [curlTarget, setCurlTarget] = useState('javascript');
  const [dateFormatType, setDateFormatType] = useState('iso');

  const [transformText] = useTransformTextMutation();

  const hasMarkdown = (str) => /[|#*-]{2,}|^\s*[•\-\d]+[.)]\s|^\|.+\|$/m.test(str);

  const callAi = async (endpoint, label, errorMsg, toolId) => {
    if (!text) return;
    if (!accessToken) {
      showAlert('Please log in to use AI tools', 'warning');
      return;
    }
    const original = text;
    try {
      const data = await transformText({ endpoint, text }).unwrap();
      setAiResult({ label, result: data.result });
      setPreviewMode('result');
      if (pushHistory)
        pushHistory(label, original, data.result, {
          toolId: toolId || label.toLowerCase().replace(/\s+/g, '_'),
          toolType: 'ai',
        });
      showAlert(`${label} generated`, 'success');
    } catch (err) {
      if (err.status === 429) {
        showAlert(
          err.data?.detail || 'Daily AI limit reached. Upgrade to Pro for unlimited access.',
          'warning'
        );
      } else {
        showAlert(err.data?.detail || errorMsg, 'danger');
      }
    }
  };

  const handleHashtags = () =>
    callAi(
      ENDPOINTS.GENERATE_HASHTAGS,
      'Hashtags',
      'Could not generate hashtags. Please try again.'
    );
  const handleSeoTitles = () =>
    callAi(
      ENDPOINTS.GENERATE_SEO_TITLES,
      'SEO Titles',
      'Could not generate SEO titles. Please try again.'
    );
  const handleMetaDescriptions = () =>
    callAi(
      ENDPOINTS.GENERATE_META_DESCRIPTIONS,
      'Meta Descriptions',
      'Could not generate meta descriptions. Please try again.'
    );
  const handleBlogOutline = () =>
    callAi(
      ENDPOINTS.GENERATE_BLOG_OUTLINE,
      'Blog Outline',
      'Could not generate blog outline. Please try again.'
    );
  const handleTweetShorten = () =>
    callAi(ENDPOINTS.SHORTEN_FOR_TWEET, 'Tweet', 'Could not shorten for tweet. Please try again.');
  const handleEmailRewrite = () =>
    callAi(ENDPOINTS.REWRITE_EMAIL, 'Email', 'Could not rewrite email. Please try again.');
  const handleKeywords = () =>
    callAi(ENDPOINTS.EXTRACT_KEYWORDS, 'Keywords', 'Could not extract keywords. Please try again.');
  const handleSummarize = () =>
    callAi(ENDPOINTS.SUMMARIZE, 'Summary', 'Could not summarize text. Please try again.');
  const handleFixGrammar = () =>
    callAi(ENDPOINTS.FIX_GRAMMAR, 'Grammar Fix', 'Could not fix grammar. Please try again.');
  const handleParaphrase = () =>
    callAi(ENDPOINTS.PARAPHRASE, 'Paraphrase', 'Could not paraphrase text. Please try again.');
  const handleSentiment = () =>
    callAi(
      ENDPOINTS.ANALYZE_SENTIMENT,
      'Sentiment',
      'Could not analyze sentiment. Please try again.'
    );
  const handleLengthenText = () =>
    callAi(ENDPOINTS.LENGTHEN_TEXT, 'Lengthened', 'Could not lengthen text. Please try again.');
  const handleEli5 = () =>
    callAi(ENDPOINTS.ELI5, 'ELI5', 'Could not simplify text. Please try again.');
  const handleProofread = () =>
    callAi(ENDPOINTS.PROOFREAD, 'Proofread', 'Could not proofread text. Please try again.');
  const handleGenerateTitle = () =>
    callAi(ENDPOINTS.GENERATE_TITLE, 'Titles', 'Could not generate titles. Please try again.');
  const handleRefactorPrompt = () =>
    callAi(
      ENDPOINTS.REFACTOR_PROMPT,
      'Prompt Refactored',
      'Could not refactor prompt. Please try again.'
    );
  const handleEmojify = () =>
    callAi(ENDPOINTS.EMOJIFY, 'Emojify', 'Could not add emojis. Please try again.', 'emojify');

  // New AI Writing handlers
  const handleAcademicStyle = () =>
    callAi(
      ENDPOINTS.ACADEMIC_STYLE,
      'Academic Style',
      'Could not convert to academic style.',
      'academic_style'
    );
  const handleCreativeStyle = () =>
    callAi(
      ENDPOINTS.CREATIVE_STYLE,
      'Creative Style',
      'Could not convert to creative style.',
      'creative_style'
    );
  const handleTechnicalStyle = () =>
    callAi(
      ENDPOINTS.TECHNICAL_STYLE,
      'Technical Style',
      'Could not convert to technical style.',
      'technical_style'
    );
  const handleActiveVoice = () =>
    callAi(
      ENDPOINTS.ACTIVE_VOICE,
      'Active Voice',
      'Could not convert to active voice.',
      'active_voice'
    );
  const handleRedundancyRemover = () =>
    callAi(
      ENDPOINTS.REDUNDANCY_REMOVER,
      'Remove Redundancy',
      'Could not remove redundancy.',
      'redundancy_remover'
    );
  const handleSentenceSplitter = () =>
    callAi(
      ENDPOINTS.SENTENCE_SPLITTER,
      'Split Sentences',
      'Could not split sentences.',
      'sentence_splitter'
    );
  const handleConciseness = () =>
    callAi(ENDPOINTS.CONCISENESS, 'Make Concise', 'Could not make text concise.', 'conciseness');
  const handleResumeBullets = () =>
    callAi(
      ENDPOINTS.RESUME_BULLETS,
      'Resume Bullets',
      'Could not generate resume bullets.',
      'resume_bullets'
    );
  const handleMeetingNotes = () =>
    callAi(
      ENDPOINTS.MEETING_NOTES,
      'Meeting Notes',
      'Could not generate meeting notes.',
      'meeting_notes'
    );
  const handleCoverLetter = () =>
    callAi(
      ENDPOINTS.COVER_LETTER,
      'Cover Letter',
      'Could not generate cover letter.',
      'cover_letter'
    );
  const handleOutlineToDraft = () =>
    callAi(
      ENDPOINTS.OUTLINE_TO_DRAFT,
      'Outline→Draft',
      'Could not expand outline.',
      'outline_to_draft'
    );
  const handleContinueWriting = () =>
    callAi(
      ENDPOINTS.CONTINUE_WRITING,
      'Continue Writing',
      'Could not continue writing.',
      'continue_writing'
    );
  const handleRewriteUnique = () =>
    callAi(
      ENDPOINTS.REWRITE_UNIQUE,
      'Rewrite Unique',
      'Could not rewrite uniquely.',
      'rewrite_unique'
    );
  const handleToneAnalyzer = () =>
    callAi(ENDPOINTS.TONE_ANALYZER, 'Tone Analysis', 'Could not analyze tone.', 'tone_analyzer');

  // New AI Content handlers
  const handleLinkedinPost = () =>
    callAi(
      ENDPOINTS.LINKEDIN_POST,
      'LinkedIn Post',
      'Could not generate LinkedIn post.',
      'linkedin_post'
    );
  const handleTwitterThread = () =>
    callAi(
      ENDPOINTS.TWITTER_THREAD,
      'Twitter Thread',
      'Could not generate Twitter thread.',
      'twitter_thread'
    );
  const handleInstagramCaption = () =>
    callAi(
      ENDPOINTS.INSTAGRAM_CAPTION,
      'Instagram Caption',
      'Could not generate Instagram caption.',
      'instagram_caption'
    );
  const handleYoutubeDesc = () =>
    callAi(
      ENDPOINTS.YOUTUBE_DESC,
      'YouTube Description',
      'Could not generate YouTube description.',
      'youtube_desc'
    );
  const handleSocialBio = () =>
    callAi(ENDPOINTS.SOCIAL_BIO, 'Social Bio', 'Could not generate social bio.', 'social_bio');
  const handleProductDesc = () =>
    callAi(
      ENDPOINTS.PRODUCT_DESC,
      'Product Description',
      'Could not generate product description.',
      'product_desc'
    );
  const handleCtaGenerator = () =>
    callAi(ENDPOINTS.CTA_GENERATOR, 'CTAs', 'Could not generate CTAs.', 'cta_generator');
  const handleAdCopy = () =>
    callAi(ENDPOINTS.AD_COPY, 'Ad Copy', 'Could not generate ad copy.', 'ad_copy');
  const handleLandingHeadline = () =>
    callAi(
      ENDPOINTS.LANDING_HEADLINE,
      'Landing Headline',
      'Could not generate headlines.',
      'landing_headline'
    );
  const handleEmailSubject = () =>
    callAi(
      ENDPOINTS.EMAIL_SUBJECT,
      'Email Subject',
      'Could not generate subject lines.',
      'email_subject'
    );
  const handleContentIdeas = () =>
    callAi(
      ENDPOINTS.CONTENT_IDEAS,
      'Content Ideas',
      'Could not generate content ideas.',
      'content_ideas'
    );
  const handleHookGenerator = () =>
    callAi(ENDPOINTS.HOOK_GENERATOR, 'Hooks', 'Could not generate hooks.', 'hook_generator');
  const handleAngleGenerator = () =>
    callAi(ENDPOINTS.ANGLE_GENERATOR, 'Angles', 'Could not generate angles.', 'angle_generator');
  const handleFaqSchema = () =>
    callAi(ENDPOINTS.FAQ_SCHEMA, 'FAQ Schema', 'Could not generate FAQ schema.', 'faq_schema');

  // New Language handlers
  const handlePosTagger = () =>
    callAi(ENDPOINTS.POS_TAGGER, 'Parts of Speech', 'Could not tag parts of speech.', 'pos_tagger');
  const handleSentenceType = () =>
    callAi(
      ENDPOINTS.SENTENCE_TYPE,
      'Sentence Type',
      'Could not classify sentences.',
      'sentence_type'
    );
  const handleGrammarExplain = () =>
    callAi(
      ENDPOINTS.GRAMMAR_EXPLAIN,
      'Grammar Explain',
      'Could not explain grammar.',
      'grammar_explain'
    );
  const handleSynonymFinder = () =>
    callAi(ENDPOINTS.SYNONYM_FINDER, 'Synonyms', 'Could not find synonyms.', 'synonym_finder');
  const handleAntonymFinder = () =>
    callAi(ENDPOINTS.ANTONYM_FINDER, 'Antonyms', 'Could not find antonyms.', 'antonym_finder');
  const handleDefineWords = () =>
    callAi(ENDPOINTS.DEFINE_WORDS, 'Definitions', 'Could not define words.', 'define_words');
  const handleWordPower = () =>
    callAi(ENDPOINTS.WORD_POWER, 'Power Words', 'Could not enhance words.', 'word_power');
  const handleVocabComplexity = () =>
    callAi(
      ENDPOINTS.VOCAB_COMPLEXITY,
      'Vocab Complexity',
      'Could not analyze vocabulary.',
      'vocab_complexity'
    );
  const handleJargonSimplifier = () =>
    callAi(
      ENDPOINTS.JARGON_SIMPLIFIER,
      'Jargon Simplifier',
      'Could not simplify jargon.',
      'jargon_simplifier'
    );
  const handleFormalityDetector = () =>
    callAi(
      ENDPOINTS.FORMALITY_DETECTOR,
      'Formality',
      'Could not detect formality.',
      'formality_detector'
    );
  const handleClicheDetector = () =>
    callAi(
      ENDPOINTS.CLICHE_DETECTOR,
      'Cliche Detector',
      'Could not detect cliches.',
      'cliche_detector'
    );

  // New Generator AI handlers
  const handleRegexGen = () =>
    callAi(ENDPOINTS.REGEX_GEN, 'Regex Pattern', 'Could not generate regex.', 'regex_gen');
  const handleWritingPrompt = () =>
    callAi(
      ENDPOINTS.WRITING_PROMPT,
      'Writing Prompt',
      'Could not generate prompt.',
      'writing_prompt'
    );
  const handleTeamNameGen = () =>
    callAi(ENDPOINTS.TEAM_NAME_GEN, 'Team Names', 'Could not generate names.', 'team_name_gen');
  const handleMockApiResponse = () =>
    callAi(
      ENDPOINTS.MOCK_API_RESPONSE,
      'Mock API',
      'Could not generate mock response.',
      'mock_api_response'
    );

  const handleChangeFormat = async (overrideVal) => {
    if (!text) return;
    const original = text;
    const fmt = overrideVal ?? formatSetting;
    try {
      const label = `Format (${fmt})`;
      const data = await transformText({
        endpoint: ENDPOINTS.CHANGE_FORMAT,
        text,
        format: fmt,
      }).unwrap();
      setAiResult({ label, result: data.result });
      setPreviewMode('result');
      if (pushHistory)
        pushHistory(label, original, data.result, { toolId: 'change_format', toolType: 'select' });
      showAlert(`Reformatted as ${fmt}`, 'success');
    } catch (err) {
      showAlert(err.data?.detail || 'Could not change format. Please try again.', 'danger');
    }
  };

  const handleChangeTone = async (overrideVal) => {
    if (!text) return;
    const original = text;
    const tone = overrideVal ?? toneSetting;
    try {
      const label = `Tone (${tone})`;
      const data = await transformText({ endpoint: ENDPOINTS.CHANGE_TONE, text, tone }).unwrap();
      setAiResult({ label, result: data.result });
      setPreviewMode('result');
      if (pushHistory)
        pushHistory(label, original, data.result, { toolId: 'change_tone', toolType: 'select' });
      showAlert(`Tone changed to ${tone}`, 'success');
    } catch (err) {
      showAlert(err.data?.detail || 'Could not change tone. Please try again.', 'danger');
    }
  };

  const handleDetectLanguage = async () => {
    if (!text) return;
    try {
      const data = await transformText({ endpoint: ENDPOINTS.DETECT_LANGUAGE, text }).unwrap();
      setDetectedLang(data.result);
      return data.result;
    } catch {
      setDetectedLang(null);
      return null;
    }
  };

  const handleTranslate = async (overrideVal) => {
    if (!text) return;
    const original = text;
    const lang = overrideVal ?? translateLang;
    try {
      // Auto-detect source language if enabled
      if (autoDetectLang) {
        const detected = await handleDetectLanguage();
        if (detected) showAlert(`Detected: ${detected}`, 'info');
      }
      const label = `Translation (${lang})`;
      const data = await transformText({
        endpoint: ENDPOINTS.TRANSLATE,
        text,
        target_language: lang,
      }).unwrap();
      setAiResult({ label, result: data.result });
      setPreviewMode('result');
      if (pushHistory)
        pushHistory(label, original, data.result, { toolId: 'translate', toolType: 'select' });
      showAlert(`Translated to ${lang}`, 'success');
    } catch (err) {
      showAlert(err.data?.detail || 'Could not translate text. Please try again.', 'danger');
    }
  };

  const handleTransliterate = async (overrideVal) => {
    if (!text) return;
    const original = text;
    const lang = overrideVal ?? translitLang;
    try {
      const label = `Transliteration (${lang})`;
      const data = await transformText({
        endpoint: ENDPOINTS.TRANSLITERATE,
        text,
        target_language: lang,
      }).unwrap();
      setAiResult({ label, result: data.result });
      setPreviewMode('result');
      if (pushHistory)
        pushHistory(label, original, data.result, { toolId: 'transliterate', toolType: 'select' });
      showAlert(`Transliterated to ${lang} script`, 'success');
    } catch (err) {
      showAlert(err.data?.detail || 'Could not transliterate text. Please try again.', 'danger');
    }
  };

  const handleSplitToLines = async (overrideVal) => {
    if (!text) return;
    const original = text;
    const delVal = overrideVal ?? splitDelimiter;
    try {
      const delim = delVal === '\\t' ? '\t' : delVal;
      const label = `Split to Lines (${delVal === '\\t' ? 'Tab' : delVal})`;
      const data = await transformText({
        endpoint: ENDPOINTS.SPLIT_TO_LINES,
        text,
        delimiter: delim,
      }).unwrap();
      setAiResult({ label, result: data.result });
      setPreviewMode('result');
      if (pushHistory)
        pushHistory(label, original, data.result, { toolId: 'split_to_lines', toolType: 'select' });
      showAlert('Text split to lines', 'success');
    } catch (err) {
      showAlert(err.data?.detail || 'Could not split text. Please try again.', 'danger');
    }
  };

  const handleJoinLines = async (overrideVal) => {
    if (!text) return;
    const original = text;
    const sep = overrideVal ?? joinSeparator;
    try {
      const label = `Join Lines (${sep || 'none'})`;
      const data = await transformText({
        endpoint: ENDPOINTS.JOIN_LINES,
        text,
        delimiter: sep,
      }).unwrap();
      setAiResult({ label, result: data.result });
      setPreviewMode('result');
      if (pushHistory)
        pushHistory(label, original, data.result, { toolId: 'join_lines', toolType: 'select' });
      showAlert('Lines joined', 'success');
    } catch (err) {
      showAlert(err.data?.detail || 'Could not join lines. Please try again.', 'danger');
    }
  };

  const handleCaesarCipher = async (overrideVal) => {
    if (!text) return;
    const original = text;
    const shift = parseInt(overrideVal ?? caesarShift, 10);
    try {
      const label = `Caesar Cipher (shift ${shift})`;
      const data = await transformText({ endpoint: ENDPOINTS.CAESAR_CIPHER, text, shift }).unwrap();
      setAiResult({ label, result: data.result });
      setPreviewMode('result');
      if (pushHistory)
        pushHistory(label, original, data.result, { toolId: 'caesar_cipher', toolType: 'select' });
      showAlert(`Caesar cipher applied (shift ${shift})`, 'success');
    } catch (err) {
      showAlert(err.data?.detail || 'Could not apply Caesar cipher.', 'danger');
    }
  };

  const handleRailFenceEnc = async (overrideVal) => {
    if (!text) return;
    const original = text;
    const rails = parseInt(overrideVal ?? railCount, 10);
    try {
      const label = `Rail Fence Encrypt (${rails} rails)`;
      const data = await transformText({
        endpoint: ENDPOINTS.RAIL_FENCE_ENC,
        text,
        rails,
      }).unwrap();
      setAiResult({ label, result: data.result });
      setPreviewMode('result');
      if (pushHistory)
        pushHistory(label, original, data.result, { toolId: 'rail_fence_enc', toolType: 'select' });
      showAlert(`Rail fence encrypted (${rails} rails)`, 'success');
    } catch (err) {
      showAlert(err.data?.detail || 'Could not encrypt with Rail Fence.', 'danger');
    }
  };

  const handleRailFenceDec = async (overrideVal) => {
    if (!text) return;
    const original = text;
    const rails = parseInt(overrideVal ?? railCount, 10);
    try {
      const label = `Rail Fence Decrypt (${rails} rails)`;
      const data = await transformText({
        endpoint: ENDPOINTS.RAIL_FENCE_DEC,
        text,
        rails,
      }).unwrap();
      setAiResult({ label, result: data.result });
      setPreviewMode('result');
      if (pushHistory)
        pushHistory(label, original, data.result, { toolId: 'rail_fence_dec', toolType: 'select' });
      showAlert(`Rail fence decrypted (${rails} rails)`, 'success');
    } catch (err) {
      showAlert(err.data?.detail || 'Could not decrypt Rail Fence.', 'danger');
    }
  };

  const handleCurlToCode = async (overrideVal) => {
    if (!text) return;
    const original = text;
    const target = overrideVal ?? curlTarget;
    // Client-side cURL to code conversion
    try {
      let result = text;
      const urlMatch = text.match(/curl\s+(?:.*?\s+)?['"]?(https?:\/\/[^\s'"]+)/);
      const url = urlMatch ? urlMatch[1] : 'https://api.example.com';
      const methodMatch = text.match(/-X\s+(\w+)/);
      const method = methodMatch ? methodMatch[1] : 'GET';
      const headerMatches = [...text.matchAll(/-H\s+['"]([^'"]+)['"]/g)];
      const headers = Object.fromEntries(
        headerMatches
          .map((m) => m[1].split(': ').map((s) => s.trim()))
          .filter((p) => p.length === 2)
      );
      const dataMatch =
        text.match(/-d\s+['"]([^'"]+)['"]/) || text.match(/--data\s+['"]([^'"]+)['"]/);
      const body = dataMatch ? dataMatch[1] : null;

      if (target === 'javascript') {
        const opts = [`  method: '${method}'`];
        if (Object.keys(headers).length)
          opts.push(`  headers: ${JSON.stringify(headers, null, 4).replace(/\n/g, '\n  ')}`);
        if (body) opts.push(`  body: '${body}'`);
        result = `fetch('${url}', {\n${opts.join(
          ',\n'
        )}\n})\n  .then(res => res.json())\n  .then(data => console.log(data))`;
      } else if (target === 'python') {
        const lines = [`import requests\n`];
        if (body)
          lines.push(
            `response = requests.${method.toLowerCase()}('${url}', headers=${JSON.stringify(
              headers
            )}, data='${body}')`
          );
        else
          lines.push(
            `response = requests.${method.toLowerCase()}('${url}', headers=${JSON.stringify(
              headers
            )})`
          );
        lines.push(`print(response.json())`);
        result = lines.join('\n');
      } else if (target === 'go') {
        result = `package main\n\nimport (\n  "fmt"\n  "net/http"\n  "io/ioutil"\n)\n\nfunc main() {\n  req, _ := http.NewRequest("${method}", "${url}", nil)\n  client := &http.Client{}\n  resp, _ := client.Do(req)\n  body, _ := ioutil.ReadAll(resp.Body)\n  fmt.Println(string(body))\n}`;
      } else if (target === 'php') {
        result = `<?php\n$ch = curl_init('${url}');\ncurl_setopt($ch, CURLOPT_RETURNTRANSFER, true);\n$response = curl_exec($ch);\ncurl_close($ch);\necho $response;\n?>`;
      }
      const label = `cURL → ${target}`;
      setAiResult({ label, result });
      setPreviewMode('result');
      if (pushHistory)
        pushHistory(label, original, result, { toolId: 'curl_to_code', toolType: 'select' });
      showAlert(`Converted to ${target}`, 'success');
    } catch {
      showAlert('Could not convert cURL command.', 'danger');
    }
  };

  const handleDateFormat = async (overrideVal) => {
    if (!text) return;
    const original = text;
    const fmt = overrideVal ?? dateFormatType;
    try {
      // Try to parse the date from text
      const lines = text.split('\n').map((line) => {
        const d = new Date(line.trim());
        if (isNaN(d.getTime())) return line;
        switch (fmt) {
          case 'iso':
            return d.toISOString();
          case 'us':
            return `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d
              .getDate()
              .toString()
              .padStart(2, '0')}/${d.getFullYear()}`;
          case 'eu':
            return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1)
              .toString()
              .padStart(2, '0')}/${d.getFullYear()}`;
          case 'long':
            return d.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });
          case 'relative': {
            const diff = Date.now() - d.getTime();
            const days = Math.floor(diff / 86400000);
            if (days === 0) return 'Today';
            if (days === 1) return 'Yesterday';
            if (days < 30) return `${days} days ago`;
            if (days < 365) return `${Math.floor(days / 30)} months ago`;
            return `${Math.floor(days / 365)} years ago`;
          }
          default:
            return d.toISOString();
        }
      });
      const result = lines.join('\n');
      const label = `Date Format (${fmt})`;
      setAiResult({ label, result });
      setPreviewMode('result');
      if (pushHistory)
        pushHistory(label, original, result, { toolId: 'date_format', toolType: 'select' });
      showAlert(`Date formatted as ${fmt}`, 'success');
    } catch {
      showAlert('Could not format date.', 'danger');
    }
  };

  const handlePadLines = async (overrideVal) => {
    if (!text) return;
    const original = text;
    const align = overrideVal ?? padAlign;
    try {
      const label = `Pad Lines (${align})`;
      const data = await transformText({ endpoint: ENDPOINTS.PAD_LINES, text, align }).unwrap();
      setAiResult({ label, result: data.result });
      setPreviewMode('result');
      if (pushHistory)
        pushHistory(label, original, data.result, { toolId: 'pad_lines', toolType: 'select' });
      showAlert(`Lines padded (${align})`, 'success');
    } catch (err) {
      showAlert(err.data?.detail || 'Could not pad lines. Please try again.', 'danger');
    }
  };

  const handleAiAccept = () => {
    if (aiResult) {
      setText(aiResult.result);
      if (hasMarkdown(aiResult.result)) setMarkdownMode(true);
      setAiResult(null);
    }
  };

  const handleAiDismiss = () => setAiResult(null);

  return {
    aiResult,
    setAiResult,
    hasMarkdown,
    toneSetting,
    setToneSetting,
    formatSetting,
    setFormatSetting,
    translateLang,
    setTranslateLang,
    translitLang,
    setTranslitLang,
    handleHashtags,
    handleSeoTitles,
    handleMetaDescriptions,
    handleBlogOutline,
    handleTweetShorten,
    handleEmailRewrite,
    handleKeywords,
    handleSummarize,
    handleFixGrammar,
    handleParaphrase,
    handleSentiment,
    handleLengthenText,
    handleEli5,
    handleProofread,
    handleGenerateTitle,
    handleRefactorPrompt,
    handleChangeFormat,
    handleChangeTone,
    handleTranslate,
    handleTransliterate,
    handleEmojify,
    handleDetectLanguage,
    autoDetectLang,
    setAutoDetectLang,
    detectedLang,
    setDetectedLang,
    splitDelimiter,
    setSplitDelimiter,
    joinSeparator,
    setJoinSeparator,
    padAlign,
    setPadAlign,
    handleSplitToLines,
    handleJoinLines,
    handlePadLines,
    // New select tool state
    caesarShift,
    setCaesarShift,
    railCount,
    setRailCount,
    curlTarget,
    setCurlTarget,
    dateFormatType,
    setDateFormatType,
    // New select tool handlers
    handleCaesarCipher,
    handleRailFenceEnc,
    handleRailFenceDec,
    handleCurlToCode,
    handleDateFormat,
    // New AI Writing handlers
    handleAcademicStyle,
    handleCreativeStyle,
    handleTechnicalStyle,
    handleActiveVoice,
    handleRedundancyRemover,
    handleSentenceSplitter,
    handleConciseness,
    handleResumeBullets,
    handleMeetingNotes,
    handleCoverLetter,
    handleOutlineToDraft,
    handleContinueWriting,
    handleRewriteUnique,
    handleToneAnalyzer,
    // New AI Content handlers
    handleLinkedinPost,
    handleTwitterThread,
    handleInstagramCaption,
    handleYoutubeDesc,
    handleSocialBio,
    handleProductDesc,
    handleCtaGenerator,
    handleAdCopy,
    handleLandingHeadline,
    handleEmailSubject,
    handleContentIdeas,
    handleHookGenerator,
    handleAngleGenerator,
    handleFaqSchema,
    // New Language handlers
    handlePosTagger,
    handleSentenceType,
    handleGrammarExplain,
    handleSynonymFinder,
    handleAntonymFinder,
    handleDefineWords,
    handleWordPower,
    handleVocabComplexity,
    handleJargonSimplifier,
    handleFormalityDetector,
    handleClicheDetector,
    // New Generator AI handlers
    handleRegexGen,
    handleWritingPrompt,
    handleTeamNameGen,
    handleMockApiResponse,
    handleAiAccept,
    handleAiDismiss,
  };
}
