/* ===================== EGRANG (Balance) ===================== */
class EgrangScene extends Phaser.Scene{
  constructor(){ super('Egrang'); }
  create(){
    const w=this.scale.width, h=this.scale.height;
    paperBG(this,w,h);
    this.add.text(w/2,h*0.06,'EGRANG',{fontFamily:'Baloo 2',fontSize:Math.max(20,w*0.045)+'px',color:'#3D2B1F',fontStyle:'800'}).setOrigin(0.5);
    const back = woodButton(this, w*0.14, h*0.055, w*0.2, h*0.055, '< Desa', Math.max(11,w*0.018));
    back.base.on('pointerdown', ()=> this.scene.start('Hub'));

    this.bal=0; this.progress=0; this.finish=100; this.driftPhase=Math.random()*10; this.gyroOn=false; this.fallen=false;

    // balance bar
    const barW=w*0.7, barY=h*0.22;
    this.add.rectangle(w/2,barY,barW,20,PAL.bambu).setStrokeStyle(3,0x2b1c12);
    this.safeZone = this.add.rectangle(w/2,barY,barW*0.6,20,PAL.daun,0.35);
    this.marker = this.add.rectangle(w/2,barY,10,28,PAL.genteng);
    this.balBarW = barW;

    this.add.text(w/2,h*0.13,'Jaga jarum tetap di zona hijau!',{fontFamily:'VT323',fontSize:Math.max(14,w*0.028)+'px',color:'#5C4033'}).setOrigin(0.5);

    // stick figure
    this.stick = this.add.container(w/2, h*0.5);
    const leg1=this.add.rectangle(-8,20,6,50,PAL.jati); const leg2=this.add.rectangle(8,20,6,50,PAL.jati);
    const body=this.add.rectangle(0,-15,14,45,PAL.genteng);
    const head=this.add.circle(0,-45,14,PAL.bambu).setStrokeStyle(2,0x2b1c12);
    this.stick.add([leg1,leg2,body,head]);

    // progress bar
    this.add.text(w/2,h*0.78,'Jarak',{fontFamily:'VT323',fontSize:Math.max(12,w*0.024)+'px',color:'#5C4033'}).setOrigin(0.5);
    this.add.rectangle(w/2,h*0.82,w*0.7,22,PAL.bambu).setStrokeStyle(3,0x2b1c12);
    this.progFill = this.add.rectangle(w/2-w*0.35,h*0.82,2,18,PAL.daun).setOrigin(0,0.5);
    this.progressBarW = w*0.7;
    this.statusTxt = this.add.text(w/2,h*0.9,'Tekan/tap kiri-kanan melawan arah oleng',{fontFamily:'VT323',fontSize:Math.max(13,w*0.024)+'px',color:'#BF5B21'}).setOrigin(0.5);

    this.im = new InputManager(this);
    this.im.addZone('left', 0, 0.55, 0.5, 0.35);
    this.im.addZone('right', 0.5, 0.55, 0.5, 0.35);
    this.add.text(w*0.25,h*0.7,'◀ KIRI',{fontFamily:'Baloo 2',fontSize:Math.max(14,w*0.03)+'px',color:'#5C4033'}).setOrigin(0.5);
    this.add.text(w*0.75,h*0.7,'KANAN ▶',{fontFamily:'Baloo 2',fontSize:Math.max(14,w*0.03)+'px',color:'#5C4033'}).setOrigin(0.5);

    const gyroBtn = woodButton(this, w*0.86, h*0.055, w*0.24, h*0.055, 'Pakai Gyro', Math.max(10,w*0.016));
    gyroBtn.base.on('pointerdown', ()=> this._enableGyro());
  }
  _enableGyro(){
    const start = ()=>{
      this.gyroOn=true;
      window.addEventListener('deviceorientation', (e)=>{ this._gamma = e.gamma||0; });
    };
    if(typeof DeviceOrientationEvent!=='undefined' && typeof DeviceOrientationEvent.requestPermission==='function'){
      DeviceOrientationEvent.requestPermission().then(res=>{ if(res==='granted') start(); }).catch(()=>{});
    } else { start(); }
  }
  update(time, delta){
    if(this.fallen) return;
    const dt = delta/1000;
    this.driftPhase += dt*0.8;
    const drift = Math.sin(this.driftPhase)*0.35 + Math.sin(this.driftPhase*2.3)*0.15;
    if(this.gyroOn){
      const target = Phaser.Math.Clamp((this._gamma||0)/45, -1, 1);
      this.bal += (target - this.bal)*0.15 + drift*dt;
    } else {
      const leftDown = this.im.isZoneDown('left') || this.im.isKeyDown('A');
      const rightDown = this.im.isZoneDown('right') || this.im.isKeyDown('D');
      this.bal += drift*dt;
      if(leftDown) this.bal -= 1.2*dt;
      if(rightDown) this.bal += 1.2*dt;
    }
    this.bal = Phaser.Math.Clamp(this.bal, -1.3, 1.3);
    this.marker.x = this.scale.width/2 + this.bal*(this.balBarW/2)*0.9;
    this.stick.rotation = this.bal*0.5;

    if(Math.abs(this.bal) < 0.6){
      this.progress += dt*8;
    }
    if(Math.abs(this.bal) >= 1.2){
      this.fallen=true;
      this.statusTxt.setText('Jatuh! Coba lagi dari awal petualangan.');
      this.time.delayedCall(1400, ()=> this.scene.restart());
      return;
    }
    this.progress = Phaser.Math.Clamp(this.progress, 0, this.finish);
    this.progFill.width = 2 + (this.progress/this.finish)*(this.progressBarW-4);
    if(this.progress>=this.finish){
      this.statusTxt.setText('SAMPAI 100 METER! Egrang jagoan!');
    }
  }
}
