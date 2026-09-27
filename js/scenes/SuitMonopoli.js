/* ===================== SUWIT (Jawa) + MONOPOLI KAMPUNG ===================== */
class SuitMonopoliScene extends Phaser.Scene{
  constructor(){ super('SuitMonopoli'); }
  create(){
    const w=this.scale.width, h=this.scale.height;
    paperBG(this,w,h);
    this.add.text(w/2,h*0.06,'SUWIT & MONOPOLI KAMPUNG',{fontFamily:'Baloo 2',fontSize:Math.max(16,w*0.036)+'px',color:'#3D2B1F',fontStyle:'800'}).setOrigin(0.5);
    const back = woodButton(this, w*0.14, h*0.055, w*0.2, h*0.055, '< Desa', Math.max(11,w*0.018));
    back.base.on('pointerdown', ()=> this.scene.start('Hub'));
    this.phase='suit';
    this.suitWins=0; this.aiWins=0; this.round=0;
    this._buildSuit();
  }
  _clearDynamic(){ if(this.dyn) this.dyn.forEach(o=>o.destroy && o.destroy()); this.dyn=[]; }
  _buildSuit(){
    this._clearDynamic(); this.dyn=[];
    const w=this.scale.width, h=this.scale.height;
    const t1=this.add.text(w/2,h*0.16,'SUWIT JAWA — Orang > Gajah > Semut > Orang',{fontFamily:'VT323',fontSize:Math.max(13,w*0.024)+'px',color:'#5C4033'}).setOrigin(0.5);
    const t2=this.add.text(w/2,h*0.22,`Skor: Kamu ${this.suitWins} - ${this.aiWins} Lawan`,{fontFamily:'VT323',fontSize:Math.max(14,w*0.028)+'px',color:'#BF5B21'}).setOrigin(0.5);
    this.dyn.push(t1,t2); this.suitScoreTxt=t2;
    const opts=[['Gajah','🐘'],['Semut','🐜'],['Orang','🧍']];
    const bw=w*0.26, bh=h*0.12, gap=w*0.03, startX=w/2-(bw+gap);
    opts.forEach((o,i)=>{
      const btn=woodButton(this, startX+i*(bw+gap), h*0.45, bw, bh, o[1]+' '+o[0], Math.max(13,w*0.024));
      btn.base.on('pointerdown', ()=> this._suitPlay(o[0]));
      this.dyn.push(btn.cont);
    });
    this.resultTxt = this.add.text(w/2,h*0.65,'',{fontFamily:'Baloo 2',fontSize:Math.max(16,w*0.032)+'px',color:'#3D2B1F',fontStyle:'700'}).setOrigin(0.5);
    this.dyn.push(this.resultTxt);
  }
  _suitPlay(choice){
    const opts=['Gajah','Semut','Orang'];
    const ai = opts[Math.floor(Math.random()*3)];
    const beats={Orang:'Gajah', Gajah:'Semut', Semut:'Orang'};
    let outcome;
    if(choice===ai) outcome='seri';
    else if(beats[choice]===ai) outcome='menang';
    else outcome='kalah';
    if(outcome==='menang') this.suitWins++; else if(outcome==='kalah') this.aiWins++;
    this.round++;
    this.suitScoreTxt.setText(`Skor: Kamu ${this.suitWins} - ${this.aiWins} Lawan`);
    this.resultTxt.setText(`Kamu: ${choice}  vs  Lawan: ${ai}  →  ${outcome.toUpperCase()}`);
    if(this.suitWins>=2 || this.aiWins>=2){
      const youFirst = this.suitWins>=2;
      this.time.delayedCall(1400, ()=> this._buildPlayerSelect(youFirst));
    }
  }
  _buildPlayerSelect(youFirst){
    this._clearDynamic();
    const w=this.scale.width, h=this.scale.height;
    this.add.text(w/2,h*0.2, youFirst? 'Kamu menang suwit — jalan duluan!' : 'Lawan menang suwit — jalan duluan.', {fontFamily:'VT323',fontSize:Math.max(14,w*0.028)+'px',color:'#4A7C59'}).setOrigin(0.5);
    this.add.text(w/2,h*0.3,'Berapa pemain? (Gantian 1 HP)',{fontFamily:'VT323',fontSize:Math.max(14,w*0.026)+'px',color:'#5C4033'}).setOrigin(0.5);
    [2,3,4].forEach((n,i)=>{
      const btn=woodButton(this, w/2 + (i-1)*(w*0.24), h*0.45, w*0.2, h*0.1, n+' Pemain', Math.max(13,w*0.024));
      btn.base.on('pointerdown', ()=> this._startMonopoli(n));
    });
  }
  _startMonopoli(n){
    this.phase='monopoli';
    this.numPlayers=n;
    this.players=[]; const colors=[PAL.genteng,PAL.daun,PAL.jati,0x8a6d3b];
    for(let i=0;i<n;i++) this.players.push({name:'Pemain '+(i+1), pos:0, uang:500, color:colors[i]});
    this.turn=0;
    this.tiles=['Balai Desa','Sawah','Warung','Pos Ronda','Sawah','Warung','Sawah','Warung','Pos Ronda','Sawah','Warung','Sawah'];
    this.tileOwner = this.tiles.map(()=>null);
    this.tileBuilt = this.tiles.map(()=>false);
    this._buildBoard();
  }
  _tilePos(i){
    const w=this.scale.width, h=this.scale.height;
    const bx=w*0.12, by=h*0.28, bw=w*0.76, bh=h*0.5;
    const perSide=3;
    const side=Math.floor(i/perSide), idx=i%perSide;
    const t = idx/perSide;
    if(side===0) return {x:bx+t*bw, y:by+bh}; // bottom, left->right
    if(side===1) return {x:bx+bw, y:by+bh - t*bh}; // right, bottom->top
    if(side===2) return {x:bx+bw - t*bw, y:by}; // top, right->left
    return {x:bx, y:by + t*bh}; // left, top->bottom
  }
  _buildBoard(){
    this._clearDynamic(); this.dyn=[];
    const w=this.scale.width, h=this.scale.height;
    this.boardGfx = this.add.graphics(); this.dyn.push(this.boardGfx);
    this.tileTxts=[];
    this.tiles.forEach((t,i)=>{
      const p=this._tilePos(i);
      const r=this.add.rectangle(p.x,p.y,w*0.11,h*0.07, t==='Balai Desa'?PAL.jati:t==='Warung'?PAL.genteng:t==='Sawah'?PAL.daun:PAL.bambu).setStrokeStyle(2,0x2b1c12);
      const lbl=this.add.text(p.x,p.y,t,{fontFamily:'VT323',fontSize:Math.max(9,w*0.015)+'px',color:'#F5F1E8',align:'center',wordWrap:{width:w*0.1}}).setOrigin(0.5);
      this.dyn.push(r,lbl); this.tileTxts.push(lbl);
    });
    this.tokenGfx = this.add.graphics(); this.dyn.push(this.tokenGfx);
    this.turnTxt=this.add.text(w/2,h*0.16,'',{fontFamily:'Baloo 2',fontSize:Math.max(15,w*0.03)+'px',color:'#3D2B1F',fontStyle:'700'}).setOrigin(0.5); this.dyn.push(this.turnTxt);
    this.moneyTxt=this.add.text(w/2,h*0.21,'',{fontFamily:'VT323',fontSize:Math.max(12,w*0.022)+'px',color:'#5C4033'}).setOrigin(0.5); this.dyn.push(this.moneyTxt);
    this.eventTxt=this.add.text(w/2,h*0.83,'',{fontFamily:'VT323',fontSize:Math.max(12,w*0.024)+'px',color:'#BF5B21'}).setOrigin(0.5); this.dyn.push(this.eventTxt);
    this.diceBtn = woodButton(this, w*0.5, h*0.9, w*0.3, h*0.08, 'Lempar Dadu', Math.max(13,w*0.026));
    this.diceBtn.base.on('pointerdown', ()=> this._rollDice());
    this.dyn.push(this.diceBtn.cont);
    this.buildBtn=null;
    this._refreshHUD();
  }
  _refreshHUD(){
    const p=this.players[this.turn];
    this.turnTxt.setText(p.name+' — giliranmu!');
    this.moneyTxt.setText(this.players.map((pl,i)=>pl.name+': Rp'+pl.uang).join('   '));
    this.tokenGfx.clear();
    this.players.forEach((pl,i)=>{ const pos=this._tilePos(pl.pos); this.tokenGfx.fillStyle(pl.color,1); this.tokenGfx.fillCircle(pos.x+ (i-1.5)*8, pos.y-20, 7); this.tokenGfx.lineStyle(1,0x2b1c12,1); this.tokenGfx.strokeCircle(pos.x+(i-1.5)*8,pos.y-20,7); });
  }
  _rollDice(){
    if(this.buildBtn) return;
    const roll = 1+Math.floor(Math.random()*6);
    const p=this.players[this.turn];
    const oldPos=p.pos;
    p.pos = (p.pos+roll)%this.tiles.length;
    if(p.pos<oldPos) p.uang+=100; // passed Balai Desa
    const tileType=this.tiles[p.pos];
    let msg=`${p.name} lempar dadu: ${roll}. Mendarat di ${tileType}.`;
    if(tileType==='Sawah'){ p.uang+=50; msg+=' Panen +Rp50.'; }
    else if(tileType==='Pos Ronda'){ const ev=Math.random()>0.5?20:-20; p.uang+=ev; msg+= (ev>0?' Dapat ronjok +Rp':' Kena denda ronda -Rp')+Math.abs(ev)+'.'; }
    else if(tileType==='Warung'){
      const owner=this.tileOwner[p.pos];
      if(owner===null){
        msg+=' Warung kosong — bisa dibangun jadi Jembatan/Lumbung (Rp100).';
        this.buildBtn = woodButton(this, this.scale.width*0.5, this.scale.height*0.75, this.scale.width*0.4, this.scale.height*0.08, 'Bangun (Rp100)', Math.max(12,this.scale.width*0.02));
        this.buildBtn.base.on('pointerdown', ()=>{
          if(p.uang>=100){ p.uang-=100; this.tileOwner[p.pos]=this.turn; this.tileBuilt[p.pos]=true; this.eventTxt.setText(p.name+' membangun di petak ini!'); }
          this.buildBtn.cont.destroy(); this.buildBtn=null; this._endTurn();
        });
        this.dyn.push(this.buildBtn.cont);
      } else if(owner!==this.turn){
        const toll=50; p.uang-=toll; this.players[owner].uang+=toll;
        msg+=` Bayar tol Rp${toll} ke ${this.players[owner].name}.`;
      } else { msg+=' Ini milikmu sendiri.'; }
    } else { msg+=' Aman, istirahat sejenak.'; }
    this.eventTxt.setText(msg);
    this._refreshHUD();
    if(p.uang>=1000){ this.eventTxt.setText(p.name+' MENANG! Uang mencapai Rp1000!'); this.diceBtn.cont.destroy(); return; }
    if(p.uang<=0){ this.eventTxt.setText(p.name+' bangkrut! Permainan berakhir.'); this.diceBtn.cont.destroy(); return; }
    if(!this.buildBtn) this._endTurn();
  }
  _endTurn(){ this.turn=(this.turn+1)%this.numPlayers; this._refreshHUD(); }
}
