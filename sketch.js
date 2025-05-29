// Variables globales
let nave;
let disparos = [];
let disparosEnemigos = [];
let enemigos = [];
let puntaje = 0;
let vidas = 3;
let nivel = 1;
let jefeGenerado = false;
let juegoTerminado = false;
let top5Actualizado = false;
let mostrandoTransicion = false;
let tiempoTransicion = 0;
let top5 = [];

function setup() {
  createCanvas(600, 800);
  nave = new Nave();
  cargarTop5();
  iniciarNivel(nivel);
}

function draw() {
  background(0);

  if (!juegoTerminado && !mostrandoTransicion) {
    // Mostrar y mover nave
    nave.mostrar();
    nave.mover();

    // Actualizar disparos jugador
    for (let i = disparos.length - 1; i >= 0; i--) {
      disparos[i].mover();
      disparos[i].mostrar();
      if (disparos[i].fueraDePantalla()) {
        disparos.splice(i, 1);
      }
    }

    // Actualizar disparos enemigos
    for (let i = disparosEnemigos.length - 1; i >= 0; i--) {
      disparosEnemigos[i].mover();
      disparosEnemigos[i].mostrar();
      if (disparosEnemigos[i].fueraDePantalla()) {
        disparosEnemigos.splice(i, 1);
        continue;
      }
      // Colisión disparo enemigo con nave
      if (disparosEnemigos[i].colisionConNave(nave)) {
        disparosEnemigos.splice(i, 1);
        vidas--;
        if (vidas <= 0) juegoTerminado = true;
      }
    }

    // Actualizar enemigos
    for (let i = enemigos.length - 1; i >= 0; i--) {
      enemigos[i].mover();
      enemigos[i].mostrar();

      // Colisión enemigo con disparos jugador
      let enemigoDestruido = false;
      for (let j = disparos.length - 1; j >= 0; j--) {
        if (enemigos[i].colision(disparos[j])) {
          disparos.splice(j, 1);
          enemigos[i].recibirImpacto();
          if (enemigos[i].vida <= 0) {
            puntaje += enemigos[i].puntaje;
            enemigos.splice(i, 1);
            enemigoDestruido = true;
          }
          break;
        }
      }
      if (enemigoDestruido) continue;

      // Colisión enemigo con nave
      if (enemigos[i] && enemigos[i].colisionConNave(nave)) {
        enemigos.splice(i, 1);
        vidas--;
        if (vidas <= 0) juegoTerminado = true;
        continue;
      }

      // Enemigo llega al fondo de pantalla
      if (enemigos[i] && enemigos[i].y > height - 60) {
        enemigos.splice(i, 1);
        vidas--;
        if (vidas <= 0) juegoTerminado = true;
        continue;
      }

      // Disparos enemigos (solo niveles > 1)
      if (nivel > 1 && enemigos[i] && enemigos[i].puedeDisparar && random(1) < 0.005) {
        disparosEnemigos.push(new DisparoEnemigo(enemigos[i].x, enemigos[i].y + enemigos[i].tam / 2));
      }
    }

    // Comprobar final de nivel o aparición jefe
    if (enemigos.length === 0 && vidas > 0) {
        if (nivel === 3 && !jefeGenerado) {
            // Generar jefe solo una vez, después de eliminar enemigos regulares
            let jefe = new Enemigo(width / 2, 80, 'jefe');
            jefe.movimientoTipo = 'complejo';
            jefe.puedeDisparar = true;
            enemigos.push(jefe);
            jefeGenerado = true;
        } else {
            mostrandoTransicion = true;
            tiempoTransicion = millis();
        }
    }
  }

  // Mostrar HUD
  fill(255);
  textSize(20);
  text(`Puntaje: ${puntaje}`, 20, 30);
  text(`Vidas: ${vidas}`, 20, 60);
  text(`Nivel: ${nivel}`, 20, 90);

  // Mostrar Top 5 puntajes
  textSize(16);
  text("Top 5 Puntajes:", width - 160, 30);
  for (let i = 0; i < top5.length; i++) {
    text(`${i + 1}. ${top5[i]} pts`, width - 160, 55 + i * 20);
  }

  // Transición entre niveles
  if (mostrandoTransicion && !juegoTerminado) {
    textAlign(CENTER);
    textSize(32);
    fill(0, 255, 0);
    if(!jefeGenerado) {
      text(`¡Nivel ${nivel + 1}!`, width / 2, height / 2);
    } else {
        text(`¡Ganaste!`, width / 2, height / 2);
    }
    if (millis() - tiempoTransicion > 2000) {
      if(!jefeGenerado) {
        nivel++;
      }
      else {
        juegoTerminado = true;
      }
      if (nivel > 3) {
        juegoTerminado = true;
      } else {
        iniciarNivel(nivel);
      }
      mostrandoTransicion = false;
    }
    textAlign(LEFT);
  }

  // Mostrar pantalla de fin de juego
  if (juegoTerminado) {
    push();  // Guardar estado gráfico
    textAlign(CENTER);
    textSize(40);
    fill(255, 0, 0);
    text("¡Juego Terminado!", width / 2, height / 2);
    pop();   // Restaurar estado previo (alineación, fill, etc)
    // Solo actualizar top 5 una vez
    if (!top5Actualizado) {
      actualizarTop5(puntaje);
      top5Actualizado = true;
    }
    }
}

// Control de teclas
function keyPressed() {
  if (!juegoTerminado) {
    if (key === 'a' || key === 'A') nave.direccion = -1;
    if (key === 'd' || key === 'D') nave.direccion = 1;
    if (key === ' ') disparos.push(new Disparo(nave.x, nave.y));
  }
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
    this.x += this.direccion * 7;
    this.x = constrain(this.x, 20, width - 20);
  }
}

class Disparo {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vel = 10;
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

class DisparoEnemigo {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vel = 6;
  }

  mostrar() {
    fill(0, 255, 0);
    rect(this.x - 2, this.y, 4, 15);
  }

  mover() {
    this.y += this.vel;
  }

  fueraDePantalla() {
    return this.y > height;
  }

  colisionConNave(nave) {
    let d = dist(this.x, this.y, nave.x, nave.y);
    return d < 15;
  }
}

class Enemigo {
  constructor(x, y, tipo = 'normal') {
    this.x = x;
    this.y = y;
    this.tam = 40;
    this.vel = 1;
    this.tipo = tipo;
    this.vida = 1;
    this.puntaje = 1;
    this.puedeDisparar = false;
    this.movimientoTipo = 'recto'; // 'recto', 'zigzag', 'complejo'
    this.zigzagDir = 1;
    this.zigzagAmplitude = 40;
    this.zigzagSpeed = 0.05;
    this.zigzagAngle = 0;

    if (tipo === 'resistente') {
      this.vida = 3;
      this.puntaje = 3;
    } else if (tipo === 'jefe') {
      this.vida = 7;
      this.puntaje = 10;
      this.vel = 2;
    }

    if (tipo === 'dispara') {
      this.puedeDisparar = true;
    }
  }

  mostrar() {
    if (this.tipo === 'jefe') {
      fill(255, 0, 255);
    } else if (this.tipo === 'resistente') {
      fill(255, 100, 0);
    } else {
      fill(255, 204, 0);
    }
    rect(this.x - this.tam / 2, this.y - this.tam / 2, this.tam, this.tam);

    // Mostrar barras de vida encima del enemigo
    fill(255, 0, 0);
    for (let i = 0; i < this.vida; i++) {
      rect(this.x - this.tam / 2 + i * 14, this.y - this.tam / 2 - 10, 10, 5);
    }
  }

  mover() {
    if (this.movimientoTipo === 'recto') {
      this.y += this.vel;
    } else if (this.movimientoTipo === 'zigzag') {
      this.y += this.vel;
      this.zigzagAngle += this.zigzagSpeed;
      this.x += sin(this.zigzagAngle) * 2;
    } else if (this.movimientoTipo === 'complejo') {
      this.y += this.vel;
      this.zigzagAngle += this.zigzagSpeed * 2;
      this.x += sin(this.zigzagAngle) * 4;
    }
    this.x = constrain(this.x, this.tam / 2, width - this.tam / 2);
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
    return d < this.tam / 2 + 15;
  }

  recibirImpacto() {
    this.vida--;
  }
}

// Función para iniciar el nivel con enemigos
function iniciarNivel(nivel) {
  disparos = [];
  disparosEnemigos = [];
  enemigos = [];
  mostrandoTransicion = false;
  jefeGenerado = false;  // Resetear variable jefe al iniciar nivel 3

  if (nivel === 1) {
    // Solo enemigos normales, movimiento recto, sin disparos enemigos
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 3; j++) {
        let enemigo = new Enemigo(80 + i * 80, 60 + j * 60);
        enemigo.movimientoTipo = 'recto';
        enemigos.push(enemigo);
      }
    }
  } else if (nivel === 2) {
    // Añadir enemigos zigzag y que disparan
    for (let i = 0; i < 5; i++) {
      let enemigo = new Enemigo(100 + i * 100, 50, 'dispara');
      enemigo.movimientoTipo = 'zigzag';
      enemigos.push(enemigo);
    }
    for (let i = 0; i < 4 ; i++) {
      let enemigo = new Enemigo(120 + i * 120, 120, 'resistente');
      enemigo.movimientoTipo = 'recto';
      enemigos.push(enemigo);
    }
  } else if (nivel === 3) {
    // Solo enemigos normales y resistentes, sin jefe aún
    for (let i = 0; i < 4; i++) {
      let enemigo = new Enemigo(120 + i * 120, 150, 'resistente');
      enemigo.movimientoTipo = 'zigzag';
      enemigo.puedeDisparar = true;
      enemigos.push(enemigo);
    }
    for (let i = 0; i < 6; i++) {
      let enemigo = new Enemigo(100 + i * 100, 50, 'dispara');
      enemigo.movimientoTipo = 'recto';
      enemigos.push(enemigo);
    }
  }
}

function cargarTop5() {
  const stored = localStorage.getItem("top5");
  top5 = stored ? JSON.parse(stored) : [];
}

function actualizarTop5(puntajeActual) {
  cargarTop5();

  // Si hay menos de 5, insertamos y ordenamos
  if (top5.length < 5) {
    top5.push(puntajeActual);
  } else {
    // Solo insertamos si el puntaje actual es mayor que alguno
    const menor = top5[top5.length - 1];
    if (puntajeActual > menor) {
      top5.push(puntajeActual);
    } else {
      // No es mayor que ninguno del top5, no se agrega
      return;
    }
  }

  // Ordenar descendente
  top5.sort((a, b) => b - a);

  // Mantener solo los 5 mejores
  top5 = top5.slice(0, 5);

  localStorage.setItem("top5", JSON.stringify(top5));
}