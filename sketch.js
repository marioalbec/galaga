let nave;
let disparos = [];

function setup() {
  createCanvas(600, 800);
  nave = new Nave();
}

function draw() {
  background(0);

  nave.mostrar();
  nave.mover();

  for (let i = disparos.length - 1; i >= 0; i--) {
    disparos[i].mover();
    disparos[i].mostrar();
    if (disparos[i].fueraDePantalla()) {
      disparos.splice(i, 1);
    }
  }
}

function keyPressed() {
  if (key === 'ArrowLeft') nave.direccion = -1;
  if (key === 'ArrowRight') nave.direccion = 1;
  if (key === ' ') disparos.push(new Disparo(nave.x, nave.y));
}

function keyReleased() {
  if (key === 'ArrowLeft' || key === 'ArrowRight') nave.direccion = 0;
}

// Clase de la nave
class Nave {
  constructor() {
    this.x = width / 2;
    this.y = height - 60;
    this.direccion = 0;
  }

  mostrar() {
    fill(0, 255, 255);
    noStroke();
    triangle(this.x - 20, this.y, this.x + 20, this.y, this.x, this.y - 30);
  }

  mover() {
    this.x += this.direccion * 5;
    this.x = constrain(this.x, 20, width - 20);
  }
}

// Clase de disparo
class Disparo {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vel = 7;
  }

  mostrar() {
    fill(255, 0, 0);
    rect(this.x - 2, this.y, 4, 15);
  }

  mover() {
    this.y -= this.vel;
  }

  fueraDePantalla() {
    return this.y < 0;
  }
}
