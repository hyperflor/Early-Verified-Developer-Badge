(() => {
    let MY_ID = "";

    const ICON = "https://cdn.discordapp.com/badge-icons/6df5892e0f35b051f8b61eace34f4967.png";
    const TITLE = "Early Verified Bot Developer";
    const SUBTITLE = "Built the foundation";
    const META = ["Built the foundation", "Very, very early"];
    const RARITY = "Mythic";
    const RARITY_COLOR = "#f6a33b";
    const CARD_LABEL = "Legacy Badge";
    const CARD_TEXT = "Unlocked by creating a verified bot before August 19, 2020.";
    const INFO_TEXT = "This badge is no longer available, but others are waiting.";
    const INSERT_AT = 1;

    const COLOR_TITLE = "#ffffff";
    const COLOR_META = "#b5bac1";
    const COLOR_LABEL = "#949ba4";
    const COLOR_TEXT = "#f2f3f5";
    const COLOR_INFO = "#dbdee1";

    const BADGE_IMG = 'img[src*="/badge-icons/"]';
    const TIP_SEL = '[role="tooltip"], [class*="tooltip"], [class*="Tooltip"]';
    const OURS_SEL = "[data-early-dev], [data-early-dev-tip], [data-early-dev-tile], [data-early-dev-pane], [data-early-dev-item]";
    const FAKE = "data-fake-badge";
    const FAKE_SEL = "[data-fake-badge]";
    const ICON_HASH = ICON.split("/").pop().split(".")[0];
    const DLG_SEL = '[role="dialog"], [aria-modal="true"]';
    const dlgOf = el => el.closest(DLG_SEL) || el.closest('[class*="modal"]');
    const log = (...a) => console.warn("[badge]", ...a);

    window.removeEarlyDevBadge?.();

    if (!MY_ID) {
        for (const img of document.querySelectorAll('section[class*="panels"] img[src*="/avatars/"], [class*="avatarWrapper"] img[src*="/avatars/"]')) {
            const m = img.src.match(/\/avatars\/(\d+)\//);
            if (m) { MY_ID = m[1]; break; }
        }
    }
    if (!MY_ID) return log("couldn't detect your user ID, set MY_ID at the top");

    const fire = (el, kind) => {
        const o = { bubbles: true, cancelable: true, view: window, relatedTarget: document.body };
        try { el.dispatchEvent(new PointerEvent("pointer" + kind, o)); } catch {}
        el.dispatchEvent(new MouseEvent("mouse" + kind, o));
    };

    const fiberOf = el => {
        const key = Object.keys(el).find(k => k.startsWith("__reactFiber$"));
        return key && el[key];
    };

    const ownerId = el => {
        let f = fiberOf(el);
        for (let i = 0; f && i < 100; i++, f = f.return) {
            const p = f.memoizedProps;
            const id = p?.user?.id ?? p?.userId ?? p?.displayProfile?.userId;
            if (typeof id === "string") return id;
        }
        return null;
    };

    const isMine = container => {
        const id = ownerId(container);
        if (id) return id === MY_ID;
        let el = container;
        for (let i = 0; el && i < 25; i++, el = el.parentElement) {
            if (el.querySelector?.(`img[src*="/avatars/${MY_ID}/"]`)) return true;
            if (el.getAttribute?.("role") === "dialog") break;
        }
        return false;
    };

    const isMineModal = (dlg, grid) => {
        const id = ownerId(grid);
        if (id) return id === MY_ID;
        return ![...dlg.querySelectorAll('img[src*="/avatars/"]')].some(a => !a.src.includes(`/avatars/${MY_ID}/`));
    };

    const visibleText = el => {
        const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        while (w.nextNode()) {
            if (!w.currentNode.nodeValue.trim()) continue;
            const r = w.currentNode.parentElement.getBoundingClientRect();
            if (r.width > 2 && r.height > 2) return true;
        }
        return false;
    };

    const hasBadgeProp = el => {
        let f = fiberOf(el);
        for (let i = 0; f && i < 12; i++, f = f.return) {
            const p = f.memoizedProps;
            if (p && typeof p === "object" && Object.keys(p).some(k => /badge/i.test(k))) return true;
        }
        return false;
    };

    const hasBadgeHint = el => {
        let f = fiberOf(el);
        for (let i = 0; f && i < 12; i++, f = f.return) {
            const p = f.memoizedProps;
            if (p && typeof p === "object" && Object.entries(p).some(([k, v]) =>
                /badge/i.test(k) && v != null && typeof v !== "function" && typeof v !== "boolean" &&
                typeof v !== "number" && !(typeof v === "object" && v.$$typeof))) return true;
        }
        return false;
    };

    const badgeNames = () => {
        const names = new Set();
        for (const img of document.querySelectorAll(BADGE_IMG)) {
            if (img.closest(FAKE_SEL)) continue;
            let el = img;
            for (let i = 0; el && i < 4; i++, el = el.parentElement) {
                for (const v of [el.getAttribute("alt"), el.getAttribute("aria-label")])
                    if (v && v.trim().length >= 4) names.add(v.trim().toLowerCase());
            }
        }
        return names;
    };

    const labelMatches = (tile, names) => {
        for (const e of els(tile)) {
            for (const v of [e.getAttribute("alt"), e.getAttribute("aria-label"), e.getAttribute("title")]) {
                const l = v?.trim().toLowerCase();
                if (l && [...names].some(n => l.includes(n))) return true;
            }
        }
        return false;
    };

    const swapTileIcon = (clone, base) => {
        if (clone.querySelector(`img[src*="${ICON_HASH}"]`)) return;
        const bEls = els(base), cEls = els(clone);
        let idx = -1, best = 0;
        bEls.forEach((e, i) => {
            if (!/^(img|svg|canvas|video)$/i.test(e.tagName)) return;
            const r = e.getBoundingClientRect();
            if (r.width * r.height > best) { best = r.width * r.height; idx = i; }
        });
        if (idx < 0 || !cEls[idx]) return;
        const target = cEls[idx], r = bEls[idx].getBoundingClientRect();
        if (target.tagName === "IMG") { target.removeAttribute("srcset"); target.src = ICON; target.alt = TITLE; return; }
        const img = document.createElement("img");
        img.src = ICON; img.alt = TITLE;
        img.style.cssText = `width:${Math.round(r.width)}px;height:${Math.round(r.height)}px;object-fit:contain;display:block`;
        target.replaceWith(img);
    };

    const swapImg = root => {
        root.querySelectorAll(BADGE_IMG).forEach(i => { i.removeAttribute("srcset"); i.src = ICON; i.alt = TITLE; });
        if (root.matches(BADGE_IMG)) { root.removeAttribute("srcset"); root.src = ICON; root.alt = TITLE; }
        root.querySelectorAll("[aria-label]").forEach(n => n.setAttribute("aria-label", TITLE));
    };

    let pending = null, fallbackEl = null, wantSelect = 0, hiddenByUser = false;

    const pickSource = (clone, container) => {
        for (const s of [clone.nextElementSibling, clone.previousElementSibling, ...container.children]) {
            if (s && s !== clone && !s.hasAttribute(FAKE) && (s.matches(BADGE_IMG) || s.querySelector(BADGE_IMG)))
                return { unit: s, img: s.matches(BADGE_IMG) ? s : s.querySelector(BADGE_IMG) };
        }
        return null;
    };

    const rewriteTip = (tip, p) => {
        let big = null, bigA = 0;
        for (const v of tip.querySelectorAll("img, svg, video, canvas")) {
            if (v.closest('[class*="ointer"]')) continue;
            const r = v.getBoundingClientRect(), a = r.width * r.height;
            if (a > bigA) { big = v; bigA = a; }
        }
        if (big) {
            if (big.tagName === "IMG") { big.removeAttribute("srcset"); big.src = ICON; big.alt = TITLE; }
            else {
                const r = big.getBoundingClientRect();
                const img = document.createElement("img");
                img.src = ICON; img.alt = TITLE;
                img.style.cssText = `width:${r.width || 64}px;height:${r.height || 64}px;display:block;object-fit:contain`;
                big.style.display = "none";
                big.parentNode.insertBefore(img, big);
            }
        }
        const texts = [];
        const w = document.createTreeWalker(tip, NodeFilter.SHOW_TEXT);
        while (w.nextNode()) if (w.currentNode.nodeValue.trim()) texts.push(w.currentNode);
        const size = t => parseFloat(getComputedStyle(t.parentElement).fontSize) || 0;
        let ti = 0;
        texts.forEach((t, i) => { if (size(t) > size(texts[ti])) ti = i; });
        const title = texts[ti], sub = texts[ti + 1];
        if (title) title.nodeValue = TITLE;
        if (sub) sub.nodeValue = SUBTITLE;
        for (const t of texts) {
            if (t === title || (t === sub && SUBTITLE)) continue;
            const el = t.parentElement;
            if ([title, sub].some(x => x && x !== t && el.contains(x))) t.nodeValue = "";
            else el.style.display = "none";
        }
        const a = p.clone.getBoundingClientRect(), b = p.srcUnit.getBoundingClientRect();
        tip.style.translate = `${(a.left + a.width / 2) - (b.left + b.width / 2)}px 0px`;
        tip.setAttribute("data-early-dev-tip", "");
        tip.setAttribute(FAKE, "");
    };

    const tipObs = new MutationObserver(muts => {
        if (!pending) return;
        const host = pending.container.closest('[class*="layer"], [role="dialog"]') || pending.container;
        for (const m of muts) for (const n of m.addedNodes) {
            if (!(n instanceof HTMLElement)) continue;
            let t = n.closest(TIP_SEL) || n.querySelector(TIP_SEL);
            if (!t || host.contains(t) || t.hasAttribute(FAKE)) continue;
            while (t.parentElement?.matches(TIP_SEL)) t = t.parentElement;
            if (!t.textContent.trim()) continue;
            clearTimeout(pending.timer);
            rewriteTip(t, pending);
            return;
        }
    });
    tipObs.observe(document.body, { childList: true, subtree: true });

    const showFallback = p => {
        const el = document.createElement("div");
        el.style.cssText = "position:fixed;z-index:100000;pointer-events:none;width:232px;box-sizing:border-box;padding:16px;display:flex;flex-direction:column;align-items:center;text-align:center;background:#111214;border:1px solid rgba(255,255,255,.08);border-radius:12px";
        el.innerHTML = `<img src="${ICON}" style="width:64px;height:64px;margin-bottom:12px"><b style="font-size:16px;text-transform:uppercase;color:#fff"></b><span style="margin-top:6px;font-size:14px;color:#b5bac1"></span>`;
        el.children[1].textContent = TITLE;
        el.children[2].textContent = SUBTITLE;
        document.body.appendChild(el);
        const r = p.clone.getBoundingClientRect(), b = el.getBoundingClientRect();
        el.style.left = Math.max(8, r.left + r.width / 2 - b.width / 2) + "px";
        el.style.top = Math.max(8, r.top - b.height - 10) + "px";
        fallbackEl = el;
    };

    const onLeave = () => {
        if (pending) { clearTimeout(pending.timer); fire(pending.srcImg, "out"); }
        pending = null;
        fallbackEl?.remove(); fallbackEl = null;
    };

    const onEnter = (clone, container) => {
        onLeave();
        const src = pickSource(clone, container);
        if (!src) return;
        pending = { clone, container, srcUnit: src.unit, srcImg: src.img };
        pending.timer = setTimeout(() => {
            if (pending?.clone === clone) showFallback(pending);
        }, 800);
        fire(src.img, "over");
    };

    const onProfileClick = (e, clone, container) => {
        e.preventDefault(); e.stopPropagation();
        const src = pickSource(clone, container);
        onLeave();
        if (!src) return;
        wantSelect = Date.now();
        const clickable = src.unit.matches('a, button, [role="button"]') ? src.unit
            : src.unit.querySelector('a, button, [role="button"]') || src.img;
        clickable.click();
    };

    const injectProfile = () => {
        if (pending && !pending.clone.isConnected) onLeave();
        if (hiddenByUser) return;
        const seen = new Set();
        for (const img of document.querySelectorAll(BADGE_IMG)) {
            if (img.closest(FAKE_SEL)) continue;
            if (img.getBoundingClientRect().width > 40) continue;

            let unit = img, depth = 0;
            while (unit.parentElement && unit.parentElement.querySelectorAll(BADGE_IMG).length < 2 && depth < 4) {
                unit = unit.parentElement; depth++;
            }
            if (unit.offsetWidth >= 36) continue;
            const container = unit.parentElement;
            if (!container || seen.has(container) || unit.textContent.trim()) continue;
            if (container.querySelectorAll(BADGE_IMG).length < 2) continue;
            seen.add(container);

            if (container.querySelector("[data-early-dev]")) continue;
            if (container.querySelector(`img[src*="${ICON_HASH}"]`)) continue;
            if (!isMine(container)) continue;

            const clone = unit.cloneNode(true);
            clone.setAttribute("data-early-dev", "1");
            clone.setAttribute(FAKE, "");
            clone.removeAttribute("title");
            swapImg(clone);
            clone.querySelectorAll("a[href]").forEach(a => a.removeAttribute("href"));
            if (clone.matches("a[href]")) clone.removeAttribute("href");
            clone.style.cursor = "pointer";

            clone.addEventListener("mouseenter", () => onEnter(clone, container));
            clone.addEventListener("mouseleave", onLeave);
            clone.addEventListener("click", e => onProfileClick(e, clone, container), true);

            container.insertBefore(clone, container.children[INSERT_AT] ?? null);
        }
    };

    let state = null;
    const hooks = [];
    const els = t => [t, ...t.querySelectorAll("*")];
    const cls = e => e.getAttribute("class") || "";
    const realTiles = grid => [...grid.children].filter(t => !t.hasAttribute(FAKE));
    const SEL_ATTR = '[aria-selected="true"], [aria-pressed="true"], [aria-checked="true"], [aria-current="true"]';
    const ARIA_STATES = ["aria-selected", "aria-pressed", "aria-checked", "aria-current"];

    const findSelected = grid => {
        const tiles = realTiles(grid);
        return tiles.find(t => t.matches(SEL_ATTR) || t.querySelector(SEL_ATTR))
            || tiles.find(t => els(t).some(e => /selected|active|checked/i.test(cls(e))))
            || (tiles.length >= 3 && (() => {
                const c = {}; tiles.forEach(t => c[cls(t)] = (c[cls(t)] || 0) + 1);
                return tiles.find(t => c[cls(t)] === 1);
            })())
            || null;
    };

    const pickRef = (grid, sel) => {
        const others = realTiles(grid).filter(t => t !== sel);
        return others.find(t => els(t).length === els(sel).length) || others[0] || null;
    };

    const selDiff = (sel, ref) => {
        const a = els(sel), b = els(ref), out = [];
        const n = a.length === b.length ? a.length : 1;
        for (let i = 0; i < n; i++) if (cls(a[i]) !== cls(b[i])) out.push({ i, on: cls(a[i]), off: cls(b[i]) });
        return out;
    };

    const findTile = img => {
        let u = img, d = 0;
        while (u && u.offsetWidth < 40 && d < 6) { u = u.parentElement; d++; }
        if (!u || u.offsetWidth > 100 || Math.abs(u.offsetWidth - u.offsetHeight) > 14) return null;
        while (u.parentElement && u.parentElement.children.length === 1 && u.parentElement.offsetWidth === u.offsetWidth) u = u.parentElement;
        const grid = u.parentElement;
        if (!grid || visibleText(u)) return null;
        const W = u.offsetWidth, H = u.offsetHeight;
        const similar = [...grid.children].filter(c =>
            Math.abs(c.offsetWidth - W) <= 4 && Math.abs(c.offsetHeight - H) <= 4 && !visibleText(c));
        if (similar.length < 2) return null;
        return { tile: u, grid };
    };

    const getLeftCol = (grid, dlg) => {
        let el = grid, left = grid;
        const W = dlg.getBoundingClientRect().width;
        while (el && el !== dlg) { if (el.getBoundingClientRect().width < W * 0.55) left = el; el = el.parentElement; }
        return left;
    };

    const findTitle = (dlg, leftCol) => {
        let best = null, bestSize = 17;
        const w = document.createTreeWalker(dlg, NodeFilter.SHOW_TEXT);
        while (w.nextNode()) {
            const el = w.currentNode.parentElement;
            if (!w.currentNode.nodeValue.trim() || leftCol.contains(el) || el.closest(FAKE_SEL) || !el.offsetParent) continue;
            const s = parseFloat(getComputedStyle(el).fontSize);
            if (s > bestSize) { best = el; bestSize = s; }
        }
        return best;
    };

    const fontOf = el => {
        const c = getComputedStyle(el);
        return `font-family:${c.fontFamily.replace(/"/g, "'")};font-size:${c.fontSize};font-weight:${c.fontWeight};line-height:${c.lineHeight};letter-spacing:${c.letterSpacing};text-transform:${c.textTransform};`;
    };
    const opaque = c => c && c !== "transparent" && !/,\s*0\)$/.test(c);

    const readStyles = (scopes, titleEl, width) => {
        const S = {
            title: fontOf(titleEl),
            meta: "font-size:12px;",
            icon: 112,
            card: "background:var(--background-base-lower,#1e1f22);border-radius:12px;padding:16px;",
            strong: "font-size:14px;font-weight:600;line-height:1.3;"
        };
        const texts = [];
        for (const sc of scopes) {
            const w = document.createTreeWalker(sc, NodeFilter.SHOW_TEXT);
            while (w.nextNode()) if (w.currentNode.nodeValue.trim()) texts.push(w.currentNode.parentElement);
        }
        const metaEl = texts.slice(texts.indexOf(titleEl) + 1).find(e => e !== titleEl);
        if (metaEl) S.meta = fontOf(metaEl);

        let best = 0;
        for (const sc of scopes) for (const v of sc.querySelectorAll("img, canvas, video, svg")) {
            const r = v.getBoundingClientRect();
            if (r.width * r.height > best) { best = r.width * r.height; S.icon = Math.round(Math.max(88, Math.min(r.height, 120))); }
        }

        outer: for (const sc of scopes) for (const el of [sc, ...sc.querySelectorAll("*")]) {
            if (el.contains(titleEl)) continue;
            const c = getComputedStyle(el);
            if (opaque(c.backgroundColor) && parseFloat(c.borderTopLeftRadius) >= 6 && el.offsetWidth >= width * 0.6) {
                S.card = `background:${c.backgroundColor};border-radius:${c.borderRadius};padding:${c.padding};border:${c.border};`;
                const strong = [...el.querySelectorAll("*")].find(x =>
                    [...x.childNodes].some(n => n.nodeType === 3 && n.nodeValue.trim()) &&
                    +getComputedStyle(x).fontWeight >= 600 && parseFloat(getComputedStyle(x).fontSize) <= 16);
                if (strong) S.strong = fontOf(strong) + "text-transform:none;";
                break outer;
            }
        }

        const paint = c => `color:${c} !important;-webkit-text-fill-color:${c} !important;background:none !important;opacity:1 !important;filter:none !important;`;
        S.label = S.meta + "font-size:12px;text-transform:none;" + paint(COLOR_LABEL);
        S.body = S.strong + "font-weight:400;" + paint(COLOR_INFO);
        S.title += paint(COLOR_TITLE);
        S.meta += paint(COLOR_META);
        S.strong += paint(COLOR_TEXT);
        return S;
    };

    const buildPane = (S, pad) => {
        const p = document.createElement("div");
        p.setAttribute("data-early-dev-pane", "");
        p.setAttribute(FAKE, "");
        p.style.cssText = `position:absolute;inset:0;pointer-events:none;overflow:hidden;box-sizing:border-box;padding:${pad};display:flex;flex-direction:column;align-items:center;text-align:center;`;
        p.innerHTML = `
            <img src="${ICON}" alt="" style="width:${S.icon}px;height:${S.icon}px;object-fit:contain;margin-bottom:16px">
            <div class="t" style="${S.title}"></div>
            <div class="m" style="${S.meta}display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:6px;margin-top:8px"></div>
            <div style="${S.card}box-sizing:border-box;width:100%;text-align:left;margin-top:24px">
                <div class="cl" style="${S.label}"></div>
                <div class="cs" style="${S.strong}margin-top:8px"></div>
                ${INFO_TEXT ? `<div style="${S.body}display:flex;gap:10px;align-items:flex-start;margin-top:16px;padding:12px 14px;border-radius:8px;background:rgba(56,132,232,.1);border:1px solid rgba(56,132,232,.6)">
                    <svg width="16" height="16" viewBox="0 0 24 24" style="flex:none;margin-top:2px"><circle cx="12" cy="12" r="11" fill="#4c9aff"/><rect x="10.8" y="10" width="2.4" height="8" rx="1.2" fill="#fff"/><circle cx="12" cy="6.8" r="1.5" fill="#fff"/></svg>
                    <span class="it"></span>
                </div>` : ""}
            </div>`;
        p.querySelector(".t").textContent = TITLE;
        const m = p.querySelector(".m");
        const span = t => {
            const s = document.createElement("span");
            s.textContent = t;
            s.style.cssText = `color:${COLOR_META} !important;-webkit-text-fill-color:${COLOR_META} !important`;
            return s;
        };
        META.forEach((t, i) => { if (i) m.append(span("•")); m.append(span(t)); });
        if (RARITY) {
            m.append(span("•"));
            const pill = document.createElement("span");
            pill.style.cssText = `display:inline-flex;align-items:center;gap:3px;padding:0 6px;border:1px solid ${RARITY_COLOR};border-radius:6px;background:${RARITY_COLOR}24;color:${RARITY_COLOR};font-size:11px;font-weight:700;line-height:16px;text-transform:uppercase;letter-spacing:.02em`;
            pill.textContent = "★ " + RARITY;
            m.append(pill);
        }
        p.querySelector(".cl").textContent = CARD_LABEL;
        p.querySelector(".cs").textContent = CARD_TEXT;
        if (INFO_TEXT) p.querySelector(".it").textContent = INFO_TEXT;
        return p;
    };

    const activate = (dlg, grid, ours) => {
        if (state) return true;
        const leftCol = getLeftCol(grid, dlg);
        const titleEl = findTitle(dlg, leftCol);
        if (!titleEl) return false;

        let root = titleEl;
        while (root.parentElement && root.parentElement !== dlg && !root.parentElement.contains(leftCol)) root = root.parentElement;
        const closeBtn = dlg.querySelector('[aria-label="Close" i], [aria-label*="close" i], [class*="closeButton"]');

        const changes = [];
        const setAttr = (el, name, val) => { changes.push([el, name, el.getAttribute(name)]); val == null ? el.removeAttribute(name) : el.setAttribute(name, val); };
        const addStyle = (el, css) => setAttr(el, "style", (el.getAttribute("style") || "") + ";" + css);

        const scopes = [...root.children].filter(el => !el.hasAttribute(FAKE));
        const S = readStyles(scopes, titleEl, root.clientWidth);

        let pad = "24px";
        for (let el = titleEl; el && el !== root.parentElement; el = el.parentElement) {
            const c = getComputedStyle(el);
            if (parseFloat(c.paddingLeft) >= 8) { pad = c.padding; break; }
        }
        const pane = buildPane(S, pad);

        if (getComputedStyle(root).position === "static") addStyle(root, "position:relative");
        scopes.forEach(el => addStyle(el, "visibility:hidden"));
        if (closeBtn) addStyle(closeBtn, "visibility:visible");
        root.appendChild(pane);

        const sel = findSelected(grid);
        const ref = sel && pickRef(grid, sel);
        let moved = false;
        if (sel && ref) {
            const a = els(sel), o = els(ours);
            for (const d of selDiff(sel, ref)) {
                setAttr(a[d.i], "class", d.off);
                if (d.i === 0 || o.length === a.length) { setAttr(o[d.i], "class", d.on); moved = true; }
            }
            for (const attr of ARIA_STATES) {
                if (sel.getAttribute(attr) === "true") { setAttr(sel, attr, "false"); setAttr(ours, attr, "true"); }
            }
        }
        if (!moved) addStyle(ours, "outline:2px solid var(--brand-500,#5865f2);outline-offset:-2px");

        state = { dlg, leftCol, pane, changes };
        return true;
    };

    const deactivate = () => {
        if (!state) return;
        state.pane.remove();
        for (const [el, name, v] of state.changes.reverse()) v == null ? el.removeAttribute(name) : el.setAttribute(name, v);
        state = null;
    };

    const makeWindowTile = (base, grid, dlg) => {
        const clone = base.cloneNode(true);
        const sel = findSelected(grid);
        if (sel === base) {
            const ref = pickRef(grid, sel);
            if (ref) { const o = els(clone); for (const d of selDiff(sel, ref)) o[d.i]?.setAttribute("class", d.off); }
        }
        for (const attr of ARIA_STATES)
            els(clone).forEach(e => { if (e.getAttribute(attr) === "true") e.setAttribute(attr, "false"); });
        clone.setAttribute("data-early-dev-tile", "window");
        clone.setAttribute(FAKE, "");
        swapImg(clone);
        swapTileIcon(clone, base);
        clone.style.cursor = "pointer";
        clone.addEventListener("click", e => { e.preventDefault(); e.stopPropagation(); activate(dlg, grid, clone); }, true);
        grid.insertBefore(clone, grid.children[INSERT_AT] ?? null);

        if (!dlg.__earlyDevHooked) {
            dlg.__earlyDevHooked = true;
            const fn = e => {
                if (!state || state.dlg !== dlg || e.target.closest("[data-early-dev-tile]")) return;
                if (state.leftCol.contains(e.target)) deactivate();
            };
            dlg.addEventListener("click", fn, true);
            hooks.push([dlg, fn]);
        }
        return clone;
    };

    const applyHidden = () => {
        document.querySelectorAll('[data-early-dev-tile="customize"], [data-early-dev-item]').forEach(t => {
            t.querySelectorAll("img").forEach(i => i.style.opacity = hiddenByUser ? "0.35" : "");
        });
        document.querySelectorAll("[data-early-dev]").forEach(n => n.style.display = hiddenByUser ? "none" : "");
    };

    const toggleHidden = e => {
        e.preventDefault(); e.stopPropagation();
        hiddenByUser = !hiddenByUser;
        applyHidden();
    };

    const makeCustomizeTile = (base, grid) => {
        const clone = base.cloneNode(true);
        clone.setAttribute("data-early-dev-tile", "customize");
        clone.setAttribute(FAKE, "");
        swapImg(clone);
        swapTileIcon(clone, base);
        clone.style.cursor = "pointer";
        clone.addEventListener("click", toggleHidden, true);
        grid.insertBefore(clone, grid.children[INSERT_AT] ?? null);
        applyHidden();
        return clone;
    };

    const preferImgTile = (grid, fallback) =>
        realTiles(grid).find(t => t.querySelector("img") && !t.querySelector("canvas")) || fallback;

    const seenIcons = new WeakSet();
    const knownGrids = new Map();
    const rowGrid = new WeakMap();

    const injectGrids = () => {
        if (state && !state.dlg.isConnected) state = null;

        const grids = new Map();
        for (const img of document.querySelectorAll(BADGE_IMG)) {
            if (img.closest(FAKE_SEL)) continue;
            const f = findTile(img);
            if (f && !grids.has(f.grid)) grids.set(f.grid, f.tile);
        }

        let names = null;
        for (const v of document.querySelectorAll("img, svg")) {
            if (seenIcons.has(v)) continue;
            const r = v.getBoundingClientRect();
            if (!r.width) continue;
            seenIcons.add(v);
            if (r.width < 14 || r.width > 56 || v.closest(FAKE_SEL) || v.parentElement?.closest("svg")) continue;
            const f = findTile(v instanceof SVGElement ? v.parentElement : v);
            if (!f) continue;
            names ??= badgeNames();
            if (hasBadgeHint(f.tile) || labelMatches(f.tile, names)) knownGrids.set(f.grid, f.tile);
        }
        for (const [g, t] of knownGrids) {
            if (!g.isConnected) knownGrids.delete(g);
            else if (!grids.has(g)) grids.set(g, preferImgTile(g, t));
        }

        const trusted = new Set();
        for (const ourBadge of document.querySelectorAll("[data-early-dev]")) {
            const row = ourBadge.parentElement;
            if (!row) continue;
            let g = rowGrid.get(row);
            if (!g?.isConnected) {
                g = null;
                const count = [...row.children].filter(c => !c.hasAttribute(FAKE)).length;
                names ??= badgeNames();
                const rowHost = row.closest(DLG_SEL);
                let scope = row;
                for (let i = 0; i < 14 && scope.parentElement && !g; i++) {
                    scope = scope.parentElement;
                    for (const v of scope.querySelectorAll("img, svg")) {
                        if (row.contains(v) || v.closest(FAKE_SEL) || v.parentElement?.closest("svg")) continue;
                        const r = v.getBoundingClientRect();
                        if (r.width < 14 || r.width > 56) continue;
                        const f = findTile(v instanceof SVGElement ? v.parentElement : v);
                        if (!f || realTiles(f.grid).length < 2) continue;
                        if (f.grid.closest(DLG_SEL) !== rowHost) continue;
                        if (Math.abs(realTiles(f.grid).length - count) <= 2 || hasBadgeProp(f.tile) || labelMatches(f.tile, names)) {
                            g = f.grid; break;
                        }
                    }
                }
                if (g) rowGrid.set(row, g);
            }
            if (g) {
                trusted.add(g);
                if (!grids.has(g)) grids.set(g, preferImgTile(g, realTiles(g)[0]));
            }
        }

        for (const root of document.querySelectorAll(DLG_SEL + ', [class*="modal"]')) {
            if (root.querySelector('img[src*="/avatars/"]')) continue;
            for (const v of root.querySelectorAll("img, svg")) {
                if (v.closest(FAKE_SEL) || v.parentElement?.closest("svg")) continue;
                const r = v.getBoundingClientRect();
                if (r.width < 14 || r.width > 56) continue;
                const f = findTile(v instanceof SVGElement ? v.parentElement : v);
                if (!f || grids.has(f.grid)) continue;
                if (!f.tile.querySelector(BADGE_IMG) && !hasBadgeProp(f.tile)) continue;
                grids.set(f.grid, preferImgTile(f.grid, f.tile));
            }
        }

        const ordered = [...grids].sort((a, b) =>
            a[0].compareDocumentPosition(b[0]) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1);

        const windowsDone = new Set();
        for (const [grid, tile] of ordered) {
            const dlg = dlgOf(grid);
            const isWindow = !trusted.has(grid) && !!dlg && !dlg.querySelector('img[src*="/avatars/"]');
            if (isWindow) {
                if (windowsDone.has(dlg)) continue;
                windowsDone.add(dlg);
            }

            let ours = grid.querySelector(":scope > [data-early-dev-tile]");
            if (!ours) {
                if (grid.querySelector(`img[src*="${ICON_HASH}"]`)) continue;
                if (!trusted.has(grid) && (isWindow ? !isMineModal(dlg, grid) : !isMine(grid))) continue;
                ours = isWindow ? makeWindowTile(tile, grid, dlg) : makeCustomizeTile(tile, grid);
            }

            if (isWindow && wantSelect && !state) {
                if (activate(dlg, grid, ours)) wantSelect = 0;
                else if (Date.now() - wantSelect < 4000) requestAnimationFrame(inject);
                else wantSelect = 0;
            }
        }
    };

    const injectLists = () => {
        const done = new Set();
        for (const img of document.querySelectorAll(BADGE_IMG)) {
            if (img.closest(FAKE_SEL)) continue;
            if (img.getBoundingClientRect().width > 48) continue;

            let item = img, container = null;
            for (let d = 0; d < 6 && item.parentElement; d++) {
                const p = item.parentElement;
                const twin = [...p.children].some(c => c !== item && c.tagName === item.tagName &&
                    cls(c) === cls(item) && c.querySelector(BADGE_IMG));
                if (twin) { container = p; break; }
                item = p;
            }
            if (!container || done.has(container)) continue;
            done.add(container);

            if (item.offsetWidth < 120) continue;
            if (container.querySelector(OURS_SEL) || container.querySelector(`img[src*="${ICON_HASH}"]`)) continue;
            const dlg = dlgOf(container);
            if (dlg ? !isMineModal(dlg, container) : !isMine(container)) continue;

            const clone = item.cloneNode(true);
            clone.setAttribute("data-early-dev-item", "");
            clone.setAttribute(FAKE, "");
            swapImg(clone);

            const texts = [];
            const w = document.createTreeWalker(clone, NodeFilter.SHOW_TEXT);
            while (w.nextNode()) if (w.currentNode.nodeValue.trim()) texts.push(w.currentNode);
            const name = (img.alt || img.getAttribute("aria-label") || "").trim().toLowerCase();
            let ti = texts.findIndex(t => name && t.nodeValue.trim().toLowerCase() === name);
            if (ti < 0) ti = 0;
            if (texts[ti]) texts[ti].nodeValue = TITLE;
            if (texts[ti + 1]) texts[ti + 1].nodeValue = SUBTITLE;

            clone.style.cursor = "pointer";
            clone.addEventListener("click", toggleHidden, true);

            container.insertBefore(clone, container.children[INSERT_AT] ?? null);
            applyHidden();
        }
    };

    const inject = () => {
        try { injectProfile(); } catch (e) { log("profile error", e); }
        try { injectGrids(); } catch (e) { log("grid error", e); }
        try { injectLists(); } catch (e) { log("list error", e); }
    };

    let queued = false;
    const obs = new MutationObserver(() => {
        if (queued) return;
        queued = true;
        requestAnimationFrame(() => { queued = false; inject(); });
    });
    obs.observe(document.body, { childList: true, subtree: true });
    inject();

    window.removeEarlyDevBadge = () => {
        onLeave();
        deactivate();
        obs.disconnect();
        tipObs.disconnect();
        hooks.forEach(([d, fn]) => { d.removeEventListener("click", fn, true); delete d.__earlyDevHooked; });
        document.querySelectorAll(OURS_SEL).forEach(n => n.remove());
        delete window.removeEarlyDevBadge;
    };
})();
