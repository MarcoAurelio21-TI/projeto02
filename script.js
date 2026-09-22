/* ============================================================
   MEUS POEMAS — SCRIPT PRINCIPAL
   Autor: Marco Aurélio
   Estrutura:
     1. Modo escuro
     2. Botão voltar ao topo
     3. Poema aleatório
     4. Menu lateral
     5. Reveal on scroll
     6. Favoritos
     7. Tempo de leitura
     8. Copiar poema
     9. Compartilhar
    10. Busca
    11. Filtros
    12. Idioma
    13. Modo foco
    14. Partículas do hero
    15. Cursor dourado
    16. Poema do dia
    17. Fundo estrelado
    18. Galeria (lightbox)
    19. Easter egg
    20. Leitura em voz alta
    21. Anotações pessoais
    22. Barra de progresso
    23. Frase do dia
    24. Playlist de favoritos
    25. Fundo suave de partículas
    26. Contador de visitas
   ============================================================ */

/* ============================================================
   1. MODO ESCURO
   ============================================================ */
const btnTema = document.getElementById('btn-tema');
if (localStorage.getItem('tema') === 'escuro') {
    document.body.classList.add('dark-mode');
    if (btnTema) btnTema.textContent = '☀️';
}
if (btnTema) {
    btnTema.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const ativo = document.body.classList.contains('dark-mode');
        btnTema.textContent = ativo ? '☀️' : '🌙';
        localStorage.setItem('tema', ativo ? 'escuro' : 'claro');
        atualizarFundoEstrelado();
    });
}

/* ============================================================
   2. BOTÃO VOLTAR AO TOPO
   ============================================================ */
const btnTopo = document.getElementById('btn-topo');
if (btnTopo) {
    window.addEventListener('scroll', () =>
        btnTopo.classList.toggle('visivel', window.scrollY > 400)
    );
    btnTopo.addEventListener('click', () =>
        window.scrollTo({ top: 0, behavior: 'smooth' })
    );
}

/* ============================================================
   3. POEMA ALEATÓRIO
   ============================================================ */
const btnAleatorio = document.getElementById('btn-aleatorio');
if (btnAleatorio) {
    btnAleatorio.addEventListener('click', () => {
        const path = window.location.pathname;
        let prefixo;
        if (path.includes('/pages/poemas/')) prefixo = '';
        else if (path.includes('/pages/')) prefixo = 'poemas/';
        else prefixo = 'pages/poemas/';
        const poemas = Array.from({ length: 31 }, (_, i) => `${prefixo}poema${i + 1}.html`);
        window.location.href = poemas[Math.floor(Math.random() * poemas.length)];
    });
}

/* ============================================================
   4. MENU LATERAL
   ============================================================ */
const btnMenu = document.getElementById('btn-menu');
const navLista = document.querySelector('nav ul');
const overlay = document.createElement('div');
overlay.className = 'menu-overlay';
document.body.appendChild(overlay);

if (btnMenu && navLista) {
    const fecharMenu = () => {
        navLista.classList.remove('aberto');
        overlay.classList.remove('ativo');
        btnMenu.classList.remove('ativo');
        document.body.style.overflow = '';
    };

    btnMenu.addEventListener('click', () => {
        navLista.classList.toggle('aberto');
        overlay.classList.toggle('ativo');
        btnMenu.classList.toggle('ativo');
        document.body.style.overflow = navLista.classList.contains('aberto') ? 'hidden' : '';
    });

    overlay.addEventListener('click', fecharMenu);

    navLista.querySelectorAll('a').forEach(link =>
        link.addEventListener('click', fecharMenu)
    );

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navLista.classList.contains('aberto')) fecharMenu();
    });
}

/* ============================================================
   5. REVEAL ON SCROLL (com cascata e desfoque)
   ============================================================ */
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add('aos-animate'), i * 80);
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.08, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('[data-aos]').forEach(el => observer.observe(el));

/* ============================================================
   6. FAVORITOS
   ============================================================ */
function getFavoritos() {
    return JSON.parse(localStorage.getItem('favoritos') || '[]');
}
function setFavoritos(lista) {
    localStorage.setItem('favoritos', JSON.stringify(lista));
}
function atualizarBotoesFavorito() {
    const favs = getFavoritos();
    document.querySelectorAll('.btn-favoritar').forEach(btn => {
        const ativo = favs.includes(btn.dataset.id);
        btn.classList.toggle('ativo', ativo);
        btn.textContent = ativo ? '❤️ Favoritado' : '🤍 Favoritar';
    });
}
document.querySelectorAll('.btn-favoritar').forEach(btn => {
    btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const favs = getFavoritos();
        const idx = favs.indexOf(id);
        if (idx >= 0) favs.splice(idx, 1);
        else favs.push(id);
        setFavoritos(favs);
        atualizarBotoesFavorito();

        // Feedback visual de pulso
        btn.classList.add('pulso');
        setTimeout(() => btn.classList.remove('pulso'), 500);

        if (window.location.pathname.includes('favoritos.html')) {
            setTimeout(() => location.reload(), 400);
        }
    });
});
atualizarBotoesFavorito();

/* ============================================================
   7. TEMPO DE LEITURA
   ============================================================ */
document.querySelectorAll('.tempo-leitura').forEach(el => {
    const palavras = (el.dataset.texto || '').trim().split(/\s+/).length;
    el.textContent = `⏱️ ${Math.max(1, Math.ceil(palavras / 200))} min de leitura`;
});

/* ============================================================
   8. COPIAR
   ============================================================ */
document.querySelectorAll('.btn-copiar').forEach(btn => {
    btn.addEventListener('click', async () => {
        const texto = `${document.querySelector('h1')?.textContent}\n\n${btn.dataset.texto}\n\n— Marco Aurélio`;
        try {
            await navigator.clipboard.writeText(texto);
            const orig = btn.textContent;
            btn.textContent = '✓ Copiado!';
            setTimeout(() => btn.textContent = orig, 2000);
        } catch {
            alert('Não foi possível copiar.');
        }
    });
});

/* ============================================================
   9. COMPARTILHAR
   ============================================================ */
document.querySelectorAll('.btn-share').forEach(btn => {
    btn.addEventListener('click', async () => {
        const titulo = document.querySelector('h1')?.textContent || 'Meus Poemas';
        const url = window.location.href;
        if (navigator.share) {
            try { await navigator.share({ title: titulo, url }); } catch {}
        } else {
            try {
                await navigator.clipboard.writeText(url);
                const orig = btn.textContent;
                btn.textContent = '✓ Link copiado!';
                setTimeout(() => btn.textContent = orig, 2000);
            } catch {
                alert('Copie o link: ' + url);
            }
        }
    });
});

/* ============================================================
   10. BUSCA
   ============================================================ */
const campoBusca = document.getElementById('campo-busca');
if (campoBusca) {
    campoBusca.addEventListener('input', (e) => {
        const termo = e.target.value.toLowerCase();
        document.querySelectorAll('.card-poema').forEach(card => {
            card.style.display = card.textContent.toLowerCase().includes(termo) ? '' : 'none';
        });
    });
}

/* ============================================================
   11. FILTROS
   ============================================================ */
const botoesFiltro = document.querySelectorAll('.filtro-btn');
const todosOsCards = document.querySelectorAll('.card-poema');

if (botoesFiltro.length > 0) {
    botoesFiltro.forEach(btn => {
        btn.addEventListener('click', () => {
            botoesFiltro.forEach(b => b.classList.remove('ativo'));
            btn.classList.add('ativo');
            const filtro = btn.dataset.filtro;

            todosOsCards.forEach((card, i) => {
                const tema = card.dataset.tema || '';
                const mostrar = (filtro === 'todos' || tema === filtro);

                if (mostrar) {
                    card.style.display = '';
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(25px) scale(0.96)';
                    setTimeout(() => {
                        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0) scale(1)';
                    }, i * 40);
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

/* ============================================================
   12. IDIOMA
   ============================================================ */
const btnIdioma = document.getElementById('btn-idioma');
if (btnIdioma) {
    const idiomas = ['pt', 'en', 'es'];
    const labels = { pt: 'PT', en: 'EN', es: 'ES' };
    let idioma = localStorage.getItem('idioma') || 'pt';
    if (!idiomas.includes(idioma)) idioma = 'pt';

    const aplicar = (lang) => {
        document.querySelectorAll('[data-pt]').forEach(el => {
            const traducao = el.dataset[lang];
            if (traducao) el.innerHTML = traducao;
        });
        btnIdioma.textContent = labels[lang];
        document.documentElement.lang = lang === 'pt' ? 'pt-BR' : lang;
    };
    aplicar(idioma);
    btnIdioma.addEventListener('click', () => {
        const idx = idiomas.indexOf(idioma);
        idioma = idiomas[(idx + 1) % idiomas.length];
        localStorage.setItem('idioma', idioma);
        aplicar(idioma);
    });
}

/* ============================================================
   13. MODO FOCO
   ============================================================ */
const btnFoco = document.getElementById('btn-foco');
if (btnFoco) {
    btnFoco.addEventListener('click', () => {
        document.body.classList.toggle('modo-foco');
        btnFoco.textContent = document.body.classList.contains('modo-foco')
            ? '✕ Sair do foco'
            : '📖 Modo Foco';
    });
}

/* ============================================================
   14. PARTÍCULAS DO HERO
   ============================================================ */
const canvas = document.getElementById('particulas');
if (canvas) {
    const ctx = canvas.getContext('2d');
    let p = [];
    const resize = () => {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 60; i++) {
        p.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: Math.random() * 2 + 0.5,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            a: Math.random() * 0.5 + 0.2
        });
    }

    (function animar() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        p.forEach(q => {
            q.x += q.vx;
            q.y += q.vy;
            if (q.x < 0 || q.x > canvas.width) q.vx *= -1;
            if (q.y < 0 || q.y > canvas.height) q.vy *= -1;
            ctx.beginPath();
            ctx.arc(q.x, q.y, q.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(201, 169, 97, ${q.a})`;
            ctx.fill();
        });
        requestAnimationFrame(animar);
    })();
}

/* ============================================================
   15. CURSOR DOURADO
   ============================================================ */
const canvasCursor = document.getElementById('cursor-particulas');
if (canvasCursor && window.innerWidth > 700) {
    const ctxC = canvasCursor.getContext('2d');
    let particulasC = [];
    const resizeC = () => {
        canvasCursor.width = window.innerWidth;
        canvasCursor.height = window.innerHeight;
    };
    resizeC();
    window.addEventListener('resize', resizeC);

    const cores = [
        'rgba(201,169,97,',
        'rgba(224,200,144,',
        'rgba(255,215,120,',
        'rgba(230,200,170,'
    ];
    let ultimoX = 0, ultimoY = 0;

    document.addEventListener('mousemove', (e) => {
        const dist = Math.hypot(e.clientX - ultimoX, e.clientY - ultimoY);
        if (dist > 4) {
            const qtd = Math.min(3, Math.floor(dist / 8) + 1);
            for (let i = 0; i < qtd; i++) criar(e.clientX, e.clientY);
            ultimoX = e.clientX;
            ultimoY = e.clientY;
        }
    });

    function criar(x, y) {
        particulasC.push({
            x: x + (Math.random() - 0.5) * 8,
            y: y + (Math.random() - 0.5) * 8,
            vx: (Math.random() - 0.5) * 1.2,
            vy: (Math.random() - 0.5) * 1.2,
            raio: Math.random() * 3 + 1,
            alpha: 1,
            cor: cores[Math.floor(Math.random() * cores.length)],
            decaimento: Math.random() * 0.015 + 0.015
        });
    }

    (function animarCursor() {
        ctxC.clearRect(0, 0, canvasCursor.width, canvasCursor.height);
        for (let i = particulasC.length - 1; i >= 0; i--) {
            const q = particulasC[i];
            q.x += q.vx;
            q.y += q.vy;
            q.vx *= 0.98;
            q.vy *= 0.98;
            q.alpha -= q.decaimento;
            q.raio *= 0.98;
            if (q.alpha <= 0.01 || q.raio < 0.1) {
                particulasC.splice(i, 1);
                continue;
            }
            ctxC.beginPath();
            ctxC.arc(q.x, q.y, q.raio, 0, Math.PI * 2);
            ctxC.fillStyle = `${q.cor}${q.alpha})`;
            ctxC.shadowBlur = 12;
            ctxC.shadowColor = `${q.cor}${q.alpha})`;
            ctxC.fill();
        }
        ctxC.shadowBlur = 0;
        requestAnimationFrame(animarCursor);
    })();
}

/* ============================================================
   16. POEMA DO DIA
   ============================================================ */
const poemaDoDiaEl = document.getElementById('poema-do-dia');
if (poemaDoDiaEl) {
    const poemas = [
        { titulo: 'O Recomeço Silencioso', link: 'pages/poemas/poema1.html', verso: 'A grama não apressa o seu verde na terra escura.' },
        { titulo: 'O Espelho Amigo', link: 'pages/poemas/poema2.html', verso: 'Solte as pedras pesadas que você carrega nas mãos.' },
        { titulo: 'A Casa Interna', link: 'pages/poemas/poema3.html', verso: 'No centro exato do seu peito existe uma casa antiga.' },
        { titulo: 'O Valor do Invisível', link: 'pages/poemas/poema4.html', verso: 'Há um pequeno milagre no café recém-passado.' },
        { titulo: 'A Teia Humana', link: 'pages/poemas/poema5.html', verso: 'Cada pessoa carrega um peso invisível.' },
        { titulo: 'O Silêncio das Coisas', link: 'pages/poemas/poema6.html', verso: 'O silêncio das coisas é uma lição antiga.' },
        { titulo: 'O Que Fica Depois da Chuva', link: 'pages/poemas/poema7.html', verso: 'Depois que a chuva passa, o mundo fica mais verde.' },
        { titulo: 'Cartas Que Não Enviei', link: 'pages/poemas/poema8.html', verso: 'Escrevi cartas que nunca cheguei a enviar.' },
        { titulo: 'O Ofício de Esperar', link: 'pages/poemas/poema9.html', verso: 'Esperar não é ficar parado no mesmo lugar.' },
        { titulo: 'A Coragem de Ficar', link: 'pages/poemas/poema10.html', verso: 'A coragem de ficar é feita de pequenas coisas.' },
        { titulo: 'A Casa Que Habito', link: 'pages/poemas/poema11.html', verso: 'Dentro de mim existe uma casa antiga.' },
        { titulo: 'Oração dos Dias Comuns', link: 'pages/poemas/poema12.html', verso: 'Obrigado pelo pão que amanhece na mesa.' },
        { titulo: 'Mapa de Cicatrizes', link: 'pages/poemas/poema13.html', verso: 'Meu corpo é um mapa de cicatrizes antigas.' },
        { titulo: 'A Arte de Dizer Adeus', link: 'pages/poemas/poema14.html', verso: 'Dizer adeus é uma arte que ninguém ensina.' },
        { titulo: 'O Que Aprendi com o Tempo', link: 'pages/poemas/poema15.html', verso: 'Aprendi que a pressa não resolve nada.' },
        { titulo: 'O Quarto Escuro', link: 'pages/poemas/poema16.html', verso: 'Há dias em que o mundo perde a cor.' },
        { titulo: 'A Ansiedade às Três da Manhã', link: 'pages/poemas/poema17.html', verso: 'São três da manhã e o cérebro não desliga.' },
        { titulo: 'Oração Simples', link: 'pages/poemas/poema18.html', verso: 'Não sei rezar como os santos rezam.' },
        { titulo: 'Fé de Grão de Mostarda', link: 'pages/poemas/poema19.html', verso: 'Não tenho a fé que move montanhas.' },
        { titulo: 'O Silêncio das Praças', link: 'pages/poemas/poema20.html', verso: 'Vi um povo cansado nas praças da cidade.' },
        { titulo: 'A Cidade que Não Dorme', link: 'pages/poemas/poema21.html', verso: 'A cidade que não dorme também não sonha.' },
        { titulo: 'Amor em Tempos de Pressa', link: 'pages/poemas/poema22.html', verso: 'Ninguém mais sabe amar devagar.' },
        { titulo: 'Fim de Amor', link: 'pages/poemas/poema23.html', verso: 'O fim de amor não faz barulho.' },
        { titulo: 'Amanhã é Outro Dia', link: 'pages/poemas/poema24.html', verso: 'Se hoje o mundo caiu sobre a sua cabeça.' },
        { titulo: 'Raízes', link: 'pages/poemas/poema25.html', verso: 'Mesmo que cortem o tronco.' },
        { titulo: 'O Último Rio', link: 'pages/poemas/poema26.html', verso: 'O rio que passava na minha rua.' },
        { titulo: 'Amigo de Verdade', link: 'pages/poemas/poema27.html', verso: 'Amigo de verdade não é quem só aparece.' },
        { titulo: 'Solidão', link: 'pages/poemas/poema28.html', verso: 'Solidão não é estar sozinho.' },
        { titulo: 'Geração Conectada', link: 'pages/poemas/poema29.html', verso: 'Estamos todos conectados.' },
        { titulo: 'Despedida', link: 'pages/poemas/poema30.html', verso: 'Não teve tempo pra despedida.' },
        { titulo: 'O Sonho Não Morreu', link: 'pages/poemas/poema31.html', verso: 'Disseram que era impossível.' }
    ];
    const hoje = new Date();
    const inicioAno = new Date(hoje.getFullYear(), 0, 0);
    const diaDoAno = Math.floor((hoje - inicioAno) / (1000 * 60 * 60 * 24));
    const escolhido = poemas[diaDoAno % poemas.length];

    poemaDoDiaEl.innerHTML = `
        <p class="poema-do-dia-label">✨ Poema do Dia</p>
        <h3>${escolhido.titulo}</h3>
        <p class="poema-do-dia-verso">"${escolhido.verso}"</p>
        <a href="${escolhido.link}" class="btn-nav">Ler agora →</a>
    `;
}

/* ============================================================
   17. FUNDO ESTRELADO
   ============================================================ */
const canvasEstrelas = document.getElementById('estrelas');
if (canvasEstrelas) {
    const ctxE = canvasEstrelas.getContext('2d');
    let estrelas = [];
    const resizeE = () => {
        canvasEstrelas.width = window.innerWidth;
        canvasEstrelas.height = window.innerHeight;
    };
    resizeE();
    window.addEventListener('resize', resizeE);

    for (let i = 0; i < 80; i++) {
        estrelas.push({
            x: Math.random() * canvasEstrelas.width,
            y: Math.random() * canvasEstrelas.height,
            r: Math.random() * 1.5 + 0.3,
            a: Math.random(),
            da: (Math.random() * 0.02) + 0.005
        });
    }

    (function animarEstrelas() {
        if (!document.body.classList.contains('dark-mode')) {
            ctxE.clearRect(0, 0, canvasEstrelas.width, canvasEstrelas.height);
            requestAnimationFrame(animarEstrelas);
            return;
        }
        ctxE.clearRect(0, 0, canvasEstrelas.width, canvasEstrelas.height);
        estrelas.forEach(e => {
            e.a += e.da;
            if (e.a > 1 || e.a < 0) e.da *= -1;
            ctxE.beginPath();
            ctxE.arc(e.x, e.y, e.r, 0, Math.PI * 2);
            ctxE.fillStyle = `rgba(255, 255, 255, ${e.a})`;
            ctxE.fill();
        });
        requestAnimationFrame(animarEstrelas);
    })();
}

function atualizarFundoEstrelado() {
    const c = document.getElementById('estrelas');
    if (c) c.style.display = document.body.classList.contains('dark-mode') ? 'block' : 'none';
}
atualizarFundoEstrelado();

/* ============================================================
   18. GALERIA (lightbox)
   ============================================================ */
document.querySelectorAll('.galeria-item').forEach(item => {
    item.addEventListener('click', () => {
        const modal = document.createElement('div');
        modal.className = 'lightbox';
        modal.innerHTML = `<span class="lightbox-fechar">✕</span><img src="${item.querySelector('img').src}" alt="">`;
        document.body.appendChild(modal);
        modal.addEventListener('click', () => modal.remove());
    });
});

/* ============================================================
   19. EASTER EGG
   ============================================================ */
let cliquesLogo = 0;
const logoEl = document.querySelector('nav .logo');
if (logoEl) {
    logoEl.addEventListener('click', () => {
        cliquesLogo++;
        if (cliquesLogo === 5) {
            cliquesLogo = 0;
            const surpresa = document.createElement('div');
            surpresa.className = 'easter-egg';
            surpresa.innerHTML = `
                <div class="easter-egg-conteudo">
                    <h2>✨ Surpresa Poética</h2>
                    <p>"Escrever é uma forma de existir duas vezes."</p>
                    <p class="easter-egg-autor">— Marco Aurélio</p>
                    <button class="btn-nav" onclick="this.closest('.easter-egg').remove()">Fechar</button>
                </div>
            `;
            document.body.appendChild(surpresa);
        }
    });
}

/* ============================================================
   20. LEITURA EM VOZ ALTA
   ============================================================ */
const btnVoz = document.getElementById('btn-voz');
if (btnVoz && 'speechSynthesis' in window) {
    let falando = false;

    btnVoz.addEventListener('click', () => {
        if (falando) {
            speechSynthesis.cancel();
            falando = false;
            btnVoz.textContent = '🔊 Ouvir Poema';
            btnVoz.classList.remove('ativo');
            return;
        }

        const titulo = document.querySelector('h1')?.textContent || '';
        const versos = document.querySelector('.versos')?.innerText || '';
        const texto = `${titulo}. ${versos}`;

        const utterance = new SpeechSynthesisUtterance(texto);
        utterance.lang = 'pt-BR';
        utterance.rate = 0.85;
        utterance.pitch = 1;
        utterance.volume = 1;

        const vozes = speechSynthesis.getVoices();
        const vozPT = vozes.find(v => v.lang.startsWith('pt'));
        if (vozPT) utterance.voice = vozPT;

        utterance.onend = () => {
            falando = false;
            btnVoz.textContent = '🔊 Ouvir Poema';
            btnVoz.classList.remove('ativo');
        };

        speechSynthesis.speak(utterance);
        falando = true;
        btnVoz.textContent = '⏸️ Parar Leitura';
        btnVoz.classList.add('ativo');
    });
} else if (btnVoz) {
    btnVoz.style.display = 'none';
}

/* ============================================================
   21. ANOTAÇÕES PESSOAIS
   ============================================================ */
const btnAnotar = document.getElementById('btn-anotar');
const painelAnotacao = document.getElementById('painel-anotacao');
if (btnAnotar && painelAnotacao) {
    const idPoema = document.querySelector('.btn-favoritar')?.dataset.id || 'geral';
    const chave = `anotacao_${idPoema}`;
    const textarea = painelAnotacao.querySelector('textarea');
    const btnSalvar = painelAnotacao.querySelector('.btn-salvar-anotacao');
    const btnFechar = painelAnotacao.querySelector('.btn-fechar-anotacao');

    textarea.value = localStorage.getItem(chave) || '';

    btnAnotar.addEventListener('click', () => painelAnotacao.classList.toggle('aberto'));
    btnFechar.addEventListener('click', () => painelAnotacao.classList.remove('aberto'));

    btnSalvar.addEventListener('click', () => {
        localStorage.setItem(chave, textarea.value);
        btnSalvar.textContent = '✓ Salvo!';
        setTimeout(() => {
            btnSalvar.textContent = '💾 Salvar anotação';
            painelAnotacao.classList.remove('aberto');
        }, 1200);
    });
}

/* ============================================================
   22. BARRA DE PROGRESSO DE LEITURA
   ============================================================ */
if (document.querySelector('.poema-conteudo')) {
    const barra = document.createElement('div');
    barra.className = 'barra-progresso';
    document.body.appendChild(barra);

    window.addEventListener('scroll', () => {
        const altura = document.documentElement.scrollHeight - window.innerHeight;
        const progresso = (window.scrollY / altura) * 100;
        barra.style.width = progresso + '%';
    });
}

/* ============================================================
   23. FRASE DO DIA
   ============================================================ */
const fraseDiaEl = document.getElementById('frase-do-dia');
if (fraseDiaEl) {
    const frases = [
        'A vida acontece nos intervalos — entre uma respiração e outra.',
        'Ninguém precisa entender a sua jornada para que ela seja válida.',
        'Existe uma beleza silenciosa em quem escolhe ficar quando poderia partir.',
        'O tempo não cura tudo, mas ensina a conviver com o que dói.',
        'Ser gentil consigo mesmo é o primeiro passo de qualquer recomeço.',
        'Nem toda tempestade vem para destruir — algumas vêm para limpar.',
        'Escrever é a forma mais honesta de conversar com o próprio silêncio.',
        'A vida, afinal, é abundante e lenta.',
        'O que é seu vai chegar — no dia exato, na hora certa.',
        'Recomeçar é uma arte que só quem já caiu sabe praticar.'
    ];
    const hoje = new Date();
    const inicioAno = new Date(hoje.getFullYear(), 0, 0);
    const diaDoAno = Math.floor((hoje - inicioAno) / (1000 * 60 * 60 * 24));
    const frase = frases[diaDoAno % frases.length];

    fraseDiaEl.innerHTML = `
        <p class="frase-do-dia-label">✨ Frase do Dia</p>
        <p class="frase-do-dia-texto">"${frase}"</p>
        <p class="frase-do-dia-autor">— Marco Aurélio</p>
        <button class="btn-baixar-frase" id="btn-baixar-frase">📥 Baixar como imagem</button>
    `;

    const btnBaixar = document.getElementById('btn-baixar-frase');
    btnBaixar.addEventListener('click', () => {
        const canvasF = document.createElement('canvas');
        canvasF.width = 1080;
        canvasF.height = 1080;
        const ctxF = canvasF.getContext('2d');

        const grad = ctxF.createLinearGradient(0, 0, 1080, 1080);
        grad.addColorStop(0, '#1c2f52');
        grad.addColorStop(1, '#0f1d38');
        ctxF.fillStyle = grad;
        ctxF.fillRect(0, 0, 1080, 1080);

        ctxF.strokeStyle = '#c9a961';
        ctxF.lineWidth = 4;
        ctxF.strokeRect(40, 40, 1000, 1000);

        ctxF.fillStyle = '#f0e8d8';
        ctxF.font = 'italic 48px "Cormorant Garamond", Georgia, serif';
        ctxF.textAlign = 'center';
        ctxF.textBaseline = 'middle';

        const palavras = frase.split(' ');
        const linhas = [];
        let linha = '';
        palavras.forEach(p => {
            const teste = linha + p + ' ';
            if (ctxF.measureText(teste).width > 800) {
                linhas.push(linha.trim());
                linha = p + ' ';
            } else {
                linha = teste;
            }
        });
        linhas.push(linha.trim());

        const alturaTotal = linhas.length * 70;
        linhas.forEach((l, i) => {
            ctxF.fillText(l, 540, 540 - alturaTotal / 2 + i * 70 + 35);
        });

        ctxF.fillStyle = '#c9a961';
        ctxF.font = 'italic 36px "Cormorant Garamond", Georgia, serif';
        ctxF.fillText('— Marco Aurélio', 540, 800);

        const link = document.createElement('a');
        link.download = 'frase-do-dia.png';
        link.href = canvasF.toDataURL('image/png');
        link.click();
    });
}

/* ============================================================
   24. PLAYLIST DE FAVORITOS
   ============================================================ */
const btnPlaylist = document.getElementById('btn-playlist');
if (btnPlaylist && 'speechSynthesis' in window) {
    let tocando = false;

    btnPlaylist.addEventListener('click', async () => {
        if (tocando) {
            speechSynthesis.cancel();
            tocando = false;
            btnPlaylist.textContent = '🎧 Ouvir playlist de favoritos';
            btnPlaylist.classList.remove('ativo');
            return;
        }

        const favs = JSON.parse(localStorage.getItem('favoritos') || '[]');
        if (favs.length === 0) {
            alert('Você ainda não tem poemas favoritos. 💔\nFavorite alguns poemas primeiro!');
            return;
        }

        tocando = true;
        btnPlaylist.textContent = '⏸️ Parar playlist';
        btnPlaylist.classList.add('ativo');

        for (let i = 0; i < favs.length; i++) {
            if (!tocando) break;
            const id = favs[i];
            try {
                const resp = await fetch(`poemas/${id}.html`);
                const html = await resp.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const titulo = doc.querySelector('h1')?.textContent || '';
                const versos = doc.querySelector('.versos')?.innerText || '';
                const texto = `Poema ${i + 1} de ${favs.length}. ${titulo}. ${versos}`;

                await new Promise(resolve => {
                    const u = new SpeechSynthesisUtterance(texto);
                    u.lang = 'pt-BR';
                    u.rate = 0.85;
                    const vozPT = speechSynthesis.getVoices().find(v => v.lang.startsWith('pt'));
                    if (vozPT) u.voice = vozPT;
                    u.onend = resolve;
                    speechSynthesis.speak(u);
                });

                await new Promise(r => setTimeout(r, 1000));
            } catch (e) {
                console.warn('Não foi possível carregar', id);
            }
        }

        tocando = false;
        btnPlaylist.textContent = '🎧 Ouvir playlist de favoritos';
        btnPlaylist.classList.remove('ativo');
    });
}

/* ============================================================
   25. FUNDO SUAVE DE PARTÍCULAS
   ============================================================ */
const canvasFundo = document.getElementById('fundo-suave');
if (canvasFundo) {
    const ctxF = canvasFundo.getContext('2d');
    let particulasF = [];
    const resizeF = () => {
        canvasFundo.width = window.innerWidth;
        canvasFundo.height = window.innerHeight;
    };
    resizeF();
    window.addEventListener('resize', resizeF);

    for (let i = 0; i < 30; i++) {
        particulasF.push({
            x: Math.random() * canvasFundo.width,
            y: Math.random() * canvasFundo.height,
            r: Math.random() * 2.5 + 0.8,
            vx: (Math.random() - 0.5) * 0.15,
            vy: (Math.random() - 0.5) * 0.15,
            a: Math.random() * 0.3 + 0.1,
            cor: Math.random() > 0.5 ? '201, 169, 97' : '224, 200, 144'
        });
    }

    (function animarFundo() {
        ctxF.clearRect(0, 0, canvasFundo.width, canvasFundo.height);
        particulasF.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0 || p.x > canvasFundo.width) p.vx *= -1;
            if (p.y < 0 || p.y > canvasFundo.height) p.vy *= -1;

            ctxF.beginPath();
            ctxF.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctxF.fillStyle = `rgba(${p.cor}, ${p.a})`;
            ctxF.shadowBlur = 8;
            ctxF.shadowColor = `rgba(${p.cor}, ${p.a})`;
            ctxF.fill();
        });
        ctxF.shadowBlur = 0;
        requestAnimationFrame(animarFundo);
    })();
}

/* ============================================================
   26. CONTADOR DE VISITAS (local)
   ============================================================ */
const contadorVisitas = document.getElementById('contador-visitas');
if (contadorVisitas) {
    const idPoema = document.querySelector('.btn-favoritar')?.dataset.id || 'geral';
    const chave = `visitas_${idPoema}`;
    let visitas = parseInt(localStorage.getItem(chave) || '0', 10);
    visitas++;
    localStorage.setItem(chave, visitas);
    contadorVisitas.textContent = `👁️ ${visitas} visualizações`;
}