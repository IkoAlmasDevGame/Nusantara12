/* ===================== 2) LOMPAT TALI (Rhythm) ===================== */
class LompatTaliScene extends Phaser.Scene{
  constructor(){ super('LompatTali'); }
  create(){
    const w=this.scale.width, h=this.scale.height;
    paperBG(this,w,h);
    this.add.text(w/2,h*0.07,'LOMPAT TALI\nKARET',{fontFamily:'Baloo 2',fontSize:Math.max(15,w*0.034)+'px',color:'#3D2B1F',fontStyle:'800',align:'center'}).setOrigin(0.5);
    const back = woodButton(this, Math.max(34,w*0.09), Math.max(40,h*0.06), Math.min(56,w*0.16), Math.max(40,h*0.06), '◀', Math.max(18,w*0.024));
    back.base.on('pointerdown', ()=> this.scene.start('Hub'));

    this.levels=['Lutut','Pinggang','Kepala','Merdeka'];
    this.speeds=[900,700,500,350];
    this.level=0; this.score=0; this.combo=0; this.beatT=0; this.nextBeat=this.speeds[0];
    this.input.setDefaultCursor?.('pointer');

    this.levelTxt = this.add.text(w/2,h*0.14,`Level: ${this.levels[0]}`,{fontFamily:'VT323',fontSize:Math.max(16,w*0.035)+'px',color:'#BF5B21'}).setOrigin(0.5);
    this.scoreTxt = this.add.text(w/2,h*0.2,'Skor: 0  Combo: 0',{fontFamily:'VT323',fontSize:Math.max(14,w*0.03)+'px',color:'#5C4033'}).setOrigin(0.5);

    this.laneY = h*0.55;
    this.hitZoneX = w*0.5;
    this.hitCircle = this.add.circle(this.hitZoneX,this.laneY,Math.max(28,w*0.05),PAL.genteng,0.25).setStrokeStyle(4,PAL.genteng);
    this.beats=[];
    this.im = new InputManager(this);
    this.im.addZone('left', 0, 0.4, 0.5, 0.4);
    this.im.addZone('right', 0.5, 0.4, 0.5, 0.4);

    this.add.text(w*0.25,h*0.85,'TAP KIRI',{fontFamily:'Baloo 2',fontSize:Math.max(14,w*0.025)+'px',color:'#5C4033'}).setOrigin(0.5);
    this.add.text(w*0.75,h*0.85,'TAP KANAN',{fontFamily:'Baloo 2',fontSize:Math.max(14,w*0.025)+'px',color:'#5C4033'}).setOrigin(0.5);

    this.spaceHandled=false;
    this.input.keyboard?.on('keydown-SPACE', ()=> this._tryHit());
    this.input.on('pointerdown', ()=> this._tryHit());

    this.mode2=false; this.wobblePhase=0;
    const modeBtn = woodButton(this, w*0.86, h*0.06, w*0.24, h*0.06, 'Mode 2 Orang', Math.max(10,w*0.017));
    modeBtn.base.on('pointerdown', ()=>{ this.mode2=!this.mode2; modeBtn.txt.setText(this.mode2?'2 Orang: ON':'Mode 2 Orang'); });
  }
  _spawnBeat(){
    const w=this.scale.width;
    const g = this.add.circle(this.hitZoneX, -20, Math.max(20,w*0.035), PAL.daun).setStrokeStyle(3,0x2b1c12);
    this.beats.push(g);
  }
  _tryHit(){
    let hit=false;
    const laneNow = this.hitCircle.y;
    for(let i=this.beats.length-1;i>=0;i--){
      const b=this.beats[i];
      if(Math.abs(b.y-laneNow)<40){
        hit=true; b.destroy(); this.beats.splice(i,1);
        this.combo++; this.score+=10*(1+Math.floor(this.combo/5));
        if(this.combo>0 && this.combo%8===0 && this.level<3){ this.level++; this.levelTxt.setText('Level: '+this.levels[this.level]); }
        break;
      }
    }
    if(!hit){ this.combo=0; }
    this.scoreTxt.setText(`Skor: ${this.score}  Combo: ${this.combo}`);
  }
  update(time, delta){
    const speed = this.speeds[this.level];
    this.beatT += delta;
    if(this.beatT>speed){ this.beatT=0; this._spawnBeat(); }
    let effLaneY = this.laneY;
    if(this.mode2){
      this.wobblePhase += delta*0.004;
      effLaneY = this.laneY + Math.sin(this.wobblePhase)*20;
      this.hitCircle.y = effLaneY;
    }
    const fallSpeed = (effLaneY+40)/ (speed*1.6) * delta;
    for(let i=this.beats.length-1;i>=0;i--){
      const b=this.beats[i]; b.y += fallSpeed;
      if(b.y>this.scale.height+30){ b.destroy(); this.beats.splice(i,1); this.combo=0; this.scoreTxt.setText(`Skor: ${this.score}  Combo: ${this.combo}`); }
    }
  }
}
