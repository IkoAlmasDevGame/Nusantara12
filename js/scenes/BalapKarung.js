/* ===================== BALAP KARUNG + MAKAN KERUPUK ===================== */
class BalapKarungScene extends Phaser.Scene{
  constructor(){ super('BalapKarung'); }
  create(){
    const w=this.scale.width, h=this.scale.height;
    paperBG(this,w,h);
    this.add.text(w/2,h*0.06,'BALAP KARUNG\n+ KERUPUK',{fontFamily:'Baloo 2',fontSize:Math.max(13,w*0.03)+'px',color:'#3D2B1F',fontStyle:'800',align:'center'}).setOrigin(0.5);
    const back = woodButton(this, Math.max(34,w*0.09), Math.max(40,h*0.06), Math.min(56,w*0.16), Math.max(40,h*0.06), '◀', Math.max(18,w*0.024));
    back.base.on('pointerdown', ()=> this.scene.start('Hub'));

    this.phase='hop1'; this.dist=0; this.finish1=50; this.finish2=100;
    this.lastFoot=null; this.startTime=this.time.now; this.bites=0;

    this.progFill=this.add.rectangle(w*0.15,h*0.35,4,h*0.04,PAL.genteng).setOrigin(0,0.5);
    this.add.rectangle(w*0.5,h*0.35,w*0.7,h*0.045,PAL.bambu).setStrokeStyle(3,0x2b1c12);
    this.progFill.setPosition(w*0.15,h*0.35);

    this.statusTxt=this.add.text(w/2,h*0.45,'Tap KIRI-KANAN BERGANTIAN untuk melompat!',{fontFamily:'VT323',fontSize:Math.max(13,w*0.026)+'px',color:'#BF5B21',align:'center',wordWrap:{width:w*0.85}}).setOrigin(0.5);
    this.distTxt=this.add.text(w/2,h*0.55,'Jarak: 0/100m',{fontFamily:'VT323',fontSize:Math.max(13,w*0.026)+'px',color:'#5C4033'}).setOrigin(0.5);

    this.krupukGfx=this.add.graphics();
    this.krupukPhase=0; this.krupukVisible=false;

    this.im=new InputManager(this);
    this.im.addZone('left',0,0.6,0.5,0.3);
    this.im.addZone('right',0.5,0.6,0.5,0.3);
    this.add.text(w*0.25,h*0.75,'KAKI KIRI',{fontFamily:'Baloo 2',fontSize:Math.max(13,w*0.028)+'px',color:'#5C4033'}).setOrigin(0.5);
    this.add.text(w*0.75,h*0.75,'KAKI KANAN',{fontFamily:'Baloo 2',fontSize:Math.max(13,w*0.028)+'px',color:'#5C4033'}).setOrigin(0.5);
    this._zoneWasDown={left:false,right:false};
    this.input.keyboard?.on('keydown-LEFT', ()=> this._step('left'));
    this.input.keyboard?.on('keydown-RIGHT', ()=> this._step('right'));
    this.input.keyboard?.on('keydown-SPACE', ()=> this._biteKerupuk());
  }
  _step(side){
    if(this.phase!=='hop1' && this.phase!=='hop2') return;
    if(side===this.lastFoot){ this.statusTxt.setText('Gantian kaki dong! Kiri-Kanan-Kiri-Kanan.'); return; }
    this.lastFoot=side; this.dist+=4;
    this.statusTxt.setText('Semangat! Terus bergantian!');
    const target = this.phase==='hop1'? this.finish1 : this.finish2;
    const startD = this.phase==='hop1'? 0 : this.finish1;
    const pct=(this.dist-0)/this.finish2;
    this.progFill.width = 4 + Math.min(1,this.dist/this.finish2)*(this.scale.width*0.7-4);
    this.distTxt.setText(`Jarak: ${Math.min(this.dist,this.finish2)}/100m`);
    if(this.phase==='hop1' && this.dist>=this.finish1){ this.phase='kerupuk'; this.krupukVisible=true; this.statusTxt.setText('STOP! Gigit kerupuknya, tap/SPACE saat pas!'); }
    if(this.phase==='hop2' && this.dist>=this.finish2){ this._finish(); }
  }
  _biteKerupuk(){
    if(this.phase!=='kerupuk') return;
    const swing=Math.sin(this.krupukPhase);
    if(Math.abs(swing) < 0.25){
      this.bites++;
      this.statusTxt.setText(`Gigitan ${this.bites}/3!`);
      if(this.bites>=3){ this.phase='hop2'; this.krupukVisible=false; this.statusTxt.setText('Kerupuk habis! Lanjut lompat ke garis finish!'); }
    } else {
      this.statusTxt.setText('Meleset, coba timing lagi!');
    }
  }
  _finish(){
    this.phase='done';
    const elapsed=((this.time.now-this.startTime)/1000).toFixed(1);
    this.statusTxt.setText(`FINISH! Waktu: ${elapsed} detik. Merdeka!`);
  }
  update(time,delta){
    if(this.phase==='kerupuk'){
      this.krupukPhase += delta*0.004;
      const w=this.scale.width;
      const swingX = w/2 + Math.sin(this.krupukPhase)*w*0.18;
      const g=this.krupukGfx; g.clear();
      g.lineStyle(3,0x2b1c12,1); g.lineBetween(w/2,this.scale.height*0.62, swingX, this.scale.height*0.68);
      g.fillStyle(PAL.genteng,1); g.fillCircle(swingX,this.scale.height*0.68,18-this.bites*4);
      g.lineStyle(2,0x2b1c12,1); g.fillStyle(0,0); g.strokeRect(w/2-14,this.scale.height*0.68-2,28,4);
    }
    ['left','right'].forEach(id=>{
      const down=this.im.isZoneDown(id);
      if(down && !this._zoneWasDown[id]) this._step(id);
      this._zoneWasDown[id]=down;
    });
  }
}
