/* ===================== BENTENGAN (Mini RTS: capture & tawanan) ===================== */
class BentenganScene extends Phaser.Scene{
  constructor(){ super('Bentengan'); }
  create(){
    const w=this.scale.width, h=this.scale.height;
    paperBG(this,w,h);
    this.add.text(w/2,h*0.055,'BENTENGAN',{fontFamily:'Baloo 2',fontSize:Math.max(18,w*0.04)+'px',color:'#3D2B1F',fontStyle:'800'}).setOrigin(0.5);
    const back = woodButton(this, w*0.14, h*0.05, w*0.2, h*0.05, '< Desa', Math.max(11,w*0.017));
    back.base.on('pointerdown', ()=> this.scene.start('Hub'));

    this.fieldX=w*0.06, this.fieldY=h*0.18, this.fieldW=w*0.88, this.fieldH=h*0.6;
    this.add.rectangle(this.fieldX+this.fieldW/2, this.fieldY+this.fieldH/2, this.fieldW, this.fieldH, PAL.daun,0.12).setStrokeStyle(3,0x2b1c12);

    this.myFort={x:this.fieldX+30,y:this.fieldY+this.fieldH-30};
    this.enemyFort={x:this.fieldX+this.fieldW-30,y:this.fieldY+30};
    this.add.rectangle(this.myFort.x,this.myFort.y,36,36,PAL.genteng).setStrokeStyle(3,0x2b1c12);
    this.add.rectangle(this.enemyFort.x,this.enemyFort.y,36,36,PAL.sogan).setStrokeStyle(3,0x2b1c12);

    this.player={x:this.myFort.x,y:this.myFort.y-40,r:13,captured:false};
    this.enemies=[0,1,2].map(i=>({x:this.enemyFort.x, y:this.enemyFort.y+40+i*30, r:12, captured:false, wanderT:0, tx:0, ty:0}));
    this.playerGfx=this.add.circle(this.player.x,this.player.y,this.player.r,PAL.genteng).setStrokeStyle(2,0x2b1c12);
    this.enemyGfx=this.enemies.map(e=>this.add.circle(e.x,e.y,e.r,PAL.sogan).setStrokeStyle(2,0x2b1c12));

    this.myScore=0; this.enemyScore=0; this.timeLeft=90; this.over=false;
    this.scoreTxt=this.add.text(w/2,h*0.12,'Tawanan: Kamu 0 - 0 Musuh',{fontFamily:'VT323',fontSize:Math.max(14,w*0.026)+'px',color:'#BF5B21'}).setOrigin(0.5);
    this.timeTxt=this.add.text(w/2,h*0.16,'Waktu: 90s',{fontFamily:'VT323',fontSize:Math.max(12,w*0.022)+'px',color:'#5C4033'}).setOrigin(0.5);
    this.statusTxt=this.add.text(w/2,h*0.88,'Sentuh musuh saat kamu LEBIH DEKAT ke bentengmu sendiri!',{fontFamily:'VT323',fontSize:Math.max(11,w*0.02)+'px',color:'#5C4033',align:'center',wordWrap:{width:w*0.9}}).setOrigin(0.5);

    this.im=new InputManager(this);
    const zH=0.15;
    this.im.addZone('up',0.34,1-zH*2,0.32,zH);
    this.im.addZone('down',0.34,1-zH,0.32,zH);
    this.im.addZone('left',0.02,1-zH*1.5,0.3,zH);
    this.im.addZone('right',0.68,1-zH*1.5,0.3,zH);
    ['up','down','left','right'].forEach((id,i)=>{
      const labels={up:'▲',down:'▼',left:'◀',right:'▶'};
      const zx=this.im.zones.find(z=>z.id===id);
    });
    this.add.text(w*0.5,h*(1-zH*1.5),'▲',{fontFamily:'Baloo 2',fontSize:w*0.04+'px',color:'#5C4033'}).setOrigin(0.5);
    this.add.text(w*0.5,h*(1-zH*0.5),'▼',{fontFamily:'Baloo 2',fontSize:w*0.04+'px',color:'#5C4033'}).setOrigin(0.5);
    this.add.text(w*0.17,h*(1-zH*0.75),'◀',{fontFamily:'Baloo 2',fontSize:w*0.04+'px',color:'#5C4033'}).setOrigin(0.5);
    this.add.text(w*0.83,h*(1-zH*0.75),'▶',{fontFamily:'Baloo 2',fontSize:w*0.04+'px',color:'#5C4033'}).setOrigin(0.5);

    this.time.addEvent({delay:1000, loop:true, callback:()=>{
      if(this.over) return;
      this.timeLeft--; this.timeTxt.setText('Waktu: '+this.timeLeft+'s');
      if(this.timeLeft<=0) this._endGame();
    }});
  }
  _endGame(){
    this.over=true;
    if(this.myScore===this.enemyScore) this.statusTxt.setText('Waktu habis — SERI!');
    else this.statusTxt.setText(this.myScore>this.enemyScore? 'Waktu habis — KAMU MENANG!':'Waktu habis — musuh menang.');
  }
  update(time,delta){
    if(this.over) return;
    const dt=delta/1000;
    if(!this.player.captured){
      const up=this.im.isZoneDown('up')||this.im.isKeyDown('UP')||this.im.isKeyDown('W');
      const down=this.im.isZoneDown('down')||this.im.isKeyDown('DOWN')||this.im.isKeyDown('S');
      const left=this.im.isZoneDown('left')||this.im.isKeyDown('LEFT')||this.im.isKeyDown('A');
      const right=this.im.isZoneDown('right')||this.im.isKeyDown('RIGHT')||this.im.isKeyDown('D');
      const spd=140*dt;
      if(up) this.player.y-=spd; if(down) this.player.y+=spd; if(left) this.player.x-=spd; if(right) this.player.x+=spd;
      this.player.x=Phaser.Math.Clamp(this.player.x,this.fieldX+15,this.fieldX+this.fieldW-15);
      this.player.y=Phaser.Math.Clamp(this.player.y,this.fieldY+15,this.fieldY+this.fieldH-15);
    }
    this.enemies.forEach(e=>{
      if(e.captured) return;
      const distToPlayer=Phaser.Math.Distance.Between(e.x,e.y,this.player.x,this.player.y);
      if(distToPlayer<160){ e.tx=this.player.x; e.ty=this.player.y; }
      else {
        e.wanderT-=dt;
        if(e.wanderT<=0){ e.tx=this.fieldX+Math.random()*this.fieldW; e.ty=this.fieldY+Math.random()*this.fieldH; e.wanderT=1.5+Math.random(); }
      }
      const ang=Math.atan2(e.ty-e.y, e.tx-e.x);
      e.x+=Math.cos(ang)*90*dt; e.y+=Math.sin(ang)*90*dt;
      e.x=Phaser.Math.Clamp(e.x,this.fieldX+15,this.fieldX+this.fieldW-15);
      e.y=Phaser.Math.Clamp(e.y,this.fieldY+15,this.fieldY+this.fieldH-15);
    });
    if(!this.player.captured){
      this.enemies.forEach((e,i)=>{
        if(e.captured) return;
        const d=Phaser.Math.Distance.Between(this.player.x,this.player.y,e.x,e.y);
        if(d < this.player.r+e.r){
          const pd=Phaser.Math.Distance.Between(this.player.x,this.player.y,this.myFort.x,this.myFort.y);
          const ed=Phaser.Math.Distance.Between(e.x,e.y,this.enemyFort.x,this.enemyFort.y);
          if(pd>ed){
            this.player.captured=true; this.enemyScore++; this.statusTxt.setText('Kamu tertangkap! Kembali ke benteng...');
            this.time.delayedCall(1800, ()=>{ this.player.x=this.myFort.x; this.player.y=this.myFort.y-40; this.player.captured=false; this.statusTxt.setText('Bebas! Lanjutkan misi.'); });
          } else {
            e.captured=true; this.myScore++; this.statusTxt.setText('Musuh tertawan! +1 poin.');
            this.time.delayedCall(1800, ()=>{ e.x=this.enemyFort.x; e.y=this.enemyFort.y+40+i*30; e.captured=false; });
          }
          this.scoreTxt.setText(`Tawanan: Kamu ${this.myScore} - ${this.enemyScore} Musuh`);
          if(this.myScore>=3 || this.enemyScore>=3) this._endGame();
        }
      });
    }
    this.playerGfx.x=this.player.x; this.playerGfx.y=this.player.y; this.playerGfx.setVisible(!this.player.captured || (Math.floor(time/200)%2===0));
    this.enemies.forEach((e,i)=>{ this.enemyGfx[i].x=e.x; this.enemyGfx[i].y=e.y; this.enemyGfx[i].setVisible(!e.captured); });
  }
}
