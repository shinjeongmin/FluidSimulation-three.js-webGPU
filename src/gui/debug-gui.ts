import GUI from "lil-gui";
import {SPH as _SPH} from '../sph'

const gui = new GUI();

export function init(){
}

export function setShowSphere(name: string, value: boolean, SPH: _SPH){
  const object = {[name]: value};
  gui.add(object, name).onChange(value =>{
    SPH.setShowSpheres(value);
  })
}