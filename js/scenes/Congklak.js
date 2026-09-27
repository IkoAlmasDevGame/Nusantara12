/* ===================== 1) CONGKLAK (Mancala, Minimax AI) ===================== */
class CongklakScene extends Phaser.Scene{
  constructor(){ super('Congklak'); }
  create(){
    const w=this.scale.width, h=this.scale.height;
    paperBG(this,w,h);
    this.add.text(w/2,h*0.06,'CONGKLAK',{fontFamily:'Baloo 2',fontSize:Math.max(22,w*0.05)+'px',color:'#3D2B1F',fontStyle:'800'}).setOrigin(0.5);
    const back = woodButton(this, w*0.12, h*0.06, w*0.16, h*0.06, '< Desa', Math.max(12,w*0.02));
    back.base.on('pointerdown', ()=> this.scene.start('Hub'));

    // board: 7 holes each side (index 0-6 player, 7 lumbung player, 8-14 AI, 15 lumbung AI)
    this.pits = [7,7,7,7,7,7,7, 0, 7,7,7,7,7,7,7, 0];
    this.PLAYER_PITS=[0,1,2,3,4,5,6]; this.PLAYER_HOME=7;
    this.AI_PITS=[8,9,10,11,12,13,14]; this.AI_HOME=15;
    this.turn='player'; this.gameOver=false;

    this.pitGfx=[]; this.pitTxt=[];
    const boardW=w*0.9, boardX=w*0.05, topY=h*0.22, botY=h*0.72;
    const pitR = Math.min(w,h)*0.045;
    const gap = boardW/8;
    for(let i=0;i<7;i++){ this._makePit(8+ (6-i), boardX+gap*(i+1), topY, pitR); } // AI row (reversed visually)
    this._makePit(15, boardX+gap*7.5, h/2, pitR*1.2); // AI home right... actually place homes at ends
    this._makePit(7, boardX+gap*0.2, h/2, pitR*1.2); // player home left
    for(let i=0;i<7;i++){ this._makePit(i, boardX+gap*(i+1), botY, pitR); }

    this.statusTxt = this.add.text(w/2, h*0.9, 'Giliranmu — pilih lubang', {fontFamily:'VT323', fontSize:Math.max(14,w*0.03)+'px', color:'#3D2B1F'}).setOrigin(0.5);
    this._refresh();
  }
  _makePit(idx,x,y,r){
    const isHome = idx===7||idx===15;
    const c = this.add.circle(x,y,r, isHome?PAL.jati:PAL.bambu).setStrokeStyle(3,0x2b1c12);
    const t = this.add.text(x,y,'',{fontFamily:'VT323',fontSize:Math.max(14,r*0.7)+'px',color:isHome?'#F5F1E8':'#3D2B1F'}).setOrigin(0.5);
    this.pitGfx[idx]=c; this.pitTxt[idx]=t;
    if(this.PLAYER_PITS && this.PLAYER_PITS.includes(idx)){
      c.setInteractive({useHandCursor:true});
      c.on('pointerdown', ()=> this._playerMove(idx));
    }
  }
  _refresh(){ for(let i=0;i<16;i++){ if(this.pitTxt[i]) this.pitTxt[i].setText(this.pits[i]>0||i===7||i===15? String(this.pits[i]):''); } }
  _sow(pits, startIdx, skipHole){
    let seeds = pits[startIdx]; pits[startIdx]=0; let i=startIdx;
    while(seeds>0){ i=(i+1)%16; if(i===skipHole) continue; pits[i]++; seeds--; }
    return i;
  }
  _playerMove(idx){
    if(this.turn!=='player' || this.gameOver || this.pits[idx]===0) return;
    const last = this._sow(this.pits, idx, this.AI_HOME);
    this._resolveCapture(last, this.PLAYER_PITS, this.PLAYER_HOME, this.AI_PITS);
    this._refresh();
    if(last===this.PLAYER_HOME){ this.statusTxt.setText('Nembak! Jalan lagi.'); this._checkEnd(); return; } // extra turn
    this.turn='ai'; this.statusTxt.setText('Mbah AI berpikir...'); this._checkEnd();
    if(!this.gameOver) this.time.delayedCall(700, ()=> this._aiTurn());
  }
  _resolveCapture(last, ownPits, ownHome, oppPits){
    if(ownPits.includes(last) && this.pits[last]===1){
      const mirror = 14-last; // mirrored pit across the board (works for both sides symmetrically here)
      if(this.pits[mirror]>0){
        this.pits[ownHome]+= this.pits[mirror]+1; this.pits[last]=0; this.pits[mirror]=0;
      }
    }
  }
  _aiTurn(){
    const best = this._minimax(this.pits.slice(), 4, true, -Infinity, Infinity).move;
    const move = best!==undefined? best : this.AI_PITS.find(p=>this.pits[p]>0);
    if(move===undefined){ this._checkEnd(true); return; }
    const last = this._sow(this.pits, move, this.PLAYER_HOME);
    this._resolveCapture(last, this.AI_PITS, this.AI_HOME, this.PLAYER_PITS);
    this._refresh();
    if(last===this.AI_HOME){ this.statusTxt.setText('AI jalan lagi...'); this._checkEnd(); if(!this.gameOver) this.time.delayedCall(600,()=>this._aiTurn()); return; }
    this.turn='player'; this.statusTxt.setText('Giliranmu — pilih lubang');
    this._checkEnd();
  }
  _minimax(pits, depth, maximizing, alpha, beta){
    const pitsList = maximizing? this.AI_PITS: this.PLAYER_PITS;
    const valid = pitsList.filter(p=>pits[p]>0);
    if(depth===0 || valid.length===0){ return {score: pits[this.AI_HOME]-pits[this.PLAYER_HOME]}; }
    let bestMove; let bestScore = maximizing? -Infinity: Infinity;
    for(const p of valid){
      const cp = pits.slice();
      const last = this._sow(cp, p, maximizing? this.PLAYER_HOME: this.AI_HOME);
      const extra = maximizing? last===this.AI_HOME : last===this.PLAYER_HOME;
      const res = this._minimax(cp, depth-1, extra? maximizing : !maximizing, alpha, beta);
      const score = res.score;
      if(maximizing){ if(score>bestScore){bestScore=score;bestMove=p;} alpha=Math.max(alpha,score); }
      else { if(score<bestScore){bestScore=score;bestMove=p;} beta=Math.min(beta,score); }
      if(beta<=alpha) break;
    }
    return {score:bestScore, move:bestMove};
  }
  _checkEnd(force){
    const playerEmpty = this.PLAYER_PITS.every(p=>this.pits[p]===0);
    const aiEmpty = this.AI_PITS.every(p=>this.pits[p]===0);
    if(force || playerEmpty || aiEmpty){
      this.AI_PITS.forEach(p=>{this.pits[this.AI_HOME]+=this.pits[p]; this.pits[p]=0;});
      this.PLAYER_PITS.forEach(p=>{this.pits[this.PLAYER_HOME]+=this.pits[p]; this.pits[p]=0;});
      this._refresh(); this.gameOver=true;
      const win = this.pits[this.PLAYER_HOME]>this.pits[this.AI_HOME];
      this.statusTxt.setText((win?'Kamu Menang! ':'Mbah AI Menang! ')+`${this.pits[this.PLAYER_HOME]} - ${this.pits[this.AI_HOME]}`);
    }
  }
}
