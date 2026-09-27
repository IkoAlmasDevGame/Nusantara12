/* ===================== PETAK UMPET (Search 60s) ===================== */
class PetakUmpetScene extends Phaser.Scene{
  constructor(){ super('PetakUmpet'); }
  create(){
    const w=this.scale.width, h=this.scale.height;
    paperBG(this,w,h);
    this.add.text(w/2,h*0.06,'PETAK UMPET',{fontFamily:'Baloo 2',fontSize:Math.max(20,w*0.045)+'px',color:'#3D2B1F',fontStyle:'800'}).setOrigin(0.5);
    const back = woodButton(this, Math.max(34,w*0.09), Math.max(40,h*0.06), Math.min(56,w*0.16), Math.max(40,h*0.06), '◀', Math.max(18,w*0.024));
    back.base.on('pointerdown', ()=> this.scene.start('Hub'));

    const names=['Sari','Budi','Wayan','Made'];
    const spotCount=9, hideCount=4;
    const idxPool=Phaser.Utils.Array.NumberArray(0,spotCount-1);
    Phaser.Utils.Array.Shuffle(idxPool);
    this.hiddenAt = idxPool.slice(0,hideCount);
    this.hiddenNames = names;
    this.found=0; this.timeLeft=60; this.over=false;

    const cols=3, rows=3, marginX=w*0.08, marginY=h*0.24, cw=(w-marginX*2)/cols, ch=Math.min(h*0.16, cw*0.8);
    this.spots=[];
    for(let i=0;i<spotCount;i++){
      const col=i%cols, row=Math.floor(i/cols);
      const x=marginX+col*cw+cw/2, y=marginY+row*(ch+h*0.03)+ch/2;
      const rect=this.add.rectangle(x,y,cw*0.85,ch*0.85,PAL.daun).setStrokeStyle(3,0x2b1c12).setInteractive({useHandCursor:true});
      const icon=this.add.text(x,y,'🌳',{fontFamily:'Baloo 2',fontSize:Math.max(20,cw*0.3)+'px'}).setOrigin(0.5);
      rect.on('pointerdown', ()=> this._check(i, rect, icon));
      this.spots.push({rect,icon,checked:false});
    }
    this.foundTxt=this.add.text(w/2,h*0.15,`Ditemukan: 0/${hideCount}`,{fontFamily:'VT323',fontSize:Math.max(14,w*0.028)+'px',color:'#BF5B21'}).setOrigin(0.5);
    this.timeTxt=this.add.text(w/2,h*0.19,'Waktu: 60s',{fontFamily:'VT323',fontSize:Math.max(12,w*0.022)+'px',color:'#5C4033'}).setOrigin(0.5);
    this.msgTxt=this.add.text(w/2,h*0.92,'Ketuk semak/tempat sembunyi untuk mencari teman!',{fontFamily:'VT323',fontSize:Math.max(11,w*0.02)+'px',color:'#5C4033',align:'center',wordWrap:{width:w*0.9}}).setOrigin(0.5);

    this.time.addEvent({delay:1000, loop:true, callback:()=>{
      if(this.over) return;
      this.timeLeft--; this.timeTxt.setText('Waktu: '+this.timeLeft+'s');
      if(this.timeLeft<=0) this._endGame();
    }});
  }
  _check(i, rect, icon){
    if(this.over || this.spots[i].checked) return;
    this.spots[i].checked=true;
    const hideIdx = this.hiddenAt.indexOf(i);
    if(hideIdx>=0){
      rect.setFillStyle(PAL.genteng); icon.setText('🙂');
      this.found++; this.foundTxt.setText(`Ditemukan: ${this.found}/${this.hiddenAt.length}`);
      this.msgTxt.setText(`Ketemu! ${this.hiddenNames[hideIdx]} nongol dari balik pohon!`);
      if(this.found>=this.hiddenAt.length) this._endGame(true);
    } else {
      rect.setFillStyle(0x8a7f6b); icon.setText('🍃');
      this.msgTxt.setText('Sepi... coba tempat lain.');
    }
  }
  _endGame(won){
    this.over=true;
    this.msgTxt.setText(won? 'SEMUA TEMAN KETEMU! Kamu jago petak umpet!' : `Waktu habis. Ditemukan ${this.found}/${this.hiddenAt.length}.`);
  }
}
