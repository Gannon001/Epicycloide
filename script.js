const Config = {
  nbPoints: 1000,
  nbCircle: 60,
  speed: 0.01,
  scale: 2,
  'Nouveau dessin': () => {
    newDessin()
  },
  'Charger via SVG': () => {
    const points = getPointsFromSVG()
    localStorage.setItem('points', JSON.stringify(points))
    start()
  }
}

// Global
const PI_2 = Math.PI * 2
const offset = 10
let canvas = undefined
let ctx = undefined
let points = []
let coef = []
let t = 0
let draw = false
let dataImage = undefined
let dataImageGraph = undefined


const getPointsFromSVG = function (nbPoints = 1000) {
  const p = document.querySelector('path')
  const di = p.getTotalLength() / nbPoints
  points = []
  for (let i = 0; i < nbPoints; i++) {
    const pos = p.getPointAtLength(di * i)
    points.push([pos.x, pos.y])
  }
  return points
}

const paintFigure = function () {
  if (draw === false) {
    return
  }

  if (dataImage === undefined) {
    dataImage = new ImageData(canvas.width / 2, canvas.height / 2)
  }

  ctx.fillRect(0, 0, canvas.width, canvas.height)
  if (initDrawGraph !== undefined) {
    ctx.putImageData(dataImageGraph, 0, 0)
    // Draw Current pos
    ctx.strokeStyle = '#FFF'
    ctx.beginPath()
    const lx = (t % PI_2) * dataImageGraph.width / PI_2
    ctx.moveTo(offset + lx, 0)
    ctx.lineTo(offset + lx, dataImageGraph.height)
    ctx.stroke()
  }


  const w2 = canvas.width / 2
  const h2 = canvas.height / 2

  const centerAx = w2 + w2 / 2
  const centerAY = h2 - h2 / 2

  ctx.lineWidth = 2

  let x = w2 * 3 / 2
  let y = h2  / 2
  ctx.clearRect(w2, 0, w2, h2)
  ctx.strokeStyle = '#FF0080'
  for (let i = 1; i < coef.xa.length ; i++) {
    ctx.beginPath();
    ctx.arc(x, y, coef.xr[i] / Config.scale, 0, PI_2)
    ctx.moveTo(x, y)
    
    x += Math.cos(t * i -coef.xo[i]) * coef.xr[i] / Config.scale
    y += Math.sin(t * i -coef.xo[i]) * coef.xr[i] / Config.scale
    ctx.lineTo(x, y)
    ctx.stroke();
  }

  let xx = x
  let xy = y


  x = w2 / 2
  y = h2 * 3 / 2
  
  ctx.clearRect(0, h2 - 1 ,  w2, h2)
  
  ctx.strokeStyle = '#00FF00'
  for (let i = 1; i < coef.ya.length ; i++) {
    ctx.beginPath();
    ctx.arc(x, y, coef.yr[i] / Config.scale, 0, PI_2)
    ctx.moveTo(x, y)
    x += Math.sin(t * i -coef.yo[i]) * coef.yr[i] / Config.scale
    y += Math.cos(t * i -coef.yo[i]) * coef.yr[i] / Config.scale
    ctx.lineTo(x, y)
    ctx.stroke();
  }

  let yx = x
  let yy = y


  
  ctx.clearRect(w2, h2,  w2, h2)
  const index = Math.floor(yy -h2) * dataImage.width * 4 + Math.floor(xx -w2) * 4
  dataImage.data[index] = 0
  dataImage.data[index + 1] = 255
  dataImage.data[index + 2] = 255
  dataImage.data[index + 3] = 255

  ctx.lineWidth = 1
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
  ctx.putImageData(dataImage, w2, h2)
  ctx.beginPath();
  ctx.moveTo(xx, xy)
  ctx.lineTo(xx, yy)

  ctx.moveTo(yx, yy)
  ctx.lineTo(xx, yy)

  ctx.fillRect(xx, yy, 1, 1); // fill in the pixel at (10,10)
  ctx.stroke();

  
  t += Config.speed
  if (draw === true) {
    requestAnimationFrame(paintFigure)
  }
}

// http://www.bibmath.net/formulaire/index.php?action=affiche&quoi=sf
/**
 * @var points: [ [x1, y1], [x2, y2], ... ]
 * @returns Coef de Fourier les courbes f(x) & f(y)
 */
const getCoef = function () {
  const l = 2 * Math.PI / points.length
  
  let coef = {
    xa : new Array(Config.nbCircle).fill(0),
    xb : new Array(Config.nbCircle).fill(0),
    xr : new Array(Config.nbCircle).fill(0),
    xo : new Array(Config.nbCircle).fill(0),

    ya : new Array(Config.nbCircle).fill(0),
    yb : new Array(Config.nbCircle).fill(0),
    yr : new Array(Config.nbCircle).fill(0),
    yo : new Array(Config.nbCircle).fill(0)
  }

  for (let i = 0; i < points.length ; i += 1) {
    const t = i * l
    coef.xa[0] += points[i][0] * l
    coef.ya[0] += points[i][1] * l

    for (let k = 1; k < Config.nbCircle ; k += 1) {
      coef.xa[k] += points[i][0] * Math.cos(k * t) * l
      coef.xb[k] += points[i][0] * Math.sin(k * t) * l
      coef.ya[k] += points[i][1] * Math.cos(k * t) * l
      coef.yb[k] += points[i][1] * Math.sin(k * t) * l
    }
  }

  

  coef.xa[0] *= 1 / (2 * Math.PI)
  coef.ya[0] *= 1 / (2 * Math.PI)

  for (let k = 1; k < Config.nbCircle; k += 1) {
    coef.xa[k] /= Math.PI
    coef.xb[k] /= Math.PI
    coef.ya[k] /= Math.PI
    coef.yb[k] /= Math.PI

    coef.xr[k] = Math.sqrt(coef.xa[k] * coef.xa[k] + coef.xb[k] * coef.xb[k])
    coef.xo[k] = Math.atan(coef.xb[k] / coef.xa[k])
    if ( coef.xa[k] < 0) { coef.xo[k] += Math.PI}

    coef.yr[k] = Math.sqrt(coef.ya[k] * coef.ya[k] + coef.yb[k] * coef.yb[k])
    coef.yo[k] = Math.atan(coef.yb[k] / coef.ya[k])
    if ( coef.ya[k] < 0) { coef.yo[k] += Math.PI}
  }

  // coef.debugCoef = Object.assign({}, coef)
  // // Tranforne ak cos(kt) + ak sin (kt) => R cos(kt + O)
  // for (let k = 1; k < Config.nbCircle; k += 1) {
  //   const cxa = coef.xa[k]
  //   const cxb = coef.xb[k]
  //   const cya = coef.ya[k]
  //   const cyb = coef.yb[k]
  //   coef.xa[k] = Math.sqrt(cxa * cxa + cxb * cxb)
  //   coef.xb[k] = Math.atan(cxb / cxa)
  //   if ( cxa < 0) { coef.xb[k] += Math.PI}

  //   coef.ya[k] = Math.sqrt(cya * cya + cyb * cyb)
  //   coef.yb[k] = Math.atan(cyb / cya) - (Math.PI / 2) // - Math.PI / 2 |=> cos to sin
  //   if ( cya < 0) { coef.yb[k] += Math.PI}
  // }
  console.log(coef)
  return coef
}

const initDrawGraph = function () {
  
  const mw = canvas.width / 2
  const mh = canvas.height / 2
  const offset = 10
  const xcoef = (mw - 2 * offset) / points.length

  ctx.fillStyle = "rgba(0,0,0,0)"
  ctx.clearRect(0, 0, mw, mh)
  // Draw axe
  ctx.strokeStyle = '#FFFFFF'
  ctx.beginPath()
  ctx.moveTo(offset, mh - (2 * offset) + 5)
  ctx.lineTo(offset, offset )
  ctx.moveTo(offset - 5, mh - (2 * offset))
  ctx.lineTo(mw - ( 2 * offset), mh - (2 * offset))
  ctx.stroke()


  // Draw Real coord
  ctx.lineWidth = 3
  ctx.strokeStyle = '#4000FF'
  ctx.beginPath()
  ctx.moveTo(offset, -offset + mh - points[0][0] / (Config.scale *2))
  for( let i = 1; i < points.length; i += 1) {
    ctx.lineTo(offset + i * xcoef, -offset + mh - points[i][0] / (Config.scale * 2))
  }
  ctx.stroke()

  ctx.strokeStyle = '#0080FF'
  ctx.beginPath()
  ctx.moveTo(offset, -offset + mh - points[0][1] / (Config.scale *2)) 
  for( let i = 1; i < points.length; i += 1) {
    ctx.lineTo(offset + i * xcoef, -offset + mh - points[i][1] / (Config.scale *2))
  }
  ctx.stroke()

  // Draw Fourier equivalent
  ctx.lineWidth = 1
  ctx.strokeStyle = '#FF0000'
  ctx.beginPath()
  for (let i = 0; i < points.length; i += 1) {
    const t = i / points.length * Math.PI *2 
    let val = coef.xa[0]
    for (let x = 1; x < coef.xa.length; x += 1) {
      val += coef.xa[x] * Math.cos(x * t) + coef.xb[x] * Math.sin(x * t) 
    } 
    if (i === 0) {
      ctx.moveTo(offset + i * xcoef, -offset + mh - val / (Config.scale *2))
    } else {
      ctx.lineTo(offset + i * xcoef, -offset + mh - val / (Config.scale *2))
    }
  }
  ctx.stroke()

  ctx.strokeStyle = '#00FF00'
  ctx.beginPath()
  for (let i = 0; i < points.length; i += 1) {
    const t = i / points.length * Math.PI *2 
    let val = coef.ya[0]
    for (let x = 1; x < coef.xa.length; x += 1) {
      val += coef.ya[x] * Math.cos(x * t) + coef.yb[x] * Math.sin(x * t) 
    } 
    if (i === 0) {
      ctx.moveTo(offset + i * xcoef, -offset + mh - val / (Config.scale *2))
    } else {
      ctx.lineTo(offset + i * xcoef, -offset + mh - val / (Config.scale *2))
    }
  }
  ctx.stroke()

  dataImageGraph = ctx.getImageData(0, 0, mw, mh)
}

const drawstart = function ($event, resolve) {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#FFF'
  points = []
  points.push([$event.clientX, $event.clientY])
  document.addEventListener('mousemove', drawmove)
  document.addEventListener('mouseup', ($event) => {
    drawend($event, resolve)
  })
  document.removeEventListener('mousedown', drawstart)
}
const drawmove = function ($event) {
  const lastPoint = points[points.length - 1]
  const newPoint = [$event.clientX, $event.clientY]
  points.push(newPoint)
  // Draw
  ctx.beginPath()
  ctx.moveTo(...lastPoint)
  ctx.lineTo(...newPoint)
  ctx.stroke()
}
const drawend = function ($event, resolve) {
  const lastPoint = points[points.length - 1]
  const newPoint = points[0]
  ctx.beginPath()
  ctx.moveTo(...lastPoint)
  ctx.lineTo(...newPoint)
  ctx.stroke()
  document.removeEventListener('mousemove', drawmove)
  document.removeEventListener('mouseup', drawend)
  resolve()
}
const drawModel = function ($event) {
  const promise = new Promise((resolve, reject) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.font = '30px Comic Sans MS'
    ctx.fillStyle = 'rgba(255, 0, 0, 196)'
    ctx.textAlign = 'center'
    ctx.lineWidth = 3
    ctx.fillText('Dessinez', canvas.width / 2, canvas.height / 2)
    document.addEventListener('mousedown', ($event) => {
      drawstart($event, resolve)
    })
  })
  return promise
}

/**
 * Fait en sorte que les points sont equidistance les aux autre
 */
const linearPoint = function () {
  let peri = 0
  if (points === undefined || points.length === 0) {
    return
  }
  let lastPoint = points[0]
  points[0].cDist = 0
  for (let i = 1; i < points.length; i++) {
    const dx = lastPoint[0] - points[i][0]
    const dy = lastPoint[1] - points[i][1]
    const dist = Math.sqrt( dx * dx + dy * dy )
    peri += dist
    points[i].cDist = peri
    lastPoint = points[i]
  }
  
  const eDist = peri / Config.nbPoints
  const newPoints = []
  let cri = 0
  for (let i = 0; i < Config.nbPoints; i++) {
    const cDist = i * eDist
    while (points[cri].cDist <= cDist ) {
      cri ++
    }
    const delta = (cDist - points[cri -1].cDist) / (points[cri].cDist - points[cri -1].cDist)
    newPoints.push([
      points[cri ][0] * delta + points[cri- 1][0] * ( 1 - delta),
      points[cri ][1] * delta + points[cri- 1][1] * ( 1 - delta)
    ])
  }
  points = newPoints
}

const newDessin = function () {
  draw = false

  ctx.clearRect(0, 0, canvas.width, canvas.width)
  drawModel().then(() => {
    dataImage = undefined
    dataImageGraph = undefined
    ctx.clearRect(0, 0, canvas.width, canvas.width)
    localStorage.setItem('points', JSON.stringify(points))
    linearPoint()
    coef = getCoef(points)
    localStorage.setItem('coef', JSON.stringify(coef))
    initDrawGraph()
    draw = true
    requestAnimationFrame(paintFigure)
  })
}

function start () {
  points = JSON.parse(localStorage.getItem('points')) || undefined
  if (points === undefined || points.length === 0) {
    points = getPointsFromSVG()
  }

    dataImage = undefined
    dataImageGraph = undefined
    draw = true
    linearPoint()
    coef = getCoef(points)
    initDrawGraph()
    requestAnimationFrame(paintFigure)
}

const main = function () {
  canvas = document.querySelector('#canvas')
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  ctx = canvas.getContext('2d') 
  start()

  var gui = new dat.GUI()
  // const nbPointsCtrl = gui.add(Config, 'nbPoints', 16, 3000)
  const nbCircleCtrl = gui.add(Config, 'nbCircle', 2, 500).step(1)
  const scaleCtrl = gui.add(Config, 'scale', 0.1, 20).step(0.1)
  gui.add(Config, 'speed', 0.0001, 0.1)
  gui.add(Config, 'Nouveau dessin')
  gui.add(Config, 'Charger via SVG')

  // nbPointsCtrl.onFinishChange((value) => { 
  //   value = Math.abs(value)
  //   Config.nbPoints = value
  //   start()
  // })

  nbCircleCtrl.onFinishChange((value) => { 
    value = Math.abs(value)
    Config.nbCircle = value
    start()
  })

  scaleCtrl.onFinishChange((value) => { 
    value = Math.abs(value)
    Config.scale = value
    start()
  })

}

if (document.readyState === 'complete') {
  main()
} else {
  document.addEventListener('DOMContentLoaded', main)
}

