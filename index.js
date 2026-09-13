// ===== index.js：正常页面逻辑 =====
const html = document.documentElement;
const langBtn = document.getElementById('langBtn');
const resZh = document.getElementById("resZh");
const resEn = document.getElementById("resEn");
const res4Zh = document.getElementById("res4Zh");
const res4En = document.getElementById("res4En");

// 语言切换
langBtn.onclick = () => {
    html.classList.toggle('en');
    if(html.classList.contains('en')){
        document.title = "V6-Test IPv6 Connectivity Test";
    }else{
        document.title = "V6‑Test IPv6连通测试";
    }
};

// IPv4/IPv6检测，同时填充中英文四个框（封装成函数，支持重新检测）
async function detect(){
    resZh.innerHTML = 'IPv6 正在检测……';
    resEn.innerHTML = 'IPv6 detecting...';
    res4Zh.innerHTML = 'IPv4 正在检测……';
    res4En.innerHTML = 'IPv4 detecting...';

    // IPv6：ipify IPv6 接口（支持 CORS）
    fetch("https://api6.ipify.org?format=json",{signal:AbortSignal.timeout(4500)})
        .then(r=>r.json())
        .then(d=>{
            resZh.innerHTML = `<span class="ok">✅ IPv6 连通正常<br>你的IPv6：${d.ip}</span>`;
            resEn.innerHTML = `<span class="ok">✅ IPv6 Connected Successfully<br>Your IPv6: ${d.ip}</span>`;
        })
        .catch(()=>{
            resZh.innerHTML = `<span class="fail">❌ 当前没有可用 IPv6 网络</span>`;
            resEn.innerHTML = `<span class="fail">❌ No available IPv6 network detected</span>`;
        });

    // IPv4：优先 ipinfo.io（支持 CORS），失败自动换备用接口
    detectIPv4();
}

function detectIPv4(){
    const endpoints = ['https://ipinfo.io/ip', 'https://checkip.amazonaws.com'];
    let i = 0;

    function ok4(ip){
        res4Zh.innerHTML = `<span class="ok">✅ IPv4 连通正常<br>你的IPv4：${ip}</span>`;
        res4En.innerHTML = `<span class="ok">✅ IPv4 Connected Successfully<br>Your IPv4: ${ip}</span>`;
    }
    function fail4(){
        res4Zh.innerHTML = `<span class="fail">❌ 当前没有可用 IPv4 网络</span>`;
        res4En.innerHTML = `<span class="fail">❌ No available IPv4 network detected</span>`;
    }
    function tryNext(){
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
}

// 页面加载检测一次
detect();

// 重新检测按钮（中/英）
document.getElementById('retestZh').onclick = detect;
document.getElementById('retestEn').onclick = detect;

// 从整蛊页双击「重新检测」返回时的提示
const backParam = new URLSearchParams(location.search).get('back');
if (backParam === '1') {
    // 先清除地址栏的 ?back=1，避免刷新时重复提示
    history.replaceState(null, '', location.pathname);
    const toast = document.createElement('div');
    toast.textContent = '你已成功返回主页面';
    toast.style.cssText = 'position:fixed;top:80px;left:50%;transform:translateX(-50%);background:#152038;border:1px solid #59fa89;color:#59fa89;padding:10px 20px;border-radius:8px;z-index:999;font-size:14px;box-shadow:0 4px 12px rgba(0,0,0,.4);';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}
