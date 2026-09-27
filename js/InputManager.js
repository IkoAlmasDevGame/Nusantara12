/* ===================== InputManager.js (inlined) ===================== */
class InputManager {
  constructor(scene){
    this.scene = scene;
    this.keys = scene.input.keyboard ? scene.input.keyboard.addKeys('W,A,S,D,Q,O,P,LEFT,RIGHT,SPACE,UP,DOWN') : null;
    this.zones = []; // {id,x,y,w,h,pointerId,active}
    this.activePointers = new Map();
    scene.input.on('pointerdown', p => this._down(p));
    scene.input.on('pointerup', p => this._up(p));
    scene.input.on('pointermove', p => this._move(p));
  }
  // Register a touch zone in NORMALIZED coords (0..1) so it works on 320px-1440px alike
  addZone(id, nx, ny, nw, nh){ this.zones.push({id, nx, ny, nw, nh, down:false}); }
  clearZones(){ this.zones = []; }
  _hit(zone, x, y){
    const w = this.scene.scale.width, h = this.scene.scale.height;
    const zx = zone.nx*w, zy = zone.ny*h, zw = zone.nw*w, zh = zone.nh*h;
    return x>=zx && x<=zx+zw && y>=zy && y<=zy+zh;
  }
  _down(p){
    for(const z of this.zones){ if(this._hit(z,p.x,p.y)){ z.down=true; this.activePointers.set(p.id,z.id);} }
  }
  _up(p){
    const zid = this.activePointers.get(p.id);
    if(zid){ const z=this.zones.find(z=>z.id===zid); if(z) z.down=false; this.activePointers.delete(p.id); }
  }
  _move(p){ /* multi-touch drag not required for tap zones */ }
  isZoneDown(id){ const z=this.zones.find(z=>z.id===id); return z? z.down : false; }
  isKeyDown(name){ return this.keys && this.keys[name] ? this.keys[name].isDown : false; }
  justDownKey(name){ return this.keys && this.keys[name] ? Phaser.Input.Keyboard.JustDown(this.keys[name]) : false; }
}
window.InputManager = InputManager;
