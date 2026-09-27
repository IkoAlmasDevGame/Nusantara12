/* ===================== KELERENG / GUNDU (Flick Shooter) ===================== */
class KelerengScene extends Phaser.Scene{
  constructor(){ super('Kelereng'); }
  create(){
    const w=this.scale.width, h=this.scale.height;
    paperBG(this,w,h);
    this.add.text(w/2,h*0.06,'KELERENG',{fontFamily:'Baloo 2',fontSize:Math.max(20,w*0.045)+'px',color:'#3D2B1F',fontStyle:'800'}).setOrigin(0.5);
    const back = woodButton(this, w*0.14, h*0.055, w*0.2, h*0.055, '< Desa', Math.max(11,w*0.018));
    back.base.on('pointerdown', ()=> this.scene.start('Hub'));

    const cx=w/2, cy=h*0.5, R=Math.min(w,h)*0.36;
    this.arenaC={x:cx,y:cy,r:R};
    this.add.circle(cx,cy,R,PAL.bambu,0.3).setStrokeStyle(4,PAL.jati);

    this.marbleR = Math.max(10, R*0.07);
    this.player = {x:cx, y:cy+R*0.7, vx:0, vy:0, r:this.marbleR*1.1, color:PAL.genteng, isPlayer:true};
    this.targets = [];
    const colors=[PAL.daun,PAL.sogan,PAL.jati,0x8a6d3b,PAL.genteng];
    for(let i=0;i<5;i++){
      const ang = (i/5)*Math.PI*2;
      this.targets.push({x:cx+Math.cos(ang)*R*0.45, y:cy+Math.sin(ang)*R*0.45 - R*0.1, vx:0, vy:0, r:this.marbleR, color:colors[i]});
    }
    this.marbleGfx = this.add.graphics();
    this.attempts=8; this.score=0; this.state='aim'; this.aimVec={x:0,y:0};

    this.infoTxt = this.add.text(w/2,h*0.15,'Tarik dari gundu lalu lepas untuk menyentil',{fontFamily:'VT323',fontSize:Math.max(13,w*0.026)+'px',color:'#5C4033'}).setOrigin(0.5);
    this.scoreTxt = this.add.text(w/2,h*0.9,`Kena: 0/5   Sisa Sentil: 8`,{fontFamily:'VT323',fontSize:Math.max(14,w*0.028)+'px',color:'#BF5B21'}).setOrigin(0.5);

    this.input.on('pointerdown', p=>{ if(this.state==='aim') this.dragStart={x:p.x,y:p.y}; });
    this.input.on('pointermove', p=>{ if(this.dragStart) this.aimVec={x:this.dragStart.x-p.x, y:this.dragStart.y-p.y}; });
    this.input.on('pointerup', ()=>{
      if(this.dragStart && this.state==='aim'){
        const power = Math.min(Phaser.Math.Distance.Between(0,0,this.aimVec.x,this.aimVec.y), 220)/220;
        const mag = Math.hypot(this.aimVec.x,this.aimVec.y)||1;
        this.player.vx = (this.aimVec.x/mag)*power*14;
        this.player.vy = (this.aimVec.y/mag)*power*14;
        this.state='settling'; this.attempts--; this.dragStart=null; this.aimVec={x:0,y:0};
        this.scoreTxt.setText(`Kena: ${this.score}/5   Sisa Sentil: ${this.attempts}`);
      }
    });
  }
  _stepMarble(m, dt){
    m.x += m.vx; m.y += m.vy;
    m.vx *= 0.985; m.vy *= 0.985;
    if(Math.abs(m.vx)<0.02) m.vx=0; if(Math.abs(m.vy)<0.02) m.vy=0;
  }
  update(){
    const all = [this.player, ...this.targets];
    let moving=false;
    all.forEach(m=>{ this._stepMarble(m); if(Math.abs(m.vx)>0.02||Math.abs(m.vy)>0.02) moving=true; });
    // collisions
    for(let i=0;i<all.length;i++){
      for(let j=i+1;j<all.length;j++){
        const a=all[i], b=all[j];
        const dx=b.x-a.x, dy=b.y-a.y, dist=Math.hypot(dx,dy), minD=a.r+b.r;
        if(dist>0 && dist<minD){
          const nx=dx/dist, ny=dy/dist, overlap=(minD-dist)/2;
          a.x-=nx*overlap; a.y-=ny*overlap; b.x+=nx*overlap; b.y+=ny*overlap;
          const rvx=b.vx-a.vx, rvy=b.vy-a.vy;
          const sep=rvx*nx+rvy*ny;
          if(sep<0){
            const imp=sep*0.9;
            a.vx+=imp*nx; a.vy+=imp*ny; b.vx-=imp*nx; b.vy-=imp*ny;
          }
        }
      }
    }
    // remove targets knocked out of arena
    for(let i=this.targets.length-1;i>=0;i--){
      const t=this.targets[i];
      const d = Phaser.Math.Distance.Between(t.x,t.y,this.arenaC.x,this.arenaC.y);
      if(d > this.arenaC.r){ this.targets.splice(i,1); this.score++; this.scoreTxt.setText(`Kena: ${this.score}/5   Sisa Sentil: ${this.attempts}`); }
    }
    // keep player marble bounded (bounce)
    const d = Phaser.Math.Distance.Between(this.player.x,this.player.y,this.arenaC.x,this.arenaC.y);
    if(d > this.arenaC.r - this.player.r){
      const ang = Math.atan2(this.player.y-this.arenaC.y, this.player.x-this.arenaC.x);
      this.player.x = this.arenaC.x + Math.cos(ang)*(this.arenaC.r-this.player.r);
      this.player.y = this.arenaC.y + Math.sin(ang)*(this.arenaC.r-this.player.r);
      this.player.vx*=-0.5; this.player.vy*=-0.5;
    }
    if(this.state==='settling' && !moving){
      this.state='aim';
      if(this.targets.length===0){ this.infoTxt.setText('MENANG! Semua gundu kena!'); }
      else if(this.attempts<=0){ this.infoTxt.setText('Sentilan habis. '+this.score+'/5 kena. Coba lagi?'); }
      else { this.infoTxt.setText('Tarik dari gundu lalu lepas untuk menyentil'); }
    }
    // draw
    const g=this.marbleGfx; g.clear();
    if(this.dragStart){
      g.lineStyle(3,PAL.genteng,0.8);
      g.lineBetween(this.player.x,this.player.y, this.player.x+this.aimVec.x*0.5, this.player.y+this.aimVec.y*0.5);
    }
    [this.player, ...this.targets].forEach(m=>{
      g.fillStyle(m.color,1); g.fillCircle(m.x,m.y,m.r);
      g.lineStyle(2,0x2b1c12,1); g.strokeCircle(m.x,m.y,m.r);
    });
  }
}
