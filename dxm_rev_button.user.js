// ==UserScript==
// @name         DX Medical Revive Request Button
// @namespace    http://tampermonkey.net/
// @version      1.9.0
// @author       gredra [1996198]
// @description  Branded DX Medical (DXM) revive request button for Torn
// @match        https://www.torn.com/*
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @connect      divisonx.com
// @license      MIT
// @downloadURL https://update.greasyfork.org/scripts/558696/DX%20Medical%20Revive%20Request%20Button.user.js
// @updateURL https://update.greasyfork.org/scripts/558696/DX%20Medical%20Revive%20Request%20Button.meta.js
// ==/UserScript==

(function () {
    'use strict';

    const SCRIPT_VERSION = "1.9.0";
    const CONFIG_KEY = "dxm_revive_config";
    const API_BASE = "https://divisonx.com/api/dashboard/revive";

    const DXM_LOGO = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAATCAMAAABSrFY3AAAACGFjVEwAAAADAAAAAM7tusAAAAEyUExURQAAAAECAgEBAhEWFxIWFiUnJjQ2NDQ2NSYnJjU2NVNVVVJVVVNVVBolJkZGRTRGSzNGS/GcAcyJDGdlVWlmVGZlVsiJE+6bAkhEN0tFN3J1aNqVE/iiAzGFrkRCOU9pb2doZGlVKHB0aHJwXdWXGvaiBQ80NRB0pxtYayYcDzlSUU2DnGhpZcyNFxNDShRpkiQbEiQkGzZQUkA+M008GGlqZHBwXn1uMpKQepluG5p4JamhPuWXCA4eIB4gHR6HiyCMjyCZnigoHzFQXTh3lTyWtz8/QEA/NEWfikuPrUuRdE2bfk+ObFB9kVSTsF1HF2M6A2ZeTGhLFHWesIGAeYWzwIp0TIqOkoqosotvO41kG5aWgKB7MqibOKqAH65/KLl5A8C8n8e5jdCVJtG2dPGiEFzlUkwAAAABdFJOUwBA5thmAAAAGmZjVEwAAAAAAAAAGQAAABMAAAAAAAAAAABkAGQAAL/jJpYAAAEYSURBVBjTdVFNa8MwDI0QCIGwDfbBEEhyCPmAhLa0l132cdgGY2xj3xvbYfv/f2JySptSmGyQ0BPye88Z/BfZNqFe5JJRE+4QZgBblsTTSdcCMClCHwjXkoc65CGvv6wEAnxNiLt7Z0N0hrixxMgpnq8cZCjdMLJupzC+hEBacVV0ghlUN0XltEGN9/5bC+uq4j5PDIaub4GYIxH5J3277ZcDJ9auWC4MEjfncHHrGU8X/aXb6nFrgzrarFdOopIwzu2UkpBKjOHkcRUBSezsAYowxPq3fvgx1uLsjjPAMsZNXvo3HTFuj5ikYmL9qfpRB/fbyKphbMUykxU68FoNIdFIbUoWz78w7UQ0Bo//ZyJo2gPgEDmKP75wF3dy4NuZAAAAGmZjVEwAAAABAAAAGQAAABEAAAAAAAAAAQBkAGQAAV1mRvEAAADdZmRBVAAAAAIY021Qu2oDQQwcg6YQiHDFsmx5B1ddbVy5sRunTB1I0jj//wsZrc+v4NlFK0ZaPQboMF1jo+kxrCBlWnP2kzfJNJ4fAmVXULCTW5LJyKAMKNHsBKcx0VkLYKSqexlRisvL8rF2G0RMlW/bWU7mXybo1sk6eZ2s917ZnmLO9/nj60DajdOzIFOX730sGw2B4VoPHp4r1t+iLuaBOyyC2M7n+bi5CHJFrhRjbajTGLx16eW0xeePW9vnxg8BaSHBKI2oScIfIhLEQ0jaSfxH6m94AXse6w8vZw0uTRanHAAAABpmY1RMAAAAAwAAABkAAAATAAAAAAAAAAAAZABkAAG+AS89AAAA4WZkQVQAAAAEGNN1UTFuAyEQHLGKRtpuCwoE1XVXXOHCcmyX6aK8Ivn/H7ILRkaWPIcEtwOzzID0DhiT+BAUiE8yGTiJUoj+9eEFOkPfCN0y8pY3AJqZpDMI+EZX80OCBxJEgbOXhfmMnCnSSZV5RqQdwMfRBoFtqnk3qyQPiw5DLY2F0O4/6ftuj07DD778l3a57beLjUtMp1RKsr1+1t2SUPHMQFRhp/pbTxbKz3SinzZe/65sOlKZTLgwLa2oRX6LWk/L7YUzKJeso6KOKBNYX6EvQ0de36dfECuxMi/4B7FyDL/ZMgFSAAAAGHRFWHRTb2Z0d2FyZQBnaWYyYXBuZy5zZi5uZXSW/xPIAAAAAElFTkSuQmCC";

    const YELLOW = "#f0b429";
    const YELLOW_HOVER = "#d99e17";
    const YELLOW_BORDER = "#c98f10";

    let serviceOnline = null;

    const injectStyles = () => {
        if (document.getElementById('dxm-revive-styles')) return;
        const style = document.createElement('style');
        style.id = 'dxm-revive-styles';
        style.textContent = `
            .dxm-revive-group { display: inline-flex !important; align-items: stretch; vertical-align: middle; gap: 0 !important; flex-shrink: 0 !important; width: max-content !important; }
            .dxm-revive-main, .dxm-revive-quick {
                cursor: pointer; display: inline-flex !important; align-items: center; margin: 0 !important;
                color: #3a2606 !important; border: 1px solid ${YELLOW_BORDER} !important;
                font: 700 11px system-ui, sans-serif; white-space: nowrap; flex-shrink: 0;
                background: linear-gradient(#f8cb52, ${YELLOW} 48%, #d9980e) !important;
                box-shadow: inset 0 1px 0 rgba(255,255,255,.5), inset 0 -1px 0 rgba(0,0,0,.28), 0 1px 2px rgba(0,0,0,.35) !important;
            }
            .dxm-revive-main { gap: 6px; padding: 0 12px !important; border-radius: 4px 0 0 4px !important; }
            .dxm-revive-quick { padding: 0 8px !important; margin-left: -1px !important; border-radius: 0 4px 4px 0 !important; border-left: 1px solid rgba(0,0,0,.25) !important; font-size: 13px; }
            .dxm-revive-main:hover, .dxm-revive-quick:hover {
                background: linear-gradient(#fad161, ${YELLOW_HOVER} 48%, #c98f10) !important; border-color: ${YELLOW_BORDER} !important;
            }
            .dxm-revive-main:active, .dxm-revive-quick:active {
                background: linear-gradient(${YELLOW_HOVER}, #e5a815) !important;
                box-shadow: inset 0 2px 4px rgba(0,0,0,.4) !important; transform: translateY(1px);
            }

            .dxm-revive-group--header { margin-right: 10px; margin-top: 2px; float: left !important; }
            .dxm-revive-group--header .dxm-revive-main, .dxm-revive-group--header .dxm-revive-quick { height: 24px; }
            #dxm-revive-group-hospital { margin-right: 16px; }

            .dxm-revive-group--mobilebar {
                display: inline-flex !important; width: max-content !important;
                margin: 6px 8px 6px 0 !important; align-self: center; vertical-align: middle; float: left !important;
            }
            .dxm-revive-group--mobilebar .dxm-revive-main {
                height: 20px !important; min-width: 0 !important; justify-content: center; padding: 0 10px 0 8px !important;
                gap: 4px; border-radius: 999px !important; font-size: 9px; line-height: 1;
            }
            .dxm-revive-group--mobilebar .dxm-rev-logo { height: 10px !important; max-width: 14px !important; }
            .dxm-revive-group--mobilebar .dxm-rev-txt { display: none !important; }
            .dxm-revive-group--mobilebar .dxm-rev-dot { width: 6px; height: 6px; }

            .dxm-rev-logo {
                height: 15px !important; width: auto !important; max-width: 22px !important; max-height: 100% !important;
                object-fit: contain; display: block; opacity: .95; flex-shrink: 0; vertical-align: middle;
            }
            .dxm-rev-dot { width: 8px; height: 8px; border-radius: 999px; background: #9ca3af; flex-shrink: 0; border: 1.5px solid rgba(0,0,0,.55); box-sizing: content-box; }

            .dxm-rev-overlay {
                position: fixed; inset: 0; display: flex; align-items: center; justify-content: center;
                background: rgba(0,0,0,.5); z-index: 2147483647;
            }
            .dxm-rev-modal {
                width: 340px; max-width: calc(100vw - 32px); padding: 0; border-radius: 12px; overflow: hidden;
                max-height: min(85vh, 85dvh); display: flex; flex-direction: column;
                background: #1c1c1e; color: #e5e7eb; box-shadow: 0 12px 40px rgba(0,0,0,.5);
                border: 1.5px solid rgba(240,180,41,.65); font: 14px system-ui, sans-serif;
            }
            .dxm-rev-header {
                display: flex; align-items: center; gap: 9px; padding: 16px 20px; flex-shrink: 0;
                background: linear-gradient(rgba(240,180,41,.10), rgba(240,180,41,0));
                border-bottom: 1px solid rgba(255,255,255,.06);
            }
            .dxm-rev-header img { height: 20px; width: auto; display: block; }
            .dxm-rev-body { padding: 18px 20px 20px; overflow-y: auto; min-height: 0; }
            .dxm-rev-title { margin: 0; font-size: 15px; font-weight: 700; letter-spacing: .2px; }
            .dxm-rev-label { display: block; margin: 0 0 6px; font-size: 12px; font-weight: 600; color: #cbd5e1; }
            .dxm-rev-select {
                width: 100%; box-sizing: border-box; margin-bottom: 14px; padding: 8px 10px; border: 1px solid #3a3a3d;
                border-radius: 8px; background: #111; color: #e5e7eb; font-size: 14px;
            }
            .dxm-rev-select:focus { outline: none; border-color: ${YELLOW}; box-shadow: 0 0 0 2px rgba(240,180,41,.25); }
            .dxm-rev-textarea {
                width: 100%; box-sizing: border-box; margin-bottom: 14px; padding: 8px 10px; border: 1px solid #3a3a3d;
                border-radius: 8px; background: #111; color: #e5e7eb; font: 14px system-ui, sans-serif;
                resize: vertical; min-height: 58px;
            }
            .dxm-rev-textarea:focus { outline: none; border-color: ${YELLOW}; box-shadow: 0 0 0 2px rgba(240,180,41,.25); }

            .dxm-rev-price-row { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
            .dxm-rev-price-val {
                flex: 1; box-sizing: border-box; padding: 8px 10px; border: 1px solid #3a3a3d;
                border-radius: 8px; background: #111; color: #e5e7eb; font: 600 14px system-ui, sans-serif;
            }
            .dxm-rev-switch {
                flex-shrink: 0; padding: 8px 12px; border: 1px solid #3a3a3d; border-radius: 8px;
                background: #26262a; color: #e5e7eb; font: 600 12px system-ui, sans-serif;
                cursor: pointer; white-space: nowrap;
            }
            .dxm-rev-switch:hover { border-color: ${YELLOW}; color: #fff; }
            .dxm-rev-note { margin: -4px 0 16px; font-size: 12px; line-height: 1.5; color: #9ca3af; }

            .dxm-rev-tabs {
                display: flex; gap: 4px; margin-bottom: 16px; padding: 4px;
                background: #111; border: 1px solid #2a2a2d; border-radius: 9px;
            }
            .dxm-rev-tab {
                flex: 1; padding: 7px 10px; border: none; border-radius: 6px; cursor: pointer;
                background: transparent; color: #9ca3af; font: 600 13px system-ui, sans-serif;
            }
            .dxm-rev-tab:hover { color: #e5e7eb; }
            .dxm-rev-tab.is-active {
                color: #3a2606; background: linear-gradient(#f8cb52, ${YELLOW} 48%, #d9980e);
                box-shadow: inset 0 1px 0 rgba(255,255,255,.5), 0 1px 2px rgba(0,0,0,.35);
            }
            .dxm-rev-panel.is-hidden { display: none; }
            .dxm-rev-hstatus { margin-left: auto; display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 600; color: #9ca3af; }
            .dxm-rev-hstatus-dot { width: 8px; height: 8px; border-radius: 999px; background: #9ca3af; flex-shrink: 0; }
            .dxm-rev-hstatus.is-online { color: #34d399; }
            .dxm-rev-hstatus.is-online .dxm-rev-hstatus-dot { background: #22c55e; box-shadow: 0 0 6px #22c55e; }
            .dxm-rev-hstatus.is-offline { color: #f87171; }
            .dxm-rev-hstatus.is-offline .dxm-rev-hstatus-dot { background: #ef4444; box-shadow: 0 0 6px #ef4444; }
            .dxm-rev-actions {
                display: flex; justify-content: flex-end; gap: 8px;
                position: sticky; bottom: -20px; margin: 0 -20px -20px; padding: 10px 20px;
                background: #1c1c1e; border-top: 1px solid rgba(255,255,255,.06);
            }
            .dxm-rev-btn2 { padding: 8px 14px; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; }
            .dxm-rev-btn2-primary { background: ${YELLOW}; color: #3a2606; }
            .dxm-rev-btn2-primary:disabled { opacity: .5; cursor: not-allowed; }
            .dxm-rev-btn2-ghost { background: transparent; color: #9ca3af; }
            .dxm-rev-btn2-ghost:hover { color: #e5e7eb; }

            .dxm-rev-toast {
                position: fixed; left: 50%; bottom: 24px; transform: translate(-50%, 12px);
                padding: 10px 16px; border-radius: 999px; z-index: 2147483647; opacity: 0;
                font: 600 13px system-ui, sans-serif; color: #fff; background: #374151;
                box-shadow: 0 6px 20px rgba(0,0,0,.4); transition: opacity .25s, transform .25s; pointer-events: none;
            }
            .dxm-rev-toast.show { opacity: 1; transform: translate(-50%, 0); }
            .dxm-rev-toast.is-ok { background: #059669; }
            .dxm-rev-toast.is-err { background: #dc2626; }
        `;
        document.head.appendChild(style);
    };

    const toast = (msg, ok) => {
        injectStyles();
        const t = document.createElement('div');
        t.className = `dxm-rev-toast ${ok ? 'is-ok' : 'is-err'}`;
        t.textContent = msg;
        document.body.appendChild(t);
        requestAnimationFrame(() => t.classList.add('show'));
        setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 3200);
    };

    const paintDots = () => {
        const color = serviceOnline === true ? '#22c55e' : serviceOnline === false ? '#ef4444' : '#9ca3af';
        const title = serviceOnline === true ? 'Revive service online'
            : serviceOnline === false ? 'Revive service offline' : 'Revive service status unknown';
        document.querySelectorAll('.dxm-rev-dot').forEach((d) => {
            d.style.background = color;
            d.style.boxShadow = `0 0 6px ${color}`;
            d.title = title;
        });
    };

    const paintQuickTips = () => {
        const cfg = GM_getValue(CONFIG_KEY, null);
        const tip = cfg ? `Quick request: ${cfg.type} ${cfg.price}, ${cfg.skill}`
            : 'Quick request (opens the form the first time)';
        document.querySelectorAll('.dxm-revive-quick').forEach((q) => { q.title = tip; });
    };

    const refreshStatus = () => {
        fetchServiceStatus((online) => { serviceOnline = online; paintDots(); });
    };

    const ensureApiKey = () => {
        let apiKey = GM_getValue("torn_api_key", null);
        if (!apiKey) {
            apiKey = prompt("Please enter your Torn PUBLIC API key:");
            if (!apiKey) { alert("No API key set. Cannot send revive request."); return null; }
            GM_setValue("torn_api_key", apiKey);
        }
        return apiKey;
    };

    const handleMainClick = () => {
        const apiKey = ensureApiKey();
        if (!apiKey) return;
        showPriceModal(apiKey);
    };

    const handleQuickClick = () => {
        const apiKey = ensureApiKey();
        if (!apiKey) return;
        const cfg = GM_getValue(CONFIG_KEY, null);
        if (!cfg) { showPriceModal(apiKey); return; }
        if (serviceOnline === false) { toast("DXM revive service is offline", false); return; }
        sendToController(cfg, apiKey);
    };

    const makeGroup = (id, variant) => {
        const group = document.createElement('div');
        group.id = id;
        group.className = `dxm-revive-group dxm-revive-group--${variant}`;

        const main = document.createElement('button');
        main.className = 'dxm-revive-main';
        main.innerHTML = variant === 'mobilebar'
            ? `<img class="dxm-rev-logo" src="${DXM_LOGO}" alt=""><span class="dxm-rev-dot"></span>`
            : `<img class="dxm-rev-logo" src="${DXM_LOGO}" alt=""><span class="dxm-rev-txt">DXM Revive</span><span class="dxm-rev-dot"></span>`;
        main.addEventListener('click', (e) => { e.preventDefault(); handleMainClick(); });

        group.appendChild(main);

        if (variant !== 'mobilebar') {
            const quick = document.createElement('button');
            quick.className = 'dxm-revive-quick';
            quick.textContent = '»';
            quick.addEventListener('click', (e) => { e.preventDefault(); handleQuickClick(); });
            group.appendChild(quick);
        }

        return group;
    };

    const findContentBarAnchor = () => {
        const selectors = [
            '#top-page-links-list',
            '.content-title-links',
            '.links-top-wrap',
            '.view-wars',
            '.revive-availability-btn'
        ];

        for (const selector of selectors) {
            const match = document.querySelector(selector);
            if (match) return match;
        }
        return null;
    };

    const getLayoutMode = () => {
        const mobileShellSignal = !!(
            document.body && (
                document.body.classList.contains('tt-mobile') ||
                document.body.classList.contains('mobile') ||
                (document.body.dataset && document.body.dataset.layout === 'mobile')
            )
        );

        const ratio = window.innerWidth / Math.max(window.innerHeight, 1);
        if (mobileShellSignal || ratio <= 1.15 || window.innerWidth <= 768) return 'mobile';

        return 'desktop';
    };

    const injectButtons = () => {
        injectStyles();
        let added = false;

        const existingMobile = document.getElementById('dxm-revive-group-mobilebar');
        const existingDesktop = document.getElementById('dxm-revive-group-faction');
        existingMobile?.remove();
        existingDesktop?.remove();

        const layoutMode = getLayoutMode();
        const anchor = findContentBarAnchor();

        if (anchor && layoutMode === 'desktop' && !document.getElementById('dxm-revive-group-faction')) {
            const group = makeGroup('dxm-revive-group-faction', 'header');
            const insertTarget = anchor.firstElementChild || null;
            if (insertTarget) {
                anchor.insertBefore(group, insertTarget);
            } else {
                anchor.appendChild(group);
            }
            added = true;
        }

        if (anchor && layoutMode === 'mobile' && !document.getElementById('dxm-revive-group-mobilebar')) {
            const group = makeGroup('dxm-revive-group-mobilebar', 'mobilebar');
            const insertTarget = anchor.firstElementChild || null;
            if (insertTarget) {
                anchor.insertBefore(group, insertTarget);
            } else {
                anchor.appendChild(group);
            }
            added = true;
        }

        paintDots();
        paintQuickTips();
        if (added) refreshStatus();
    };

    // Torn's faction/war nav re-renders live (war status ticks, ajax nav), which
    // can wipe our injected sibling button. Poll as a backstop, but also react
    // to DOM changes immediately so there's no multi-second window where the
    // button is missing or a tap lands on a stale reference.
    let injectScheduled = false;
    const scheduleInject = () => {
        if (injectScheduled) return;
        injectScheduled = true;
        requestAnimationFrame(() => { injectScheduled = false; injectButtons(); });
    };
    const startObserver = () => {
        if (!document.body) { requestAnimationFrame(startObserver); return; }
        new MutationObserver(scheduleInject).observe(document.body, { childList: true, subtree: true });
    };
    startObserver();

    setInterval(injectButtons, 1000);
    refreshStatus();
    setInterval(refreshStatus, 30000);

    GM_registerMenuCommand("DXM: Set / change API key", () => {
        const current = GM_getValue("torn_api_key", "");
        const next = prompt("Enter your Torn PUBLIC API key:", current || "");
        if (next) { GM_setValue("torn_api_key", next); toast("DXM API key saved", true); }
    });
    GM_registerMenuCommand("DXM: Clear saved quick request", () => {
        GM_setValue(CONFIG_KEY, null);
        paintQuickTips();
        toast("Saved quick request cleared", true);
    });

    function showPriceModal(apiKey) {
        injectStyles();
        const saved = GM_getValue(CONFIG_KEY, null);
        const overlay = document.createElement('div');
        overlay.className = 'dxm-rev-overlay';
        const modal = document.createElement('div');
        modal.className = 'dxm-rev-modal';

        modal.innerHTML = `
            <div class="dxm-rev-header">
                <img src="${DXM_LOGO}" alt="">
                <div class="dxm-rev-title">DX Medical Revive</div>
                <div id="dxm-status" class="dxm-rev-hstatus"><span class="dxm-rev-hstatus-dot"></span><span class="dxm-rev-hstatus-txt"></span></div>
            </div>
            <div class="dxm-rev-body">
                <div class="dxm-rev-tabs">
                    <button class="dxm-rev-tab is-active" data-tab="single">Single Revive</button>
                    <button class="dxm-rev-tab" data-tab="contract">Contract</button>
                </div>

                <div class="dxm-rev-panel" data-panel="single">
                    <label class="dxm-rev-label">Required Revive Skill</label>
                    <select id="dxm-skill-select" class="dxm-rev-select"><option>Any</option><option>At least 75%</option><option>Full (100%)</option></select>
                    <label class="dxm-rev-label">Revive Price</label>
                    <div class="dxm-rev-price-row">
                        <div id="dxm-price-display" class="dxm-rev-price-val"></div>
                        <button id="dxm-switch-type" type="button" class="dxm-rev-switch"></button>
                    </div>
                    <p id="dxm-perk-note" class="dxm-rev-note" style="display:none">As a DX member, your revive is discounted. Please pay the above amount to your reviver.</p>
                </div>

                <div class="dxm-rev-panel is-hidden" data-panel="contract">
                    <label class="dxm-rev-label">Contract Details <span style="color:#f87171;font-weight:400">*</span></label>
                    <textarea id="dxm-c-notes" class="dxm-rev-textarea" placeholder="Details of your request"></textarea>
                    <p class="dxm-rev-note">Please provide an estimated # of revives and start date. A contract specialist will reach out to you.</p>
                </div>

                <div class="dxm-rev-actions">
                    <button id="dxm-close" class="dxm-rev-btn2 dxm-rev-btn2-ghost">Cancel</button>
                    <button id="dxm-send" class="dxm-rev-btn2 dxm-rev-btn2-primary">Send</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        overlay.appendChild(modal);

        const skillS = modal.querySelector('#dxm-skill-select');
        const priceDisplay = modal.querySelector('#dxm-price-display');
        const switchBtn = modal.querySelector('#dxm-switch-type');
        const perkNote = modal.querySelector('#dxm-perk-note');

        // Payment type is a toggle (Xanax <-> Cash); the price is derived from the
        // skill — 2 for Full (100%), 1 for Any / At least 75%. DX members get the
        // perk: half price, cash only (set once the member check returns).
        let payType = (saved && saved.type) === "Cash" ? "Cash" : "Xanax";
        let perkMode = false;
        if (saved && saved.skill) skillS.value = saved.skill;

        const priceFor = () => {
            if (perkMode) return skillS.value === "Full (100%)" ? "1m" : "500k";
            const units = skillS.value === "Full (100%)" ? 2 : 1;
            return payType === "Cash" ? `${units}m` : `${units} Xanax`;
        };
        const update = () => {
            priceDisplay.textContent = priceFor();
            switchBtn.style.display = perkMode ? "none" : "";
            switchBtn.textContent = payType === "Cash" ? "Switch to Xanax" : "Switch to Cash";
            perkNote.style.display = perkMode ? "" : "none";
        };
        switchBtn.onclick = () => { payType = payType === "Cash" ? "Xanax" : "Cash"; update(); };
        skillS.onchange = update;
        update();

        // DX members pay half (cash only). Server checks their faction; flip to
        // perk pricing when it confirms membership.
        checkMembership(apiKey, (member) => {
            if (!member) return;
            perkMode = true;
            payType = "Cash";
            update();
        });

        const cNotes = modal.querySelector('#dxm-c-notes');

        let activeTab = 'single';
        modal.querySelectorAll('.dxm-rev-tab').forEach((tab) => {
            tab.onclick = () => {
                activeTab = tab.dataset.tab;
                modal.querySelectorAll('.dxm-rev-tab').forEach(t => t.classList.toggle('is-active', t === tab));
                modal.querySelectorAll('.dxm-rev-panel').forEach(p => p.classList.toggle('is-hidden', p.dataset.panel !== activeTab));
            };
        });

        const statusEl = modal.querySelector('#dxm-status');
        const statusTxt = statusEl.querySelector('.dxm-rev-hstatus-txt');
        const sendBtn = modal.querySelector('#dxm-send');
        const applyStatus = (online) => {
            statusEl.className = 'dxm-rev-hstatus';
            if (online === true) {
                statusEl.classList.add('is-online');
                statusTxt.textContent = "Online";
                sendBtn.disabled = false;
            } else if (online === false) {
                statusEl.classList.add('is-offline');
                statusTxt.textContent = "Offline";
                sendBtn.disabled = true;
            } else {
                statusTxt.textContent = "Unknown";
            }
        };
        applyStatus(serviceOnline);
        fetchServiceStatus((online) => { serviceOnline = online; paintDots(); applyStatus(online); });

        const closeModal = () => { if (overlay.isConnected) document.body.removeChild(overlay); };

        sendBtn.onclick = () => {
            if (sendBtn.disabled) return;
            if (activeTab === 'single') {
                const data = { mode: 'single', type: payType, price: priceFor(), skill: skillS.value };
                GM_setValue(CONFIG_KEY, { type: data.type, price: data.price, skill: data.skill });
                paintQuickTips();
                sendToController(data, apiKey);
            } else {
                const notes = cNotes.value.trim();
                if (!notes) { toast("Please add contract details", false); cNotes.focus(); return; }
                sendContract({ notes }, apiKey);
            }
            closeModal();
        };
        modal.querySelector('#dxm-close').onclick = closeModal;
        // Redundant close path: tap on the dimmed backdrop itself (not the modal)
        // in case a viewport quirk ever pushes the Cancel button out of reach.
        overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
    }

    function sendToController(data, apiKey) {
        GM_xmlhttpRequest({
            method: "POST",
            url: `${API_BASE}/script`,
            headers: { "Content-Type": "application/json" },
            data: JSON.stringify({ apiKey, ...data, scriptVersion: SCRIPT_VERSION }),
            onload: (res) => {
                let body = {};
                try { body = JSON.parse(res.responseText); } catch (e) {}
                const ok = res.status >= 200 && res.status < 300 && body.success !== false;
                const msg = ok ? `Revive request sent: ${data.type} ${data.price}`
                    : (body.message || `Request failed (${res.status})`);
                toast(msg, ok);
            },
            onerror: () => toast("Request failed (network error)", false)
        });
    }

    function sendContract(data, apiKey) {
        GM_xmlhttpRequest({
            method: "POST",
            url: `${API_BASE}/contract`,
            headers: { "Content-Type": "application/json" },
            data: JSON.stringify({ apiKey, ...data, scriptVersion: SCRIPT_VERSION }),
            onload: (res) => {
                let body = {};
                try { body = JSON.parse(res.responseText); } catch (e) {}
                const ok = res.status >= 200 && res.status < 300 && body.success !== false;
                const msg = ok ? `Future revive request sent`
                    : (body.message || `Request failed (${res.status})`);
                toast(msg, ok);
            },
            onerror: () => toast("Contract request failed (network error)", false)
        });
    }

    let dxMemberCache = null;
    function checkMembership(apiKey, cb) {
        if (dxMemberCache !== null) { cb(dxMemberCache); return; }
        GM_xmlhttpRequest({
            method: "POST",
            url: `${API_BASE}/member-check`,
            headers: { "Content-Type": "application/json" },
            data: JSON.stringify({ apiKey }),
            onload: (res) => {
                try {
                    const data = JSON.parse(res.responseText);
                    dxMemberCache = data.member === true;
                } catch (e) { dxMemberCache = false; }
                cb(dxMemberCache);
            },
            onerror: () => cb(false)
        });
    }

    function fetchServiceStatus(cb) {
        GM_xmlhttpRequest({
            method: "GET",
            url: `${API_BASE}/status`,
            onload: (res) => {
                try {
                    const data = JSON.parse(res.responseText);
                    cb(typeof data.online === "boolean" ? data.online : null);
                } catch (e) { cb(null); }
            },
            onerror: () => cb(null)
        });
    }
})();
