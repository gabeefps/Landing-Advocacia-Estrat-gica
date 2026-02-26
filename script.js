// ===== CONFIG (troque aqui) =====
const CONFIG = {
    wppNumber: "5510987654321", // DDI+DDD+NUMERO
    emailEndpoint: "send.php",
    googleReviewUrl: "https://g.page/r/SEU-CODIGO/review"
};

// ===== Helpers =====
const qs = (s, el = document) => el.querySelector(s);
const qsa = (s, el = document) => [...el.querySelectorAll(s)];

function buildWppText(data) {
    return `Olá! Gostaria de atendimento jurídico.

Nome: ${data.nome}
WhatsApp: ${data.telefone}
Tipo: ${data.tipo}
Assunto: ${data.assunto}

Resumo do caso:
${data.mensagem}`;
}

function openWpp(data) {
    const text = buildWppText(data);
    const url = `https://wa.me/${CONFIG.wppNumber}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener");
}

function setMsg(el, msg, ok = true) {
    el.textContent = msg;
    el.style.color = ok ? "inherit" : "crimson";
}

(function initTheme() {
    const saved = localStorage.getItem("theme");
    if (saved) {
        document.documentElement.setAttribute("data-theme", saved);
    }
    const btn = qs("#themeToggle");
    btn.addEventListener("click", () => {
        const current = document.documentElement.getAttribute("data-theme");
        const next = current === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", next);
        localStorage.setItem("theme", next);
    });
})();

(function initMobileMenu() {
    const burger = qs("#burger");
    const menu = qs("#mobileMenu");

    burger.addEventListener("click", () => {
        const expanded = burger.getAttribute("aria-expanded") === "true";
        burger.setAttribute("aria-expanded", String(!expanded));
        menu.setAttribute("aria-hidden", String(expanded));
    });

    qsa(".mobile__link").forEach(a => {
        a.addEventListener("click", () => {
            burger.setAttribute("aria-expanded", "false");
            menu.setAttribute("aria-hidden", "true");
        });
    });
})();

(function initReveal() {
    const els = qsa(".reveal");
    const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add("is-visible");
                io.unobserve(e.target);
            }
        });
    }, { threshold: 0.12 });
    els.forEach(el => io.observe(el));
})();

(function initActiveNav() {
    const links = qsa(".menu__link").filter(a => a.getAttribute("href").startsWith("#"));
    const sections = links
        .map(a => qs(a.getAttribute("href")))
        .filter(Boolean);

    if (!sections.length) return;

    const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                const id = `#${e.target.id}`;
                links.forEach(l => {
                    const active = l.getAttribute("href") === id;
                    l.style.borderColor = active ? "var(--border)" : "transparent";
                    l.style.opacity = active ? "1" : ".92";
                });
            }
        });
    }, { rootMargin: "-30% 0px -60% 0px", threshold: 0.01 });

    sections.forEach(s => io.observe(s));
})();

(function initWppButtons() {
    const float = qs("#wppFloat");
    const top = qs("#ctaWppTop");
    const mid = qs("#ctaWppMid");
    const defaultUrl = `https://wa.me/${CONFIG.wppNumber}`;

    [float, top, mid].forEach(btn => {
        if (!btn) return;
        btn.setAttribute("href", defaultUrl);
    });
})();

qs("#year").textContent = new Date().getFullYear();

(function initForm() {
    const form = qs("#leadForm");
    const msg = qs("#formMsg");
    const btnOnlyWpp = qs("#btnOnlyWpp");
    const btnSubmit = qs("#btnSubmit");

    function getData() {
        return {
            nome: qs("#nome").value.trim(),
            telefone: qs("#telefone").value.trim(),
            tipo: qs("#tipo").value,
            assunto: qs("#assunto").value,
            mensagem: qs("#mensagem").value.trim()
        };
    }

    function isValid(data) {
        if (!data.nome || data.nome.length < 3) return false;
        if (!data.telefone || data.telefone.length < 8) return false;
        if (!data.mensagem || data.mensagem.length < 10) return false;
        if (!qs("#consent").checked) return false;
        return true;
    }

    btnOnlyWpp.addEventListener("click", () => {
        const data = getData();
        if (!isValid(data)) {
            setMsg(msg, "Preencha nome, WhatsApp, resumo (mín. 10 caracteres) e marque a autorização (LGPD).", false);
            return;
        }
        openWpp(data);
    });

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const data = getData();

        if (!isValid(data)) {
            setMsg(msg, "Preencha nome, WhatsApp, resumo (mín. 10 caracteres) e marque a autorização (LGPD).", false);
            return;
        }

        openWpp(data);

        btnSubmit.disabled = true;
        setMsg(msg, "Enviando seus dados para o escritório…");

        try {
            const res = await fetch(CONFIG.emailEndpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            const json = await res.json().catch(() => ({ ok: false }));

            if (res.ok && json.ok) {
                setMsg(msg, "Recebido! Também registramos seu pedido por e-mail. ✅");
                form.reset();
            } else {
                setMsg(msg, "WhatsApp aberto ✅. Falha ao enviar por e-mail (verifique configuração do servidor).", false);
            }
        } catch (err) {
            setMsg(msg, "WhatsApp aberto ✅. Falha ao enviar por e-mail (endpoint indisponível).", false);
        } finally {
            btnSubmit.disabled = false;
        }
    });
})();