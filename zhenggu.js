// ===== zhenggu.js：整蛊页面逻辑 =====
// 点击任何按钮播放一次「抢铁U彩.mp3」；累计点击 5 次跳转 B 站视频；「重新检测」双击返回主页面
const audio = new Audio('抢铁U彩.mp3');
audio.preload = 'auto';

const TARGET_COUNT = 5;
const BILI_URL = 'https://www.bilibili.com/video/BV1UT42167xb/?share_source=copy_web&vd_source=74be11979b14d26ab745ca3bf95f5f71';
let clickCount = 0;

function playAudio() {
    audio.currentTime = 0;
    const p = audio.play();
    if (p && p.catch) p.catch(() => {});
}

// 「重新检测」：300ms 内第二次点击视为双击 → 返回主页面并提示
let retestTimer = null;
function handleRetest() {
    if (retestTimer) {
        clearTimeout(retestTimer);
        retestTimer = null;
        location.href = 'index.html?back=1';
        return;
    }
    retestTimer = setTimeout(() => {
        retestTimer = null;
        playAudio();
    }, 300);
}

document.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();

    // 任何按钮点击都累计，达到 5 次跳转 B 站
    clickCount++;
    if (clickCount >= TARGET_COUNT) {
        location.href = BILI_URL;
        return;
    }

    if (btn.classList.contains('btn-retest')) {
        handleRetest();
    } else {
        playAudio();
    }
});

// IPv6 检测照常显示（与正常页面外观一致）
const resZh = document.getElementById("resZh");
const resEn = document.getElementById("resEn");
const res4Zh = document.getElementById("res4Zh");
const res4En = document.getElementById("res4En");

// IPv6：ipify IPv6 接口（支持 CORS）
fetch("https://api6.ipify.org?format=json", { signal: AbortSignal.timeout(4500) })
    .then(r => r.json())
    .then(d => {
        resZh.innerHTML = `<span class="ok">✅ IPv6 连通正常<br>你的IPv6：${d.ip}</span>`;
        resEn.innerHTML = `<span class="ok">✅ IPv6 Connected Successfully<br>Your IPv6: ${d.ip}</span>`;
    })
    .catch(() => {
        resZh.innerHTML = `<span class="fail">❌ 当前没有可用 IPv6 网络</span>`;
        resEn.innerHTML = `<span class="fail">❌ No available IPv6 network detected</span>`;
    });

// IPv4：优先 ipinfo.io（支持 CORS），失败自动换备用接口
(function detectIPv4() {
    const endpoints = ['https://ipinfo.io/ip', 'https://checkip.amazonaws.com'];
    let i = 0;

    function ok4(ip) {
        res4Zh.innerHTML = `<span class="ok">✅ IPv4 连通正常<br>你的IPv4：${ip}</span>`;
        res4En.innerHTML = `<span class="ok">✅ IPv4 Connected Successfully<br>Your IPv4: ${ip}</span>`;
    }
    function fail4() {
        res4Zh.innerHTML = `<span class="fail">❌ 当前没有可用 IPv4 网络</span>`;
        res4En.innerHTML = `<span class="fail">❌ No available IPv4 network detected</span>`;
    }
    function tryNext() {
        if (i >= endpoints.length) { fail4(); return; }
        const url = endpoints[i++];
        fetch(url, { signal: AbortSignal.timeout(4500) })
            .then(r => r.text())
            .then(t => {
                const ip = (t || '').trim();
                if (/^\d+\.\d+\.\d+\.\d+$/.test(ip)) {
                    ok4(ip);
                } else {
                    tryNext();
                }
            })
            .catch(tryNext);
    }
    tryNext();
})();
