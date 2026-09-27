/* ===================== GOBAK SODOR (Dodge the guard lines) ===================== */
class GobakSodorScene extends Phaser.Scene{
  constructor(){ super('GobakSodor'); }
  create(){
    const w=this.scale.width, h=this.scale.height;
    paperBG(this,w,h);
    this.add.text(w/2,h*0.06,'GOBAK SODOR',{fontFamily:'Baloo 2',fontSize:Math.max(20,w*0.045)+'px',color:'#3D2B1F',fontStyle:'800'}).setOrigin(0.5);
    const back = woodButton(this, w*0.14, h*0.055, w*0.2, h*0.055, '< Desa', Math.max(11,w*0.018));
    back.base.on('pointerdown', ()=> this.scene.start('Hub'));

    this.fieldTop=h*0.16, this.fieldBottom=h*0.86;
    this.fieldW = w*0.7; this.fieldX = w*0.15;
    this.add.rectangle(w/2,(this.fieldTop+this.fieldBottom)/2, this.fieldW, this.fieldBottom-this.fieldTop, PAL.daun,0.12).setStrokeStyle(3,0x2b1c12);

    this.lives=3; this.lineCount=4;
    this.lines=[];
    for(let i=0;i<this.lineCount;i++){
      const y = this.fieldBottom - (i+1)*((this.fieldBottom-this.fieldTop)/(this.lineCount+1));
      this.lines.push({ y, width: this.fieldW*0.28, phase: Math.random()*10, speed: 1+i*0.4, x:0 });
    }
    this.guardGfx = this.add.graphics();
    this.player = {x:w/2, y:this.fieldBottom-10, r:14};
    this.playerGfx = this.add.circle(this.player.x,this.player.y,this.player.r,PAL.genteng).setStrokeStyle(2,0x2b1c12);
    this.finishY = this.fieldTop+10;

    this.statusTxt = this.add.text(w/2,h*0.92,`Nyawa: ${this.lives}  — Tembus semua garis jaga!`,{fontFamily:'VT323',fontSize:Math.max(14,w*0.026)+'px',color:'#BF5B21'}).setOrigin(0.5);
    this.im = new InputManager(this);
    this.im.addZone('left', 0, 0.55, 0.5, 0.35);
    this.im.addZone('right', 0.5, 0.55, 0.5, 0.35);
    this.add.text(w*0.25,h*0.72,'◀ GESER KIRI',{fontFamily:'Baloo 2',fontSize:Math.max(12,w*0.026)+'px',color:'#5C4033'}).setOrigin(0.5);
    this.add.text(w*0.75,h*0.72,'GESER KANAN ▶',{fontFamily:'Baloo 2',fontSize:Math.max(12,w*0.026)+'px',color:'#5C4033'}).setOrigin(0.5);
    this.climbSpeed = h*0.06; // px/sec upward
    this.gameOver=false;
  }
  _resetPlayer(){ this.player.x=this.scale.width/2; this.player.y=this.fieldBottom-10; }
  update(time, delta){
    if(this.gameOver) return;
    const dt=delta/1000;
    const leftDown = this.im.isZoneDown('left') || this.im.isKeyDown('A') || this.im.isKeyDown('LEFT');
    const rightDown = this.im.isZoneDown('right') || this.im.isKeyDown('D') || this.im.isKeyDown('RIGHT');
    if(leftDown) this.player.x -= 220*dt;
    if(rightDown) this.player.x += 220*dt;
    this.player.x = Phaser.Math.Clamp(this.player.x, this.fieldX+this.player.r, this.fieldX+this.fieldW-this.player.r);
    this.player.y -= this.climbSpeed*dt;

    this.lines.forEach(l=>{ l.phase += dt*l.speed; l.x = this.fieldX + this.fieldW/2 + Math.sin(l.phase)*(this.fieldW/2-l.width/2); });

    this.guardGfx.clear();
    this.lines.forEach(l=>{
      this.guardGfx.fillStyle(PAL.sogan,0.85);
      this.guardGfx.fillRect(l.x-l.width/2, l.y-8, l.width, 16);
      this.guardGfx.lineStyle(2,0x2b1c12,1);
      this.guardGfx.strokeRect(l.x-l.width/2, l.y-8, l.width, 16);
      // check catch
      if(Math.abs(this.player.y-l.y) < 10 && Math.abs(this.player.x-l.x) < l.width/2+this.player.r){
        this.lives--;
        this.statusTxt.setText(`Tertangkap! Nyawa: ${this.lives}`);
        this._resetPlayer();
        if(this.lives<=0){
          this.gameOver=true;
          this.statusTxt.setText('Kalah — regu jaga terlalu rapat. Coba lagi!');
          this.time.delayedCall(1500, ()=> this.scene.restart());
        }
      }
    });
    this.playerGfx.x=this.player.x; this.playerGfx.y=this.player.y;

    if(this.player.y <= this.finishY){
      this.gameOver=true;
      this.statusTxt.setText('BERHASIL TEMBUS MARKAS LAWAN! Menang!');
    }
  }
}
