import { useState } from 'react'
import { useSelector } from 'react-redux'
import { useTransformTextMutation } from '../store/api/textApi'
import { ENDPOINTS } from '../constants/endpoints'

export default function useAiTools(text, setText, setMarkdownMode, setPreviewMode, showAlert, pushHistory) {
    const { accessToken } = useSelector((s) => s.auth)
    const [aiResult, setAiResult] = useState(null)
    const [toneSetting, setToneSetting] = useState('formal')
    const [formatSetting, setFormatSetting] = useState('paragraph')
    const [translateLang, setTranslateLang] = useState('Spanish')
    const [translitLang, setTranslitLang] = useState('Hindi')
    const [splitDelimiter, setSplitDelimiter] = useState(',')
    const [joinSeparator, setJoinSeparator] = useState(', ')
    const [padAlign, setPadAlign] = useState('left')
    const [autoDetectLang, setAutoDetectLang] = useState(false)
    const [detectedLang, setDetectedLang] = useState(null)

    const [transformText] = useTransformTextMutation()

    const hasMarkdown = (str) => /[|#*\-]{2,}|^\s*[•\-\d]+[.)]\s|^\|.+\|$/m.test(str)

    const callAi = async (endpoint, label, errorMsg, toolId) => {
        if (!text) return
        if (!accessToken) {
            showAlert('Please log in to use AI tools', 'warning')
            return
        }
        const original = text
        try {
            const data = await transformText({ endpoint, text }).unwrap()
            setAiResult({ label, result: data.result })
            setPreviewMode('result')
            if (pushHistory) pushHistory(label, original, data.result, { toolId: toolId || label.toLowerCase().replace(/\s+/g, '_'), toolType: 'ai' })
            showAlert(`${label} generated`, 'success')
        } catch (err) {
            if (err.status === 429) {
                showAlert(err.data?.detail || 'Daily AI limit reached. Upgrade to Pro for unlimited access.', 'warning')
            } else {
                showAlert(err.data?.detail || errorMsg, 'danger')
            }
        }
    }

    const handleHashtags         = () => callAi(ENDPOINTS.GENERATE_HASHTAGS,         'Hashtags',          'Could not generate hashtags. Please try again.')
    const handleSeoTitles        = () => callAi(ENDPOINTS.GENERATE_SEO_TITLES,        'SEO Titles',        'Could not generate SEO titles. Please try again.')
    const handleMetaDescriptions = () => callAi(ENDPOINTS.GENERATE_META_DESCRIPTIONS, 'Meta Descriptions', 'Could not generate meta descriptions. Please try again.')
    const handleBlogOutline      = () => callAi(ENDPOINTS.GENERATE_BLOG_OUTLINE,      'Blog Outline',      'Could not generate blog outline. Please try again.')
    const handleTweetShorten     = () => callAi(ENDPOINTS.SHORTEN_FOR_TWEET,          'Tweet',             'Could not shorten for tweet. Please try again.')
    const handleEmailRewrite     = () => callAi(ENDPOINTS.REWRITE_EMAIL,              'Email',             'Could not rewrite email. Please try again.')
    const handleKeywords         = () => callAi(ENDPOINTS.EXTRACT_KEYWORDS,           'Keywords',          'Could not extract keywords. Please try again.')
    const handleSummarize        = () => callAi(ENDPOINTS.SUMMARIZE,                  'Summary',           'Could not summarize text. Please try again.')
    const handleFixGrammar       = () => callAi(ENDPOINTS.FIX_GRAMMAR,                'Grammar Fix',       'Could not fix grammar. Please try again.')
    const handleParaphrase       = () => callAi(ENDPOINTS.PARAPHRASE,                 'Paraphrase',        'Could not paraphrase text. Please try again.')
    const handleSentiment        = () => callAi(ENDPOINTS.ANALYZE_SENTIMENT,          'Sentiment',         'Could not analyze sentiment. Please try again.')
    const handleLengthenText     = () => callAi(ENDPOINTS.LENGTHEN_TEXT,              'Lengthened',        'Could not lengthen text. Please try again.')
    const handleEli5             = () => callAi(ENDPOINTS.ELI5,                       'ELI5',              'Could not simplify text. Please try again.')
    const handleProofread        = () => callAi(ENDPOINTS.PROOFREAD,                  'Proofread',         'Could not proofread text. Please try again.')
    const handleGenerateTitle    = () => callAi(ENDPOINTS.GENERATE_TITLE,             'Titles',            'Could not generate titles. Please try again.')
    const handleRefactorPrompt   = () => callAi(ENDPOINTS.REFACTOR_PROMPT,            'Prompt Refactored', 'Could not refactor prompt. Please try again.')
    const handleEmojify          = () => callAi(ENDPOINTS.EMOJIFY,                   'Emojify',           'Could not add emojis. Please try again.', 'emojify')

    const handleChangeFormat = async (overrideVal) => {
        if (!text) return
        const original = text
        const fmt = overrideVal ?? formatSetting
        try {
            const label = `Format (${fmt})`
            const data = await transformText({ endpoint: ENDPOINTS.CHANGE_FORMAT, text, format: fmt }).unwrap()
            setAiResult({ label, result: data.result })
            setPreviewMode('result')
            if (pushHistory) pushHistory(label, original, data.result, { toolId: 'change_format', toolType: 'select' })
            showAlert(`Reformatted as ${fmt}`, 'success')
        } catch (err) {
            showAlert(err.data?.detail || 'Could not change format. Please try again.', 'danger')
        }
    }

    const handleChangeTone = async (overrideVal) => {
        if (!text) return
        const original = text
        const tone = overrideVal ?? toneSetting
        try {
            const label = `Tone (${tone})`
            const data = await transformText({ endpoint: ENDPOINTS.CHANGE_TONE, text, tone }).unwrap()
            setAiResult({ label, result: data.result })
            setPreviewMode('result')
            if (pushHistory) pushHistory(label, original, data.result, { toolId: 'change_tone', toolType: 'select' })
            showAlert(`Tone changed to ${tone}`, 'success')
        } catch (err) {
            showAlert(err.data?.detail || 'Could not change tone. Please try again.', 'danger')
        }
    }

    const handleDetectLanguage = async () => {
        if (!text) return
        try {
            const data = await transformText({ endpoint: ENDPOINTS.DETECT_LANGUAGE, text }).unwrap()
            setDetectedLang(data.result)
            return data.result
        } catch {
            setDetectedLang(null)
            return null
        }
    }

    const handleTranslate = async (overrideVal) => {
        if (!text) return
        const original = text
        const lang = overrideVal ?? translateLang
        try {
            // Auto-detect source language if enabled
            if (autoDetectLang) {
                const detected = await handleDetectLanguage()
                if (detected) showAlert(`Detected: ${detected}`, 'info')
            }
            const label = `Translation (${lang})`
            const data = await transformText({ endpoint: ENDPOINTS.TRANSLATE, text, target_language: lang }).unwrap()
            setAiResult({ label, result: data.result })
            setPreviewMode('result')
            if (pushHistory) pushHistory(label, original, data.result, { toolId: 'translate', toolType: 'select' })
            showAlert(`Translated to ${lang}`, 'success')
        } catch (err) {
            showAlert(err.data?.detail || 'Could not translate text. Please try again.', 'danger')
        }
    }

    const handleTransliterate = async (overrideVal) => {
        if (!text) return
        const original = text
        const lang = overrideVal ?? translitLang
        try {
            const label = `Transliteration (${lang})`
            const data = await transformText({ endpoint: ENDPOINTS.TRANSLITERATE, text, target_language: lang }).unwrap()
            setAiResult({ label, result: data.result })
            setPreviewMode('result')
            if (pushHistory) pushHistory(label, original, data.result, { toolId: 'transliterate', toolType: 'select' })
            showAlert(`Transliterated to ${lang} script`, 'success')
        } catch (err) {
            showAlert(err.data?.detail || 'Could not transliterate text. Please try again.', 'danger')
        }
    }

    const handleSplitToLines = async (overrideVal) => {
        if (!text) return
        const original = text
        const delVal = overrideVal ?? splitDelimiter
        try {
            const delim = delVal === '\\t' ? '\t' : delVal
            const label = `Split to Lines (${delVal === '\\t' ? 'Tab' : delVal})`
            const data = await transformText({ endpoint: ENDPOINTS.SPLIT_TO_LINES, text, delimiter: delim }).unwrap()
            setAiResult({ label, result: data.result })
            setPreviewMode('result')
            if (pushHistory) pushHistory(label, original, data.result, { toolId: 'split_to_lines', toolType: 'select' })
            showAlert('Text split to lines', 'success')
        } catch (err) {
            showAlert(err.data?.detail || 'Could not split text. Please try again.', 'danger')
        }
    }

    const handleJoinLines = async (overrideVal) => {
        if (!text) return
        const original = text
        const sep = overrideVal ?? joinSeparator
        try {
            const label = `Join Lines (${sep || 'none'})`
            const data = await transformText({ endpoint: ENDPOINTS.JOIN_LINES, text, delimiter: sep }).unwrap()
            setAiResult({ label, result: data.result })
            setPreviewMode('result')
            if (pushHistory) pushHistory(label, original, data.result, { toolId: 'join_lines', toolType: 'select' })
            showAlert('Lines joined', 'success')
        } catch (err) {
            showAlert(err.data?.detail || 'Could not join lines. Please try again.', 'danger')
        }
    }

    const handlePadLines = async (overrideVal) => {
        if (!text) return
        const original = text
        const align = overrideVal ?? padAlign
        try {
            const label = `Pad Lines (${align})`
            const data = await transformText({ endpoint: ENDPOINTS.PAD_LINES, text, align }).unwrap()
            setAiResult({ label, result: data.result })
            setPreviewMode('result')
            if (pushHistory) pushHistory(label, original, data.result, { toolId: 'pad_lines', toolType: 'select' })
            showAlert(`Lines padded (${align})`, 'success')
        } catch (err) {
            showAlert(err.data?.detail || 'Could not pad lines. Please try again.', 'danger')
        }
    }

    const handleAiAccept = () => {
        if (aiResult) {
            setText(aiResult.result)
            if (hasMarkdown(aiResult.result)) setMarkdownMode(true)
            setAiResult(null)
        }
    }

    const handleAiDismiss = () => setAiResult(null)

    return {
        aiResult, setAiResult, hasMarkdown,
        toneSetting, setToneSetting,
        formatSetting, setFormatSetting,
        translateLang, setTranslateLang,
        translitLang, setTranslitLang,
        handleHashtags, handleSeoTitles, handleMetaDescriptions, handleBlogOutline,
        handleTweetShorten, handleEmailRewrite, handleKeywords,
        handleSummarize, handleFixGrammar, handleParaphrase,
        handleSentiment, handleLengthenText,
        handleEli5, handleProofread, handleGenerateTitle, handleRefactorPrompt,
        handleChangeFormat, handleChangeTone, handleTranslate, handleTransliterate,
        handleEmojify, handleDetectLanguage,
        autoDetectLang, setAutoDetectLang, detectedLang, setDetectedLang,
        splitDelimiter, setSplitDelimiter, joinSeparator, setJoinSeparator, padAlign, setPadAlign,
        handleSplitToLines, handleJoinLines, handlePadLines,
        handleAiAccept, handleAiDismiss,
    }
}
