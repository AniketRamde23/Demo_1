import React, { useEffect, useMemo, useState } from 'https://esm.sh/react@18.3.1';

const e = React.createElement;

const STATUS_SEARCHING = '🔍 Searching global opportunities';
const STATUS_MATCHING = '🧠 AI matching opportunities';
const STATUS_READY = '✅ Opportunities ready';

const APP_TITLE = 'OpportunityBridge AI';

const defaultCategories = [
  {
    icon: '🎓',
    title: 'Scholarships',
    description: 'Funding opportunities for undergraduate, graduate, and specialized programs worldwide.'
  },
  {
    icon: '💻',
    title: 'Remote Jobs',
    description: 'Global remote roles that value skills and impact over physical location.'
  },
  {
    icon: '🚀',
    title: 'Internships',
    description: 'Career-launching internships from mission-driven organizations and top employers.'
  },
  {
    icon: '📚',
    title: 'Learning Programs',
    description: 'Curated bootcamps, certifications, and upskilling tracks for in-demand fields.'
  }
];

const defaultOpportunities = [
  {
    title: 'Frontend Developer Fellowship',
    organization: 'Global Tech Academy',
    type: 'Internship',
    location: 'Remote',
    matchScore: 88,
    description: 'A 6-month paid fellowship focused on React and product engineering with mentorship.',
    applyLink: 'https://example.org/fellowship'
  },
  {
    title: 'Climate Data Internship',
    organization: 'Green Future Labs',
    type: 'Internship',
    location: 'Kenya',
    matchScore: 74,
    description: 'Hands-on internship using data tools to support sustainability and adaptation projects.',
    applyLink: 'https://example.org/internship'
  },
  {
    title: 'Women in AI Scholarship',
    organization: 'Open Learning Network',
    type: 'Scholarship',
    location: 'Remote',
    matchScore: 59,
    description: 'Scholarship covering AI coursework, labs, and portfolio coaching for emerging talent.',
    applyLink: 'https://example.org/scholarship'
  },
  {
    title: 'Junior Product Analyst Role',
    organization: 'BridgeWorks International',
    type: 'Remote Job',
    location: 'Nigeria',
    matchScore: 36,
    description: 'Entry-level analyst role supporting product growth, reporting, and user research.',
    applyLink: 'https://example.org/job'
  }
];

const defaultInsights = [
  {
    icon: '🧠',
    title: 'Prioritize Portfolio Signals',
    description: 'Show practical work with measurable outcomes to increase shortlist rates in global applications.',
    sdg: 'SDG 10'
  },
  {
    icon: '🌐',
    title: 'Optimize for Remote Readiness',
    description: 'Highlight communication, asynchronous collaboration, and timezone flexibility in your profile.',
    sdg: 'SDG 10'
  },
  {
    icon: '📈',
    title: 'Stack Adjacent Skills',
    description: 'Combine core skills with emerging tools like AI workflows to boost opportunity-fit scores.',
    sdg: 'SDG 10'
  }
];

function scoreMeta(score) {
  if (score <= 40) return { tone: 'red', ring: '#dc2626', glow: 'rgba(220,38,38,0.35)', bar: 'fill-red-500' };
  if (score <= 60) return { tone: 'yellow', ring: '#ca8a04', glow: 'rgba(202,138,4,0.35)', bar: 'fill-yellow-500' };
  if (score <= 80) return { tone: 'green', ring: '#65a30d', glow: 'rgba(101,163,13,0.35)', bar: 'fill-lime-500' };
  return { tone: 'bright-green', ring: '#16a34a', glow: 'rgba(22,163,74,0.35)', bar: 'fill-green-500' };
}

function scoreStyle(score) {
  if (score <= 40) return 'text-red-600 bg-red-100 border-red-200';
  if (score <= 60) return 'text-yellow-700 bg-yellow-100 border-yellow-200';
  if (score <= 80) return 'text-lime-700 bg-lime-100 border-lime-200';
  return 'text-green-700 bg-green-100 border-green-200';
}

function floatingParticle(key, cls, style) {
  return e('div', {
    key,
    style,
    className: `absolute rounded-full bg-white/40 ${cls}`
  });
}

function sanitizeJSONString(raw) {
  return raw.replace(/```json/gi, '').replace(/```/g, '').trim();
}

function extractTextBlocks(responseData) {
  if (!responseData || typeof responseData !== 'object') return '';

  if (typeof responseData.output_text === 'string' && responseData.output_text.trim()) {
    return responseData.output_text.trim();
  }

  const blocks = [];
  const contentBlocks = [];

  if (Array.isArray(responseData.content)) contentBlocks.push(...responseData.content);
  if (Array.isArray(responseData.output)) contentBlocks.push(...responseData.output);

  for (const block of contentBlocks) {
    if (!block || typeof block !== 'object') continue;

    if (block.type === 'text' && typeof block.text === 'string') {
      blocks.push(block.text);
      continue;
    }

    if (Array.isArray(block.content)) {
      for (const child of block.content) {
        if (child?.type === 'text' && typeof child.text === 'string') blocks.push(child.text);
      }
    }
  }

  if (!blocks.length && typeof responseData.message?.content === 'string') {
    blocks.push(responseData.message.content);
  }

  return blocks.join('\n').trim();
}

function safeParseOpportunityJSON(apiData) {
  const textContent = extractTextBlocks(apiData);
  const cleaned = sanitizeJSONString(textContent);
  return JSON.parse(cleaned);
}

function MatchGauge({ score }) {
  const safeScore = Math.max(0, Math.min(100, Number(score) || 0));
  const [displayScore, setDisplayScore] = useState(0);
  const size = 66;
  const stroke = 7;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayScore / 100) * circumference;
  const meta = scoreMeta(safeScore);

  useEffect(() => {
    let raf = 0;
    const duration = 900;
    const startAt = performance.now();

    function tick(now) {
      const progress = Math.min(1, (now - startAt) / duration);
      setDisplayScore(Math.round(safeScore * progress));
      if (progress < 1) raf = requestAnimationFrame(tick);
    }

    setDisplayScore(0);
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [safeScore]);

  return e(
    'div',
    {
      className: 'relative grid place-items-center rounded-full shrink-0',
      style: { filter: `drop-shadow(0 0 7px ${meta.glow})` }
    },
    e(
      'svg',
      { width: size, height: size, viewBox: `0 0 ${size} ${size}` },
      e('circle', {
        cx: size / 2,
        cy: size / 2,
        r: radius,
        fill: 'none',
        stroke: '#dbe7f2',
        strokeWidth: stroke
      }),
      e('circle', {
        cx: size / 2,
        cy: size / 2,
        r: radius,
        fill: 'none',
        stroke: meta.ring,
        strokeWidth: stroke,
        strokeLinecap: 'round',
        strokeDasharray: circumference,
        strokeDashoffset: offset,
        transform: `rotate(-90 ${size / 2} ${size / 2})`,
        style: { transition: 'stroke-dashoffset 120ms linear' }
      })
    ),
    e('span', { className: 'absolute text-xs font-extrabold text-slate-800' }, displayScore)
  );
}

function OpportunityComparisonChart({ opportunities, loading }) {
  const [animatedScores, setAnimatedScores] = useState([]);

  useEffect(() => {
    if (loading) {
      setAnimatedScores([]);
      return;
    }

    const targets = opportunities.map((item) => Math.max(0, Math.min(100, Number(item.matchScore) || 0)));
    let raf = 0;
    const duration = 900;
    const startAt = performance.now();

    function tick(now) {
      const progress = Math.min(1, (now - startAt) / duration);
      setAnimatedScores(targets.map((score) => Math.round(score * progress)));
      if (progress < 1) raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [loading, opportunities]);

  if (loading) {
    return e(
      'div',
      { className: 'space-y-3 mt-4' },
      [0, 1, 2, 3].map((idx) =>
        e(
          'div',
          { key: idx, className: 'animate-pulse' },
          e('div', { className: 'h-3 w-44 rounded bg-slate-200 mb-2' }),
          e('div', { className: 'h-5 rounded bg-slate-200' })
        )
      )
    );
  }

  return e(
    'svg',
    { width: '100%', height: Math.max(120, opportunities.length * 54), className: 'mt-3' },
    opportunities.map((item, idx) => {
      const score = animatedScores[idx] || 0;
      const y = idx * 52 + 8;
      const meta = scoreMeta(score);

      return e(
        'g',
        { key: `${item.title}-${idx}` },
        e('text', { x: 2, y: y + 13, className: 'fill-slate-700 text-[11px] font-semibold' }, item.title.slice(0, 36)),
        e('rect', {
          x: 0,
          y: y + 20,
          width: '100%',
          height: 18,
          rx: 9,
          className: 'fill-slate-200/80'
        }),
        e('rect', {
          x: 0,
          y: y + 20,
          width: `${score}%`,
          height: 18,
          rx: 9,
          className: meta.bar,
          style: { transition: 'width 150ms linear' }
        }),
        e('text', { x: '96%', y: y + 34, textAnchor: 'end', className: 'fill-slate-800 text-[11px] font-bold' }, `${score}`)
      );
    })
  );
}

function categoryCard(item) {
  return e(
    'article',
    {
      key: item.title,
      className:
        'group relative rounded-2xl p-[1px] bg-gradient-to-br from-sky-300/60 via-emerald-300/30 to-cyan-200/60 hover:from-sky-400 hover:to-emerald-400 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-cyan-200/60'
    },
    e(
      'div',
      {
        className: 'h-full rounded-2xl bg-white/70 backdrop-blur-xl border border-white/70 p-5'
      },
      e('div', { className: 'text-2xl mb-2' }, item.icon),
      e('h3', { className: 'text-lg font-bold text-slate-800 mb-2' }, item.title),
      e('p', { className: 'text-sm text-slate-600 leading-relaxed' }, item.description)
    )
  );
}

function opportunityCard(item) {
  const score = Math.max(0, Math.min(100, Number(item.matchScore) || 0));

  return e(
    'article',
    {
      key: `${item.title}-${item.organization}`,
      className:
        'group relative rounded-2xl p-[1px] bg-gradient-to-br from-sky-300/50 via-teal-200/40 to-emerald-300/50 hover:from-cyan-400 hover:to-emerald-400 transition-all duration-300 hover:scale-[1.02]'
    },
    e('div', {
      className:
        'pointer-events-none absolute inset-0 rounded-2xl opacity-0 blur-md bg-gradient-to-r from-cyan-300/40 to-emerald-300/40 group-hover:opacity-100 transition-opacity duration-300'
    }),
    e(
      'div',
      {
        className:
          'relative h-full rounded-2xl bg-white/75 backdrop-blur-xl border border-white/80 p-5 shadow-lg shadow-slate-200/60'
      },
      e(
        'div',
        { className: 'flex items-start justify-between gap-3' },
        e(
          'div',
          null,
          e('h3', { className: 'text-lg font-bold text-slate-900' }, item.title),
          e('p', { className: 'text-sm text-slate-600 mt-1' }, item.organization),
          e('p', { className: 'text-xs mt-2 text-slate-500 font-medium' }, item.type || 'Opportunity')
        ),
        e(MatchGauge, { score })
      ),
      e('p', { className: 'text-sm text-slate-500 mt-2' }, `Location: ${item.location}`),
      e(
        'span',
        {
          className: `inline-block mt-3 text-xs font-semibold px-3 py-1 rounded-full border ${scoreStyle(score)}`
        },
        `Match Score: ${score}`
      ),
      e('p', { className: 'text-sm text-slate-600 mt-3 leading-relaxed' }, item.description),
      e(
        'a',
        {
          href: item.applyLink || '#',
          target: '_blank',
          rel: 'noreferrer',
          className:
            'mt-4 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 text-white py-2.5 font-semibold hover:bg-slate-800 transition-colors duration-200'
        },
        'Apply'
      )
    )
  );
}

function opportunitySkeletonCard(idx) {
  return e(
    'article',
    {
      key: `skeleton-${idx}`,
      className: 'rounded-2xl border border-white/80 bg-white/75 p-5 shadow-lg shadow-slate-200/60 animate-pulse'
    },
    e('div', { className: 'h-5 w-3/5 rounded bg-slate-200 mb-2' }),
    e('div', { className: 'h-4 w-1/2 rounded bg-slate-200 mb-2' }),
    e('div', { className: 'h-3 w-1/3 rounded bg-slate-200 mb-4' }),
    e('div', { className: 'h-20 rounded-xl bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 mb-4' }),
    e('div', { className: 'h-10 rounded-xl bg-slate-200' })
  );
}

function insightCard(item, idx) {
  return e(
    'article',
    {
      key: `${item.title}-${idx}`,
      className:
        'rounded-2xl border border-white/80 bg-white/70 backdrop-blur-xl p-5 shadow-lg shadow-slate-200/60 hover:-translate-y-1 transition-transform duration-300'
    },
    e('div', { className: 'text-2xl mb-2' }, item.icon || '💡'),
    e('h3', { className: 'text-base font-bold text-slate-800' }, item.title),
    e('p', { className: 'text-sm text-slate-600 mt-2 leading-relaxed' }, item.description),
    e(
      'span',
      {
        className:
          'inline-block mt-3 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200'
      },
      item.sdg || 'SDG 10'
    )
  );
}

function normalizeResults(parsed, queryFallback) {
  const parsedOpportunities = Array.isArray(parsed.opportunities) ? parsed.opportunities : [];
  const parsedInsights = Array.isArray(parsed.insights) ? parsed.insights : [];

  return {
    opportunities: parsedOpportunities.slice(0, 4),
    insights: parsedInsights.slice(0, 3).map((item, idx) => ({
      icon: ['🧠', '🌍', '📈'][idx] || '💡',
      title: item.title,
      description: item.description,
      sdg: item.sdg || 'SDG 10'
    })),
    summary: parsed.summary || '',
    query: parsed.query || queryFallback
  };
}

function deriveSkillGap(skill, opportunities) {
  const skillLower = String(skill || '').toLowerCase();
  const catalog = {
    Scholarship: ['Academic Writing', 'English Proficiency', 'Research Methods'],
    Internship: ['Communication', 'Project Management', 'Data Analysis'],
    'Remote Job': ['Remote Collaboration', 'Time Management', 'Git/GitHub'],
    Learning: ['Learning Strategy', 'Problem Solving', 'Digital Literacy'],
    Opportunity: ['Communication', 'Digital Skills', 'Critical Thinking']
  };

  const scoreMap = new Map();
  for (const opportunity of opportunities) {
    const type = opportunity.type || 'Opportunity';
    const candidateSkills = catalog[type] || catalog.Opportunity;
    for (const s of candidateSkills) {
      if (skillLower.includes(s.toLowerCase())) continue;
      const current = scoreMap.get(s) || 25;
      scoreMap.set(s, Math.min(95, current + 15));
    }
  }

  return Array.from(scoreMap.entries())
    .slice(0, 5)
    .map(([name, pct]) => ({ name, pct }));
}

export default function App() {
  const [skill, setSkill] = useState('Web Development');
  const [educationLevel, setEducationLevel] = useState('Student');
  const [interestType, setInterestType] = useState('Scholarships');

  const [opportunities, setOpportunities] = useState(defaultOpportunities);
  const [insights, setInsights] = useState(defaultInsights);
  const [summary, setSummary] = useState('');
  const [queryLabel, setQueryLabel] = useState('');

  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const raw = localStorage.getItem('ob_recent_searches_v1');
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [copyMessage, setCopyMessage] = useState('');

  const [typedTitle, setTypedTitle] = useState('');

  const [compareSkillA, setCompareSkillA] = useState('Web Development');
  const [compareSkillB, setCompareSkillB] = useState('Data Analysis');
  const [compareOppA, setCompareOppA] = useState(0);
  const [compareOppB, setCompareOppB] = useState(1);

  const endpoint = useMemo(() => window.OPPORTUNITYBRIDGE_LLM_ENDPOINT || 'LLM endpoint', []);
  const modelName = useMemo(() => window.OPPORTUNITYBRIDGE_LLM_MODEL || 'model-name', []);

  const topScore = useMemo(() => Math.max(0, ...opportunities.map((item) => Number(item.matchScore) || 0)), [opportunities]);
  const skillGapRows = useMemo(() => deriveSkillGap(skill, opportunities), [skill, opportunities]);

  useEffect(() => {
    localStorage.setItem('ob_recent_searches_v1', JSON.stringify(recentSearches));
  }, [recentSearches]);

  useEffect(() => {
    setTypedTitle('');
    let idx = 0;
    const timer = setInterval(() => {
      idx += 1;
      setTypedTitle(APP_TITLE.slice(0, idx));
      if (idx >= APP_TITLE.length) clearInterval(timer);
    }, 80);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!loading) return undefined;

    setStatusMessage(STATUS_SEARCHING);
    let index = 0;
    const sequence = [STATUS_SEARCHING, STATUS_MATCHING];
    const timer = setInterval(() => {
      index = (index + 1) % sequence.length;
      setStatusMessage(sequence[index]);
    }, 1300);

    return () => clearInterval(timer);
  }, [loading]);

  useEffect(() => {
    if (!copyMessage) return undefined;
    const timer = setTimeout(() => setCopyMessage(''), 1800);
    return () => clearTimeout(timer);
  }, [copyMessage]);

  function applyResultSet(resultSet) {
    setOpportunities(resultSet.opportunities);
    setInsights(resultSet.insights);
    setSummary(resultSet.summary);
    setQueryLabel(resultSet.query);
  }

  function pushRecentSearch(entry) {
    setRecentSearches((prev) => [entry, ...prev].slice(0, 5));
  }

  function clearHistory() {
    setRecentSearches([]);
    localStorage.removeItem('ob_recent_searches_v1');
  }

  function reloadRecentSearch(entry) {
    setSkill(entry.skill);
    setEducationLevel(entry.educationLevel);
    setInterestType(entry.interestType);
    applyResultSet({
      opportunities: entry.opportunities,
      insights: entry.insights,
      summary: entry.summary,
      query: entry.query
    });
    setStatusMessage(STATUS_READY);
  }

  function shareResults() {
    const text = `🌍 OpportunityBridge AI found opportunities for ${skill}.\nTop match score: ${topScore}.\n#ReducedInequality #SDG10`;
    navigator.clipboard
      .writeText(text)
      .then(() => setCopyMessage('Results copied to clipboard.'))
      .catch(() => setCopyMessage('Unable to copy automatically. Please copy manually.'));
  }

  function printReport() {
    window.print();
  }

  async function findOpportunities() {
    setLoading(true);
    setErrorMessage('');

    const userQuery = `${skill} | ${educationLevel} | ${interestType}`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: modelName,
          max_tokens: 1200,
          tools: [{ type: 'web_search_20250305', name: 'web_search' }],
          system:
            'You are OpportunityBridge AI, an assistant designed to reduce global inequality by helping people discover opportunities.',
          messages: [
            {
              role: 'user',
              content:
                `skill: ${skill}\neducation level: ${educationLevel}\ninterest type: ${interestType}\n\n` +
                'Use web search to find scholarships, internships, remote jobs, global fellowships, free learning programs. Return JSON only in this format:\n' +
                '{"query":"user query","opportunities":[{"title":"opportunity title","organization":"organization name","type":"Scholarship | Internship | Remote Job | Learning","location":"country or remote","matchScore":0,"description":"1 sentence description","applyLink":"URL"}],"insights":[{"title":"career insight","description":"short explanation","sdg":"SDG 10"}],"summary":"2 sentence summary explaining why these opportunities are good matches"}'
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed (${response.status})`);
      }

      const apiData = await response.json();

      let parsed;
      try {
        parsed = safeParseOpportunityJSON(apiData);
      } catch (parseErr) {
        throw new Error(`Unable to parse AI JSON response: ${parseErr.message}`);
      }

      if (!Array.isArray(parsed.opportunities) || !Array.isArray(parsed.insights)) {
        throw new Error('AI response JSON is missing required opportunities or insights arrays.');
      }

      const normalized = normalizeResults(parsed, userQuery);
      applyResultSet(normalized);

      const topMatch = Math.max(0, ...normalized.opportunities.map((item) => Number(item.matchScore) || 0));
      pushRecentSearch({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        skill,
        educationLevel,
        interestType,
        topScore: topMatch,
        opportunities: normalized.opportunities,
        insights: normalized.insights,
        summary: normalized.summary,
        query: normalized.query
      });

      setStatusMessage(STATUS_READY);
    } catch (err) {
      setErrorMessage(err.message || 'Something went wrong while discovering opportunities.');
      setStatusMessage('');
    } finally {
      setLoading(false);
    }
  }

  return e(
    'div',
    {
      className: 'min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-emerald-50 text-slate-900 px-3 py-6 sm:px-4 md:px-8 lg:px-10'
    },
    e(
      'div',
      {
        className: 'max-w-7xl mx-auto space-y-6 md:space-y-7'
      },
      e(
        'section',
        {
          className:
            'relative overflow-hidden rounded-3xl border border-white/70 bg-white/55 backdrop-blur-xl p-5 sm:p-7 md:p-10 shadow-2xl shadow-blue-100/70'
        },
        floatingParticle('p1', 'h-2.5 w-2.5 top-8 left-8 animate-ping', { animationDuration: '3s' }),
        floatingParticle('p2', 'h-2 w-2 top-16 right-20 animate-bounce', { animationDelay: '600ms' }),
        floatingParticle('p3', 'h-3 w-3 bottom-14 left-1/3 animate-pulse', { animationDuration: '2.6s' }),
        floatingParticle('p4', 'h-2.5 w-2.5 bottom-10 right-1/4 animate-ping', { animationDelay: '300ms' }),
        floatingParticle('p5', 'h-2 w-2 top-1/2 right-12 animate-pulse', { animationDuration: '2.4s' }),
        e(
          'span',
          {
            className:
              'absolute right-3 top-3 sm:right-4 sm:top-4 md:right-6 md:top-6 text-[10px] sm:text-xs md:text-sm font-semibold px-3 py-1 rounded-full bg-slate-900 text-white shadow-lg'
          },
          '🌍 AI Opportunity Analysis'
        ),
        e(
          'div',
          { className: 'relative z-10 max-w-4xl pr-16 sm:pr-0' },
          e(
            'h1',
            { className: 'text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 min-h-[58px] sm:min-h-[72px]' },
            typedTitle,
            e('span', { className: 'inline-block w-[2px] h-9 sm:h-12 ml-1 bg-slate-700 align-middle animate-pulse' })
          ),
          e(
            'p',
            { className: 'mt-4 text-lg sm:text-xl md:text-2xl text-sky-900 font-semibold' },
            'Discover global opportunities regardless of where you live.'
          ),
          e(
            'p',
            { className: 'mt-3 sm:mt-4 text-sm sm:text-base md:text-lg text-slate-700' },
            'Connecting talent from underserved regions to global education and career opportunities.'
          )
        )
      ),
      e(
        'section',
        {
          className:
            'no-print rounded-3xl border border-white/70 bg-white/60 backdrop-blur-xl p-5 sm:p-6 md:p-8 shadow-xl shadow-cyan-100/50'
        },
        e('h2', { className: 'text-xl sm:text-2xl font-bold text-center text-slate-800 mb-5' }, 'Opportunity Search Panel'),
        e(
          'div',
          { className: 'grid gap-4 md:grid-cols-3' },
          e(
            'div',
            null,
            e('label', { className: 'block text-sm font-semibold text-slate-700 mb-1.5' }, 'Skill'),
            e('input', {
              value: skill,
              onChange: (ev) => setSkill(ev.target.value),
              className:
                'w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 outline-none focus:ring-2 focus:ring-sky-300'
            })
          ),
          e(
            'div',
            null,
            e('label', { className: 'block text-sm font-semibold text-slate-700 mb-1.5' }, 'Education level'),
            e(
              'select',
              {
                value: educationLevel,
                onChange: (ev) => setEducationLevel(ev.target.value),
                className:
                  'w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 outline-none focus:ring-2 focus:ring-sky-300'
              },
              e('option', null, 'Student'),
              e('option', null, 'Graduate'),
              e('option', null, 'Professional')
            )
          ),
          e(
            'div',
            null,
            e('label', { className: 'block text-sm font-semibold text-slate-700 mb-1.5' }, 'Interest type'),
            e(
              'select',
              {
                value: interestType,
                onChange: (ev) => setInterestType(ev.target.value),
                className:
                  'w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-300'
              },
              e('option', null, 'Scholarships'),
              e('option', null, 'Jobs'),
              e('option', null, 'Internships'),
              e('option', null, 'Learning')
            )
          )
        ),
        e(
          'div',
          { className: 'mt-5 flex flex-col sm:flex-row gap-3 justify-center' },
          e(
            'button',
            {
              onClick: findOpportunities,
              disabled: loading,
              className:
                'relative inline-flex items-center justify-center rounded-2xl px-8 py-3.5 text-base sm:text-lg font-bold text-white bg-gradient-to-r from-sky-600 to-emerald-500 shadow-xl shadow-cyan-300/40 hover:shadow-emerald-300/60 hover:scale-105 transition-all duration-300 animate-pulse disabled:opacity-70 disabled:cursor-not-allowed'
            },
            loading ? 'Searching...' : 'Find Opportunities'
          ),
          e(
            'button',
            {
              onClick: shareResults,
              className:
                'inline-flex items-center justify-center rounded-2xl px-8 py-3.5 text-base font-bold border border-slate-300 text-slate-700 bg-white/80 hover:bg-white transition-colors'
            },
            'Share Results'
          ),
          e(
            'button',
            {
              onClick: printReport,
              className:
                'inline-flex items-center justify-center rounded-2xl px-8 py-3.5 text-base font-bold border border-slate-300 text-slate-700 bg-white/80 hover:bg-white transition-colors'
            },
            'Download Opportunity Report'
          )
        ),
        copyMessage && e('p', { className: 'text-center text-sm mt-3 text-emerald-700 font-semibold' }, copyMessage),
        loading &&
          e(
            'div',
            {
              className:
                'mt-5 rounded-2xl border border-cyan-200 bg-cyan-50/80 p-4 text-center text-cyan-900 font-semibold flex items-center justify-center gap-3'
            },
            e('span', { className: 'inline-block h-5 w-5 rounded-full border-2 border-cyan-600 border-t-transparent animate-spin' }),
            '🤖 AI Agent discovering global opportunities...'
          ),
        statusMessage && e('div', { className: 'mt-3 text-center text-sm font-semibold text-slate-700' }, statusMessage),
        errorMessage &&
          e(
            'div',
            {
              className: 'mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700'
            },
            e('h3', { className: 'font-bold mb-1' }, 'Unable to load AI opportunities'),
            e('p', { className: 'text-sm' }, errorMessage)
          )
      ),
      e(
        'section',
        {
          className: 'no-print rounded-3xl border border-white/70 bg-white/60 backdrop-blur-xl p-5 sm:p-6 md:p-8 shadow-xl shadow-slate-100/70'
        },
        e(
          'div',
          { className: 'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4' },
          e('h2', { className: 'text-2xl md:text-3xl font-bold text-slate-800' }, 'Recent Searches'),
          e(
            'button',
            {
              onClick: clearHistory,
              className: 'rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors'
            },
            'Clear History'
          )
        ),
        recentSearches.length
          ? e(
              'div',
              { className: 'grid gap-3 md:grid-cols-2 lg:grid-cols-3' },
              recentSearches.map((entry) =>
                e(
                  'button',
                  {
                    key: entry.id,
                    onClick: () => reloadRecentSearch(entry),
                    className:
                      'text-left rounded-2xl border border-white bg-white/70 p-4 shadow hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200'
                  },
                  e('p', { className: 'font-bold text-slate-800' }, entry.skill),
                  e('p', { className: 'text-xs text-slate-500 mt-1' }, `${entry.educationLevel} • ${entry.interestType}`),
                  e(
                    'span',
                    {
                      className: `inline-block mt-3 text-xs font-semibold px-3 py-1 rounded-full border ${scoreStyle(entry.topScore || 0)}`
                    },
                    `Top Match: ${entry.topScore || 0}`
                  )
                )
              )
            )
          : e('p', { className: 'text-sm text-slate-600' }, 'No recent searches yet. Your last 5 AI searches will appear here.')
      ),
      e(
        'section',
        {
          className: 'no-print rounded-3xl border border-white/70 bg-white/60 backdrop-blur-xl p-5 sm:p-6 md:p-8 shadow-xl shadow-indigo-100/60'
        },
        e('h2', { className: 'text-2xl md:text-3xl font-bold text-slate-800 mb-4' }, 'Compare Mode'),
        e('p', { className: 'text-sm text-slate-600 mb-4' }, 'Compare two skills or two opportunities side by side.'),
        e(
          'div',
          { className: 'grid gap-4 lg:grid-cols-2' },
          e(
            'div',
            { className: 'rounded-2xl border border-white bg-white/75 p-4' },
            e('h3', { className: 'font-bold text-slate-800 mb-3' }, 'Skill Comparison'),
            e(
              'div',
              { className: 'grid gap-3 sm:grid-cols-2' },
              e('input', {
                value: compareSkillA,
                onChange: (ev) => setCompareSkillA(ev.target.value),
                className: 'rounded-xl border border-slate-200 px-3 py-2',
                placeholder: 'Skill A'
              }),
              e('input', {
                value: compareSkillB,
                onChange: (ev) => setCompareSkillB(ev.target.value),
                className: 'rounded-xl border border-slate-200 px-3 py-2',
                placeholder: 'Skill B'
              })
            ),
            e(
              'div',
              { className: 'mt-3 space-y-2' },
              e('div', { className: 'text-sm text-slate-700 font-semibold' }, `${compareSkillA}: ${Math.min(100, 50 + compareSkillA.length * 2)} readiness`),
              e('div', { className: 'h-3 rounded bg-slate-200 overflow-hidden' }, e('div', { className: 'h-full bg-sky-500', style: { width: `${Math.min(100, 50 + compareSkillA.length * 2)}%` } })),
              e('div', { className: 'text-sm text-slate-700 font-semibold' }, `${compareSkillB}: ${Math.min(100, 50 + compareSkillB.length * 2)} readiness`),
              e('div', { className: 'h-3 rounded bg-slate-200 overflow-hidden' }, e('div', { className: 'h-full bg-emerald-500', style: { width: `${Math.min(100, 50 + compareSkillB.length * 2)}%` } }))
            )
          ),
          e(
            'div',
            { className: 'rounded-2xl border border-white bg-white/75 p-4' },
            e('h3', { className: 'font-bold text-slate-800 mb-3' }, 'Opportunity Comparison'),
            e(
              'div',
              { className: 'grid gap-3 sm:grid-cols-2' },
              e(
                'select',
                { value: compareOppA, onChange: (ev) => setCompareOppA(Number(ev.target.value)), className: 'rounded-xl border border-slate-200 px-3 py-2' },
                opportunities.map((op, idx) => e('option', { key: `${op.title}-a-${idx}`, value: idx }, op.title))
              ),
              e(
                'select',
                { value: compareOppB, onChange: (ev) => setCompareOppB(Number(ev.target.value)), className: 'rounded-xl border border-slate-200 px-3 py-2' },
                opportunities.map((op, idx) => e('option', { key: `${op.title}-b-${idx}`, value: idx }, op.title))
              )
            ),
            e(
              'div',
              { className: 'mt-3 grid grid-cols-2 gap-3' },
              e('div', { className: 'rounded-xl border border-slate-200 p-3' }, e('p', { className: 'text-xs text-slate-500' }, 'Opportunity A'), e('p', { className: 'text-sm font-bold' }, opportunities[compareOppA]?.title || '-'), e(MatchGauge, { score: opportunities[compareOppA]?.matchScore || 0 })),
              e('div', { className: 'rounded-xl border border-slate-200 p-3' }, e('p', { className: 'text-xs text-slate-500' }, 'Opportunity B'), e('p', { className: 'text-sm font-bold' }, opportunities[compareOppB]?.title || '-'), e(MatchGauge, { score: opportunities[compareOppB]?.matchScore || 0 }))
            )
          )
        )
      ),
      e(
        'section',
        null,
        e('h2', { className: 'text-2xl md:text-3xl font-bold text-slate-800 mb-4' }, 'Opportunity Categories'),
        e('div', { className: 'grid gap-4 sm:grid-cols-2 lg:grid-cols-4' }, defaultCategories.map(categoryCard))
      ),
      e(
        'section',
        { id: 'report-section', className: 'printable-report' },
        e('h2', { className: 'text-2xl md:text-3xl font-bold text-slate-800 mb-2' }, 'Opportunity Matches'),
        queryLabel && e('p', { className: 'text-sm text-slate-600 mb-3' }, `Query: ${queryLabel}`),
        summary && e('p', { className: 'text-sm text-slate-700 mb-3 bg-white/60 border border-white rounded-xl p-3' }, summary),
        e(
          'div',
          { className: 'grid gap-4 md:grid-cols-2 xl:grid-cols-4' },
          loading ? [0, 1, 2, 3].map(opportunitySkeletonCard) : opportunities.map(opportunityCard)
        )
      ),
      e(
        'section',
        {
          className: 'rounded-3xl border border-white/70 bg-white/60 backdrop-blur-xl p-5 sm:p-6 md:p-8 shadow-xl shadow-blue-100/60'
        },
        e('h2', { className: 'text-2xl md:text-3xl font-bold text-slate-800 mb-2' }, 'Opportunity Match Comparison'),
        e('p', { className: 'text-sm text-slate-600 mb-2' }, 'Compare AI confidence across all listed opportunities.'),
        e(OpportunityComparisonChart, { opportunities, loading })
      ),
      e(
        'section',
        {
          className: 'rounded-3xl border border-white/70 bg-white/60 backdrop-blur-xl p-5 sm:p-6 md:p-8 shadow-xl shadow-violet-100/60'
        },
        e('h2', { className: 'text-2xl md:text-3xl font-bold text-slate-800 mb-3' }, 'Skill Gap Analysis'),
        e('p', { className: 'text-sm text-slate-600 mb-4' }, 'AI suggests skills to improve based on opportunity requirements.'),
        e(
          'div',
          { className: 'space-y-3' },
          skillGapRows.map((row) =>
            e(
              'div',
              { key: row.name },
              e(
                'div',
                { className: 'flex justify-between text-sm mb-1' },
                e('span', { className: 'font-semibold text-slate-700' }, row.name),
                e('span', { className: 'text-slate-600' }, `${row.pct}%`) 
              ),
              e('div', { className: 'h-3 bg-slate-200 rounded overflow-hidden' }, e('div', { className: 'h-full bg-gradient-to-r from-sky-500 to-emerald-500', style: { width: `${row.pct}%` } }))
            )
          )
        )
      ),
      e(
        'section',
        {
          className:
            'rounded-3xl border border-white/70 bg-white/60 backdrop-blur-xl p-5 sm:p-6 md:p-8 shadow-xl shadow-emerald-100/50'
        },
        e('h2', { className: 'text-2xl md:text-3xl font-bold text-slate-800 mb-4' }, 'AI Career Insights'),
        e('div', { className: 'grid gap-4 md:grid-cols-3' }, insights.map(insightCard))
      ),
      e(
        'footer',
        { className: 'text-center text-sm sm:text-base text-slate-600 py-2' },
        'Powered by AI · Reducing Inequality · SDG 10'
      )
    )
  );
}
