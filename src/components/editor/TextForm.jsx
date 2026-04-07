import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTransformTextMutation } from '../../store/api/textApi';
import { useSelector } from 'react-redux';
import { useLogoutMutation } from '../../store/api/authApi';
import {
  useGetHistoryQuery,
  useDeleteHistoryEntryMutation,
  useClearHistoryMutation,
} from '../../store/api/historyApi';
import { useGetUiSettingsQuery, useUpdateUiSettingsMutation } from '../../store/api/userDataApi';
import {
  TOOLS,
  PERSONAS,
  QUEST_TEMPLATES,
  USE_CASE_TABS,
  ACHIEVEMENTS,
} from '../../constants/tools';
import { ENDPOINTS } from '../../constants/endpoints';
import { ROUTES } from '../../constants';

// Hooks
import useFindReplace from '../../hooks/useFindReplace';
import useTextCompare from '../../hooks/useTextCompare';
import useGenerators from '../../hooks/useGenerators';
import useFormatter from '../../hooks/useFormatter';
import useAiTools from '../../hooks/useAiTools';
import useSpeech from '../../hooks/useSpeech';
import useExport from '../../hooks/useExport';
import useRegexTester from '../../hooks/useRegexTester';
import useTemplates from '../../hooks/useTemplates';
import useHistory from '../../hooks/useHistory';
import useWordFrequency from '../../hooks/useWordFrequency';
import usePipeline from '../../hooks/usePipeline';
import useSmartSuggestions from '../../hooks/useSmartSuggestions';
import useToolSearch from '../../hooks/useToolSearch';
import useResize from '../../hooks/useResize';
import useTrialLimit from '../../hooks/useTrialLimit';
import useKeyboardShortcuts from '../../hooks/useKeyboardShortcuts';

// Components
import ToolPanel from './ToolPanel';
import ToolIcon from './ToolIcon';
import OutputPanel from './OutputPanel';
import DrawerPanel from '../drawers/DrawerPanel';
import FindReplaceDrawer from '../drawers/FindReplaceDrawer';
import CompareOutput, { CompareInput } from '../drawers/CompareDrawer';
import { RandomTextDrawer, PasswordDrawer } from '../drawers/GeneratorDrawer';
import FmtConfigBar from './FmtConfigBar';
import RegexDrawer from '../drawers/RegexDrawer';
import {
  WrapLinesDrawer,
  FilterLinesDrawer,
  TruncateLinesDrawer,
  NthLineDrawer,
} from '../drawers/LineToolsDrawer';
import TemplatesDrawer from '../drawers/TemplatesDrawer';
import HistoryDrawer from '../drawers/HistoryDrawer';
import CipherDrawer from '../drawers/CipherDrawer';
import DiffDrawer from '../drawers/DiffDrawer';
import FakeDataDrawer from '../drawers/FakeDataDrawer';
import {
  JsonPathDrawer,
  MarkdownPreviewDrawer,
  LoremIpsumDrawer,
  SampleJsonDrawer,
} from '../drawers/DevToolsDrawer';
import SmartSuggestions from './SmartSuggestions';
import BottomPanel from './BottomPanel';
import CommandPalette from '../layout/CommandPalette';
import KeyboardShortcuts from '../layout/KeyboardShortcuts';
import AchievementToast from '../gamification/AchievementToast';

import { motion, AnimatePresence } from 'framer-motion';

// SVG icons for activity bar (module-level constant — avoids recreation on every render)
const ACTIVITY_ICONS = {
  all: (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  writing: (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  ),
  transform: (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  ),
  code: (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  ai: (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z" />
      <path d="M16 14H8a4 4 0 0 0-4 4v2h16v-2a4 4 0 0 0-4-4z" />
      <circle cx="9" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="15" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  ),
  language: (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  encode: (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
};

// Drawer panel metadata (static — no need to recreate per render)
const DRAWERS = {
  find: { title: 'Find & Replace', color: 'teal' },
  compare: { title: 'Text Compare', color: 'purple' },
  randtext: { title: 'Random Text Generator', color: 'amber' },
  password: { title: 'Password Generator', color: 'amber' },
  regex: { title: 'Regex Tester', color: 'teal' },
  templates: { title: 'Text Templates', color: 'amber' },
  history: { title: 'History / Undo', color: 'slate' },
  wraplines: { title: 'Wrap Lines', color: 'teal' },
  filterlines: { title: 'Keep Lines', color: 'teal' },
  droplines: { title: 'Drop Lines', color: 'teal' },
  truncatelines: { title: 'Truncate Lines', color: 'teal' },
  nthlines: { title: 'Every Nth Line', color: 'teal' },
};

/* ── Tab bar with scroll arrows that disable at boundaries ── */
function TabBarWrap({
  workspaceTabs,
  activeWorkspaceId,
  setActiveWorkspaceId,
  setActivePanel,
  setSaveModal,
  closeWorkspaceTab,
  onTabSwitch,
}) {
  const barRef = useRef(null);
  const [scrollState, setScrollState] = useState({ overflows: false, atStart: true, atEnd: true });

  const updateScroll = useCallback(() => {
    const el = barRef.current;
    if (!el) return;
    const overflows = el.scrollWidth > el.clientWidth;
    const atStart = el.scrollLeft <= 0;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1;
    setScrollState({ overflows, atStart, atEnd });
  }, []);

  useEffect(() => {
    const el = barRef.current;
    if (!el) return;
    updateScroll();
    el.addEventListener('scroll', updateScroll, { passive: true });
    const ro = new ResizeObserver(updateScroll);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', updateScroll);
      ro.disconnect();
    };
  }, [updateScroll, workspaceTabs.length]);

  return (
    <div className="tu-tab-bar-wrap">
      {scrollState.overflows && (
        <button
          className={`tu-tab-scroll tu-tab-scroll--left${
            scrollState.atStart ? ' tu-tab-scroll--disabled' : ''
          }`}
          onClick={() => barRef.current?.scrollBy({ left: -200, behavior: 'smooth' })}
          disabled={scrollState.atStart}
          title="Scroll tabs left"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      )}
      <div
        ref={barRef}
        className="tu-tab-bar"
        onWheel={(e) => {
          e.currentTarget.scrollLeft += e.deltaY;
          e.preventDefault();
        }}
      >
        {workspaceTabs.map((tab) => (
          <div
            key={tab.id}
            className={`tu-tab${activeWorkspaceId === tab.id ? ' tu-tab--active' : ''}`}
            onClick={() => {
              if (tab.id !== activeWorkspaceId) onTabSwitch?.();
              setActiveWorkspaceId(tab.id);
              if (tab.type === 'drawer') setActivePanel(tab.panelId);
            }}
            title={`~/FixMyText/workspace/${tab.label}`}
          >
            <ToolIcon
              icon={tab.icon}
              color={tab.tool?.color || tab.color}
              toolId={tab.tool?.id || tab.panelId}
            />
            <span className="tu-tab-name">{tab.label}</span>
            <button
              className="tu-tab-save"
              onClick={(e) => {
                e.stopPropagation();
                setSaveModal({ tabId: tab.id, defaultName: tab.label });
              }}
              title="Save to templates (Ctrl+S)"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
            </button>
            <button
              className="tu-tab-close"
              onClick={(e) => {
                e.stopPropagation();
                closeWorkspaceTab(tab.id);
              }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      {scrollState.overflows && (
        <button
          className={`tu-tab-scroll tu-tab-scroll--right${
            scrollState.atEnd ? ' tu-tab-scroll--disabled' : ''
          }`}
          onClick={() => barRef.current?.scrollBy({ left: 200, behavior: 'smooth' })}
          disabled={scrollState.atEnd}
          title="Scroll tabs right"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      )}
    </div>
  );
}

export default function TextForm(props) {
  const [toolTexts, setToolTexts] = useState({});
  const [dyslexiaMode, setDyslexiaMode] = useState(false);
  const [markdownMode, setMarkdownMode] = useState(false);
  const [activePanel, setActivePanel] = useState(null);
  const [previewMode, setPreviewMode] = useState(null);
  const [activeTab, setActiveTab] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [toolViewMode, setToolViewMode] = useState(
    () => localStorage.getItem('fmx_tool_view') || 'grid'
  );
  const [workspaceTabs, setWorkspaceTabs] = useState([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(null);
  const [toolResults, setToolResults] = useState({}); // keyed by tab ID, not tool ID
  const aiResultSourceRef = useRef(null); // tracks which toolId/panelId produced the current ai.aiResult
  const lastTextPerTab = useRef({}); // tracks last input text per tab for debounce
  const [, setSavedTabs] = useState({});
  const [saveModal, setSaveModal] = useState(null); // { tabId, defaultName }

  // Per-tool text: derived from the active workspace tab
  const activeTabIdRef = useRef(null);
  activeTabIdRef.current = activeWorkspaceId;
  const text = toolTexts[activeWorkspaceId] || '';
  const setText = useCallback((valOrFn) => {
    const tabId = activeTabIdRef.current;
    if (!tabId) return;
    setToolTexts((prev) => {
      const oldVal = prev[tabId] || '';
      const newVal = typeof valOrFn === 'function' ? valOrFn(oldVal) : valOrFn;
      return { ...prev, [tabId]: newVal };
    });
    // Mark as unsaved when text changes
    setSavedTabs((prev) => (prev[tabId] ? { ...prev, [tabId]: false } : prev));
  }, []);
  const sharedTextRef = useRef(null);
  const pendingAutoRun = useRef(null);
  const selectValueRef = useRef(null); // holds the freshly-clicked value for select tools

  const showAlert = props.showAlert;
  const navigate = useNavigate();
  const [logout] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      showAlert('Logged out', 'success');
      navigate(ROUTES.HOME);
    } catch {
      showAlert('Logout failed', 'danger');
    }
  };

  // ── RTK Query mutation ──────────────────────────────────
  const [transformText, { isLoading: rtkLoading }] = useTransformTextMutation();
  const [localLoading, setLocalLoading] = useState(false);
  const loading = rtkLoading || localLoading;

  // ── Hooks ───────────────────────────────────────────────
  const findReplace = useFindReplace(text, setText, showAlert);
  const compare = useTextCompare(text, showAlert);
  const generators = useGenerators(setText, showAlert);
  const formatter = useFormatter(text, setLocalLoading, showAlert, (label, result) => {
    const toolId = activeWorkspaceId?.replace('tool-', '') || null;
    aiResultSourceRef.current = toolId;
    ai.setAiResult({ label, result });
    setPreviewMode('result');
    history.pushHistory(label, text, result, { toolType: 'local' });
  });
  const history = useHistory(setText, showAlert);
  const ai = useAiTools(
    text,
    setText,
    setMarkdownMode,
    setPreviewMode,
    showAlert,
    history.pushHistory
  );
  const speech = useSpeech(text, setText, showAlert);
  const exportTools = useExport(setLocalLoading, showAlert);
  const regex = useRegexTester(text, showAlert);
  const templateHelpersRef = useRef({ getActiveToolId: () => null, openToolById: () => {} });
  const templates = useTemplates(text, setText, showAlert, {
    getActiveToolId: () => templateHelpersRef.current.getActiveToolId(),
    openToolById: (toolId, content) => templateHelpersRef.current.openToolById(toolId, content),
    renameActiveTab: (name) => templateHelpersRef.current.renameActiveTab(name),
  });
  const wordFreq = useWordFrequency(
    text,
    showAlert,
    ai.setAiResult,
    setPreviewMode,
    history.pushHistory
  );
  const gamification = props.gamification;
  const pipeline = usePipeline();
  const suggestions = useSmartSuggestions(text);
  const search = useToolSearch();
  const trial = useTrialLimit(props.isAuthenticated);
  const subscription = props.subscription;

  // ── Persistent history (server-side) ─────────────────────
  const { accessToken } = useSelector((s) => s.auth);
  const [historyView, setHistoryView] = useState('session'); // 'session' | 'saved'
  const [historyPage, setHistoryPage] = useState(1);
  const { data: serverHistory, isFetching: historyFetching } = useGetHistoryQuery(
    { page: historyPage, pageSize: 25 },
    { skip: !accessToken || historyView !== 'saved' }
  );
  const [deleteHistoryEntry] = useDeleteHistoryEntryMutation();
  const [clearServerHistory] = useClearHistoryMutation();

  // ── UI Settings (tool_view + panel sizes synced to server) ──
  const { data: uiSettings } = useGetUiSettingsQuery(undefined, { skip: !accessToken });
  const [updateUiSettings] = useUpdateUiSettingsMutation();
  const uiSettingsHydrated = useRef(false);

  // Hydrate tool_view and panel sizes from server on login
  useEffect(() => {
    if (uiSettings && !uiSettingsHydrated.current) {
      uiSettingsHydrated.current = true;
      if (uiSettings.tool_view) {
        setToolViewMode(uiSettings.tool_view);
        localStorage.setItem('fmx_tool_view', uiSettings.tool_view);
      }
      const ps = uiSettings.panel_sizes || {};
      if (ps.fmx_sidebar_w) {
        localStorage.setItem('fmx_sidebar_w', String(ps.fmx_sidebar_w));
        sidebarResize.setSize(Number(ps.fmx_sidebar_w));
      }
      if (ps.fmx_split_pct) {
        localStorage.setItem('fmx_split_pct', String(ps.fmx_split_pct));
        splitResize.setSize(Number(ps.fmx_split_pct));
      }
      if (ps.fmx_bottom_h) {
        localStorage.setItem('fmx_bottom_h', String(ps.fmx_bottom_h));
        bottomResize.setSize(Number(ps.fmx_bottom_h));
      }
    }
  }, [uiSettings]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!accessToken) uiSettingsHydrated.current = false;
  }, [accessToken]);

  // Resizable panels
  const splitRef = useRef(null);
  const gutterRef = useRef(null);
  const textRef = useRef(text);
  textRef.current = text;
  const textareaRef = useRef(null);
  const sidebarResize = useResize('horizontal', 240, {
    min: 160,
    max: 480,
    storageKey: 'fmx_sidebar_w',
  });
  const splitResize = useResize('horizontal', 50, {
    min: 20,
    max: 80,
    storageKey: 'fmx_split_pct',
    unit: 'percent',
    containerRef: splitRef,
  });
  const bottomResize = useResize('vertical', 200, {
    min: 80,
    max: 500,
    storageKey: 'fmx_bottom_h',
  });

  // Sync panel sizes to server when authenticated (debounced)
  const panelSizeSyncTimer = useRef(null);
  const syncPanelSizes = useCallback(
    (updates) => {
      if (!accessToken) return;
      clearTimeout(panelSizeSyncTimer.current);
      panelSizeSyncTimer.current = setTimeout(() => {
        updateUiSettings({ panel_sizes: updates })
          .unwrap()
          .catch(() => {});
      }, 800);
    },
    [accessToken, updateUiSettings]
  );

  // Watch panel sizes and sync to server
  useEffect(() => {
    if (!accessToken || !uiSettingsHydrated.current) return;
    syncPanelSizes({
      fmx_sidebar_w: sidebarResize.size,
      fmx_split_pct: splitResize.size,
      fmx_bottom_h: bottomResize.size,
    });
  }, [sidebarResize.size, splitResize.size, bottomResize.size]); // eslint-disable-line react-hooks/exhaustive-deps

  // Set default tab from persona
  useEffect(() => {
    if (gamification?.persona && !activeTab) {
      setActiveTab(PERSONAS[gamification.persona]?.defaultTab || 'all');
    }
  }, [gamification?.persona, activeTab]);

  useEffect(() => {
    if (!activeTab) setActiveTab('all');
  }, [activeTab]);

  // Capture AI results per-tab for persistence
  // Keyed by tab ID so each tab is fully independent
  useEffect(() => {
    if (ai.aiResult && activeWorkspaceId) {
      const ws = workspaceTabs.find((t) => t.id === activeWorkspaceId);
      if (!ws) return;
      // Only persist if this result belongs to the active tab
      const expectedSource = ws.type === 'tool' ? ws.tool.id : ws.panelId;
      if (aiResultSourceRef.current === expectedSource) {
        setToolResults((prev) => ({ ...prev, [activeWorkspaceId]: ai.aiResult }));
      }
    }
  }, [ai.aiResult, activeWorkspaceId, workspaceTabs]);

  const closeWorkspaceTab = (tabId) => {
    setWorkspaceTabs((tabs) => {
      const remaining = tabs.filter((t) => t.id !== tabId);
      if (activeWorkspaceId === tabId) {
        const newActive = remaining.length > 0 ? remaining[remaining.length - 1] : null;
        setActiveWorkspaceId(newActive?.id || null);
        setActivePanel(newActive?.type === 'drawer' ? newActive.panelId : null);
      }
      return remaining;
    });
    // Clean up per-tab text
    setToolTexts((prev) => {
      const next = { ...prev };
      delete next[tabId];
      return next;
    });
    // Clean up per-tab result
    setToolResults((prev) => {
      const next = { ...prev };
      delete next[tabId];
      return next;
    });
    // Clean up per-tab text tracking
    if (lastTextPerTab.current[tabId] !== undefined) {
      delete lastTextPerTab.current[tabId];
    }
  };

  // ── URL shared text decode on mount ─────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shared = params.get('t');
    if (shared) {
      try {
        sharedTextRef.current = decodeURIComponent(atob(shared));
      } catch {
        /* ignore invalid shared text */
      }
    }
  }, []);

  // ── Generic API handler (RTK Query) ─────────────────────
  const callApi = async (endpoint, successMsg, toolMeta) => {
    const t = textRef.current;
    if (!t) return;
    const original = t;
    try {
      const data = await transformText({ endpoint, text: t }).unwrap();
      if (toolMeta?.toolId) aiResultSourceRef.current = toolMeta.toolId;
      ai.setAiResult({ label: successMsg, result: data.result });
      setPreviewMode('result');
      history.pushHistory(successMsg, original, data.result, toolMeta);
      showAlert(successMsg, 'success');
      return { success: true, result: data.result };
    } catch (err) {
      showAlert(err.data?.detail || 'Something went wrong. Please try again.', 'danger');
      return { success: false };
    }
  };

  // ── Generic API handler with extra params (for drawer tools) ──
  const callApiWithParams = async (endpoint, successMsg, extraParams, toolMeta) => {
    const t = textRef.current;
    if (!t) return;
    const original = t;
    try {
      const data = await transformText({ endpoint, text: t, ...extraParams }).unwrap();
      if (toolMeta?.toolId) aiResultSourceRef.current = toolMeta.toolId;
      ai.setAiResult({ label: successMsg, result: data.result });
      setPreviewMode('result');
      history.pushHistory(successMsg, original, data.result, toolMeta);
      showAlert(successMsg, 'success');
      return { success: true, result: data.result };
    } catch (err) {
      showAlert(err.data?.detail || 'Something went wrong. Please try again.', 'danger');
      return { success: false };
    }
  };

  // ── Clipboard ───────────────────────────────────────────
  const handleClear = () => {
    setText('');
    ai.setAiResult(null);
    setPreviewMode(null);
    showAlert('Text cleared', 'success');
  };
  const handleCopy = () => {
    navigator.clipboard.writeText(textRef.current);
    showAlert('Copied to clipboard', 'success');
  };
  const handlePaste = () => {
    navigator.clipboard.readText().then((t) => {
      setText((prev) => prev + t);
      const ws = workspaceTabs.find((tab) => tab.id === activeWorkspaceId);
      if (ws?.type === 'tool') setTimeout(() => executeToolAction(ws.tool), 150);
    });
    showAlert('Pasted from clipboard', 'success');
  };
  const handleClearPaste = () => {
    navigator.clipboard.readText().then((t) => {
      setText(t);
      const ws = workspaceTabs.find((tab) => tab.id === activeWorkspaceId);
      if (ws?.type === 'tool') setTimeout(() => executeToolAction(ws.tool), 150);
    });
    showAlert('Cleared and pasted', 'success');
  };

  // ── Encoding ────────────────────────────────────────────
  const handleBase64Encode = () => callApi(ENDPOINTS.BASE64_ENCODE, 'Base64 encoded');
  const handleBase64Decode = () => callApi(ENDPOINTS.BASE64_DECODE, 'Base64 decoded');
  const handleUrlEncode = () => callApi(ENDPOINTS.URL_ENCODE, 'URL encoded');
  const handleUrlDecode = () => callApi(ENDPOINTS.URL_DECODE, 'URL decoded');
  const handleHexEncode = () => callApi(ENDPOINTS.HEX_ENCODE, 'Hex encoded');
  const handleHexDecode = () => callApi(ENDPOINTS.HEX_DECODE, 'Hex decoded');
  const handleMorseEncode = () => callApi(ENDPOINTS.MORSE_ENCODE, 'Morse encoded');
  const handleMorseDecode = () => callApi(ENDPOINTS.MORSE_DECODE, 'Morse decoded');
  const handleBinaryEncode = () => callApi(ENDPOINTS.BINARY_ENCODE, 'Binary encoded');
  const handleBinaryDecode = () => callApi(ENDPOINTS.BINARY_DECODE, 'Binary decoded');
  const handleOctalEncode = () => callApi(ENDPOINTS.OCTAL_ENCODE, 'Octal encoded');
  const handleOctalDecode = () => callApi(ENDPOINTS.OCTAL_DECODE, 'Octal decoded');
  const handleDecimalEncode = () => callApi(ENDPOINTS.DECIMAL_ENCODE, 'Decimal encoded');
  const handleDecimalDecode = () => callApi(ENDPOINTS.DECIMAL_DECODE, 'Decimal decoded');
  const handleUnicodeEscape = () => callApi(ENDPOINTS.UNICODE_ESCAPE, 'Unicode escaped');
  const handleUnicodeUnescape = () => callApi(ENDPOINTS.UNICODE_UNESCAPE, 'Unicode unescaped');
  const handleAtbash = () => callApi(ENDPOINTS.ATBASH, 'Atbash cipher applied');
  const handleBrainfuckEncode = () => callApi(ENDPOINTS.BRAINFUCK_ENCODE, 'Brainfuck encoded');
  const handleBrainfuckDecode = () => callApi(ENDPOINTS.BRAINFUCK_DECODE, 'Brainfuck decoded');

  // ── Hashing (client-side) ───────────────────────────────
  // Factory for all hash handlers — keeps things DRY
  const createHashHandler = (toolId, label, hashFn) => async () => {
    const t = textRef.current;
    if (!t) return;
    const original = t;
    setLocalLoading(true);
    try {
      const hash = await hashFn(t);
      ai.setAiResult({ label, result: hash });
      setPreviewMode('result');
      history.pushHistory(label, original, hash, { toolId, toolType: 'local' });
      showAlert(`${label} generated`, 'success');
    } catch {
      showAlert(`${label} failed`, 'danger');
    } finally {
      setLocalLoading(false);
    }
  };

  // Helper: Web Crypto API digest
  const webCryptoHash = (algo) => async (text) => {
    const data = new TextEncoder().encode(text);
    const buf = await crypto.subtle.digest(algo, data);
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  };

  // Helper: CRC32 (pure JS, no library)
  const crc32Fn = (text) => {
    const table = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[i] = c;
    }
    const bytes = new TextEncoder().encode(text);
    let crc = 0xffffffff;
    for (let i = 0; i < bytes.length; i++) crc = table[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
    return ((crc ^ 0xffffffff) >>> 0).toString(16).padStart(8, '0');
  };

  // Helper: Adler-32 (pure JS, no library)
  const adler32Fn = (text) => {
    const bytes = new TextEncoder().encode(text);
    let a = 1,
      b = 0;
    for (let i = 0; i < bytes.length; i++) {
      a = (a + bytes[i]) % 65521;
      b = (b + a) % 65521;
    }
    return ((b << 16) | a).toString(16).padStart(8, '0');
  };

  // Helper: FNV-1a 32-bit (pure JS, no library)
  const fnv1aFn = (text) => {
    const bytes = new TextEncoder().encode(text);
    let hash = 0x811c9dc5;
    for (let i = 0; i < bytes.length; i++) {
      hash ^= bytes[i];
      hash = Math.imul(hash, 0x01000193);
    }
    return (hash >>> 0).toString(16).padStart(8, '0');
  };

  // SHA family (Web Crypto API)
  const handleMd5 = createHashHandler('md5', 'MD5 Hash', async (t) => {
    const m = await import('blueimp-md5');
    return m.default(t);
  });
  const handleSha1 = createHashHandler('sha1', 'SHA-1 Hash', webCryptoHash('SHA-1'));
  const handleSha224 = createHashHandler('sha224', 'SHA-224 Hash', async (t) => {
    const m = await import('js-sha256');
    return m.sha224(t);
  });
  const handleSha256 = createHashHandler('sha256', 'SHA-256 Hash', webCryptoHash('SHA-256'));
  const handleSha384 = createHashHandler('sha384', 'SHA-384 Hash', webCryptoHash('SHA-384'));
  const handleSha512 = createHashHandler('sha512', 'SHA-512 Hash', webCryptoHash('SHA-512'));
  const handleSha512_224 = createHashHandler('sha512_224', 'SHA-512/224 Hash', async (t) => {
    const m = await import('js-sha512');
    return m.sha512_224(t);
  });
  const handleSha512_256 = createHashHandler('sha512_256', 'SHA-512/256 Hash', async (t) => {
    const m = await import('js-sha512');
    return m.sha512_256(t);
  });

  // SHA-3 family (js-sha3 library)
  const handleSha3_224 = createHashHandler('sha3_224', 'SHA3-224 Hash', async (t) => {
    const m = await import('js-sha3');
    return m.sha3_224(t);
  });
  const handleSha3_256 = createHashHandler('sha3_256', 'SHA3-256 Hash', async (t) => {
    const m = await import('js-sha3');
    return m.sha3_256(t);
  });
  const handleSha3_384 = createHashHandler('sha3_384', 'SHA3-384 Hash', async (t) => {
    const m = await import('js-sha3');
    return m.sha3_384(t);
  });
  const handleSha3_512 = createHashHandler('sha3_512', 'SHA3-512 Hash', async (t) => {
    const m = await import('js-sha3');
    return m.sha3_512(t);
  });
  const handleKeccak256 = createHashHandler('keccak256', 'Keccak-256 Hash', async (t) => {
    const m = await import('js-sha3');
    return m.keccak256(t);
  });

  // Other cryptographic hashes
  const handleRipemd160 = createHashHandler('ripemd160', 'RIPEMD-160 Hash', async (t) => {
    const { default: ripemd160 } = await import('../../utils/ripemd160');
    return ripemd160(t);
  });
  const handleBlake2b = createHashHandler('blake2b', 'BLAKE2b Hash', async (t) => {
    const m = await import('blakejs');
    const bytes = new TextEncoder().encode(t);
    return m.blake2bHex(bytes);
  });
  const handleBlake2s = createHashHandler('blake2s', 'BLAKE2s Hash', async (t) => {
    const m = await import('blakejs');
    const bytes = new TextEncoder().encode(t);
    return m.blake2sHex(bytes);
  });
  const handleWhirlpool = createHashHandler('whirlpool', 'Whirlpool Hash', async (t) => {
    const m = await import('whirlpool-hash');
    const w = new m.default.Whirlpool();
    w.update(t);
    return m.default.encoders.toHex(w.finalize());
  });

  // Non-cryptographic hashes (checksums)
  const handleCrc32 = createHashHandler('crc32', 'CRC32 Checksum', async (t) => crc32Fn(t));
  const handleAdler32 = createHashHandler('adler32', 'Adler-32 Checksum', async (t) =>
    adler32Fn(t)
  );
  const handleFnv1a = createHashHandler('fnv1a', 'FNV-1a Hash', async (t) => fnv1aFn(t));
  const handleXxhash = createHashHandler('xxhash', 'xxHash Hash', async (t) => {
    const m = await import('xxhashjs');
    return m.h32(t, 0).toString(16).padStart(8, '0');
  });
  const handleMurmurHash3 = createHashHandler('murmurhash3', 'MurmurHash3 Hash', async (t) => {
    const m = await import('murmurhash3js');
    return m.default.x86.hash32(t).toString(16).padStart(8, '0');
  });

  // ── Escape / Unescape ───────────────────────────────────
  const handleJsonEscape = () => callApi(ENDPOINTS.JSON_ESCAPE, 'JSON escaped');
  const handleJsonUnescape = () => callApi(ENDPOINTS.JSON_UNESCAPE, 'JSON unescaped');
  const handleHtmlEscape = () => callApi(ENDPOINTS.HTML_ESCAPE, 'HTML escaped');
  const handleHtmlUnescape = () => callApi(ENDPOINTS.HTML_UNESCAPE, 'HTML unescaped');

  // ── Developer Tools ─────────────────────────────────────
  const handleJsonFormat = () => callApi(ENDPOINTS.FORMAT_JSON, 'JSON formatted');
  const handleJsonToYaml = () => callApi(ENDPOINTS.JSON_TO_YAML, 'Converted to YAML');
  const handleCsvToJson = () => callApi(ENDPOINTS.CSV_TO_JSON, 'CSV converted to JSON');
  const handleJsonToCsv = () => callApi(ENDPOINTS.JSON_TO_CSV, 'JSON converted to CSV');

  // ── JWT Decoder (client-side) ───────────────────────────
  const handleJwtDecode = () => {
    const t = textRef.current;
    if (!t) return;
    const original = t;
    setLocalLoading(true);
    try {
      const cleaned = t.trim().replace(/\s+/g, '');
      const parts = cleaned.split('.');
      if (parts.length !== 3) throw new Error('Invalid JWT: expected 3 dot-separated parts');
      const decode = (s, label) => {
        if (!/^[A-Za-z0-9_-]+$/.test(s)) throw new Error(`Invalid characters in JWT ${label}`);
        const padded = s + '='.repeat((4 - (s.length % 4)) % 4);
        let binary;
        try {
          binary = atob(padded.replace(/-/g, '+').replace(/_/g, '/'));
        } catch {
          throw new Error(`Invalid base64 in JWT ${label}`);
        }
        const jsonStr = new TextDecoder().decode(Uint8Array.from(binary, (c) => c.charCodeAt(0)));
        try {
          return JSON.parse(jsonStr);
        } catch {
          throw new Error(`JWT ${label} is not valid JSON`);
        }
      };
      const header = decode(parts[0], 'header');
      const payload = decode(parts[1], 'payload');
      const result = `=== HEADER ===\n${JSON.stringify(
        header,
        null,
        2
      )}\n\n=== PAYLOAD ===\n${JSON.stringify(payload, null, 2)}`;
      ai.setAiResult({ label: 'JWT Decoded', result });
      setPreviewMode('result');
      history.pushHistory('JWT Decoded', original, result, {
        toolId: 'jwt_decode',
        toolType: 'local',
      });
      showAlert('JWT decoded', 'success');
    } catch (err) {
      showAlert(err.message || 'Invalid JWT token', 'danger');
    } finally {
      setLocalLoading(false);
    }
  };

  // ── Accessibility ───────────────────────────────────────
  const handleDyslexiaMode = () => {
    setDyslexiaMode((prev) => {
      const next = !prev;
      showAlert(next ? 'Dyslexia font on' : 'Dyslexia font off', 'info');
      if (next) setPreviewMode('dyslexia');
      else if (previewMode === 'dyslexia') setPreviewMode(null);
      return next;
    });
  };
  const handleMarkdownMode = () => {
    setMarkdownMode((prev) => {
      const next = !prev;
      showAlert(next ? 'Markdown preview on' : 'Markdown preview off', 'info');
      if (next) setPreviewMode('markdown');
      else if (previewMode === 'markdown') setPreviewMode(null);
      return next;
    });
  };

  // ── New Local Tool Handlers ────────────────────────────────

  const handleFrequencyAnalysis = () => {
    const t = textRef.current;
    if (!t) return;
    const freq = {};
    for (const ch of t.toUpperCase()) {
      if (/[A-Z]/.test(ch)) freq[ch] = (freq[ch] || 0) + 1;
    }
    const total = Object.values(freq).reduce((a, b) => a + b, 0);
    const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
    const lines = sorted.map(([ch, count]) => {
      const pct = ((count / total) * 100).toFixed(1);
      const bar = '█'.repeat(Math.round(pct / 2));
      return `${ch}: ${count} (${pct}%) ${bar}`;
    });
    const result = `Letter Frequency Analysis (${total} letters)\n${'─'.repeat(40)}\n${lines.join(
      '\n'
    )}`;
    setToolResults((prev) => ({ ...prev, [activeWorkspaceId]: result }));
    setPreviewMode('result');
    showAlert('Frequency analysis complete', 'success');
  };

  const handleFormatSql = async () => {
    const t = textRef.current;
    if (!t) return;
    setLocalLoading(true);
    try {
      const m = await import('sql-formatter');
      const result = m.format(t);
      setToolResults((prev) => ({ ...prev, [activeWorkspaceId]: result }));
      setPreviewMode('result');
      showAlert('SQL formatted', 'success');
    } catch {
      showAlert('Could not format SQL', 'danger');
    } finally {
      setLocalLoading(false);
    }
  };

  const handleFormatXml = () => {
    const t = textRef.current;
    if (!t) return;
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(t, 'text/xml');
      const errorNode = doc.querySelector('parsererror');
      if (errorNode) throw new Error('Invalid XML');
      const serializer = new XMLSerializer();
      let xml = serializer.serializeToString(doc);
      // Simple indentation
      let formatted = '',
        indent = 0;
      xml.split(/>\s*</).forEach((node) => {
        if (node.match(/^\//)) indent--;
        formatted += '  '.repeat(Math.max(indent, 0)) + '<' + node + '>\n';
        if (node.match(/^<?\w[^>]*[^/]$/) && !node.startsWith('?')) indent++;
      });
      formatted = formatted.replace(/^</, '').replace(/>$/, '');
      setToolResults((prev) => ({ ...prev, [activeWorkspaceId]: formatted }));
      setPreviewMode('result');
      showAlert('XML formatted', 'success');
    } catch {
      showAlert('Invalid XML input', 'danger');
    }
  };

  const handleJsonMinify = () => {
    const t = textRef.current;
    if (!t) return;
    try {
      const result = JSON.stringify(JSON.parse(t));
      setToolResults((prev) => ({ ...prev, [activeWorkspaceId]: result }));
      setPreviewMode('result');
      showAlert('JSON minified', 'success');
    } catch {
      showAlert('Invalid JSON input', 'danger');
    }
  };

  const handleJsonToTs = () => {
    const t = textRef.current;
    if (!t) return;
    try {
      const obj = JSON.parse(t);
      const inferType = (val, name = 'Root', depth = 0) => {
        if (val === null) return 'null';
        if (Array.isArray(val)) {
          if (val.length === 0) return 'any[]';
          const itemType = inferType(val[0], name + 'Item', depth + 1);
          return itemType.includes('{') ? `${name}Item[]` : `${itemType}[]`;
        }
        if (typeof val === 'object') {
          const fields = Object.entries(val).map(([k, v]) => {
            const type = inferType(v, k.charAt(0).toUpperCase() + k.slice(1), depth + 1);
            return `  ${k}: ${type}`;
          });
          if (depth === 0) return `interface ${name} {\n${fields.join('\n')}\n}`;
          return `{\n${fields.join('\n')}\n}`;
        }
        return typeof val;
      };
      const result = inferType(obj);
      setToolResults((prev) => ({ ...prev, [activeWorkspaceId]: result }));
      setPreviewMode('result');
      showAlert('TypeScript interface generated', 'success');
    } catch {
      showAlert('Invalid JSON input', 'danger');
    }
  };

  const handleUuidGen = () => {
    const uuids = Array.from({ length: 5 }, () => crypto.randomUUID()).join('\n');
    setToolResults((prev) => ({ ...prev, [activeWorkspaceId]: uuids }));
    setPreviewMode('result');
    showAlert('UUIDs generated', 'success');
  };

  const handleTimestampConvert = () => {
    const t = (textRef.current || '').trim();
    if (!t) return;
    let date;
    if (/^\d{10,13}$/.test(t)) {
      const ts = t.length === 10 ? parseInt(t) * 1000 : parseInt(t);
      date = new Date(ts);
    } else {
      date = new Date(t);
    }
    if (isNaN(date.getTime())) {
      showAlert('Could not parse date/timestamp', 'danger');
      return;
    }
    const result = `Unix (s):  ${Math.floor(
      date.getTime() / 1000
    )}\nUnix (ms): ${date.getTime()}\nISO 8601:  ${date.toISOString()}\nUTC:       ${date.toUTCString()}\nLocal:     ${date.toLocaleString()}`;
    setToolResults((prev) => ({ ...prev, [activeWorkspaceId]: result }));
    setPreviewMode('result');
    showAlert('Timestamp converted', 'success');
  };

  const handleColorConvert = () => {
    const t = (textRef.current || '').trim();
    if (!t) return;
    let r, g, b;
    const hexMatch = t.match(/^#?([0-9a-fA-F]{6})$/);
    const rgbMatch = t.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
    if (hexMatch) {
      const hex = hexMatch[1];
      r = parseInt(hex.slice(0, 2), 16);
      g = parseInt(hex.slice(2, 4), 16);
      b = parseInt(hex.slice(4, 6), 16);
    } else if (rgbMatch) {
      r = parseInt(rgbMatch[1]);
      g = parseInt(rgbMatch[2]);
      b = parseInt(rgbMatch[3]);
    } else {
      showAlert('Enter a HEX (#FF5733) or RGB (rgb(255,87,51)) color', 'danger');
      return;
    }
    const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b
      .toString(16)
      .padStart(2, '0')}`.toUpperCase();
    const rn = r / 255,
      gn = g / 255,
      bn = b / 255;
    const max = Math.max(rn, gn, bn),
      min = Math.min(rn, gn, bn);
    const l = (max + min) / 2;
    let h = 0,
      s = 0;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
      else if (max === gn) h = ((bn - rn) / d + 2) / 6;
      else h = ((rn - gn) / d + 4) / 6;
    }
    const result = `HEX: ${hex}\nRGB: rgb(${r}, ${g}, ${b})\nHSL: hsl(${Math.round(
      h * 360
    )}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
    setToolResults((prev) => ({ ...prev, [activeWorkspaceId]: result }));
    setPreviewMode('result');
    showAlert('Color converted', 'success');
  };

  const handleUlidGen = () => {
    // Simple ULID-like generator (timestamp + random)
    const result = Array.from({ length: 5 }, (_, i) => {
      const t = (Date.now() + i).toString(36).toUpperCase().padStart(10, '0');
      const r = Array.from(
        { length: 16 },
        () => '0123456789ABCDEFGHJKMNPQRSTVWXYZ'[Math.floor(Math.random() * 32)]
      ).join('');
      return t + r;
    }).join('\n');
    setToolResults((prev) => ({ ...prev, [activeWorkspaceId]: result }));
    setPreviewMode('result');
    showAlert('ULIDs generated', 'success');
  };

  const handleCronExplain = () => {
    const t = (textRef.current || '').trim();
    if (!t) return;
    const parts = t.split(/\s+/);
    if (parts.length < 5 || parts.length > 6) {
      showAlert('Enter a valid cron expression (5 or 6 fields)', 'danger');
      return;
    }
    const [min, hour, dom, month, dow] = parts;
    const descs = [];
    if (min === '*') descs.push('every minute');
    else if (min.includes('/')) descs.push(`every ${min.split('/')[1]} minutes`);
    else descs.push(`at minute ${min}`);
    if (hour === '*') descs.push('of every hour');
    else if (hour.includes('-')) descs.push(`during hours ${hour.replace('-', ' through ')}`);
    else descs.push(`at ${hour}:00`);
    if (dom !== '*') descs.push(`on day ${dom} of the month`);
    if (month !== '*') descs.push(`in month ${month}`);
    if (dow !== '*') {
      const days = {
        0: 'Sunday',
        1: 'Monday',
        2: 'Tuesday',
        3: 'Wednesday',
        4: 'Thursday',
        5: 'Friday',
        6: 'Saturday',
        7: 'Sunday',
      };
      const dayStr = dow
        .split(',')
        .map((d) => {
          if (d.includes('-')) {
            const [s, e] = d.split('-');
            return `${days[s] || s} through ${days[e] || e}`;
          }
          return days[d] || d;
        })
        .join(', ');
      descs.push(`on ${dayStr}`);
    }
    const result = `Cron: ${t}\n\n${descs.join(', ')}.`;
    setToolResults((prev) => ({ ...prev, [activeWorkspaceId]: result }));
    setPreviewMode('result');
    showAlert('Cron expression explained', 'success');
  };

  const handleHttpHeaderParse = () => {
    const t = textRef.current;
    if (!t) return;
    const lines = t.split('\n').filter((l) => l.includes(':'));
    const headers = lines.map((l) => {
      const idx = l.indexOf(':');
      return `| ${l.slice(0, idx).trim().padEnd(30)} | ${l.slice(idx + 1).trim()} |`;
    });
    const result = `| ${'Header'.padEnd(30)} | Value |\n| ${'-'.repeat(
      30
    )} | ----- |\n${headers.join('\n')}`;
    setToolResults((prev) => ({ ...prev, [activeWorkspaceId]: result }));
    setPreviewMode('result');
    showAlert('HTTP headers parsed', 'success');
  };

  const handleUrlParser = () => {
    const t = (textRef.current || '').trim();
    if (!t) return;
    try {
      const url = new URL(t);
      const params = [...url.searchParams.entries()].map(([k, v]) => `  ${k} = ${v}`).join('\n');
      const result = `Protocol: ${url.protocol}\nHost:     ${url.hostname}\nPort:     ${
        url.port || '(default)'
      }\nPath:     ${url.pathname}\nSearch:   ${url.search}\nHash:     ${url.hash}\n${
        params ? `\nQuery Parameters:\n${params}` : ''
      }`;
      setToolResults((prev) => ({ ...prev, [activeWorkspaceId]: result }));
      setPreviewMode('result');
      showAlert('URL parsed', 'success');
    } catch {
      showAlert('Invalid URL', 'danger');
    }
  };

  const handleSlugGenerator = () => {
    const t = textRef.current;
    if (!t) return;
    const stopWords = new Set([
      'a',
      'an',
      'the',
      'and',
      'or',
      'but',
      'in',
      'on',
      'at',
      'to',
      'for',
      'of',
      'with',
      'by',
      'is',
      'it',
      'as',
    ]);
    const slug = t
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .split(/\s+/)
      .filter((w) => !stopWords.has(w))
      .join('-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 80);
    setToolResults((prev) => ({ ...prev, [activeWorkspaceId]: slug }));
    setPreviewMode('result');
    showAlert('URL slug generated', 'success');
  };

  const handleReadingLevel = () => {
    const t = textRef.current;
    if (!t) return;
    const words = t.split(/\s+/).filter(Boolean);
    const sentences = t.split(/[.!?]+/).filter((s) => s.trim());
    const syllables = words.reduce((sum, w) => {
      const s = w
        .toLowerCase()
        .replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
        .match(/[aeiouy]{1,2}/g);
      return sum + Math.max(s ? s.length : 1, 1);
    }, 0);
    const wc = words.length,
      sc = sentences.length;
    const flesch = 206.835 - 1.015 * (wc / sc) - 84.6 * (syllables / wc);
    const fkGrade = 0.39 * (wc / sc) + 11.8 * (syllables / wc) - 15.59;
    const readTime = Math.ceil(wc / 238);
    const speakTime = Math.ceil(wc / 150);
    let level = 'College';
    if (fkGrade <= 5) level = 'Elementary';
    else if (fkGrade <= 8) level = 'Middle School';
    else if (fkGrade <= 12) level = 'High School';
    const result = `Reading Level Analysis\n${'─'.repeat(30)}\nFlesch Score:    ${flesch.toFixed(
      1
    )}\nGrade Level:     ${fkGrade.toFixed(
      1
    )} (${level})\nReading Time:    ~${readTime} min (238 WPM)\nSpeaking Time:   ~${speakTime} min (150 WPM)\nWords:           ${wc}\nSentences:       ${sc}\nAvg Words/Sent:  ${(
      wc / sc
    ).toFixed(1)}`;
    setToolResults((prev) => ({ ...prev, [activeWorkspaceId]: result }));
    setPreviewMode('result');
    showAlert('Reading level analyzed', 'success');
  };

  const handleReadingTime = () => {
    const t = textRef.current;
    if (!t) return;
    const words = t.split(/\s+/).filter(Boolean).length;
    const result = `Reading Time:  ~${Math.ceil(
      words / 238
    )} min (238 WPM)\nSpeaking Time: ~${Math.ceil(words / 150)} min (150 WPM)\nWords: ${words}`;
    setToolResults((prev) => ({ ...prev, [activeWorkspaceId]: result }));
    setPreviewMode('result');
    showAlert('Reading time estimated', 'success');
  };

  const handleCharCount = () => {
    const t = textRef.current || '';
    const chars = t.length,
      charsNoSpaces = t.replace(/\s/g, '').length;
    const words = t.split(/\s+/).filter(Boolean).length;
    const sentences = t.split(/[.!?]+/).filter((s) => s.trim()).length;
    const paragraphs = t.split(/\n\s*\n/).filter((p) => p.trim()).length;
    const lines = t.split('\n').length;
    const result = `Characters:     ${chars}\nNo Spaces:      ${charsNoSpaces}\nWords:          ${words}\nSentences:      ${sentences}\nParagraphs:     ${paragraphs}\nLines:          ${lines}`;
    setToolResults((prev) => ({ ...prev, [activeWorkspaceId]: result }));
    setPreviewMode('result');
    showAlert('Characters counted', 'success');
  };

  const handleTextStats = () => {
    const t = textRef.current;
    if (!t) return;
    const words = t.split(/\s+/).filter(Boolean);
    const sentences = t.split(/[.!?]+/).filter((s) => s.trim());
    const uniqueWords = new Set(words.map((w) => w.toLowerCase()));
    const avgWordLen = words.reduce((s, w) => s + w.length, 0) / words.length;
    const avgSentLen = words.length / sentences.length;
    const result = `Text Statistics\n${'─'.repeat(30)}\nTotal Words:       ${
      words.length
    }\nUnique Words:      ${uniqueWords.size}\nVocabulary Ratio:  ${(
      (uniqueWords.size / words.length) *
      100
    ).toFixed(1)}%\nAvg Word Length:   ${avgWordLen.toFixed(
      1
    )} chars\nAvg Sentence Len:  ${avgSentLen.toFixed(1)} words\nLongest Word:      ${words.reduce(
      (a, b) => (a.length > b.length ? a : b),
      ''
    )}`;
    setToolResults((prev) => ({ ...prev, [activeWorkspaceId]: result }));
    setPreviewMode('result');
    showAlert('Text statistics computed', 'success');
  };

  const handleDuplicateWords = () => {
    const t = textRef.current;
    if (!t) return;
    const words = t.toLowerCase().match(/\b[a-z]+\b/g) || [];
    const freq = {};
    words.forEach((w) => {
      freq[w] = (freq[w] || 0) + 1;
    });
    const dupes = Object.entries(freq)
      .filter(([, c]) => c > 1)
      .sort((a, b) => b[1] - a[1]);
    const result = dupes.length
      ? dupes.map(([w, c]) => `${w}: ${c}×`).join('\n')
      : 'No duplicate words found!';
    setToolResults((prev) => ({ ...prev, [activeWorkspaceId]: result }));
    setPreviewMode('result');
    showAlert('Duplicate words found', 'success');
  };

  const handleOverusedWords = () => {
    const t = textRef.current;
    if (!t) return;
    const stopWords = new Set([
      'the',
      'a',
      'an',
      'and',
      'or',
      'but',
      'in',
      'on',
      'at',
      'to',
      'for',
      'of',
      'with',
      'by',
      'is',
      'it',
      'as',
      'was',
      'were',
      'be',
      'been',
      'being',
      'have',
      'has',
      'had',
      'do',
      'does',
      'did',
      'will',
      'would',
      'could',
      'should',
      'may',
      'might',
      'can',
      'this',
      'that',
      'these',
      'those',
      'i',
      'you',
      'he',
      'she',
      'we',
      'they',
      'me',
      'him',
      'her',
      'us',
      'them',
      'my',
      'your',
      'his',
      'its',
      'our',
      'their',
      'not',
      'no',
      'so',
      'if',
    ]);
    const words = t.toLowerCase().match(/\b[a-z]+\b/g) || [];
    const freq = {};
    words
      .filter((w) => !stopWords.has(w) && w.length > 2)
      .forEach((w) => {
        freq[w] = (freq[w] || 0) + 1;
      });
    const total = Object.values(freq).reduce((a, b) => a + b, 0);
    const overused = Object.entries(freq)
      .filter(([, c]) => c / total > 0.03)
      .sort((a, b) => b[1] - a[1]);
    const result = overused.length
      ? `Overused Words (>3% frequency)\n${'─'.repeat(30)}\n` +
        overused.map(([w, c]) => `⚠ "${w}" — ${c}× (${((c / total) * 100).toFixed(1)}%)`).join('\n')
      : 'No overused words detected!';
    setToolResults((prev) => ({ ...prev, [activeWorkspaceId]: result }));
    setPreviewMode('result');
    showAlert('Overused words analyzed', 'success');
  };

  const handleNumToWords = () => {
    const t = (textRef.current || '').trim();
    if (!t) return;
    const ones = [
      '',
      'one',
      'two',
      'three',
      'four',
      'five',
      'six',
      'seven',
      'eight',
      'nine',
      'ten',
      'eleven',
      'twelve',
      'thirteen',
      'fourteen',
      'fifteen',
      'sixteen',
      'seventeen',
      'eighteen',
      'nineteen',
    ];
    const tens = [
      '',
      '',
      'twenty',
      'thirty',
      'forty',
      'fifty',
      'sixty',
      'seventy',
      'eighty',
      'ninety',
    ];
    const convert = (n) => {
      if (n === 0) return 'zero';
      if (n < 0) return 'negative ' + convert(-n);
      let result = '';
      if (n >= 1e9) {
        result += convert(Math.floor(n / 1e9)) + ' billion ';
        n %= 1e9;
      }
      if (n >= 1e6) {
        result += convert(Math.floor(n / 1e6)) + ' million ';
        n %= 1e6;
      }
      if (n >= 1000) {
        result += convert(Math.floor(n / 1000)) + ' thousand ';
        n %= 1000;
      }
      if (n >= 100) {
        result += ones[Math.floor(n / 100)] + ' hundred ';
        n %= 100;
      }
      if (n >= 20) {
        result += tens[Math.floor(n / 10)] + (n % 10 ? '-' + ones[n % 10] : '') + ' ';
      } else if (n > 0) {
        result += ones[n] + ' ';
      }
      return result.trim();
    };
    const num = parseFloat(t.replace(/,/g, ''));
    if (isNaN(num)) {
      showAlert('Enter a valid number', 'danger');
      return;
    }
    setToolResults((prev) => ({ ...prev, [activeWorkspaceId]: convert(Math.floor(num)) }));
    setPreviewMode('result');
    showAlert('Number converted to words', 'success');
  };

  const handleWordsToNum = () => {
    const t = (textRef.current || '').trim().toLowerCase();
    if (!t) return;
    const map = {
      zero: 0,
      one: 1,
      two: 2,
      three: 3,
      four: 4,
      five: 5,
      six: 6,
      seven: 7,
      eight: 8,
      nine: 9,
      ten: 10,
      eleven: 11,
      twelve: 12,
      thirteen: 13,
      fourteen: 14,
      fifteen: 15,
      sixteen: 16,
      seventeen: 17,
      eighteen: 18,
      nineteen: 19,
      twenty: 20,
      thirty: 30,
      forty: 40,
      fifty: 50,
      sixty: 60,
      seventy: 70,
      eighty: 80,
      ninety: 90,
    };
    const multipliers = { hundred: 100, thousand: 1000, million: 1e6, billion: 1e9 };
    const words = t
      .replace(/-/g, ' ')
      .split(/[\s,]+/)
      .filter(Boolean);
    let result = 0,
      current = 0;
    for (const w of words) {
      if (w === 'and') continue;
      if (map[w] !== undefined) current += map[w];
      else if (w === 'hundred') current *= 100;
      else if (multipliers[w]) {
        result += current * (multipliers[w] / (w === 'hundred' ? 1 : 1));
        current *= multipliers[w];
        if (w !== 'hundred') {
          result += current;
          current = 0;
        }
      }
    }
    result += current;
    setToolResults((prev) => ({ ...prev, [activeWorkspaceId]: result.toString() }));
    setPreviewMode('result');
    showAlert('Words converted to number', 'success');
  };

  const handleRomanNumeral = () => {
    const t = (textRef.current || '').trim();
    if (!t) return;
    if (/^\d+$/.test(t)) {
      let n = parseInt(t),
        result = '';
      const vals = [
        [1000, 'M'],
        [900, 'CM'],
        [500, 'D'],
        [400, 'CD'],
        [100, 'C'],
        [90, 'XC'],
        [50, 'L'],
        [40, 'XL'],
        [10, 'X'],
        [9, 'IX'],
        [5, 'V'],
        [4, 'IV'],
        [1, 'I'],
      ];
      for (const [val, sym] of vals) {
        while (n >= val) {
          result += sym;
          n -= val;
        }
      }
      setToolResults((prev) => ({ ...prev, [activeWorkspaceId]: result }));
    } else {
      const roman = { M: 1000, D: 500, C: 100, L: 50, X: 10, V: 5, I: 1 };
      const upper = t.toUpperCase();
      let result = 0;
      for (let i = 0; i < upper.length; i++) {
        const curr = roman[upper[i]],
          next = roman[upper[i + 1]];
        if (next && curr < next) result -= curr;
        else result += curr;
      }
      setToolResults((prev) => ({ ...prev, [activeWorkspaceId]: result.toString() }));
    }
    setPreviewMode('result');
    showAlert('Roman numeral converted', 'success');
  };

  const handleQrFromText = async () => {
    const t = textRef.current;
    if (!t) return;
    try {
      const QRCode = (await import('qrcode')).default;
      const dataUrl = await QRCode.toDataURL(t, { width: 300, margin: 2 });
      const result = `[QR Code Generated]\n\nData URL (paste in browser):\n${dataUrl}`;
      setToolResults((prev) => ({ ...prev, [activeWorkspaceId]: result }));
      setPreviewMode('result');
      showAlert('QR code generated', 'success');
    } catch {
      showAlert('Could not generate QR code', 'danger');
    }
  };

  const handleMdToHtml = () => {
    const t = textRef.current;
    if (!t) return;
    try {
      // Simple markdown to HTML conversion
      let html = t
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/^# (.+)$/gm, '<h1>$1</h1>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`(.+?)`/g, '<code>$1</code>')
        .replace(/^- (.+)$/gm, '<li>$1</li>')
        .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
        .replace(/\n\n/g, '</p>\n<p>');
      html = '<p>' + html + '</p>';
      setToolResults((prev) => ({ ...prev, [activeWorkspaceId]: html }));
      setPreviewMode('result');
      showAlert('Markdown converted to HTML', 'success');
    } catch {
      showAlert('Could not convert Markdown', 'danger');
    }
  };

  const handleTextToTable = () => {
    const t = textRef.current;
    if (!t) return;
    const lines = t.split('\n').filter((l) => l.trim());
    const sep = lines[0].includes('\t') ? '\t' : ',';
    const rows = lines.map((l) => l.split(sep).map((c) => c.trim()));
    if (rows.length < 2) {
      showAlert('Need at least a header + 1 data row', 'danger');
      return;
    }
    const widths = rows[0].map((_, i) => Math.max(...rows.map((r) => (r[i] || '').length)));
    const header = '| ' + rows[0].map((c, i) => c.padEnd(widths[i])).join(' | ') + ' |';
    const divider = '| ' + widths.map((w) => '-'.repeat(w)).join(' | ') + ' |';
    const body = rows
      .slice(1)
      .map((r) => '| ' + r.map((c, i) => (c || '').padEnd(widths[i] || 0)).join(' | ') + ' |')
      .join('\n');
    setToolResults((prev) => ({ ...prev, [activeWorkspaceId]: `${header}\n${divider}\n${body}` }));
    setPreviewMode('result');
    showAlert('Text converted to table', 'success');
  };

  const handleExtractEmails = () => {
    const t = textRef.current;
    if (!t) return;
    const emails = [...new Set(t.match(/[\w.+-]+@[\w-]+\.[\w.]+/g) || [])];
    setToolResults((prev) => ({
      ...prev,
      [activeWorkspaceId]: emails.length ? emails.join('\n') : 'No email addresses found',
    }));
    setPreviewMode('result');
    showAlert(`Found ${emails.length} email(s)`, 'success');
  };

  const handleExtractUrls = () => {
    const t = textRef.current;
    if (!t) return;
    const urls = [...new Set(t.match(/https?:\/\/[^\s<>"{}|\\^`[\]]+/g) || [])];
    setToolResults((prev) => ({
      ...prev,
      [activeWorkspaceId]: urls.length ? urls.join('\n') : 'No URLs found',
    }));
    setPreviewMode('result');
    showAlert(`Found ${urls.length} URL(s)`, 'success');
  };

  const handleExtractNumbers = () => {
    const t = textRef.current;
    if (!t) return;
    const numbers = t.match(/-?\d+\.?\d*/g) || [];
    setToolResults((prev) => ({
      ...prev,
      [activeWorkspaceId]: numbers.length ? numbers.join('\n') : 'No numbers found',
    }));
    setPreviewMode('result');
    showAlert(`Found ${numbers.length} number(s)`, 'success');
  };

  const handleNanoidGen = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';
    const gen = () =>
      Array.from(crypto.getRandomValues(new Uint8Array(21)), (b) => chars[b % 64]).join('');
    const result = Array.from({ length: 5 }, gen).join('\n');
    setToolResults((prev) => ({ ...prev, [activeWorkspaceId]: result }));
    setPreviewMode('result');
    showAlert('Nano IDs generated', 'success');
  };

  const handleTimestampGen = () => {
    const now = new Date();
    const result = `Unix (s):  ${Math.floor(
      now.getTime() / 1000
    )}\nUnix (ms): ${now.getTime()}\nISO 8601:  ${now.toISOString()}\nRFC 2822:  ${now.toUTCString()}\nLocal:     ${now.toLocaleString()}`;
    setToolResults((prev) => ({ ...prev, [activeWorkspaceId]: result }));
    setPreviewMode('result');
    showAlert('Timestamps generated', 'success');
  };

  const handleUsernameGen = () => {
    const t = (textRef.current || '').trim() || 'user';
    const words = t.toLowerCase().split(/\s+/);
    const combos = [
      words.join('_'),
      words.join('.'),
      words[0] + '_' + Math.floor(Math.random() * 999),
      words.join('') + Math.floor(Math.random() * 99),
      words[0][0] + '_' + (words[1] || words[0]) + '_' + Math.floor(Math.random() * 99),
      words.map((w) => w[0]).join('') + '_' + Math.floor(Math.random() * 9999),
      words[0] + '.codes',
      'the_' + words[0],
      words[0] + '_dev',
      words.reverse().join('_'),
    ];
    setToolResults((prev) => ({ ...prev, [activeWorkspaceId]: [...new Set(combos)].join('\n') }));
    setPreviewMode('result');
    showAlert('Usernames generated', 'success');
  };

  const handlePlaceholderImg = () => {
    const t = (textRef.current || '').trim() || '800x600';
    const match = t.match(/(\d+)\s*[x×]\s*(\d+)/);
    const w = match ? match[1] : '800',
      h = match ? match[2] : '600';
    const urls = [
      `https://placehold.co/${w}x${h}`,
      `https://placehold.co/${w}x${h}/png`,
      `https://placehold.co/${w}x${h}/gray/white`,
      `https://placehold.co/${w}x${h}/000/fff?text=Placeholder`,
    ];
    setToolResults((prev) => ({ ...prev, [activeWorkspaceId]: urls.join('\n') }));
    setPreviewMode('result');
    showAlert('Placeholder URLs generated', 'success');
  };

  // ── Handler Map (for data-driven tool dispatch) ─────────
  const handlerMap = useMemo(
    () => ({
      handleBase64Encode,
      handleBase64Decode,
      handleUrlEncode,
      handleUrlDecode,
      handleHexEncode,
      handleHexDecode,
      handleMorseEncode,
      handleMorseDecode,
      handleBinaryEncode,
      handleBinaryDecode,
      handleOctalEncode,
      handleOctalDecode,
      handleDecimalEncode,
      handleDecimalDecode,
      handleUnicodeEscape,
      handleUnicodeUnescape,
      handleAtbash,
      handleBrainfuckEncode,
      handleBrainfuckDecode,
      handleMd5,
      handleSha1,
      handleSha224,
      handleSha256,
      handleSha384,
      handleSha512,
      handleSha512_224,
      handleSha512_256,
      handleSha3_224,
      handleSha3_256,
      handleSha3_384,
      handleSha3_512,
      handleKeccak256,
      handleRipemd160,
      handleBlake2b,
      handleBlake2s,
      handleWhirlpool,
      handleCrc32,
      handleAdler32,
      handleFnv1a,
      handleXxhash,
      handleMurmurHash3,
      handleReverseText: () => callApi(ENDPOINTS.REVERSE, 'Text reversed'),
      handleSortAsc: () => callApi(ENDPOINTS.SORT_LINES_ASC, 'Lines sorted A → Z'),
      handleSortDesc: () => callApi(ENDPOINTS.SORT_LINES_DESC, 'Lines sorted Z → A'),
      handleRemoveDuplicates: () =>
        callApi(ENDPOINTS.REMOVE_DUPLICATE_LINES, 'Duplicate lines removed'),
      handleReverseLines: () => callApi(ENDPOINTS.REVERSE_LINES, 'Lines reversed'),
      handleNumberLines: () => callApi(ENDPOINTS.NUMBER_LINES, 'Lines numbered'),
      handleRot13: () => callApi(ENDPOINTS.ROT13, 'ROT13 applied'),
      handleJsonEscape,
      handleJsonUnescape,
      handleHtmlEscape,
      handleHtmlUnescape,
      handleJsonFormat,
      handleJsonToYaml,
      handleCsvToJson,
      handleJsonToCsv,
      handleJwtDecode,
      handleFormatHtml: formatter.handleFormatHtml,
      handleFormatCss: formatter.handleFormatCss,
      handleFormatJs: formatter.handleFormatJs,
      handleFormatTs: formatter.handleFormatTs,
      handleFixGrammar: ai.handleFixGrammar,
      handleParaphrase: ai.handleParaphrase,
      handleProofread: ai.handleProofread,
      handleSummarize: ai.handleSummarize,
      handleEli5: ai.handleEli5,
      handleLengthenText: ai.handleLengthenText,
      handleEmailRewrite: ai.handleEmailRewrite,
      handleTweetShorten: ai.handleTweetShorten,
      handleHashtags: ai.handleHashtags,
      handleSeoTitles: ai.handleSeoTitles,
      handleMetaDescriptions: ai.handleMetaDescriptions,
      handleBlogOutline: ai.handleBlogOutline,
      handleKeywords: ai.handleKeywords,
      handleSentiment: ai.handleSentiment,
      handleGenerateTitle: ai.handleGenerateTitle,
      handleRefactorPrompt: ai.handleRefactorPrompt,
      handleEmojify: ai.handleEmojify,
      handleChangeFormat: ai.handleChangeFormat,
      handleChangeTone: ai.handleChangeTone,
      handleTranslate: ai.handleTranslate,
      handleTransliterate: ai.handleTransliterate,
      handleSplitToLines: ai.handleSplitToLines,
      handleJoinLines: ai.handleJoinLines,
      handlePadLines: ai.handlePadLines,
      handleMarkdownMode,
      handleWordFrequency: wordFreq.handleWordFrequency,
      // New Cipher & Crypto local handlers
      handleFrequencyAnalysis,
      handleCaesarCipher: ai.handleCaesarCipher,
      handleRailFenceEnc: ai.handleRailFenceEnc,
      handleRailFenceDec: ai.handleRailFenceDec,
      // New Developer Tool local handlers
      handleFormatSql,
      handleFormatXml,
      handleJsonMinify,
      handleJsonToTs,
      handleUuidGen,
      handleTimestampConvert,
      handleColorConvert,
      handleUlidGen,
      handleCronExplain,
      handleHttpHeaderParse,
      handleUrlParser,
      handleCurlToCode: ai.handleCurlToCode,
      // New AI Writing handlers
      handleAcademicStyle: ai.handleAcademicStyle,
      handleCreativeStyle: ai.handleCreativeStyle,
      handleTechnicalStyle: ai.handleTechnicalStyle,
      handleActiveVoice: ai.handleActiveVoice,
      handleRedundancyRemover: ai.handleRedundancyRemover,
      handleSentenceSplitter: ai.handleSentenceSplitter,
      handleConciseness: ai.handleConciseness,
      handleResumeBullets: ai.handleResumeBullets,
      handleMeetingNotes: ai.handleMeetingNotes,
      handleCoverLetter: ai.handleCoverLetter,
      handleOutlineToDraft: ai.handleOutlineToDraft,
      handleContinueWriting: ai.handleContinueWriting,
      handleRewriteUnique: ai.handleRewriteUnique,
      handleToneAnalyzer: ai.handleToneAnalyzer,
      // New AI Content handlers
      handleLinkedinPost: ai.handleLinkedinPost,
      handleTwitterThread: ai.handleTwitterThread,
      handleInstagramCaption: ai.handleInstagramCaption,
      handleYoutubeDesc: ai.handleYoutubeDesc,
      handleSocialBio: ai.handleSocialBio,
      handleProductDesc: ai.handleProductDesc,
      handleCtaGenerator: ai.handleCtaGenerator,
      handleAdCopy: ai.handleAdCopy,
      handleLandingHeadline: ai.handleLandingHeadline,
      handleEmailSubject: ai.handleEmailSubject,
      handleContentIdeas: ai.handleContentIdeas,
      handleHookGenerator: ai.handleHookGenerator,
      handleAngleGenerator: ai.handleAngleGenerator,
      handleFaqSchema: ai.handleFaqSchema,
      handleSlugGenerator,
      // New Language handlers
      handlePosTagger: ai.handlePosTagger,
      handleSentenceType: ai.handleSentenceType,
      handleGrammarExplain: ai.handleGrammarExplain,
      handleSynonymFinder: ai.handleSynonymFinder,
      handleAntonymFinder: ai.handleAntonymFinder,
      handleDefineWords: ai.handleDefineWords,
      handleWordPower: ai.handleWordPower,
      handleReadingLevel,
      handleVocabComplexity: ai.handleVocabComplexity,
      handleJargonSimplifier: ai.handleJargonSimplifier,
      handleFormalityDetector: ai.handleFormalityDetector,
      handleClicheDetector: ai.handleClicheDetector,
      // New Generator handlers
      handleNanoidGen,
      handleTimestampGen,
      handleUsernameGen,
      handlePlaceholderImg,
      handleRegexGen: ai.handleRegexGen,
      handleWritingPrompt: ai.handleWritingPrompt,
      handleTeamNameGen: ai.handleTeamNameGen,
      handleMockApiResponse: ai.handleMockApiResponse,
      // New Utility handlers
      handleReadingTime,
      handleCharCount,
      handleTextStats,
      handleDuplicateWords,
      handleOverusedWords,
      handleNumToWords,
      handleWordsToNum,
      handleDateFormat: ai.handleDateFormat,
      handleRomanNumeral,
      handleQrFromText,
      handleMdToHtml,
      handleTextToTable,
      handleExtractEmails,
      handleExtractUrls,
      handleExtractNumbers,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      callApi,
      ai,
      formatter,
      wordFreq,
      handleBase64Encode,
      handleBase64Decode,
      handleUrlEncode,
      handleUrlDecode,
      handleHexEncode,
      handleHexDecode,
      handleMorseEncode,
      handleMorseDecode,
      handleBinaryEncode,
      handleBinaryDecode,
      handleOctalEncode,
      handleOctalDecode,
      handleDecimalEncode,
      handleDecimalDecode,
      handleUnicodeEscape,
      handleUnicodeUnescape,
      handleAtbash,
      handleBrainfuckEncode,
      handleBrainfuckDecode,
      handleMd5,
      handleSha1,
      handleSha224,
      handleSha256,
      handleSha384,
      handleSha512,
      handleSha512_224,
      handleSha512_256,
      handleSha3_224,
      handleSha3_256,
      handleSha3_384,
      handleSha3_512,
      handleKeccak256,
      handleRipemd160,
      handleBlake2b,
      handleBlake2s,
      handleWhirlpool,
      handleCrc32,
      handleAdler32,
      handleFnv1a,
      handleXxhash,
      handleMurmurHash3,
      handleJsonEscape,
      handleJsonUnescape,
      handleHtmlEscape,
      handleHtmlUnescape,
      handleJsonFormat,
      handleJsonToYaml,
      handleCsvToJson,
      handleJsonToCsv,
      handleJwtDecode,
      handleMarkdownMode,
    ]
  );

  // ── Open a tool as a workspace tab ──────────────────────
  const openToolTab = useCallback(
    (tool) => {
      if (!tool) return;
      const tabId = `tool-${tool.id}`;
      let isNew = false;
      setWorkspaceTabs((tabs) => {
        if (tabs.find((t) => t.id === tabId)) return tabs;
        isNew = true;
        return [...tabs, { id: tabId, label: tool.label, icon: tool.icon, type: 'tool', tool }];
      });
      // Seed new tab: only from URL shared text, otherwise start empty
      if (isNew) {
        const seedText = sharedTextRef.current || '';
        if (sharedTextRef.current) sharedTextRef.current = null;
        setToolTexts((prev) => (prev[tabId] ? prev : { ...prev, [tabId]: seedText }));
        if (seedText) {
          pendingAutoRun.current = tool;
        }
      }
      setActiveWorkspaceId(tabId);
      // Clear stale global output state so the new tab starts clean
      ai.setAiResult(null);
      setPreviewMode(null);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [toolTexts]
  );

  // ── Open tool by ID and seed with content (used by templates) ──
  const openToolById = useCallback((toolId, content) => {
    const tool = toolId ? TOOLS.find((t) => t.id === toolId) : null;
    if (!tool) {
      // No tool_id or tool not found — load into current tab if open, otherwise open a generic tab
      const activeId = activeTabIdRef.current;
      if (activeId) {
        setToolTexts((prev) => ({ ...prev, [activeId]: content }));
      } else {
        // No tab open — pick the first non-drawer, non-action tool as a generic text holder
        const fallback = TOOLS.find((t) => t.type === 'api' && t.group === 'case') || TOOLS[0];
        const tabId = `tool-${fallback.id}`;
        setWorkspaceTabs((tabs) => {
          if (tabs.find((t) => t.id === tabId)) return tabs;
          return [
            ...tabs,
            { id: tabId, label: fallback.label, icon: fallback.icon, type: 'tool', tool: fallback },
          ];
        });
        setToolTexts((prev) => ({ ...prev, [tabId]: content }));
        setActiveWorkspaceId(tabId);
      }
      return;
    }
    const tabId = `tool-${tool.id}`;
    setWorkspaceTabs((tabs) => {
      if (tabs.find((t) => t.id === tabId)) return tabs;
      return [...tabs, { id: tabId, label: tool.label, icon: tool.icon, type: 'tool', tool }];
    });
    setToolTexts((prev) => ({ ...prev, [tabId]: content }));
    setActiveWorkspaceId(tabId);
    ai.setAiResult(null);
    setPreviewMode(null);
    // Schedule auto-run after text is set
    pendingAutoRun.current = tool;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep template helpers ref up to date
  templateHelpersRef.current = {
    getActiveToolId: () => {
      const ws = workspaceTabs.find((t) => t.id === activeWorkspaceId);
      return ws?.type === 'tool' ? ws.tool.id : null;
    },
    openToolById,
    renameActiveTab: (name) => {
      if (!activeWorkspaceId) return;
      setWorkspaceTabs((tabs) =>
        tabs.map((t) => (t.id === activeWorkspaceId ? { ...t, label: name } : t))
      );
    },
  };

  // ── Execute a tool ──
  const executeToolAction = useCallback(
    (tool) => {
      if (!tool) return;
      if (!trial.checkTrial()) return;

      // Unified tool access check (all tool types: ai, api, local, action, select)
      if (subscription?.checkToolAccess && !subscription.checkToolAccess(tool)) return;

      gamification.recordToolUse(tool.id, (textRef.current || '').length);

      // Stamp the source so the persistence effect knows which tool produced the result
      aiResultSourceRef.current = tool.id;

      if (tool.type === 'api') {
        callApi(tool.endpoint, tool.successMsg, { toolId: tool.id, toolType: tool.type }).then(
          (res) => {
            if (res?.success) pipeline.addStep(tool.id, tool.label, res.result);
            if (subscription?.refetchStatus) subscription.refetchStatus();
          }
        );
      } else if (
        tool.type === 'ai' ||
        tool.type === 'local' ||
        tool.type === 'action' ||
        tool.type === 'select'
      ) {
        const handler = handlerMap[tool.handlerKey];
        if (handler) {
          // For select tools, pass the freshly-clicked value from the ref to avoid stale closure
          const freshVal = selectValueRef.current;
          selectValueRef.current = null;
          const result = handler(freshVal);
          if (result && typeof result.then === 'function') {
            result.then(() => {
              pipeline.addStep(tool.id, tool.label);
              if (subscription?.refetchStatus) subscription.refetchStatus();
            });
          } else {
            pipeline.addStep(tool.id, tool.label);
            if (subscription?.refetchStatus) subscription.refetchStatus();
          }
        }
      } else if (tool.type === 'drawer') {
        togglePanel(tool.panelId);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [text, gamification.recordToolUse, trial.checkTrial, subscription?.checkToolAccess]
  );

  // ── Unified tool click handler ──────────────────────────
  const handleToolClick = useCallback(
    (tool) => {
      if (!tool) return;
      if (tool.type === 'drawer') {
        const tabId = `drawer-${tool.panelId}`;
        let isNew = false;
        setWorkspaceTabs((tabs) => {
          if (tabs.find((t) => t.id === tabId)) return tabs;
          isNew = true;
          return [
            ...tabs,
            {
              id: tabId,
              label: tool.label,
              icon: tool.icon,
              type: 'drawer',
              panelId: tool.panelId,
            },
          ];
        });
        // Reset compare state on fresh open so user starts with empty text
        if (isNew && tool.panelId === 'compare') {
          setToolTexts((prev) => ({ ...prev, [tabId]: '' }));
          compare.setCompareText('');
          compare.setDiffResult(null);
        }
        setActiveWorkspaceId(tabId);
        setActivePanel(tool.panelId);
        gamification.recordToolUse(tool.id, text.length);
      } else if (tool.type === 'action') {
        executeToolAction(tool);
      } else {
        openToolTab(tool);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [openToolTab, executeToolAction, text, gamification.recordToolUse]
  );

  // ── Auto-run tool on first open (when text was seeded) ──
  useEffect(() => {
    if (pendingAutoRun.current && text) {
      const tool = pendingAutoRun.current;
      pendingAutoRun.current = null;
      setTimeout(() => executeToolAction(tool), 50);
    }
  }, [text, activeWorkspaceId, executeToolAction]);

  // ── Debounced auto-run: re-run tool 2s after user stops typing ──
  useEffect(() => {
    if (!activeWorkspaceId || !text || loading) return;
    const ws = workspaceTabs.find((t) => t.id === activeWorkspaceId);
    if (!ws || ws.type !== 'tool') return;

    const prevText = lastTextPerTab.current[activeWorkspaceId];
    // First time seeing this tab — record text, don't auto-run (result may already be stored)
    if (prevText === undefined) {
      lastTextPerTab.current[activeWorkspaceId] = text;
      return;
    }
    // Text hasn't actually changed (tab switch back to same text)
    if (text === prevText) return;
    lastTextPerTab.current[activeWorkspaceId] = text;

    // Text genuinely changed — clear stale result and schedule re-run
    if (toolResults[activeWorkspaceId]) {
      setToolResults((prev) => {
        const next = { ...prev };
        delete next[activeWorkspaceId];
        return next;
      });
    }

    const timer = setTimeout(() => {
      executeToolAction(ws.tool);
    }, 2000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, activeWorkspaceId]);

  // ── Auto-run formatter when config changes ───────────
  const fmtCfgRef = useRef(formatter.fmtCfg);
  useEffect(() => {
    if (fmtCfgRef.current === formatter.fmtCfg) return;
    fmtCfgRef.current = formatter.fmtCfg;
    if (!activeWorkspaceId || !text || loading) return;
    const ws = workspaceTabs.find((t) => t.id === activeWorkspaceId);
    if (!ws || ws.type !== 'tool') return;
    if (!['js_fmt', 'ts_fmt', 'css_fmt', 'html_fmt'].includes(ws.tool.id)) return;
    const timer = setTimeout(() => executeToolAction(ws.tool), 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formatter.fmtCfg]);

  // ── Keyboard Shortcuts (power-user hotkeys) ─────────────
  // Use a ref so the keydown handler always sees the latest closures
  // without triggering re-registration on every render.
  const kbActionsRef = useRef(null);
  kbActionsRef.current = {
    openPalette: () => (search.isOpen ? search.close() : search.open()),
    toggleSidebar: () => setSidebarOpen((o) => !o),
    toggleSettings: () => setSettingsOpen((o) => !o),
    onEscape: () => {
      if (search.isOpen) {
        search.close();
        return;
      }
      if (settingsOpen) {
        setSettingsOpen(false);
        return;
      }
      if (activePanel) {
        setActivePanel(null);
        return;
      }
      if (sidebarOpen) {
        setSidebarOpen(false);
        return;
      }
    },
    runActiveTool: () => {
      const ws = workspaceTabs.find((t) => t.id === activeWorkspaceId);
      if (ws?.type === 'tool') executeToolAction(ws.tool);
    },
    saveTemplate: () => {
      if (activeWorkspaceId) {
        const ws = workspaceTabs.find((t) => t.id === activeWorkspaceId);
        setSaveModal({ tabId: activeWorkspaceId, defaultName: ws?.label || 'Untitled' });
      }
    },
    closeActiveTab: () => {
      if (activeWorkspaceId) closeWorkspaceTab(activeWorkspaceId);
    },
    clearText: () => handleClear(),
    undo: () => history.handleUndo(),
    redo: () => history.handleRedo(),
    copyOutput: () => {
      const result = toolResults[activeWorkspaceId] || ai.aiResult;
      if (result?.result) {
        navigator.clipboard.writeText(result.result);
        showAlert('Output copied', 'success');
      }
    },
    clearPaste: () => handleClearPaste(),
    goToTab: (idx) => {
      if (idx === 8) {
        const last = workspaceTabs[workspaceTabs.length - 1];
        if (last) setActiveWorkspaceId(last.id);
      } else if (workspaceTabs[idx]) {
        setActiveWorkspaceId(workspaceTabs[idx].id);
      }
    },
    nextTab: () => {
      if (workspaceTabs.length === 0) return;
      const idx = workspaceTabs.findIndex((t) => t.id === activeWorkspaceId);
      const next = (idx + 1) % workspaceTabs.length;
      setActiveWorkspaceId(workspaceTabs[next].id);
    },
    prevTab: () => {
      if (workspaceTabs.length === 0) return;
      const idx = workspaceTabs.findIndex((t) => t.id === activeWorkspaceId);
      const prev = (idx - 1 + workspaceTabs.length) % workspaceTabs.length;
      setActiveWorkspaceId(workspaceTabs[prev].id);
    },
    runTool: (tool) => handleToolClick(tool),
  };
  // Stable proxy object — never changes identity, always delegates to latest ref
  const keyboardActions = useMemo(() => {
    const proxy = {};
    const keys = [
      'openPalette',
      'toggleSidebar',
      'toggleSettings',
      'onEscape',
      'runActiveTool',
      'saveTemplate',
      'closeActiveTab',
      'clearText',
      'undo',
      'redo',
      'copyOutput',
      'clearPaste',
      'goToTab',
      'nextTab',
      'prevTab',
      'runTool',
    ];
    keys.forEach((k) => {
      proxy[k] = (...args) => kbActionsRef.current[k]?.(...args);
    });
    return proxy;
  }, []);

  const {
    shortcutsOpen,
    setShortcutsOpen,
    groups: shortcutGroups,
    overrides: shortcutOverrides,
    updateBinding,
    resetAll: resetAllBindings,
    resetOne: resetOneBinding,
    isCustomized: isBindingCustomized,
  } = useKeyboardShortcuts(keyboardActions);

  // ── Derived stats ───────────────────────────────────────
  const disabled = text.length === 0 || loading;
  const { words, chars, sentences } = useMemo(
    () => ({
      words: text.split(/\s+/).filter(Boolean).length,
      chars: text.length,
      sentences: text.split(/[.?]\s*(?=\S|$)|\n/).filter((s) => s.trim()).length,
    }),
    [text]
  );

  const togglePanel = (panel) => setActivePanel((prev) => (prev === panel ? null : panel));

  const renderDrawerContent = () => {
    switch (activePanel) {
      case 'find':
        return null; // Renders inline in input area
      case 'compare':
        return null; // Compare uses its own layout
      case 'randtext':
        return null; // Renders inline in input area
      case 'password':
        return null; // Renders inline in input area
      case 'regex':
        return <RegexDrawer {...regex} disabled={disabled} />;
      case 'templates':
        return <TemplatesDrawer {...templates} disabled={disabled} />;
      case 'history':
        return <HistoryDrawer {...history} setText={setText} showAlert={showAlert} />;
      case 'wraplines':
        return null; // Renders inline in input area
      case 'filterlines':
        return null; // Renders inline in input area
      case 'droplines':
        return null; // Renders inline in input area
      case 'truncatelines':
        return null; // Renders inline in input area
      case 'nthlines':
        return null; // Renders inline in input area
      case 'cipherdrawer':
        return null; // Renders inline
      case 'diffdrawer':
        return null; // Renders inline
      case 'fakedata':
        return null; // Renders inline
      case 'jsonpath':
        return null; // Renders inline
      case 'mdpreview':
        return null; // Renders inline
      case 'loremipsum':
        return null; // Renders inline
      case 'samplejson':
        return null; // Renders inline
      default:
        return null;
    }
  };

  // Activity bar tab click — toggles sidebar
  const handleActivityClick = (tabId) => {
    if (activeTab === tabId && sidebarOpen) {
      setSidebarOpen(false);
    } else {
      setActiveTab(tabId);
      setSidebarOpen(true);
    }
  };

  return (
    <>
      <div
        className={`tu-forge${sidebarOpen ? '' : ' tu-forge--sidebar-collapsed'}`}
        style={
          sidebarOpen ? { gridTemplateColumns: `48px ${sidebarResize.size}px 1fr` } : undefined
        }
      >
        {/* ─── Activity Bar (far left icons) ─── */}
        <div className="tu-activity-bar">
          {USE_CASE_TABS.map((tab) => (
            <button
              key={tab.id}
              className={`tu-activity-btn${
                activeTab === tab.id && sidebarOpen ? ' tu-activity-btn--active' : ''
              }`}
              onClick={() => handleActivityClick(tab.id)}
              data-tooltip={tab.label}
            >
              {ACTIVITY_ICONS[tab.id] || <span>{tab.icon}</span>}
            </button>
          ))}
          {/* What's New */}
          <button
            className={`tu-activity-btn${
              activeTab === '_new' && sidebarOpen ? ' tu-activity-btn--active' : ''
            }`}
            onClick={() => handleActivityClick('_new')}
            data-tooltip="What's New"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </button>
          {/* Favourites */}
          <button
            className={`tu-activity-btn${
              activeTab === '_favourites' && sidebarOpen ? ' tu-activity-btn--active' : ''
            }`}
            onClick={() => handleActivityClick('_favourites')}
            data-tooltip="Favourites"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
          <div className="tu-activity-spacer" />
          {/* Templates */}
          <button
            className={`tu-activity-btn${
              activeTab === '_templates' && sidebarOpen ? ' tu-activity-btn--active' : ''
            }`}
            onClick={() => handleActivityClick('_templates')}
            data-tooltip="Templates"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </button>
          {/* History */}
          <button
            className={`tu-activity-btn${
              activeTab === '_history' && sidebarOpen ? ' tu-activity-btn--active' : ''
            }`}
            onClick={() => handleActivityClick('_history')}
            data-tooltip="History"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </button>
          {/* Bottom: avatar */}
          <button
            className={`tu-activity-avatar${settingsOpen ? ' tu-activity-avatar--open' : ''}`}
            onClick={() => setSettingsOpen((o) => !o)}
          >
            <span className="tu-activity-avatar-letter">
              {props.user?.display_name?.charAt(0)?.toUpperCase() || 'G'}
            </span>
          </button>
        </div>

        {/* ─── Sidebar (tool explorer / templates / history) ─── */}
        <div className="tu-forge-sidebar">
          <div className="tu-sidebar-header">
            <span title="~/FixMyText/workspace/tools">
              {activeTab === '_new'
                ? "What's New"
                : activeTab === '_templates'
                ? 'Templates'
                : activeTab === '_history'
                ? 'History'
                : activeTab === '_favourites'
                ? 'Favourites'
                : USE_CASE_TABS.find((t) => t.id === activeTab)?.label || 'Explorer'}
              {activeTab && !activeTab.startsWith('_') && (
                <span className="tu-sidebar-header-count">
                  {activeTab === 'all'
                    ? TOOLS.length
                    : TOOLS.filter((t) => t.tabs?.includes(activeTab)).length}
                </span>
              )}
            </span>
            <div className="tu-sidebar-header-actions">
              {((activeTab && !activeTab.startsWith('_')) ||
                activeTab === '_favourites' ||
                activeTab === '_new') && (
                <>
                  <button
                    className={`tu-sidebar-header-btn${
                      toolViewMode === 'list' ? ' tu-sidebar-header-btn--active' : ''
                    }`}
                    onClick={() => {
                      setToolViewMode('list');
                      localStorage.setItem('fmx_tool_view', 'list');
                      if (accessToken)
                        updateUiSettings({ tool_view: 'list' })
                          .unwrap()
                          .catch(() => {});
                    }}
                    title="List view"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="8" y1="6" x2="21" y2="6" />
                      <line x1="8" y1="12" x2="21" y2="12" />
                      <line x1="8" y1="18" x2="21" y2="18" />
                      <line x1="3" y1="6" x2="3.01" y2="6" />
                      <line x1="3" y1="12" x2="3.01" y2="12" />
                      <line x1="3" y1="18" x2="3.01" y2="18" />
                    </svg>
                  </button>
                  <button
                    className={`tu-sidebar-header-btn${
                      toolViewMode === 'grid' ? ' tu-sidebar-header-btn--active' : ''
                    }`}
                    onClick={() => {
                      setToolViewMode('grid');
                      localStorage.setItem('fmx_tool_view', 'grid');
                      if (accessToken)
                        updateUiSettings({ tool_view: 'grid' })
                          .unwrap()
                          .catch(() => {});
                    }}
                    title="Grid view"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" />
                    </svg>
                  </button>
                </>
              )}
              <button
                className="tu-sidebar-header-btn"
                onClick={() => setSidebarOpen(false)}
                title="Close sidebar"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Tool panel — when a tool category is active */}
          {activeTab && !activeTab.startsWith('_') && (
            <ToolPanel
              tools={TOOLS}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onToolClick={handleToolClick}
              disabled={loading}
              gamification={gamification}
              activeToolId={(() => {
                const ws = workspaceTabs.find((t) => t.id === activeWorkspaceId);
                if (ws?.type === 'tool') return ws.tool.id;
                if (ws?.type === 'drawer')
                  return TOOLS.find((t) => t.panelId === ws.panelId)?.id || null;
                return null;
              })()}
              ai={ai}
              hideTabs
              viewMode={toolViewMode}
              suggestedToolIds={suggestions.suggestions.map((t) => t.id)}
            />
          )}

          {/* Favourites panel */}
          {activeTab === '_favourites' &&
            (() => {
              const favTools = (gamification?.favorites || [])
                .map((id) => TOOLS.find((t) => t.id === id))
                .filter(Boolean);
              return (
                <div className="tu-tpanel">
                  {favTools.length === 0 ? (
                    <div className="tu-sidebar-panel-empty">
                      No favourite tools yet.
                      <br />
                      Click ♡ on any tool to add it here.
                    </div>
                  ) : toolViewMode === 'grid' ? (
                    <div className="tu-tpanel-list">
                      <div className="tu-group-grid">
                        {favTools.map((tool) => (
                          <div
                            key={tool.id}
                            className="tu-tgrid-card"
                            onClick={() => handleToolClick(tool)}
                          >
                            <div className="tu-tgrid-card-icon">
                              <ToolIcon icon={tool.icon} color={tool.color} toolId={tool.id} />
                            </div>
                            <span className="tu-tgrid-card-name">{tool.label}</span>
                            <button
                              className="tu-titem-fav tu-tgrid-card-fav tu-titem-fav--active"
                              onClick={(e) => {
                                e.stopPropagation();
                                gamification?.toggleFavorite(tool.id);
                              }}
                              title="Remove from favourites"
                            >
                              ♥
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="tu-tpanel-list">
                      {favTools.map((tool) => (
                        <div key={tool.id} className="tu-titem-wrap">
                          <div className="tu-titem" onClick={() => handleToolClick(tool)}>
                            <ToolIcon icon={tool.icon} color={tool.color} toolId={tool.id} />
                            <span className="tu-titem-name">{tool.label}</span>
                            <button
                              className="tu-titem-fav tu-titem-fav--active"
                              onClick={(e) => {
                                e.stopPropagation();
                                gamification?.toggleFavorite(tool.id);
                              }}
                              title="Remove from favourites"
                            >
                              ♥
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

          {/* What's New panel */}
          {activeTab === '_new' &&
            (() => {
              const discovered = gamification?.discoveredTools || [];
              const newTools = TOOLS.filter(
                (t) =>
                  !discovered.includes(t.id) && (t.tabs?.includes('ai') || t.tabs?.includes('code'))
              );
              return (
                <div className="tu-tpanel">
                  {newTools.length === 0 ? (
                    <div className="tu-sidebar-panel-empty">You&apos;ve discovered all tools!</div>
                  ) : toolViewMode === 'grid' ? (
                    <div className="tu-tpanel-list">
                      <div className="tu-group-grid">
                        {newTools.map((tool) => (
                          <div
                            key={tool.id}
                            className="tu-tgrid-card"
                            onClick={() => handleToolClick(tool)}
                          >
                            <div className="tu-tgrid-card-icon">
                              <ToolIcon icon={tool.icon} color={tool.color} toolId={tool.id} />
                            </div>
                            <span className="tu-tgrid-card-name">{tool.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="tu-tpanel-list">
                      {newTools.map((tool) => (
                        <div key={tool.id} className="tu-titem-wrap">
                          <div className="tu-titem" onClick={() => handleToolClick(tool)}>
                            <ToolIcon icon={tool.icon} color={tool.color} toolId={tool.id} />
                            <span className="tu-titem-name">{tool.label}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

          {/* Templates panel */}
          {activeTab === '_templates' && (
            <div className="tu-sidebar-panel">
              <div className="tu-sidebar-panel-actions">
                <input
                  className="tu-sidebar-panel-input"
                  type="text"
                  placeholder="Template name..."
                  value={templates.templateName}
                  onChange={(e) => templates.setTemplateName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && templates.handleSaveTemplate()}
                />
                <button
                  className="tu-sidebar-panel-btn"
                  onClick={templates.handleSaveTemplate}
                  title="Save current text as template"
                >
                  Save
                </button>
              </div>

              {templates.templates.length === 0 ? (
                <div className="tu-sidebar-panel-empty">No saved templates yet</div>
              ) : (
                <div className="tu-sidebar-panel-list">
                  {templates.templates.map((tpl, i) => (
                    <div
                      key={i}
                      className="tu-sidebar-panel-item"
                      onClick={() => templates.handleLoadTemplate(i)}
                    >
                      <span className="tu-sidebar-panel-item-icon">📄</span>
                      <span className="tu-sidebar-panel-item-name">{tpl.name}</span>
                      <span className="tu-sidebar-panel-item-meta">
                        {new Date(tpl.updatedAt).toLocaleDateString()}
                      </span>
                      <button
                        className="tu-sidebar-panel-item-del"
                        onClick={(e) => {
                          e.stopPropagation();
                          templates.handleDeleteTemplate(i);
                        }}
                        title="Delete template"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* History panel */}
          {activeTab === '_history' && (
            <div className="tu-sidebar-panel">
              {/* View toggle: Session vs Saved (only if logged in) */}
              {accessToken && (
                <div className="tu-sidebar-panel-tabs">
                  <button
                    className={`tu-sidebar-panel-tab${
                      historyView === 'session' ? ' tu-sidebar-panel-tab--active' : ''
                    }`}
                    onClick={() => setHistoryView('session')}
                  >
                    Session
                  </button>
                  <button
                    className={`tu-sidebar-panel-tab${
                      historyView === 'saved' ? ' tu-sidebar-panel-tab--active' : ''
                    }`}
                    onClick={() => {
                      setHistoryView('saved');
                      setHistoryPage(1);
                    }}
                  >
                    All History
                  </button>
                </div>
              )}

              {/* Session history (local, in-memory) */}
              {historyView === 'session' && (
                <>
                  {history.history.length > 0 && (
                    <div className="tu-sidebar-panel-actions">
                      <span className="tu-sidebar-panel-count">
                        {history.history.length} operations
                      </span>
                      <button
                        className="tu-sidebar-panel-btn tu-sidebar-panel-btn--danger"
                        onClick={history.handleClearHistory}
                      >
                        Clear All
                      </button>
                    </div>
                  )}
                  {history.history.length === 0 ? (
                    <div className="tu-sidebar-panel-empty">No operations yet</div>
                  ) : (
                    <div className="tu-sidebar-panel-list">
                      {[...history.history].reverse().map((h, ri) => {
                        const i = history.history.length - 1 - ri;
                        return (
                          <div key={i} className="tu-sidebar-panel-item">
                            <span className="tu-sidebar-panel-item-icon">⚡</span>
                            <span className="tu-sidebar-panel-item-name">{h.operation}</span>
                            <span className="tu-sidebar-panel-item-meta">
                              {new Date(h.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            <button
                              className="tu-sidebar-panel-item-action"
                              onClick={() => {
                                setText(h.original);
                                showAlert(`Restored input from "${h.operation}"`, 'success');
                              }}
                              title="Restore input"
                            >
                              ↩
                            </button>
                            <button
                              className="tu-sidebar-panel-item-action"
                              onClick={() => {
                                setText(h.result);
                                showAlert(`Restored result from "${h.operation}"`, 'success');
                              }}
                              title="Restore result"
                            >
                              ↪
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}

              {/* Saved history (server-side, paginated) */}
              {historyView === 'saved' && accessToken && (
                <>
                  {serverHistory && serverHistory.total > 0 && (
                    <div className="tu-sidebar-panel-actions">
                      <span className="tu-sidebar-panel-count">{serverHistory.total} total</span>
                      <button
                        className="tu-sidebar-panel-btn tu-sidebar-panel-btn--danger"
                        onClick={() => {
                          clearServerHistory()
                            .unwrap()
                            .then(() => showAlert('All history cleared', 'success'))
                            .catch(() => {});
                        }}
                      >
                        Clear All
                      </button>
                    </div>
                  )}
                  {historyFetching ? (
                    <div className="tu-sidebar-panel-empty">Loading...</div>
                  ) : !serverHistory || serverHistory.items.length === 0 ? (
                    <div className="tu-sidebar-panel-empty">No saved history yet</div>
                  ) : (
                    <>
                      <div className="tu-sidebar-panel-list">
                        {serverHistory.items.map((h) => (
                          <div key={h.id} className="tu-sidebar-panel-item">
                            <span className="tu-sidebar-panel-item-icon">⚡</span>
                            <span className="tu-sidebar-panel-item-name">{h.tool_label}</span>
                            <span className="tu-sidebar-panel-item-meta">
                              {new Date(h.created_at).toLocaleDateString([], {
                                month: 'short',
                                day: 'numeric',
                              })}{' '}
                              {new Date(h.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            <button
                              className="tu-sidebar-panel-item-action"
                              onClick={() => {
                                setText(h.input_preview);
                                showAlert(`Restored input from "${h.tool_label}"`, 'success');
                              }}
                              title="Restore input"
                            >
                              ↩
                            </button>
                            <button
                              className="tu-sidebar-panel-item-action"
                              onClick={() => {
                                setText(h.output_preview);
                                showAlert(`Restored output from "${h.tool_label}"`, 'success');
                              }}
                              title="Restore output"
                            >
                              ↪
                            </button>
                            <button
                              className="tu-sidebar-panel-item-action tu-sidebar-panel-item-action--danger"
                              onClick={() => {
                                deleteHistoryEntry(h.id)
                                  .unwrap()
                                  .catch(() => {});
                              }}
                              title="Delete entry"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                      {/* Pagination */}
                      {serverHistory.total > 25 && (
                        <div className="tu-sidebar-panel-pagination">
                          <button
                            className="tu-sidebar-panel-btn"
                            disabled={historyPage <= 1}
                            onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                          >
                            Prev
                          </button>
                          <span className="tu-sidebar-panel-count">
                            Page {historyPage} of {Math.ceil(serverHistory.total / 25)}
                          </span>
                          <button
                            className="tu-sidebar-panel-btn"
                            disabled={!serverHistory.has_more}
                            onClick={() => setHistoryPage((p) => p + 1)}
                          >
                            Next
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          )}

          {/* ─── Sidebar Footer: Gamification ─── */}
          <div className="tu-sidebar-footer">
            {/* Level + XP */}
            <div className="tu-sf-row tu-sf-level">
              <span className="tu-sf-level-icon">⚡</span>
              <span className="tu-sf-label">Lv.{gamification.level?.level || 1}</span>
              <span className="tu-sf-sublabel">{gamification.level?.title || 'Beginner'}</span>
              <span className="tu-sf-value">{gamification.xp || 0} XP</span>
            </div>
            <div className="tu-sf-xp-track">
              <div
                className="tu-sf-xp-fill"
                style={{ width: `${gamification.xpProgress || 0}%` }}
              />
            </div>

            {/* Subscription Status */}
            {subscription?.isPro && (
              <div className="tu-sf-row tu-sf-ai-usage">
                <span className="tu-sf-label tu-sf-label--pro">PRO</span>
                <span className="tu-sf-value">Unlimited</span>
              </div>
            )}
            {subscription &&
              props.isAuthenticated &&
              !subscription.isPro &&
              subscription.totalCredits > 0 && (
                <div className="tu-sf-row tu-sf-ai-usage">
                  <span className="tu-sf-label">Credits</span>
                  <span className="tu-sf-value">{subscription.totalCredits}</span>
                </div>
              )}

            {/* Streak + Discovery */}
            <div className="tu-sf-stats">
              <div className="tu-sf-stat" title="Daily streak">
                🔥 <b>{gamification.streak?.current || 0}</b> streak
              </div>
              <div className="tu-sf-stat" title="Tools discovered">
                🧭 <b>{gamification.discoveredTools?.length || 0}</b>/{TOOLS.length}
              </div>
            </div>

            {/* Daily Quest */}
            {gamification.dailyQuest?.id && (
              <div
                className={`tu-sf-quest${
                  gamification.dailyQuest.completed ? ' tu-sf-quest--done' : ''
                }`}
              >
                <span className="tu-sf-quest-icon">
                  {gamification.dailyQuest.completed ? '✅' : '📋'}
                </span>
                <span className="tu-sf-quest-text">
                  {QUEST_TEMPLATES.find((q) => q.id === gamification.dailyQuest.id)?.text ||
                    'Daily Quest'}
                </span>
              </div>
            )}
          </div>
          {/* Sidebar resize handle */}
          {sidebarOpen && (
            <div
              className="tu-resize-handle tu-resize-handle--sidebar"
              onMouseDown={sidebarResize.onMouseDown}
            />
          )}
        </div>

        {/* ─── Center: Editor Area ─── */}
        <div className="tu-forge-center">
          {/* ─── Workspace Tab Bar (top-level, tools as files) ─── */}
          {workspaceTabs.length > 0 && (
            <TabBarWrap
              workspaceTabs={workspaceTabs}
              activeWorkspaceId={activeWorkspaceId}
              setActiveWorkspaceId={setActiveWorkspaceId}
              setActivePanel={setActivePanel}
              setSaveModal={setSaveModal}
              closeWorkspaceTab={closeWorkspaceTab}
              onTabSwitch={() => {
                ai.setAiResult(null);
                setPreviewMode(null);
              }}
            />
          )}

          {/* ─── Landing page (no tool selected) ─── */}
          {!activeWorkspaceId && (
            <div className="tu-landing">
              {props.isAuthenticated ? (
                /* ══════════ SIGNED-IN DASHBOARD ══════════ */
                <>
                  {/* Greeting + search */}
                  <div className="tu-landing-greeting">
                    <div className="tu-landing-greeting-left">
                      <h1 className="tu-landing-title">
                        Welcome back, {props.user?.display_name?.split(' ')[0] || 'there'}
                      </h1>
                      <p className="tu-landing-subtitle">
                        Level {gamification?.level?.level || 1}{' '}
                        {gamification?.level?.title || 'Beginner'} &middot; {gamification?.xp || 0}{' '}
                        XP
                      </p>
                    </div>
                    <button className="tu-landing-search-btn" onClick={() => search.open()}>
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                      Search tools...
                      <kbd>Ctrl+K</kbd>
                    </button>
                  </div>

                  {/* XP progress bar */}
                  {gamification?.nextLevel && (
                    <div className="tu-landing-xp-bar">
                      <div className="tu-landing-xp-track">
                        <div
                          className="tu-landing-xp-fill"
                          style={{ width: `${Math.min(gamification.xpProgress || 0, 100)}%` }}
                        />
                      </div>
                      <span className="tu-landing-xp-label">
                        {gamification.xp || 0} / {gamification.nextLevel.xp} XP to{' '}
                        {gamification.nextLevel.title}
                      </span>
                    </div>
                  )}

                  {/* Dashboard grid */}
                  <div className="tu-landing-dash-grid">
                    {/* Daily quest card */}
                    <div className="tu-landing-card tu-landing-card--quest">
                      <h3 className="tu-landing-card-title">
                        <span className="tu-landing-card-icon">&#x2728;</span>
                        Daily Quest
                      </h3>
                      {gamification?.dailyQuest?.id ? (
                        (() => {
                          const quest = QUEST_TEMPLATES.find(
                            (q) => q.id === gamification.dailyQuest.id
                          );
                          return quest ? (
                            <div className="tu-landing-quest-body">
                              <p className="tu-landing-quest-text">{quest.text}</p>
                              <div className="tu-landing-quest-footer">
                                <span className="tu-landing-quest-xp">+{quest.xp} XP</span>
                                {gamification.dailyQuest.completed ? (
                                  <span className="tu-landing-quest-done">Completed!</span>
                                ) : (
                                  <span className="tu-landing-quest-pending">In progress</span>
                                )}
                              </div>
                            </div>
                          ) : null;
                        })()
                      ) : (
                        <p className="tu-landing-quest-text" style={{ color: 'var(--text-3)' }}>
                          No quest today
                        </p>
                      )}
                    </div>

                    {/* Stats card */}
                    <div className="tu-landing-card tu-landing-card--stats">
                      <h3 className="tu-landing-card-title">
                        <span className="tu-landing-card-icon">&#x1F4CA;</span>
                        Your Stats
                      </h3>
                      <div className="tu-landing-mini-stats">
                        <div className="tu-landing-mini-stat">
                          <span className="tu-landing-mini-stat-val">
                            {gamification?.streak?.current || 0}
                          </span>
                          <span className="tu-landing-mini-stat-label">Day Streak</span>
                        </div>
                        <div className="tu-landing-mini-stat">
                          <span className="tu-landing-mini-stat-val">
                            {gamification?.totalOps || 0}
                          </span>
                          <span className="tu-landing-mini-stat-label">Operations</span>
                        </div>
                        <div className="tu-landing-mini-stat">
                          <span className="tu-landing-mini-stat-val">
                            {gamification?.discoveredTools?.length || 0}
                          </span>
                          <span className="tu-landing-mini-stat-label">Tools Found</span>
                        </div>
                        <div className="tu-landing-mini-stat">
                          <span className="tu-landing-mini-stat-val">
                            {gamification?.achievements?.length || 0}
                          </span>
                          <span className="tu-landing-mini-stat-label">Badges</span>
                        </div>
                      </div>
                    </div>

                    {/* Achievements card */}
                    <div className="tu-landing-card tu-landing-card--achievements">
                      <h3 className="tu-landing-card-title">
                        <span className="tu-landing-card-icon">&#x1F3C6;</span>
                        Recent Badges
                      </h3>
                      <div className="tu-landing-badge-row">
                        {gamification?.achievements?.length > 0 ? (
                          gamification.achievements
                            .slice(-6)
                            .reverse()
                            .map((aid) => {
                              const ach = ACHIEVEMENTS.find((a) => a.id === aid);
                              return ach ? (
                                <span
                                  key={aid}
                                  className="tu-landing-badge"
                                  title={`${ach.label}: ${ach.description}`}
                                >
                                  {ach.icon}
                                </span>
                              ) : null;
                            })
                        ) : (
                          <span className="tu-landing-badge-empty">
                            Complete quests to earn badges
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Favorites + Recent tools */}
                  <div className="tu-landing-tools-row">
                    {/* Favourites */}
                    <div className="tu-landing-card tu-landing-card--wide">
                      <h3 className="tu-landing-card-title">
                        <span className="tu-landing-card-icon">&#x2764;</span>
                        {gamification?.favorites?.length > 0 ? 'Your Favourites' : 'Popular Tools'}
                      </h3>
                      <div className="tu-landing-tool-grid">
                        {(gamification?.favorites?.length > 0
                          ? gamification.favorites
                              .slice(0, 8)
                              .map((id) => TOOLS.find((t) => t.id === id))
                              .filter(Boolean)
                          : [
                              'fix_grammar',
                              'paraphrase',
                              'summarize',
                              'uppercase',
                              'lowercase',
                              'title_case',
                              'word_count',
                              'find_replace',
                            ]
                              .map((id) => TOOLS.find((t) => t.id === id))
                              .filter(Boolean)
                        ).map((tool) => (
                          <button
                            key={tool.id}
                            className="tu-landing-tool-btn"
                            onClick={() => handleToolClick(tool)}
                          >
                            <span className={`tu-landing-tool-icon tu-titem-icon--${tool.color}`}>
                              {tool.icon}
                            </span>
                            <span className="tu-landing-tool-name">{tool.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Most used */}
                    <div className="tu-landing-card tu-landing-card--wide">
                      <h3 className="tu-landing-card-title">
                        <span className="tu-landing-card-icon">&#x1F525;</span>
                        Most Used
                      </h3>
                      <div className="tu-landing-tool-grid">
                        {(() => {
                          const used = gamification?.toolsUsed || {};
                          const sorted = Object.entries(used)
                            .sort((a, b) => b[1] - a[1])
                            .slice(0, 8);
                          if (sorted.length === 0)
                            return (
                              <span className="tu-landing-badge-empty">
                                Start using tools to track your favorites
                              </span>
                            );
                          return sorted.map(([id, count]) => {
                            const tool = TOOLS.find((t) => t.id === id);
                            return tool ? (
                              <button
                                key={id}
                                className="tu-landing-tool-btn"
                                onClick={() => handleToolClick(tool)}
                              >
                                <span
                                  className={`tu-landing-tool-icon tu-titem-icon--${tool.color}`}
                                >
                                  {tool.icon}
                                </span>
                                <span className="tu-landing-tool-name">{tool.label}</span>
                                <span className="tu-landing-tool-count">{count}x</span>
                              </button>
                            ) : null;
                          });
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Category grid + Shortcuts */}
                  <div className="tu-landing-bottom">
                    <div className="tu-landing-categories">
                      <h3 className="tu-landing-heading">Explore categories</h3>
                      <div className="tu-landing-cat-grid">
                        {USE_CASE_TABS.filter((t) => t.id !== 'all').map((tab) => {
                          const count = TOOLS.filter((t) => t.tabs?.includes(tab.id)).length;
                          return (
                            <button
                              key={tab.id}
                              className="tu-landing-cat-card"
                              onClick={() => {
                                setActiveTab(tab.id);
                                setSidebarOpen(true);
                              }}
                            >
                              <span className="tu-landing-cat-icon">
                                {ACTIVITY_ICONS[tab.id] || <span>{tab.icon}</span>}
                              </span>
                              <span className="tu-landing-cat-name">{tab.label}</span>
                              <span className="tu-landing-cat-count">{count} tools</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="tu-landing-shortcuts">
                      <h3 className="tu-landing-heading">Keyboard shortcuts</h3>
                      <div className="tu-landing-shortcut-list">
                        <div className="tu-landing-shortcut">
                          <kbd>Ctrl</kbd>
                          <kbd>K</kbd>
                          <span>Command palette</span>
                        </div>
                        <div className="tu-landing-shortcut">
                          <kbd>Ctrl</kbd>
                          <kbd>&#x23CE;</kbd>
                          <span>Run tool</span>
                        </div>
                        <div className="tu-landing-shortcut">
                          <kbd>Ctrl</kbd>
                          <kbd>B</kbd>
                          <span>Toggle sidebar</span>
                        </div>
                        <div className="tu-landing-shortcut">
                          <kbd>Ctrl</kbd>
                          <kbd>Z</kbd>
                          <span>Undo</span>
                        </div>
                        <div className="tu-landing-shortcut">
                          <kbd>Ctrl</kbd>
                          <kbd>S</kbd>
                          <span>Save template</span>
                        </div>
                        <div className="tu-landing-shortcut">
                          <kbd>Ctrl</kbd>
                          <kbd>/</kbd>
                          <span>All shortcuts</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* ══════════ SIGNED-OUT MARKETING PAGE ══════════ */
                <>
                  {/* Hero */}
                  <div className="tu-landing-hero tu-landing-hero--big">
                    <h1 className="tu-landing-title tu-landing-title--big">
                      Fix, transform &amp; enhance
                      <br />
                      your text instantly
                    </h1>
                    <p className="tu-landing-subtitle tu-landing-subtitle--big">
                      {TOOLS.length}+ powerful tools for writing, coding, translating, and more
                      &mdash; all in one place. No installs. No fluff.
                    </p>
                    <div className="tu-landing-hero-actions">
                      <button className="tu-landing-cta" onClick={() => navigate('/login')}>
                        Get Started Free
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="5" y1="12" x2="19" y2="12" />
                          <polyline points="12 5 19 12 12 19" />
                        </svg>
                      </button>
                      <button className="tu-landing-cta-secondary" onClick={() => search.open()}>
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <circle cx="11" cy="11" r="8" />
                          <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        Try a tool now
                        <kbd>Ctrl+K</kbd>
                      </button>
                    </div>
                  </div>

                  {/* Feature highlights */}
                  <div className="tu-landing-features">
                    <div className="tu-landing-feature">
                      <div className="tu-landing-feature-icon">
                        <svg
                          width="28"
                          height="28"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="var(--accent)"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                        </svg>
                      </div>
                      <h3 className="tu-landing-feature-title">
                        {TOOLS.filter((t) => t.tabs?.includes('writing')).length}+ Writing Tools
                      </h3>
                      <p className="tu-landing-feature-desc">
                        Grammar fixes, paraphrasing, tone adjustment, summarization, proofreading,
                        and more.
                      </p>
                    </div>
                    <div className="tu-landing-feature">
                      <div className="tu-landing-feature-icon">
                        <svg
                          width="28"
                          height="28"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="var(--accent)"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="16 18 22 12 16 6" />
                          <polyline points="8 6 2 12 8 18" />
                        </svg>
                      </div>
                      <h3 className="tu-landing-feature-title">Developer Friendly</h3>
                      <p className="tu-landing-feature-desc">
                        JSON formatting, Base64 encoding, regex testing, slug generation, and code
                        utilities.
                      </p>
                    </div>
                    <div className="tu-landing-feature">
                      <div className="tu-landing-feature-icon">
                        <svg
                          width="28"
                          height="28"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="var(--accent)"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z" />
                          <path d="M16 14H8a4 4 0 0 0-4 4v2h16v-2a4 4 0 0 0-4-4z" />
                        </svg>
                      </div>
                      <h3 className="tu-landing-feature-title">AI-Powered</h3>
                      <p className="tu-landing-feature-desc">
                        Translate, rewrite in any tone, ELI5, summarize — backed by state-of-the-art
                        AI models.
                      </p>
                    </div>
                    <div className="tu-landing-feature">
                      <div className="tu-landing-feature-icon">
                        <svg
                          width="28"
                          height="28"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="var(--accent)"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="17 1 21 5 17 9" />
                          <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                          <polyline points="7 23 3 19 7 15" />
                          <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                        </svg>
                      </div>
                      <h3 className="tu-landing-feature-title">Instant Transforms</h3>
                      <p className="tu-landing-feature-desc">
                        UPPERCASE, lowercase, title case, reverse, sort lines, remove duplicates —
                        one click away.
                      </p>
                    </div>
                  </div>

                  {/* How it works */}
                  <div className="tu-landing-how">
                    <h2 className="tu-landing-section-title">How it works</h2>
                    <div className="tu-landing-how-steps">
                      <div className="tu-landing-how-step">
                        <span className="tu-landing-step-num">1</span>
                        <div>
                          <h4 className="tu-landing-how-step-title">Pick a tool</h4>
                          <p className="tu-landing-how-step-desc">
                            Browse {TOOLS.length}+ tools by category or search with Ctrl+K
                          </p>
                        </div>
                      </div>
                      <div className="tu-landing-how-step">
                        <span className="tu-landing-step-num">2</span>
                        <div>
                          <h4 className="tu-landing-how-step-title">Paste or type your text</h4>
                          <p className="tu-landing-how-step-desc">
                            The split editor shows input on the left, output on the right
                          </p>
                        </div>
                      </div>
                      <div className="tu-landing-how-step">
                        <span className="tu-landing-step-num">3</span>
                        <div>
                          <h4 className="tu-landing-how-step-title">
                            Click Run or press Ctrl+Enter
                          </h4>
                          <p className="tu-landing-how-step-desc">
                            Your transformed text appears instantly. Copy, export, or chain more
                            tools
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Category grid */}
                  <div className="tu-landing-categories">
                    <h2 className="tu-landing-section-title">Explore categories</h2>
                    <div className="tu-landing-cat-grid">
                      {USE_CASE_TABS.filter((t) => t.id !== 'all').map((tab) => {
                        const count = TOOLS.filter((t) => t.tabs?.includes(tab.id)).length;
                        return (
                          <button
                            key={tab.id}
                            className="tu-landing-cat-card"
                            onClick={() => {
                              setActiveTab(tab.id);
                              setSidebarOpen(true);
                            }}
                          >
                            <span className="tu-landing-cat-icon">
                              {ACTIVITY_ICONS[tab.id] || <span>{tab.icon}</span>}
                            </span>
                            <span className="tu-landing-cat-name">{tab.label}</span>
                            <span className="tu-landing-cat-count">{count} tools</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Social proof / highlights */}
                  <div className="tu-landing-highlights">
                    <div className="tu-landing-highlight">
                      <span className="tu-landing-highlight-val">{TOOLS.length}+</span>
                      <span className="tu-landing-highlight-label">Text tools</span>
                    </div>
                    <div className="tu-landing-highlight">
                      <span className="tu-landing-highlight-val">
                        {USE_CASE_TABS.filter((t) => t.id !== 'all').length}
                      </span>
                      <span className="tu-landing-highlight-label">Categories</span>
                    </div>
                    <div className="tu-landing-highlight">
                      <span className="tu-landing-highlight-val">{ACHIEVEMENTS.length}</span>
                      <span className="tu-landing-highlight-label">Achievements</span>
                    </div>
                    <div className="tu-landing-highlight">
                      <span className="tu-landing-highlight-val">Free</span>
                      <span className="tu-landing-highlight-label">To get started</span>
                    </div>
                  </div>

                  {/* Bottom CTA */}
                  <div className="tu-landing-bottom-cta">
                    <h2 className="tu-landing-section-title">Ready to fix your text?</h2>
                    <p className="tu-landing-subtitle">
                      Create a free account to sync your progress, earn XP, and unlock achievements.
                    </p>
                    <div className="tu-landing-hero-actions">
                      <button className="tu-landing-cta" onClick={() => navigate('/login')}>
                        Sign Up Free
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="5" y1="12" x2="19" y2="12" />
                          <polyline points="12 5 19 12 12 19" />
                        </svg>
                      </button>
                      <button className="tu-landing-cta-secondary" onClick={() => search.open()}>
                        Or just start using tools
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeWorkspaceId && (
            <>
              <div
                ref={splitRef}
                className="tu-editor-split"
                style={{
                  gridTemplateColumns: `${splitResize.size}fr 4px ${100 - splitResize.size}fr`,
                }}
              >
                {/* ─── Left: Input (or generator panel for no-input tools) ─── */}
                <div
                  className={`tu-editor-input${
                    workspaceTabs.find((t) => t.id === activeWorkspaceId)?.panelId === 'compare'
                      ? ' tu-editor-input--split'
                      : ''
                  }`}
                >
                  {['password', 'randtext', 'fakedata', 'loremipsum', 'samplejson'].includes(
                    workspaceTabs.find((t) => t.id === activeWorkspaceId)?.panelId
                  ) ? (
                    <div className="tu-gen-fullpage">
                      {workspaceTabs.find((t) => t.id === activeWorkspaceId)?.panelId ===
                      'password' ? (
                        <PasswordDrawer
                          {...generators}
                          showAlert={showAlert}
                          onResult={(pwd) => {
                            aiResultSourceRef.current = 'password';
                            ai.setAiResult({ label: 'Password', result: pwd });
                            setPreviewMode('result');
                          }}
                        />
                      ) : workspaceTabs.find((t) => t.id === activeWorkspaceId)?.panelId ===
                        'fakedata' ? (
                        <FakeDataDrawer
                          activeTool={workspaceTabs.find((t) => t.id === activeWorkspaceId)?.tool}
                          onResult={(label, result) => {
                            ai.setAiResult({ label, result });
                            setPreviewMode('result');
                          }}
                          showAlert={showAlert}
                        />
                      ) : workspaceTabs.find((t) => t.id === activeWorkspaceId)?.panelId ===
                        'loremipsum' ? (
                        <LoremIpsumDrawer
                          onResult={(label, result) => {
                            ai.setAiResult({ label, result });
                            setPreviewMode('result');
                          }}
                          showAlert={showAlert}
                        />
                      ) : workspaceTabs.find((t) => t.id === activeWorkspaceId)?.panelId ===
                        'samplejson' ? (
                        <SampleJsonDrawer
                          onResult={(label, result) => {
                            ai.setAiResult({ label, result });
                            setPreviewMode('result');
                          }}
                          showAlert={showAlert}
                        />
                      ) : (
                        <RandomTextDrawer
                          {...generators}
                          onResult={(txt) => {
                            aiResultSourceRef.current = 'randtext';
                            ai.setAiResult({ label: 'Random Text', result: txt });
                            setPreviewMode('result');
                          }}
                        />
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="tu-editor-topbar">
                        <span className="tu-editor-label" title="~/FixMyText/workspace/input.txt">
                          INPUT
                        </span>
                        <div className="tu-topbar-stats">
                          <span className="tu-topbar-stat">
                            <b>{words}</b> words
                          </span>
                          <span className="tu-topbar-stat">
                            <b>{chars}</b> chars
                          </span>
                          <span className="tu-topbar-stat">
                            <b>{sentences}</b> sentences
                          </span>
                        </div>
                      </div>
                      <div className="tu-input-toolbar">
                        <button
                          className="tu-input-toolbar-btn"
                          onClick={handleCopy}
                          title="Copy"
                          disabled={!text}
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <rect x="9" y="9" width="13" height="13" rx="2" />
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                          </svg>
                          <span>Copy</span>
                        </button>
                        <button
                          className="tu-input-toolbar-btn"
                          onClick={handlePaste}
                          title="Paste"
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                            <rect x="8" y="2" width="8" height="4" rx="1" />
                          </svg>
                          <span>Paste</span>
                        </button>
                        <button
                          className="tu-input-toolbar-btn"
                          onClick={handleClearPaste}
                          title="Clear + Paste"
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                            <rect x="8" y="2" width="8" height="4" rx="1" />
                            <line x1="9" y1="13" x2="15" y2="13" />
                          </svg>
                          <span>Clear+Paste</span>
                        </button>
                        <div className="tu-input-toolbar-sep" />
                        <button
                          className="tu-input-toolbar-btn tu-input-toolbar-btn--danger"
                          onClick={handleClear}
                          title="Clear"
                          disabled={!text}
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                            <path d="M10 11v6" />
                            <path d="M14 11v6" />
                            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                          </svg>
                          <span>Clear</span>
                        </button>
                        <div className="tu-input-toolbar-sep" />
                        <button
                          className={`tu-input-toolbar-btn${
                            speech.listening ? ' tu-input-toolbar-btn--active' : ''
                          }`}
                          onClick={speech.handleTts}
                          title="Read Aloud"
                          disabled={!text}
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                          </svg>
                          <span>Read Aloud</span>
                        </button>
                        <button
                          className={`tu-input-toolbar-btn${
                            speech.listening ? ' tu-input-toolbar-btn--active' : ''
                          }`}
                          onClick={speech.handleSpeechToText}
                          title="Speech to Text"
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                            <line x1="12" y1="19" x2="12" y2="23" />
                            <line x1="8" y1="23" x2="16" y2="23" />
                          </svg>
                          <span>Speech</span>
                        </button>
                        <div className="tu-input-toolbar-sep" />
                        <button
                          className={`tu-input-toolbar-btn${
                            dyslexiaMode ? ' tu-input-toolbar-btn--active' : ''
                          }`}
                          onClick={handleDyslexiaMode}
                          title="Dyslexia-friendly font"
                        >
                          <span className="tu-input-toolbar-icon-text">Aa</span>
                          <span>Dyslexia</span>
                        </button>
                      </div>
                      {/* Find & Replace bar — shown inline below toolbar */}
                      {workspaceTabs.find((t) => t.id === activeWorkspaceId)?.panelId ===
                        'find' && (
                        <FindReplaceDrawer {...findReplace} disabled={disabled} text={text} />
                      )}
                      {(() => {
                        const panelId = workspaceTabs.find(
                          (t) => t.id === activeWorkspaceId
                        )?.panelId;
                        const onPreview = (result) => {
                          if (result) {
                            ai.setAiResult(result);
                            setPreviewMode('result');
                          } else {
                            ai.setAiResult(null);
                            setPreviewMode(null);
                          }
                        };
                        switch (panelId) {
                          case 'wraplines':
                            return (
                              <WrapLinesDrawer
                                disabled={disabled}
                                text={text}
                                onPreview={onPreview}
                                onApply={({ prefix, suffix }) =>
                                  callApiWithParams(
                                    ENDPOINTS.WRAP_LINES,
                                    'Lines wrapped',
                                    { prefix, suffix },
                                    { toolId: 'wrap_lines', toolType: 'drawer' }
                                  )
                                }
                              />
                            );
                          case 'filterlines':
                            return (
                              <FilterLinesDrawer
                                disabled={disabled}
                                mode="keep"
                                text={text}
                                onPreview={onPreview}
                                onApply={({ pattern, case_sensitive, use_regex }) =>
                                  callApiWithParams(
                                    ENDPOINTS.FILTER_LINES,
                                    'Lines filtered (keep)',
                                    { pattern, case_sensitive, use_regex },
                                    { toolId: 'filter_lines_contain', toolType: 'drawer' }
                                  )
                                }
                              />
                            );
                          case 'droplines':
                            return (
                              <FilterLinesDrawer
                                disabled={disabled}
                                mode="drop"
                                text={text}
                                onPreview={onPreview}
                                onApply={({ pattern, case_sensitive, use_regex }) =>
                                  callApiWithParams(
                                    ENDPOINTS.REMOVE_LINES,
                                    'Lines filtered (drop)',
                                    { pattern, case_sensitive, use_regex },
                                    { toolId: 'remove_lines_contain', toolType: 'drawer' }
                                  )
                                }
                              />
                            );
                          case 'truncatelines':
                            return (
                              <TruncateLinesDrawer
                                disabled={disabled}
                                text={text}
                                onPreview={onPreview}
                                onApply={({ max_length }) =>
                                  callApiWithParams(
                                    ENDPOINTS.TRUNCATE_LINES,
                                    'Lines truncated',
                                    { max_length },
                                    { toolId: 'truncate_lines', toolType: 'drawer' }
                                  )
                                }
                              />
                            );
                          case 'nthlines':
                            return (
                              <NthLineDrawer
                                disabled={disabled}
                                text={text}
                                onPreview={onPreview}
                                onApply={({ n, offset }) =>
                                  callApiWithParams(
                                    ENDPOINTS.EXTRACT_NTH_LINES,
                                    `Every ${n} lines extracted`,
                                    { n, offset },
                                    { toolId: 'extract_nth_lines', toolType: 'drawer' }
                                  )
                                }
                              />
                            );
                          case 'cipherdrawer':
                            return (
                              <CipherDrawer
                                activeTool={
                                  workspaceTabs.find((t) => t.id === activeWorkspaceId)?.tool
                                }
                                text={text}
                                onResult={(label, result) => {
                                  ai.setAiResult({ label, result });
                                  setPreviewMode('result');
                                }}
                                showAlert={showAlert}
                                transformText={transformText}
                              />
                            );
                          case 'diffdrawer':
                            return (
                              <DiffDrawer
                                activeTool={
                                  workspaceTabs.find((t) => t.id === activeWorkspaceId)?.tool
                                }
                                text={text}
                                onResult={(label, result) => {
                                  ai.setAiResult({ label, result });
                                  setPreviewMode('result');
                                }}
                                showAlert={showAlert}
                              />
                            );
                          case 'jsonpath':
                            return (
                              <JsonPathDrawer
                                text={text}
                                onResult={(label, result) => {
                                  ai.setAiResult({ label, result });
                                  setPreviewMode('result');
                                }}
                                showAlert={showAlert}
                              />
                            );
                          case 'mdpreview':
                            return <MarkdownPreviewDrawer text={text} />;
                          default:
                            return null;
                        }
                      })()}
                      {/* Formatter config bar — shown inline for formatter tools */}
                      {(() => {
                        const ws = workspaceTabs.find((t) => t.id === activeWorkspaceId);
                        const fmtToolId =
                          ws?.type === 'tool' &&
                          ['js_fmt', 'ts_fmt', 'css_fmt', 'html_fmt'].includes(ws.tool.id)
                            ? ws.tool.id
                            : null;
                        return fmtToolId ? (
                          <FmtConfigBar
                            toolId={fmtToolId}
                            fmtCfg={formatter.fmtCfg}
                            setFmtCfg={formatter.setFmtCfg}
                          />
                        ) : null;
                      })()}
                      {/* Select tool options bar (Format, Tone, Translate, Translit) */}
                      {(() => {
                        const ws = workspaceTabs.find((t) => t.id === activeWorkspaceId);
                        if (ws?.type !== 'tool' || ws.tool.type !== 'select') return null;
                        const tool = ws.tool;
                        const currentVal = ai[tool.selectKey] || tool.options?.[0]?.[0];
                        return (
                          <div className="tu-fmtbar">
                            <span className="tu-fmtbar-lang">{tool.label}</span>
                            {tool.id === 'translate' && (
                              <>
                                <button
                                  className={`tu-fmtbar-detect${
                                    ai.autoDetectLang ? ' tu-fmtbar-detect--on' : ''
                                  }`}
                                  onClick={() => {
                                    const next = !ai.autoDetectLang;
                                    ai.setAutoDetectLang(next);
                                    if (next && text) ai.handleDetectLanguage();
                                    else ai.setDetectedLang(null);
                                  }}
                                  title="Auto-detect input language"
                                >
                                  <svg
                                    width="12"
                                    height="12"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <circle cx="11" cy="11" r="8" />
                                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                  </svg>
                                  Auto-detect
                                </button>
                                {ai.autoDetectLang && ai.detectedLang && (
                                  <span className="tu-fmtbar-detected">{ai.detectedLang}</span>
                                )}
                              </>
                            )}
                            <span className="tu-fmtbar-sep" />
                            {tool.options.map(([val, label]) => (
                              <button
                                key={val}
                                className={`tu-fmtbar-opt${
                                  currentVal === val ? ' tu-fmtbar-opt--on' : ''
                                }`}
                                onClick={() => {
                                  if (ai[tool.setterKey]) ai[tool.setterKey](val);
                                  selectValueRef.current = val;
                                  executeToolAction(tool);
                                }}
                              >
                                {label}
                              </button>
                            ))}
                          </div>
                        );
                      })()}
                      <div className="tu-editor-body">
                        <div className="tu-line-numbers" ref={gutterRef}>
                          {(text || '\n').split('\n').map((_, i) => (
                            <span key={i}>{i + 1}</span>
                          ))}
                        </div>
                        <textarea
                          ref={textareaRef}
                          className="tu-textarea"
                          id="text"
                          value={text}
                          onChange={(e) => {
                            setText(e.target.value);
                            if (previewMode === 'result') {
                              ai.handleAiDismiss();
                              setPreviewMode(null);
                            }
                          }}
                          onPaste={() => {
                            // After paste, auto-run the active tool with minimal delay
                            const ws = workspaceTabs.find((t) => t.id === activeWorkspaceId);
                            if (ws?.type === 'tool') {
                              setTimeout(() => executeToolAction(ws.tool), 150);
                            }
                          }}
                          onScroll={(e) => {
                            if (gutterRef.current) gutterRef.current.scrollTop = e.target.scrollTop;
                          }}
                          placeholder="// Start typing or paste your text here..."
                          style={{
                            tabSize: formatter.fmtCfg.tabWidth,
                            MozTabSize: formatter.fmtCfg.tabWidth,
                          }}
                        />
                      </div>
                      {loading && (
                        <div className="tu-loading">
                          <div className="tu-spinner" />
                          <span>Processing...</span>
                        </div>
                      )}
                      {/* Compare With input (shown below main input when compare tool is active) */}
                      {workspaceTabs.find((t) => t.id === activeWorkspaceId)?.panelId ===
                        'compare' && (
                        <CompareInput
                          compareText={compare.compareText}
                          setCompareText={compare.setCompareText}
                          setDiffResult={compare.setDiffResult}
                        />
                      )}
                    </>
                  )}
                </div>

                {/* Split resize handle */}
                <div
                  className="tu-resize-handle tu-resize-handle--split"
                  onMouseDown={splitResize.onMouseDown}
                />

                {/* ─── Right: Output (per-tool or default) ─── */}
                <div className="tu-editor-output">
                  {(() => {
                    const ws = workspaceTabs.find((t) => t.id === activeWorkspaceId);
                    if (ws?.type === 'drawer') {
                      // Compare renders diff output directly
                      if (ws.panelId === 'compare') {
                        return (
                          <CompareOutput
                            diffResult={compare.diffResult}
                            compareText={compare.compareText}
                          />
                        );
                      }
                      // These render inline in input area — fall through to OutputPanel
                      if (
                        [
                          'find',
                          'password',
                          'randtext',
                          'wraplines',
                          'filterlines',
                          'droplines',
                          'truncatelines',
                          'nthlines',
                          'cipherdrawer',
                          'diffdrawer',
                          'jsonpath',
                          'mdpreview',
                          'fakedata',
                          'loremipsum',
                          'samplejson',
                        ].includes(ws.panelId)
                      ) {
                        // fall through to OutputPanel below
                      } else {
                        return DRAWERS[ws.panelId] ? (
                          <DrawerPanel
                            title={DRAWERS[ws.panelId].title}
                            color={DRAWERS[ws.panelId].color}
                            onClose={() => closeWorkspaceTab(activeWorkspaceId)}
                          >
                            {renderDrawerContent()}
                          </DrawerPanel>
                        ) : null;
                      }
                    }
                    const isNoInputDrawer = [
                      'password',
                      'randtext',
                      'fakedata',
                      'loremipsum',
                      'samplejson',
                    ].includes(ws?.panelId);
                    // Each tab's result is stored independently by tab ID
                    const tabResult = toolResults[activeWorkspaceId] || null;
                    const displayResult =
                      tabResult || (isNoInputDrawer ? ai.aiResult : text ? ai.aiResult : null);
                    return (
                      <OutputPanel
                        aiResult={displayResult || null}
                        hasMarkdown={ai.hasMarkdown}
                        onAiAccept={() => {
                          const r = displayResult;
                          if (r) {
                            if (isNoInputDrawer) {
                              navigator.clipboard.writeText(r.result);
                              showAlert('Copied to clipboard!', 'success');
                            } else {
                              setText(r.result);
                              if (ai.hasMarkdown(r.result)) setMarkdownMode(true);
                            }
                          }
                          setToolResults((prev) => {
                            const next = { ...prev };
                            delete next[activeWorkspaceId];
                            return next;
                          });
                          if (!isNoInputDrawer) {
                            ai.setAiResult(null);
                            setPreviewMode(null);
                          }
                        }}
                        onAiDismiss={() => {
                          setToolResults((prev) => {
                            const next = { ...prev };
                            delete next[activeWorkspaceId];
                            return next;
                          });
                          ai.setAiResult(null);
                          setPreviewMode(null);
                        }}
                        previewMode={displayResult ? 'result' : previewMode}
                        setPreviewMode={setPreviewMode}
                        showAlert={showAlert}
                        text={text}
                        dyslexiaMode={dyslexiaMode}
                        markdownMode={markdownMode}
                        speech={speech}
                        onDyslexiaToggle={handleDyslexiaMode}
                        activeTool={
                          ws?.type === 'tool'
                            ? ws.tool
                            : ws?.type === 'drawer'
                            ? TOOLS.find((t) => t.panelId === ws.panelId) || null
                            : null
                        }
                        loading={loading}
                        exportTools={exportTools}
                        onOutputEdit={(newText) => {
                          const updated = { ...displayResult, result: newText };
                          setToolResults((prev) => ({ ...prev, [activeWorkspaceId]: updated }));
                          ai.setAiResult(updated);
                        }}
                      />
                    );
                  })()}
                </div>
              </div>

              {/* Bottom panel resize handle */}
              <div
                className="tu-resize-handle tu-resize-handle--bottom"
                onMouseDown={bottomResize.onMouseDown}
              />

              {/* Bottom panel: tabbed */}
              <BottomPanel
                pipeline={pipeline}
                history={history}
                text={text}
                gamification={gamification}
                style={{ height: bottomResize.size }}
              />

              {/* Smart Suggestions — below bottom panel */}
              {suggestions.suggestions.length > 0 && (
                <SmartSuggestions
                  suggestions={suggestions.suggestions}
                  onToolClick={handleToolClick}
                  onDismiss={suggestions.dismiss}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Settings menu (rendered outside .tu-forge to escape overflow:hidden) */}
      {settingsOpen && (
        <>
          <div className="tu-settings-backdrop" onClick={() => setSettingsOpen(false)} />
          <div className="tu-settings-menu">
            {/* User info */}
            <div className="tu-settings-user">
              <div className="tu-settings-user-avatar">
                {props.user?.display_name?.charAt(0)?.toUpperCase() || 'G'}
              </div>
              <div className="tu-settings-user-info">
                <span className="tu-settings-user-name">{props.user?.display_name || 'Guest'}</span>
                <span className="tu-settings-user-email">
                  {props.user?.email || 'Not signed in'}
                </span>
              </div>
            </div>
            <div className="tu-settings-divider" />

            {/* Theme toggle */}
            <button
              className="tu-settings-item"
              onClick={() => {
                props.setMode?.(props.mode === 'dark' ? 'light' : 'dark');
                setSettingsOpen(false);
              }}
            >
              <span className="tu-settings-item-icon">{props.mode === 'dark' ? '☀️' : '🌙'}</span>
              <span className="tu-settings-item-label">
                {props.mode === 'dark' ? 'Light Theme' : 'Dark Theme'}
              </span>
              <span className="tu-settings-item-hint">
                {props.mode === 'dark' ? 'Switch to light' : 'Switch to dark'}
              </span>
            </button>

            {/* Command palette */}
            <button
              className="tu-settings-item"
              onClick={() => {
                search.open();
                setSettingsOpen(false);
              }}
            >
              <span className="tu-settings-item-icon">⌨</span>
              <span className="tu-settings-item-label">Command Palette</span>
              <kbd className="tu-settings-item-kbd">Ctrl+K</kbd>
            </button>

            {/* Dashboard */}
            <button
              className="tu-settings-item"
              onClick={() => {
                setSettingsOpen(false);
                navigate('/dashboard');
              }}
            >
              <span className="tu-settings-item-icon">📊</span>
              <span className="tu-settings-item-label">Dashboard</span>
              <span className="tu-settings-item-hint">Stats & settings</span>
            </button>

            {/* Upgrade to Pro — shown for authenticated free-tier users */}
            {props.isAuthenticated && subscription && !subscription.isPro && (
              <button
                className="tu-settings-item tu-settings-item--accent"
                onClick={() => {
                  setSettingsOpen(false);
                  navigate('/pricing');
                }}
              >
                <span className="tu-settings-item-icon">⚡</span>
                <span className="tu-settings-item-label">Upgrade to Pro</span>
                <span className="tu-settings-item-hint">View plans & pricing</span>
              </button>
            )}

            {/* Keyboard shortcuts info */}
            <button
              className="tu-settings-item"
              onClick={() => {
                setShortcutsOpen(true);
                setSettingsOpen(false);
              }}
            >
              <span className="tu-settings-item-icon">⌘</span>
              <span className="tu-settings-item-label">Keyboard Shortcuts</span>
              <kbd className="tu-settings-item-kbd">Ctrl+/</kbd>
            </button>

            {/* Auth */}
            <div className="tu-settings-divider" />
            {props.isAuthenticated ? (
              <button
                className="tu-settings-item tu-settings-item--danger"
                onClick={() => {
                  setSettingsOpen(false);
                  handleLogout();
                }}
              >
                <span className="tu-settings-item-icon">⏻</span>
                <span className="tu-settings-item-label">Sign Out</span>
              </button>
            ) : (
              <button
                className="tu-settings-item"
                onClick={() => {
                  setSettingsOpen(false);
                  navigate(ROUTES.LOGIN);
                }}
              >
                <span className="tu-settings-item-icon">→</span>
                <span className="tu-settings-item-label">Sign In</span>
                <span className="tu-settings-item-hint">Unlock AI tools</span>
              </button>
            )}

            {/* About */}
            <div className="tu-settings-footer">FixMyText v1.0 — {TOOLS.length} tools</div>
          </div>
        </>
      )}

      {/* Floating overlays */}
      <AnimatePresence>
        {gamification.xpGain && (
          <motion.div
            className="tu-xp-float"
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -40 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          >
            +{gamification.xpGain} XP
          </motion.div>
        )}
      </AnimatePresence>
      {/* Save to Template modal */}
      {saveModal &&
        (() => {
          const SaveModal = () => {
            const [name, setName] = useState(saveModal.defaultName);
            const inputRef = useRef(null);
            useEffect(() => {
              inputRef.current?.focus();
              inputRef.current?.select();
            }, []);
            const handleSave = () => {
              if (!name.trim()) return;
              const ws = workspaceTabs.find((t) => t.id === saveModal.tabId);
              const toolId = ws?.type === 'tool' ? ws.tool.id : null;
              templates.saveDirectly(name.trim(), toolTexts[saveModal.tabId] || '', toolId);
              setSavedTabs((prev) => ({ ...prev, [saveModal.tabId]: true }));
              // Rename the tab to the template name
              setWorkspaceTabs((tabs) =>
                tabs.map((t) => (t.id === saveModal.tabId ? { ...t, label: name.trim() } : t))
              );
              setActiveTab('_templates');
              setSidebarOpen(true);
              setSaveModal(null);
            };
            return (
              <>
                <div className="tu-modal-backdrop" onClick={() => setSaveModal(null)} />
                <div className="tu-modal">
                  <div className="tu-modal-header">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                      <polyline points="17 21 17 13 7 13 7 21" />
                      <polyline points="7 3 7 8 15 8" />
                    </svg>
                    <span>Save to Templates</span>
                  </div>
                  <div className="tu-modal-body">
                    <label className="tu-modal-label">Template name</label>
                    <input
                      ref={inputRef}
                      className="tu-modal-input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSave();
                        if (e.key === 'Escape') setSaveModal(null);
                      }}
                      placeholder="Enter a name..."
                    />
                  </div>
                  <div className="tu-modal-footer">
                    <button
                      className="tu-modal-btn tu-modal-btn--secondary"
                      onClick={() => setSaveModal(null)}
                    >
                      Cancel
                    </button>
                    <button
                      className="tu-modal-btn tu-modal-btn--primary"
                      onClick={handleSave}
                      disabled={!name.trim()}
                    >
                      Save
                    </button>
                  </div>
                </div>
              </>
            );
          };
          return <SaveModal />;
        })()}

      <AchievementToast
        achievement={gamification.newAchievement}
        onDismiss={gamification.dismissAchievement}
      />
      <CommandPalette search={search} onToolClick={handleToolClick} />
      <KeyboardShortcuts
        isOpen={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
        groups={shortcutGroups}
        overrides={shortcutOverrides}
        updateBinding={updateBinding}
        resetAll={resetAllBindings}
        resetOne={resetOneBinding}
        isCustomized={isBindingCustomized}
      />

      {/* Sign-in gate modal */}
      {trial.showSignInGate && (
        <>
          <div className="tu-modal-backdrop" onClick={trial.dismissGate} />
          <div className="tu-modal">
            <div className="tu-modal-header">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>Free trial ended</span>
            </div>
            <div className="tu-modal-body">
              <p style={{ margin: '0 0 8px', fontSize: '0.85rem', color: 'var(--text-2)' }}>
                You&apos;ve used your <b>3 free tool runs</b>. Sign in to unlock unlimited access to
                all {TOOLS.length}+ tools.
              </p>
            </div>
            <div className="tu-modal-footer">
              <button className="tu-modal-btn tu-modal-btn--secondary" onClick={trial.dismissGate}>
                Maybe later
              </button>
              <button
                className="tu-modal-btn tu-modal-btn--primary"
                onClick={() => {
                  trial.dismissGate();
                  navigate(ROUTES.LOGIN);
                }}
              >
                Sign In
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
