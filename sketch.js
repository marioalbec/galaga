// Variables globales
let nave;
let disparos = [];
let enemigos = [];
let puntaje = 0;
let vidas = 3;
let nivel = 1;
let juegoTerminado = false;
let mostrandoTransicion = false;
let tiempoTransicion = 0;

function setup() {
  createCanvas(600, 800);
  nave = new Nave();
  generarEnemigosNivel1();
}

function draw() {
  background(0);

  if (!juegoTerminado && !mostrandoTransicion) {
    nave.mostrar();
    nave.mover();

    // Disparos
    for (let i = disparos.length - 1; i >= 0; i--) {
      disparos[i].mover();
      disparos[i].mostrar();
      if (disparos[i].fueraDePantalla()) {
        disparos.splice(i, 1);
      }
    }

    // Enemigos
    for (let i = enemigos.length - 1; i >= 0; i--) {
      enemigos[i].mover();
      enemigos[i].mostrar();

      // Colisión con disparos
      for (let j = disparos.length - 1; j >= 0; j--) {
        if (enemigos[i].colision(disparos[j])) {
          enemigos.splice(i, 1);
          disparos.splice(j, 1);
          puntaje += 1;
          break;
        }
      }

      // Colisión con nave o fondo
      if (enemigos[i] && enemigos[i].y > height - 60) {
        enemigos.splice(i, 1);
        vidas -= 1;
        if (vidas <= 0) juegoTerminado = true;
      } else if (enemigos[i] && enemigos[i].colisionConNave(nave)) {
        enemigos.splice(i, 1);
        vidas -= 1;
        if (vidas <= 0) juegoTerminado = true;
      }
    }

    // Verificar si se terminó el nivel
    if (enemigos.length === 0) {
      mostrandoTransicion = true;
      tiempoTransicion = millis();
    }
  }

  // Mostrar HUD
  fill(255);
  textSize(20);
  text(`Puntaje: ${puntaje}`, 20, 30);
  text(`Vidas: ${vidas}`, 20, 60);
  text(`Nivel: ${nivel}`, 20, 90);

  // Transición entre niveles
  if (mostrandoTransicion) {
    textAlign(CENTER);
    textSize(32);
    fill(0, 255, 0);
    text(`¡Nivel ${nivel + 1}!`, width / 2, height / 2);

    if (millis() - tiempoTransicion > 2000) {
      nivel++;
      if (nivel === 2) {
        generarEnemigosNivel2();
      }
      mostrandoTransicion = false;
    }
  }

  // Fin del juego
  if (juegoTerminado) {
    textAlign(CENTER);
    textSize(40);
    fill(255, 0, 0);
    text("¡Juego Terminado!", width / 2, height / 2);
  }
}

function keyPressed() {
  if (key === 'a' || key === 'A') nave.direccion = -1;
  if (key === 'd' || key === 'D') nave.direccion = 1;
  if (key === ' ') disparos.push(new Disparo(nave.x, nave.y));
}

function keyReleased() {
  if (key === 'a' || key === 'A' || key === 'd' || key === 'D') nave.direccion = 0;
}

// --- Clases ---

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

class Enemigo {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.tam = 40;
    this.vel = 1;
  }

  mostrar() {
    fill(255, 204, 0);
    rect(this.x - this.tam / 2, this.y - this.tam / 2, this.tam, this.tam);
  }

  mover() {
    this.y += this.vel;
  }

  colision(disparo) {
    return (
      disparo.x > this.x - this.tam / 2 &&
      disparo.x < this.x + this.tam / 2 &&
      disparo.y > this.y - this.tam / 2 &&
      disparo.y < this.y + this.tam / 2
    );
  }

  colisionConNave(nave) {
    let d = dist(this.x, this.y, nave.x, nave.y);
    return d < this.tam / 2 + 20;
  }
}

// --- Funciones para generar enemigos por nivel ---

function generarEnemigosNivel1() {
  enemigos = [];
  for (let i = 0; i < 10; i++) {
    let x = 60 + i * 50;
    let y = 60;
    enemigos.push(new Enemigo(x, y));
  }
}

function generarEnemigosNivel2() {
  enemigos = [];
  for (let i = 0; i < 12; i++) {
    let x = 40 + (i % 6) * 80;
    let y = 60 + floor(i / 6) * 80;
    enemigos.push(new Enemigo(x, y));
  }
}
