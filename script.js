const needle =
    document.getElementById("needle");

const maxNeedle =
    document.getElementById("maxNeedle");

const speedText =
    document.getElementById("speedText");

const info =
    document.getElementById("info");

const ticks =
    document.getElementById("ticks");

let lastPos = null;
let lastTime = null;

let targetSpeed = 0;
let displaySpeed = 0;
let maxSpeed = 0;

// =======================
// 文字盤生成
// =======================

// 数字
for(let i = 0; i <= 240; i += 20){

    const angle =
        -120 + (i / 240) * 240;

    const rad =
        angle * Math.PI / 180;

    const radius = 140;

    const x =
        Math.cos(rad) * radius;

    const y =
        Math.sin(rad) * radius;

    const label =
        document.createElement("div");

    label.className = "tick";

    label.innerText = i;

    label.style.transform =
        `translate(${x}px, ${y}px)`;

    ticks.appendChild(label);
}

// 小目盛り
for(let i = 0; i <= 240; i += 10){

    const tick =
        document.createElement("div");

    tick.className = "smallTick";

    const angle =
        -120 + (i / 240) * 240;

    tick.style.transform =
        `translate(-50%, -50%) rotate(${angle}deg)`;

    ticks.appendChild(tick);
}

// =======================
// 距離計算
// =======================

function toRad(v){
    return v * Math.PI / 180;
}

function distance(lat1, lon1, lat2, lon2){

    const R = 6371000;

    const dLat = toRad(lat2-lat1);
    const dLon = toRad(lon2-lon1);

    const a =
        Math.sin(dLat/2)**2 +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon/2)**2;

    return R * 2 * Math.atan2(
        Math.sqrt(a),
        Math.sqrt(1-a)
    );
}

// =======================
// GPS取得
// =======================

navigator.geolocation.watchPosition(

(pos)=>{

    const lat =
        pos.coords.latitude;

    const lon =
        pos.coords.longitude;

    const now =
        Date.now();

    if(lastPos){

        const dist = distance(
            lastPos.lat,
            lastPos.lon,
            lat,
            lon
        );

        const timeDiff =
            (now - lastTime) / 1000;

        let speed =
            (dist / timeDiff) * 3.6;

        // ノイズ除去
        if(speed < 1){
            speed = 0;
        }

        // 上限
        if(speed > 240){
            speed = 240;
        }

        targetSpeed = speed;
    }

    lastPos = {
        lat,
        lon
    };

    lastTime = now;

    info.innerText =
        `GPS精度 ±${Math.round(pos.coords.accuracy)}m`;

},

(error)=>{

    info.innerText =
        "GPS取得失敗";

    console.log(error);

},

{
    enableHighAccuracy:true,
    maximumAge:0,
    timeout:5000
});

// =======================
// アニメーション
// =======================

function animate(){

    // 滑らか補間
    displaySpeed +=
        (targetSpeed - displaySpeed) * 0.08;

    // 最高速度記録
    if(displaySpeed > maxSpeed){
        maxSpeed = displaySpeed;
    }

    // 現在速度針
    const angle =
        -120 + (displaySpeed / 240) * 240;

    needle.style.transform =
        `translateX(-50%) rotate(${angle}deg)`;

    // 最高速度針
    const maxAngle =
        -120 + (maxSpeed / 240) * 240;

    maxNeedle.style.transform =
        `translateX(-50%) rotate(${maxAngle}deg)`;

    // 数値
    speedText.innerText =
        Math.round(displaySpeed);

    requestAnimationFrame(animate);
}

animate();