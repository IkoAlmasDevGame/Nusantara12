/* ===================== LAYANGAN ADU (Wind physics + string tension duel) ===================== */
class LayanganScene extends Phaser.Scene{
  constructor(){ super('Layangan'); }
  create(){
    const w=this.scale.width, h=this.scale.height;
    paperBG(this,w,h);
    this.add.text(w/2,h*0.06,'LAYANGAN ADU',{fontFamily:'Baloo 2',fontSize:Math.max(20,w*0.045)+'px',color:'#3D2B1F',fontStyle:'800'}).setOrigin(0.5);
    const back = woodButton(this, w*0.14, h*0.055, w*0.2, h*0.055, '< Desa', Math.max(11,w*0.018));
    back.base.on('pointerdown', ()=> this.scene.start('Hub'));

    this.skyTop=h*0.16, this.skyBottom=h*0.85;
    this.playerAnchor={x:w*0.15, y:this.skyBottom};
    this.aiAnchor={x:w*0.85, y:this.skyBottom};
    this.player={x:w*0.35, y:h*0.4, taut:false};
    this.ai={x:w*0.65, y:h*0.4, taut:false, timer:0};
    this.windPhase=0; this.over=false; this.gesekTime=0;

    this.gfx=this.add.graphics();
    this.windTxt=this.add.text(w/2,h*0.13,'Angin: -',{fontFamily:'VT323',fontSize:Math.max(14,w*0.028)+'px',color:'#5C4033'}).setOrigin(0.5);
    this.statusTxt=this.add.text(w/2,h*0.9,'Tahan TARIK saat benang bersilang untuk memutus lawan!',{fontFamily:'VT323',fontSize:Math.max(12,w*0.024)+'px',color:'#BF5B21'}).setOrigin(0.5);

    this.im=new InputManager(this);
    this.im.addZone('tarik', 0, 0.5, 1, 0.35);
    this.add.text(w/2,h*0.72,'TAHAN = TARIK   LEPAS = ULUR',{fontFamily:'Baloo 2',fontSize:Math.max(13,w*0.026)+'px',color:'#5C4033'}).setOrigin(0.5);
  }
  update(time, delta){
    if(this.over) return;
    const dt=delta/1000;
    this.windPhase += dt*0.6;
    const wind = Math.sin(this.windPhase)*0.6 + Math.sin(this.windPhase*2.1)*0.3;
    this.windTxt.setText('Angin: '+(wind>0.15?'Kanan →':wind<-0.15?'← Kiri':'Tenang'));

    this.player.taut = this.im.isZoneDown('tarik') || this.im.isKeyDown('SPACE');
    if(this.player.taut){
      this.player.x += (this.aiAnchor.x>this.player.x?1:-1)*60*dt*0.4 + (Math.sign(this.aiAnchor.x - this.player.x))*20*dt;
      this.player.y -= 40*dt;
    } else {
      this.player.x += wind*50*dt; this.player.y += 20*dt;
    }
    this.player.x = Phaser.Math.Clamp(this.player.x, w0(this), this.scale.width - w0(this));
    this.player.y = Phaser.Math.Clamp(this.player.y, this.skyTop, this.skyBottom-40);

    // simple AI: toggles taut periodically, drifts toward player
    this.ai.timer -= dt;
    if(this.ai.timer<=0){ this.ai.taut = Math.random()>0.4; this.ai.timer = 0.6+Math.random()*0.8; }
    if(this.ai.taut){ this.ai.x += (this.player.x>this.ai.x?1:-1)*45*dt; this.ai.y -= 30*dt; }
    else { this.ai.x -= wind*40*dt; this.ai.y += 18*dt; }
    this.ai.x = Phaser.Math.Clamp(this.ai.x, w0(this), this.scale.width - w0(this));
    this.ai.y = Phaser.Math.Clamp(this.ai.y, this.skyTop, this.skyBottom-40);

    const dist = Phaser.Math.Distance.Between(this.player.x,this.player.y,this.ai.x,this.ai.y);
    if(dist < 60){
      this.gesekTime += dt;
      if(this.gesekTime > 0.35){
        this.over=true;
        if(this.player.taut && !this.ai.taut){ this.statusTxt.setText('PUTUS! Layangan lawan jatuh — KAMU MENANG!'); }
        else if(this.ai.taut && !this.player.taut){ this.statusTxt.setText('Benangmu putus... layangan lawan menang.'); }
        else { this.statusTxt.setText('Seri! Kedua layangan lolos.'); }
        this.time.delayedCall(1800, ()=> this.scene.restart());
      }
    } else { this.gesekTime = 0; }

    const g=this.gfx; g.clear();
    g.lineStyle(2,0x2b1c12,0.6);
    g.lineBetween(this.playerAnchor.x,this.playerAnchor.y,this.player.x,this.player.y);
    g.lineBetween(this.aiAnchor.x,this.aiAnchor.y,this.ai.x,this.ai.y);
    this._drawKite(g,this.player.x,this.player.y,PAL.genteng,this.player.taut);
    this._drawKite(g,this.ai.x,this.ai.y,PAL.daun,this.ai.taut);
  }
  _drawKite(g,x,y,color,taut){
    g.fillStyle(color,1);
    g.fillTriangle(x,y-18,x-14,y+6,x+14,y+6);
    g.fillTriangle(x,y-18,x-14,y+6,x,y+14);
    g.lineStyle(taut?4:2, 0x2b1c12, 1); g.strokeTriangle(x,y-18,x-14,y+6,x+14,y+6);
  }
}
function w0(scene){ return 30; }
