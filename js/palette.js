/* ===================== Shared palette / texture helpers ===================== */
const PAL = {jati:0x5C4033, sogan:0x3D2B1F, bambu:0xD9C5A0, kertas:0xF5F1E8, genteng:0xBF5B21, daun:0x4A7C59};

function paperBG(scene, w, h){
  const g = scene.add.graphics();
  g.fillStyle(PAL.kertas,1); g.fillRect(0,0,w,h);
  g.fillStyle(PAL.jati,0.06);
  for(let i=0;i<40;i++){ g.fillCircle(Math.random()*w, Math.random()*h, Math.random()*30+10); }
  return g;
}
function woodButton(scene, x, y, w, h, label, fontSize=22){
  const cont = scene.add.container(x,y);
  const base = scene.add.rectangle(0,0,w,h,PAL.jati).setStrokeStyle(4, 0x2b1c12);
  const inset = scene.add.rectangle(0,3,w-8,h-10,0x000000,0.18);
  const txt = scene.add.text(0,-2,label,{fontFamily:'Baloo 2', fontSize:fontSize+'px', color:'#F5F1E8', fontStyle:'700'}).setOrigin(0.5);
  cont.add([base, inset, txt]);
  cont.setSize(w,h);
  base.setInteractive({useHandCursor:true});
  base.on('pointerdown', ()=>{ cont.y+=3; scene.sound?.play?.('tok',{volume:0.001}); });
  base.on('pointerup', ()=>{ cont.y-=3; });
  base.on('pointerout', ()=>{ cont.y = y; });
  return {cont, base, txt};
}
