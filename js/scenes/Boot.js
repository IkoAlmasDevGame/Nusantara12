/* ===================== BOOT / HUB ===================== */
class BootScene extends Phaser.Scene{
  constructor(){ super('Boot'); }
  create(){ this.scene.start('Hub'); }
}

const GAMES = [
  {id:'congklak', name:'Congklak', desc:'Mancala melawan Mbah AI', color:PAL.daun, unlocked:true},
  {id:'lompattali', name:'Lompat Tali', desc:'Rhythm tali karet', color:PAL.genteng, unlocked:true},
  {id:'bakiak', name:'Bakiak', desc:'Co-op 3 orang 1 HP', color:PAL.jati, unlocked:true},
  {id:'engklek', name:'Engklek', desc:'Lempar gaco & lompat', color:PAL.bambu, unlocked:true},
  {id:'egrang', name:'Egrang', desc:'Jaga imbang, jalan 100m', color:PAL.genteng, unlocked:true},
  {id:'kelereng', name:'Kelereng', desc:'Flick sentil gundu', color:PAL.sogan, unlocked:true},
  {id:'gobaksodor', name:'Gobak Sodor', desc:'Tembus jaga penjaga', color:PAL.daun, unlocked:true},
  {id:'layangan', name:'Layangan Adu', desc:'Tarik-ulur, putus benang lawan', color:PAL.genteng, unlocked:true},
  {id:'suitmonopoli', name:'Suwit & Monopoli', desc:'Suit Jawa + Monopoli Kampung', color:PAL.jati, unlocked:true},
  {id:'bentengan', name:'Bentengan', desc:'Rebut & tawan musuh', color:PAL.sogan, unlocked:true},
  {id:'petakumpet', name:'Petak Umpet', desc:'Cari teman 60 detik', color:PAL.daun, unlocked:true},
  {id:'balapkarung', name:'Balap Karung', desc:'Lompat + gigit kerupuk', color:PAL.genteng, unlocked:true},
];

class HubScene extends Phaser.Scene{
  constructor(){ super('Hub'); }
  create(){
    const w=this.scale.width, h=this.scale.height;
    paperBG(this,w,h);
    this.add.text(w/2, h*0.08, 'NUSANTARA 12', {fontFamily:'Baloo 2', fontSize: Math.max(28,w*0.06)+'px', color:'#3D2B1F', fontStyle:'800'}).setOrigin(0.5);
    this.add.text(w/2, h*0.14, 'Museum Game Tradisional — pilih arena', {fontFamily:'VT323', fontSize: Math.max(16,w*0.03)+'px', color:'#5C4033'}).setOrigin(0.5);

    const cols = w<600?3: w<1000?4:6;
    const margin = w*0.04;
    const cellW = (w - margin*(cols+1))/cols;
    const cellH = cellW*0.85;
    const startY = h*0.22;

    GAMES.forEach((g,i)=>{
      const col = i%cols, row = Math.floor(i/cols);
      const x = margin + col*(cellW+margin) + cellW/2;
      const y = startY + row*(cellH+margin*0.8) + cellH/2;
      const tile = this.add.rectangle(x,y,cellW,cellH, g.unlocked?g.color:0x8a7f6b).setStrokeStyle(4,0x2b1c12);
      tile.setAlpha(g.unlocked?1:0.5);
      this.add.text(x,y-cellH*0.15,g.name,{fontFamily:'Baloo 2', fontSize:Math.max(12,cellW*0.14)+'px', color:'#F5F1E8', fontStyle:'700', align:'center', wordWrap:{width:cellW-10}}).setOrigin(0.5);
      this.add.text(x,y+cellH*0.22,g.desc,{fontFamily:'VT323', fontSize:Math.max(10,cellW*0.09)+'px', color:'#F5F1E8', align:'center', wordWrap:{width:cellW-10}}).setOrigin(0.5);
      if(g.unlocked){
        tile.setInteractive({useHandCursor:true});
        const SCENE_MAP = {congklak:'Congklak', lompattali:'LompatTali', bakiak:'Bakiak', engklek:'Engklek', egrang:'Egrang', kelereng:'Kelereng', gobaksodor:'GobakSodor', layangan:'Layangan', suitmonopoli:'SuitMonopoli', bentengan:'Bentengan', petakumpet:'PetakUmpet', balapkarung:'BalapKarung'};
        tile.on('pointerdown', ()=>{ this.scene.start(SCENE_MAP[g.id] || 'Hub'); });
      }
    });
  }
}
