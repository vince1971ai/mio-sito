let particles = [];
const numParticles = 300;
const noiseScale = 0.005;
const interactionRadius = 100;
const maxSpeed = 2;
let mainText = "Nik Tesla AI"; // Testo principale
let emailText = "amoledcity@gmail.com"; // Testo email
let textYOffset = 0; // Offset verticale per l'effetto fluttuante del testo principale

function setup() {
  createCanvas(windowWidth, windowHeight);
  for (let i = 0; i < numParticles; i++) {
    particles.push(new Particle(random(width), random(height)));
  }
  // Impostazioni Particelle (invariate)
  strokeWeight(2);
  noFill();

  // Impostazioni Testo (impostazioni di default)
  textFont("Arial");
}

function draw() {
  // Sfondo (invariato)
  background(0, 25);

  // Aggiorna e disegna le particelle
  for (let particle of particles) {
    particle.update();
    particle.interactWithMouse(); // Determina il colore dello stroke per il frame corrente
    particle.display();          // Disegna la particella con lo stroke impostato
    particle.checkEdges();
  }

  // Disegna il testo principale fluttuante
  // Calcola l'effetto fluttuante
  textYOffset = sin(frameCount * 0.02) * 20; // Regola velocità (0.02) e ampiezza (20)

  // Imposta le proprietà per il testo principale
  fill(255, 200); // Riempimento bianco semi-trasparente
  noStroke(); // Nessun contorno
  textSize(96); // Dimensione grande
  textAlign(CENTER, CENTER); // Allineato al centro (anche verticalmente per la fluttuazione)

  // Disegna il testo principale al centro, con l'offset verticale fluttuante
  text(mainText, width / 2, height / 2 + textYOffset);

  // Disegna l'email fissa in basso
  // Imposta le proprietà per l'email
  // fill(255, 200); // Il fill è già impostato
  // noStroke(); // Lo stroke è già disattivato
  textSize(13); // Dimensione piccola per l'email
  textAlign(CENTER, BOTTOM); // Allineato al centro, in basso

  // Disegna l'email vicino al bordo inferiore
  let emailTextY = height - 40; // Posizione Y fissa per l'email (aggiustabile)
  text(emailText, width / 2, emailTextY);

  // Resetta le impostazioni di disegno se necessario
  // noFill();
}

class Particle {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D().mult(random(0.5, maxSpeed));
    this.acc = createVector(0, 0);
    this.maxSpeed = maxSpeed;
    this.color = color(random(100, 255), random(100, 255), random(200, 255), 150); // Colore base
    this.currentStroke = this.color; // Proprietà per memorizzare lo stroke del frame corrente
  }

  applyForce(force) {
    this.acc.add(force);
  }

  update() {
    // Applica rumore di Perlin (invariato)
    let angle = noise(this.pos.x * noiseScale, this.pos.y * noiseScale) * TWO_PI * 4;
    let noiseForce = p5.Vector.fromAngle(angle);
    noiseForce.mult(0.1);
    this.applyForce(noiseForce);

    // Aggiorna velocità e posizione (invariato)
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }

  display() {
    stroke(this.currentStroke); // Usa il colore dello stroke determinato da interactWithMouse
    strokeWeight(2); // Assicura che lo spessore dello stroke sia impostato
    point(this.pos.x, this.pos.y); // Disegna la particella
  }

  checkEdges() {
    // Rimbalzo sui bordi (invariato)
    if (this.pos.x < 0 || this.pos.x > width) {
      this.vel.x *= -1;
      this.pos.x = constrain(this.pos.x, 0, width);
    }
    if (this.pos.y < 0 || this.pos.y > height) {
      this.vel.y *= -1;
      this.pos.y = constrain(this.pos.y, 0, height);
    }
  }

  interactWithMouse() {
    let mousePos = createVector(mouseX, mouseY);
    let d = dist(this.pos.x, this.pos.y, mousePos.x, mousePos.y);

    if (d < interactionRadius) {
      // Calcola forza di repulsione (invariato)
      let repelForce = p5.Vector.sub(this.pos, mousePos);
      let strength = (interactionRadius - d) / (interactionRadius * d) * 10;
      repelForce.setMag(strength);
      this.applyForce(repelForce);

      // Calcola colore interattivo
      let proximity = map(d, 0, interactionRadius, 1, 0);
      let r = lerp(red(this.color), 255, proximity);
      let g = lerp(green(this.color), 50, proximity);
      let b = lerp(blue(this.color), 50, proximity);
      this.currentStroke = color(r, g, b, 200); // Imposta lo stroke per questo frame basato sull'interazione
    } else {
      this.currentStroke = this.color; // Resetta al colore base se il mouse non interagisce
    }
  }
}

// Gestisce il ridimensionamento della finestra
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // Il testo si riposizionerà automaticamente grazie all'uso di 'height' e 'width'
}
