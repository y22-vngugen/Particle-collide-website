function showgame(){
    document.getElementById("menuScreen").style.display="none";
    document.getElementById("gameScreen").style.display="flex";
}

const area = document.getElementById("bubbleArea");
let particles = [];
let buffer = "";

/* ELEMENT DATA */
const elements = {
    H:{name:"Hydrogen",color:"#c9a4a4",radius:16},
    O:{name:"Oxygen",color:"#ff4444",radius:18},
    Na:{name:"Sodium",color:"#ffaa00",radius:20},
    Cl:{name:"Chlorine",color:"#44ff44",radius:20},
    Ag:{name:"Silver",color:"#cccccc",radius:20},
    Al:{name:"Aluminium",color:"#ff8800",radius:20},
    Ca:{name:"Calcium",color:"#88ff88",radius:20},
    Zn:{name:"Zinc",color:"#8888ff",radius:20},
    H2:{name:"Hydrogen Gas",color:"#dddddd",radius:22},
    H2O:{name:"Water",color:"#3399ff",radius:24},
    NaCl:{name:"Salt",color:"#eeeeee",radius:24}
};

/* REACTIONS */
const reactions = {
    "H+H":"H2",
    "H2+O":"H2O",
    "Na+Cl":"NaCl"
};

/* SPAWN PARTICLE */
function spawnParticle(symbol,x=null,y=null){
    let data=elements[symbol];
    if(!data) return;

    let bubble=document.createElement("div");
    bubble.className="bubble";
    bubble.innerHTML=symbol;
    bubble.style.background=data.color;

    if(x===null) x=Math.random()*(area.clientWidth-60);
    if(y===null) y=Math.random()*(area.clientHeight-60);

    let p={
        el:bubble,
        type:symbol,
        x:x,
        y:y,
        vx:(Math.random()-0.5)*1.5,
        vy:(Math.random()-0.5)*1.5,
        reacting:false,
        radius:data.radius
    };

    bubble.style.left=x+"px";
    bubble.style.top=y+"px";

    area.appendChild(bubble);
    particles.push(p);
}

/* REMOVE PARTICLE */
function removeParticle(p){
    area.removeChild(p.el);
    let i=particles.indexOf(p);
    if(i>-1) particles.splice(i,1);
}

/* COLLISION CHECK */
function checkCollisions(){
    for(let i=0;i<particles.length;i++){
        for(let j=i+1;j<particles.length;j++){
            let a=particles[i];
            let b=particles[j];
            let dx=a.x-b.x;
            let dy=a.y-b.y;
            let distance=Math.sqrt(dx*dx+dy*dy);
            if(distance<60){
                tryReaction(a,b);
            }
        }
    }
}

/* REACTION */
function tryReaction(a,b){
    if(a.reacting||b.reacting) return;

    let k1=a.type+"+"+b.type;
    let k2=b.type+"+"+a.type;

    let result=reactions[k1]||reactions[k2];

    if(result){
        a.reacting=true;
        b.reacting=true;

        setTimeout(()=>{
            let x=(a.x+b.x)/2;
            let y=(a.y+b.y)/2;

            removeParticle(a);
            removeParticle(b);

            spawnParticle(result,x,y);

        },200);
    }
}



/* UPDATE LOOP */
function update(){
    attractParticles();

    particles.forEach(p=>{
        p.x+=p.vx;
        p.y+=p.vy;

        if(p.x<0||p.x>area.clientWidth-60) p.vx*=-1;
        if(p.y<0||p.y>area.clientHeight-60) p.vy*=-1;

        p.el.style.left=p.x+"px";
        p.el.style.top=p.y+"px";
    });
    checkCollisions();
    requestAnimationFrame(update);
}
requestAnimationFrame(update);

/* CLICK TO SPAWN CURRENT ELEMENT */
area.addEventListener("click",e=>{
    spawnParticle("H",e.offsetX,e.offsetY); // default H click
});

/* KEYBOARD SPAWN */
document.addEventListener("keydown", e=>{
    // 1 chữ cái + Shift → spawn H, O, …
    if(e.shiftKey && !e.ctrlKey && /^[A-Z]$/.test(e.key)){
        spawnParticle(e.key.toUpperCase());
        return;
    }

    // 2 chữ cái đặc biệt Cl → Ctrl+C+l
    if(e.ctrlKey){
        buffer += e.key.toLowerCase();
        if(buffer==="cl"){
            spawnParticle("Cl");
            buffer = "";
        }
        return;
    }

    // 2 chữ cái bình thường (Na, Al, Ag…) → không dùng Shift
    if(!e.ctrlKey && !e.shiftKey && /^[a-zA-Z]$/.test(e.key)){
        buffer += e.key.toLowerCase();

        if(buffer.length === 2){
            // chuẩn hóa: N + a → Na
            let symbol = buffer[0].toUpperCase() + buffer[1].toLowerCase();

            if(elements[symbol]){
                spawnParticle(symbol);
            }
            buffer = ""; // reset buffer sau 2 ký tự
        }
    }
});

function attractParticles(){
    for(let i=0;i<particles.length;i++){
        for(let j=i+1;j<particles.length;j++){
            let a = particles[i];
            let b = particles[j];

            let dx = b.x - a.x;
            let dy = b.y - a.y;
            let distance = Math.sqrt(dx*dx + dy*dy);

            let minDist = 150; // khoảng cách tối đa để hút
            if(distance < minDist && distance > 0){ // tránh chia 0
                let force = (minDist - distance) / minDist * 0.05; // strength
                let fx = dx / distance * force;
                let fy = dy / distance * force;

                // update velocity
                a.vx += fx;
                a.vy += fy;

                b.vx -= fx; // phản lực cho b
                b.vy -= fy;
            }
        }
    }
}