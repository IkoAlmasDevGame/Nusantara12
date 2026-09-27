/* ===================== 3) BAKIAK (3-player co-op sync, 1 device) ===================== */
class BakiakScene extends Phaser.Scene{
  constructor(){ super('Bakiak'); }
  create(){
    const w=this.scale.width, h=this.scale.height;
    paperBG(this,w,h);
    this.add.text(w/2,h*0.06,'BAKIAK — Kompak Bertiga!',{fontFamily:'Baloo 2',fontSize:Math.max(18,w*0.04)+'px',color:'#3D2B1F',fontStyle:'800'}).setOrigin(0.5);
    const back = woodButton(this, w*0.14, h*0.055, w*0.2, h*0.055, '< Desa', Math.max(11,w*0.018));
    back.base.on('pointerdown', ()=> this.scene.start('Hub'));

    this.dist=0; this.finish=100; this.tilt=0; this.lastPress={1:-1,2:-1,3:-1};
    this.im = new InputManager(this);
    // 3 non-overlapping tap zones spanning full width, stacked so 3 people can each hold one edge/section of the phone
    this.im.addZone('p1', 0, 0.55, 0.333, 0.4);
    this.im.addZone('p2', 0.333, 0.55, 0.334, 0.4);
    this.im.addZone('p3', 0.667, 0.55, 0.333, 0.4);

    const zoneY = h*0.7;
    this.add.rectangle(w*0.5, zoneY, w*0.98, h*0.4, 0x000000,0).setStrokeStyle(2,0x2b1c12,0.3);
    const labels=[['P1','Q / W','left'],['P2','O / P','mid'],['P3','← / →','right']];
    labels.forEach((l,i)=>{
      const x = w*(0.166+i*0.333);
      this.add.rectangle(x, zoneY, w*0.31, h*0.36, PAL.jati).setStrokeStyle(3,0x2b1c12).setAlpha(0.85);
      this.add.text(x, zoneY-h*0.06, l[0], {fontFamily:'Baloo 2',fontSize:Math.max(16,w*0.04)+'px',color:'#F5F1E8',fontStyle:'700'}).setOrigin(0.5);
      this.add.text(x, zoneY+h*0.05, l[1], {fontFamily:'VT323',fontSize:Math.max(12,w*0.025)+'px',color:'#D9C5A0'}).setOrigin(0.5);
    });

    this.statusTxt = this.add.text(w/2,h*0.16,'Tekan bareng: Kiri... Kanan... Kiri...',{fontFamily:'VT323',fontSize:Math.max(14,w*0.028)+'px',color:'#BF5B21'}).setOrigin(0.5);
    this.progTxt = this.add.text(w/2,h*0.22,'Jarak: 0 / 100m',{fontFamily:'VT323',fontSize:Math.max(14,w*0.026)+'px',color:'#5C4033'}).setOrigin(0.5);
    this.tiltTxt = this.add.text(w/2,h*0.28,'Keseimbangan: STABIL',{fontFamily:'VT323',fontSize:Math.max(14,w*0.026)+'px',color:'#4A7C59'}).setOrigin(0.5);

    this.playerBar = this.add.rectangle(w/2, h*0.4, w*0.6, 18, PAL.bambu).setStrokeStyle(2,0x2b1c12);
    this.foot = this.add.rectangle(w/2, h*0.4, 30, 14, PAL.genteng);

    this.pressWindow=[]; // timestamps of last press per player within tolerance window
    this.gameOver=false;
    this.keys = this.input.keyboard?.addKeys('Q,W,O,P,LEFT,RIGHT');
  }
  _registerPress(playerId){
    if(this.gameOver) return;
    const t = this.time.now;
    this.pressWindow.push({p:playerId, t});
    this.pressWindow = this.pressWindow.filter(e=> t-e.t < 250);
    const uniquePlayers = new Set(this.pressWindow.map(e=>e.p));
    if(uniquePlayers.size===3){
      // all 3 pressed within 250ms window -> good sync step
      const times = this.pressWindow.map(e=>e.t);
      const spread = Math.max(...times)-Math.min(...times);
      this.pressWindow=[];
      if(spread<=200){
        this.dist += 4; this.tilt = Math.max(0,this.tilt-15);
        this.statusTxt.setText('KOMPAK! Melangkah maju!');
      } else {
        this.dist += 1; this.tilt += 10;
        this.statusTxt.setText('Agak molor... ayo bareng!');
      }
      this.foot.x = Phaser.Math.Clamp(this.playerBar.x-this.playerBar.width/2 + (this.dist/this.finish)*this.playerBar.width, this.playerBar.x-this.playerBar.width/2, this.playerBar.x+this.playerBar.width/2);
      this.progTxt.setText(`Jarak: ${Math.min(this.dist,this.finish)} / ${this.finish}m`);
      if(this.tilt>=60){
        this.gameOver=true; this.statusTxt.setText('Bakiak Oleng, JATUH! Coba lagi.');
        this.tiltTxt.setText('Keseimbangan: JATUH').setColor('#BF5B21');
        this.time.delayedCall(1500, ()=> this.scene.restart());
        return;
      }
      this.tiltTxt.setText(this.tilt<20?'Keseimbangan: STABIL':'Keseimbangan: GOYANG').setColor(this.tilt<20?'#4A7C59':'#BF5B21');
      if(this.dist>=this.finish){ this.gameOver=true; this.statusTxt.setText('SAMPAI GARIS FINISH! Kompak banget!'); }
    }
  }
  update(){
    if(this.im.isZoneDown('p1') || Phaser.Input.Keyboard.JustDown(this.keys.Q) || Phaser.Input.Keyboard.JustDown(this.keys.W)) {}
    if(Phaser.Input.Keyboard.JustDown(this.keys.Q) || Phaser.Input.Keyboard.JustDown(this.keys.W)) this._registerPress(1);
    if(Phaser.Input.Keyboard.JustDown(this.keys.O) || Phaser.Input.Keyboard.JustDown(this.keys.P)) this._registerPress(2);
    if(Phaser.Input.Keyboard.JustDown(this.keys.LEFT) || Phaser.Input.Keyboard.JustDown(this.keys.RIGHT)) this._registerPress(3);
  }
}
// touch handling for Bakiak zones (edge-triggered)
BakiakScene.prototype.create = (function(orig){
  return function(){
    orig.call(this);
    this._zoneWasDown={p1:false,p2:false,p3:false};
    this.im.zones.forEach(z=>{
      // patch: detect edge via polling in update by comparing state
    });
  };
})(BakiakScene.prototype.create);

/* Poll touch zones each frame for edge-trigger */
const _bakiakUpdate = BakiakScene.prototype.update;
BakiakScene.prototype.update = function(){
  _bakiakUpdate.call(this);
  ['p1','p2','p3'].forEach((id,i)=>{
    const down = this.im.isZoneDown(id);
    if(down && !this._zoneWasDown[id]) this._registerPress(i+1);
    this._zoneWasDown[id]=down;
  });
};
