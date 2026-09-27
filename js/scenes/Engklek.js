/* ===================== ENGKLEK / SUNDA MANDA ===================== */
// Classic pattern: 1(single) 2-3(double) 4(single) 5-6(double) 7(single) 8(double, "gunung")
class EngklekScene extends Phaser.Scene{
  constructor(){ super('Engklek'); }
  create(){
    const w=this.scale.width, h=this.scale.height;
    paperBG(this,w,h);
    this.add.text(w/2,h*0.06,'ENGKLEK /\nSUNDA MANDA',{fontFamily:'Baloo 2',fontSize:Math.max(14,w*0.032)+'px',color:'#3D2B1F',fontStyle:'800',align:'center'}).setOrigin(0.5);
    const back = woodButton(this, Math.max(34,w*0.09), Math.max(40,h*0.06), Math.min(56,w*0.16), Math.max(40,h*0.06), '◀', Math.max(18,w*0.024));
    back.base.on('pointerdown', ()=> this.scene.start('Hub'));

    // petak layout definition: each entry {n, type:'single'|'double', pair? for double share column}
    this.layout = [
      {n:1,type:'single'},{n:2,type:'double'},{n:3,type:'double'},{n:4,type:'single'},
      {n:5,type:'double'},{n:6,type:'double'},{n:7,type:'single'},{n:8,type:'double'}
    ];
    this.mapNames=['Peta 1: Sawah','Peta 2: Kampung','Peta 3: Balai Desa','Peta 4: Pasar','Peta 5: Gunung'];
    this.mapSpeed=[900,780,660,540,420];
    this.round=0; // 0..4 -> also gaco target petak number = round+1 (only up to 5 of 8 petak used across maps for pace)
    this.phase='throw'; // throw -> hop -> return -> done
    this.hopIndex=0; this.path=[]; this.fail=false;

    this.mapTxt=this.add.text(w/2,h*0.13,this.mapNames[0],{fontFamily:'VT323',fontSize:Math.max(16,w*0.032)+'px',color:'#BF5B21'}).setOrigin(0.5);
    this.instrTxt=this.add.text(w/2,h*0.18,'Lempar gaco ke petak target: '+ (this.round+1),{fontFamily:'VT323',fontSize:Math.max(14,w*0.026)+'px',color:'#5C4033'}).setOrigin(0.5);

    // draw board
    this.cells=[]; this.gacoSprite=null;
    const boardTop=h*0.28, boardBottom=h*0.82, colCount=2;
    const cellH=(boardBottom-boardTop)/8, cellW=Math.min(w*0.22, h*0.09);
    const cx=w*0.5;
    this.layout.forEach((cellDef,i)=>{
      const y = boardBottom - (i+0.5)*cellH; // petak 1 nearest bottom
      if(cellDef.type==='single'){
        const rect=this.add.rectangle(cx,y,cellW,cellH*0.9,PAL.bambu).setStrokeStyle(3,0x2b1c12);
        const t=this.add.text(cx,y,String(cellDef.n),{fontFamily:'Baloo 2',fontSize:Math.max(14,cellW*0.3)+'px',color:'#3D2B1F',fontStyle:'700'}).setOrigin(0.5);
        rect.setInteractive({useHandCursor:true});
        rect.on('pointerdown', ()=> this._onCellTap(cellDef.n, rect));
        this.cells.push({n:cellDef.n, rect, t, x:cx, y});
      } else {
        // double: draw once spanning wider, but two numbers share this row (walked together)
        if(!this._doublePending){ this._doublePending=cellDef; return; }
        const pairA=this._doublePending, pairB=cellDef;
        const rectL=this.add.rectangle(cx-cellW*0.55,y,cellW,cellH*0.9,PAL.bambu).setStrokeStyle(3,0x2b1c12);
        const rectR=this.add.rectangle(cx+cellW*0.55,y,cellW,cellH*0.9,PAL.bambu).setStrokeStyle(3,0x2b1c12);
        const tL=this.add.text(cx-cellW*0.55,y,String(pairA.n),{fontFamily:'Baloo 2',fontSize:Math.max(14,cellW*0.3)+'px',color:'#3D2B1F',fontStyle:'700'}).setOrigin(0.5);
        const tR=this.add.text(cx+cellW*0.55,y,String(pairB.n),{fontFamily:'Baloo 2',fontSize:Math.max(14,cellW*0.3)+'px',color:'#3D2B1F',fontStyle:'700'}).setOrigin(0.5);
        [rectL,rectR].forEach(r=>{ r.setInteractive({useHandCursor:true}); r.on('pointerdown', ()=> this._onCellTap(pairA.n, rectL, rectR)); });
        this.cells.push({n:pairA.n, rect:rectL, t:tL, x:cx-cellW*0.55, y});
        this.cells.push({n:pairB.n, rect:rectR, t:tR, x:cx+cellW*0.55, y, isPartner:true});
        this._doublePending=null;
      }
    });

    this.gacoTarget = this.round+1;
    this._highlightTarget();
    this.im = new InputManager(this);
    this.im.addZone('hop', 0, 0.55, 1, 0.4);
    this.input.keyboard?.on('keydown-SPACE', ()=> this._tryHop());
    this._zoneWasDown=false;
  }
  _highlightTarget(){
    this.cells.forEach(c=>{ c.rect.setFillStyle(c.n===this.gacoTarget?PAL.genteng:PAL.bambu); });
  }
  _onCellTap(n, rectA, rectB){
    if(this.phase!=='throw') return;
    if(n===this.gacoTarget){
      this.phase='hop'; this.hopIndex=0;
      this.path = this.layout.map(c=>c.n).filter(n2=>n2!==this.gacoTarget); // skip gaco square when hopping through
      this.instrTxt.setText('Lompat lewati petak (jangan injak petak merah)! Tap ritme.');
      rectA.setFillStyle(PAL.jati); if(rectB) rectB.setFillStyle(PAL.jati);
      this._spawnHopMarker();
    } else {
      this.instrTxt.setText('Meleset! Coba lempar lagi ke petak '+this.gacoTarget);
    }
  }
  _spawnHopMarker(){
    if(this.hopIndex>=this.path.length){ this._completeRound(); return; }
    const n = this.path[this.hopIndex];
    this.cells.forEach(c=> c.rect.setFillStyle(c.n===this.gacoTarget?PAL.jati: c.n===n?PAL.daun:PAL.bambu));
    this.currentHopN = n;
    this.hopReady=true;
    this.hopTimer = this.mapSpeed[this.round];
    this.hopElapsed=0;
  }
  _tryHop(){
    if(this.phase!=='hop' || !this.hopReady) return;
    this.hopReady=false;
    const cell = this.cells.find(c=>c.n===this.currentHopN);
    if(cell) cell.rect.setFillStyle(PAL.sogan);
    this.hopIndex++;
    this.time.delayedCall(150, ()=> this._spawnHopMarker());
  }
  _completeRound(){
    this.phase='done';
    this.round++;
    if(this.round>=5){
      this.instrTxt.setText('SELESAI! Semua 5 peta engklek berhasil dilalui. Hebat!');
      this.mapTxt.setText('Tamat 🎉');
      return;
    }
    this.gacoTarget = this.round+1;
    this.mapTxt.setText(this.mapNames[this.round]);
    this.instrTxt.setText('Lempar gaco ke petak target: '+this.gacoTarget);
    this.phase='throw';
    this._highlightTarget();
  }
  update(delta_unused, delta){
    if(this.phase==='hop' && this.hopReady){
      this.hopElapsed += this.game.loop.delta;
      if(this.hopElapsed > this.hopTimer*1.8){
        // missed the beat window -> stumble, restart this map's hop sequence
        this.instrTxt.setText('Goyah! Ulangi lompatan peta ini.');
        this.hopIndex=0; this._spawnHopMarker();
      }
    }
    const down = this.im.isZoneDown('hop');
    if(down && !this._zoneWasDown) this._tryHop();
    this._zoneWasDown = down;
  }
}
