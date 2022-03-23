import { Func } from '../core/func';
import { Canvas } from '../webgl/canvas';
import { Object3D } from 'three/src/core/Object3D';
import { Conf } from '../core/conf';
import { PlaneGeometry } from "three/src/geometries/PlaneGeometry";
import { MeshBasicMaterial } from "three/src/materials/MeshBasicMaterial";
import { Mesh } from 'three/src/objects/Mesh';
import { Util } from '../libs/util';
import { Color } from 'three';

export class Con extends Canvas {

  private _con: Object3D;
  private _mesh:Array<Mesh> = [];
  private _val:number = 0;
  private _color:Array<Color> = [];

  constructor(opt: any) {
    super(opt);

    for(let i = 0; i < 10; i++) {
      this._color.push(new Color(Util.instance.random(0, 1), Util.instance.random(0, 1), Util.instance.random(0, 1)))
    }
    this._color[0] = new Color(1 - this._color[1].r, this._color[1].g, 1 - this._color[1].b)
    // console.log(this._color[0])
    // console.log(this._color[1])
    // console.log(this._color[2])
    // this._color[0] = new Color(0.7138145373263294, 0.6410325089429487, 0.08928477973210569)

    this._con = new Object3D()
    this.mainScene.add(this._con)

    const geo = new PlaneGeometry(1, 1)
    for(let i = 0; i < 100; i++) {
      const m = new Mesh(
        geo,
        new MeshBasicMaterial({
          color:0xff0000,
          transparent:true
        })
      )
      this._con.add(m)
      this._mesh.push(m)
    }

    // センサー取得
    if(!Conf.instance.FLG_TEST && window.DeviceOrientationEvent) {
      document.querySelector('.l-btn')?.addEventListener('click', () => {
        (window.DeviceOrientationEvent as any).requestPermission().then((r:any) => {
          // Param.instance.debug.innerHTML = r
          if(r == 'granted') {
            window.addEventListener('deviceorientation', (e:DeviceOrientationEvent) => {
              this._val = Number(e.alpha)
              // const alpha = e.alpha
              // Param.instance.debug.innerHTML = 'test ' + alpha
            }, true)
            document.querySelector('.l-btn')?.classList.add('-none')
          }

        })
      })
    } else {
      document.querySelector('.l-btn')?.classList.add('-none')
    }

    this._resize()
  }



  protected _update(): void {
    super._update()
    this._con.position.y = Func.instance.screenOffsetY() * -1

    if(Conf.instance.FLG_TEST) {
      this._val += 2
      this._val = this._val % 360
    }


    const w = Func.instance.sw();
    // const h = Func.instance.sh();

    const len = this._mesh.length
    this._mesh.forEach((val, i) => {
      const radian = Util.instance.radian(i + this._val)
      const s = w * 0.5 * Util.instance.map(Math.cos(radian), 2, 1, -1, 1)
      val.scale.set(s, s * 0.02, 1)
      val.rotation.z = Util.instance.radian((360 / len) * i + this._val)

      // val.position.x = Math.sin(radian) * s * 0.1;
      // val.position.y = Math.cos(radian) * s * 0.1;

      const mat = val.material as MeshBasicMaterial;
      const r = Util.instance.map(Math.sin(radian), 0, 1, -1, 1)
      const col = this._color[1].clone()
      col.lerp(this._color[2], r)
      mat.color = col
    })

    if (this.isNowRenderFrame()) {
      this._render()
    }
  }


  private _render(): void {
    const bgColor = this._color[0]
    this.renderer.setClearColor(bgColor, 1)
    this.renderer.render(this.mainScene, this.camera)
  }


  public isNowRenderFrame(): boolean {
    return this.isRender
  }


  _resize(isRender: boolean = true): void {
    super._resize();

    const w = Func.instance.sw();
    const h = Func.instance.sh();

    if(Conf.instance.IS_SP || Conf.instance.IS_TAB) {
      if(w == this.renderSize.width && this.renderSize.height * 2 > h) {
        return
      }
    }

    this.renderSize.width = w;
    this.renderSize.height = h;

    this.updateCamera(this.camera, w, h);

    let pixelRatio: number = window.devicePixelRatio || 1;

    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.setSize(w, h);
    this.renderer.clear();

    if (isRender) {
      this._render();
    }
  }
}
