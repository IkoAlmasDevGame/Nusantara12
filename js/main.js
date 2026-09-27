/* ===================== BOOT GAME ===================== */
window.addEventListener('load', ()=>{
  const config = {
    type: Phaser.AUTO,
    canvas: document.getElementById('gamecanvas'),
    width: Math.min(window.innerWidth, 1440),
    height: Math.min(window.innerHeight, 900),
    backgroundColor: '#3D2B1F',
    scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: [BootScene, HubScene, CongklakScene, LompatTaliScene, BakiakScene, EngklekScene, EgrangScene, KelerengScene, GobakSodorScene, LayanganScene, SuitMonopoliScene, BentenganScene, PetakUmpetScene, BalapKarungScene]
  };
  const game = new Phaser.Game(config);
  document.getElementById('loading').style.display='none';
});
