// Link oficial do seu modelo do Teachable Machine integrado corretamente
const URL_MODELO = "https://teachablemachine.withgoogle.com/models/lz1bronqQ/";

let model, webcam, maxPredictions;
let dinoY, dinoX, dinoLargura, dinoAltura, gravidade, velocidadPulo;
let cactoX, cactoY, cactoLargura, cactoAltura, cactoVelocidade;
let score = 0;
let comandoIA = "Carregando IA...";

let imgFundo, imgCoelho, imgCoelhoPulando, imgTronco;

// Variáveis de controle de estado e botão
let jogoIniciado = false;
let carregandoModelo = true;
let botaoStart;

function preload() {
  imgFundo = loadImage('floresta.png');
  imgCoelho = loadImage('coelho_normal.png');
  imgCoelhoPulando = loadImage('coelho_pulando.png'); 
  imgTronco = loadImage('tronco.png');
}

function setup() {
  createCanvas(640, 480);
  
  // Configurações do Coelho
  dinoX = 50;
  dinoY = height - 90;
  dinoLargura = 60;   
  dinoAltura = 70;
  gravidade = 1.5;      
  velocidadePulo = 0;
  
  // Configurações do Tronco
  cactoX = width;
  cactoY = height - 70;
  cactoLargura = 50;
  cactoAltura = 50;
  cactoVelocidade = 6;
  
  // Criar o botão de Start (escondido até carregar)
  botaoStart = createButton('INICIAR JOGO');
  botaoStart.position(width / 2 - 60, height / 2 + 20);
  botaoStart.mousePressed(iniciarJogo);
  botaoStart.hide();
  
  // Estilização visual do botão
  botaoStart.style('padding', '10px 20px');
  botaoStart.style('font-size', '18px');
  botaoStart.style('background-color', '#4caf50');
  botaoStart.style('color', 'white');
  botaoStart.style('border', 'none');
  botaoStart.style('border-radius', '5px');
  botaoStart.style('cursor', 'pointer');
  botaoStart.style('font-weight', 'bold');
  
  initIA();
}

async function initIA() {
  try {
    const modelURL = URL_MODELO + "model.json";
    const metadataURL = URL_MODELO + "metadata.json";
    
    // CORREÇÃO: Utilizando tmImage em vez de tmPose para alinhar com o seu modelo
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    // Configuração e inicialização da webcam
    webcam = new tmImage.Webcam(200, 200, true); 
    await webcam.setup(); 
    await webcam.play();
    
    carregandoModelo = false;
    botaoStart.show(); // Mostra o botão verde de início
    
    window.requestAnimationFrame(loopIA);
  } catch (erro) {
    console.error("Erro crítico ao carregar a IA ou Webcam: ", erro);
    comandoIA = "Erro ao carregar!";
  }
}

function iniciarJogo() {
  jogoIniciado = true;
  botaoStart.hide();
  loop(); 
}

async function loopIA(timestamp) {
  if (webcam && !carregandoModelo) {
    webcam.update(); 
    await predict();
  }
  window.requestAnimationFrame(loopIA);
}

async function predict() {
  // CORREÇÃO: Lógica de previsão adaptada para o modelo de imagem (tmImage)
  const prediction = await model.predict(webcam.canvas);
  
  let maiorPrevisao = "";
  let maiorValor = 0;
  for (let i = 0; i < maxPredictions; i++) {
    if (prediction[i].probability > maiorValor) {
      maiorValor = prediction[i].probability;
      maiorPrevisao = prediction[i].className;
    }
  }
  comandoIA = maiorPrevisao;
}

function draw() {
  if (!jogoIniciado) {
    background(50);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(28);
    
    if (carregandoModelo) {
      text("Carregando Webcam e IA...", width / 2, height / 2 - 20);
      textSize(16);
      fill(200);
      text("Aguarde um instante e permita o acesso à câmera no topo da tela.", width / 2, height / 2 + 20);
    } else {
      fill(76, 175, 80);
      text("TUDO PRONTO!", width / 2, height / 2 - 60);
      fill(255);
      textSize(18);
      text("Posicione-se e clique no botão abaixo para começar:", width / 2, height / 2 - 20);
    }
    return; 
  }

  // --- JOGO RUNNING ---
  background(imgFundo);
  
  fill(255); 
  stroke(0); 
  strokeWeight(3);
  textSize(22);
  textAlign(LEFT); 
  text("Ação IA: " + comandoIA, 20, 40);
  text("Pontos: " + score, 20, 70);
  noStroke(); 

  dinoY += velocidadePulo;
  velocidadePulo += gravidade;
  let chaoY = height - 90;
  
  if (dinoY >= chaoY) {
    dinoY = chaoY;
    velocidadePulo = 0;
  }
  
  if (comandoIA === "Pular" && dinoY === chaoY) {
    velocidadePulo = -24; 
  }
  
  if (dinoY < chaoY) {
    image(imgCoelhoPulando, dinoX, dinoY, dinoLargura, dinoAltura);
  } else if (comandoIA === "Abaixar") {
    image(imgCoelhoPulando, dinoX, dinoY + 35, dinoLargura, dinoAltura / 2);
  } else {
    if (frameCount % 30 < 15) {
      image(imgCoelho, dinoX, dinoY, dinoLargura, dinoAltura);
    } else {
      image(imgCoelhoPulando, dinoX, dinoY - 8, dinoLargura, dinoAltura); 
    }
  }

  cactoX -= cactoVelocidade;
  if (cactoX < -cactoLargura) {
    cactoX = width;
    score++;
    cactoVelocidade += 0.5; 
  }
  
  image(imgTronco, cactoX, cactoY, cactoLargura, cactoAltura);

  let colidiu = false;
  if (comandoIA === "Abaixar" && dinoY === chaoY) {
    colidiu = collideRectRect(dinoX, dinoY + 35, dinoLargura, dinoAltura / 2, cactoX, cactoY, cactoLargura, cactoAltura);
  } else if (dinoY < chaoY) {
    colidiu = collideRectRect(dinoX, dinoY, dinoLargura, dinoAltura, cactoX, cactoY, cactoLargura, cactoAltura);
  } else {
    let ajusteCorrida = (frameCount % 30 < 15) ? 0 : -8;
    colidiu = collideRectRect(dinoX, dinoY + ajusteCorrida, dinoLargura, dinoAltura, cactoX, cactoY, cactoLargura, cactoAltura);
  }

  if (colidiu) {
    noLoop(); 
    fill(255, 50, 50);
    stroke(0);
    strokeWeight(5);
    textSize(50);
    textAlign(CENTER, CENTER);
    text("FIM DE JOGO", width / 2, height / 2);
  }
}

function collideRectRect(x, y, w, h, x2, y2, w2, h2) {
  return x + w >= x2 && x <= x2 + w2 && y + h >= y2 && y <= y2 + h2;
}
