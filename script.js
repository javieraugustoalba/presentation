import { textureSun, textureMercury, textureVenus, textureEarth, textureMars, textureJupiter, textureSaturn, textureSaturnRings, textureUranus, textureNeptune, texturePluto, textureExoplanet } from "./textures.js";
import { sunTemplate, mercuryTemplate, venusTemplate, earthTemplate, marsTemplate, jupiterTemplate, saturnTemplate, uranusTemplate, neptuneTemplate, plutoTemplate, saturnRingsTemplate, exoplanetTemplate } from './planetTemplates.js';
const canvas = document.getElementById('skyCanvas');
const ctx = canvas.getContext('2d');
const orbitRadiusFactor = 1;
const rotationSpeedFactor = 0.001;
const geometryXFactorSun = 0.000003;
const geometryXFactorMercury = 1;
const geometryXFactorVenus = 0.1;
const geometryXFactorEarth = 0.1;
const geometryXFactorMars = 1;
const geometryXFactorJupiter = 0.001;
const geometryXFactorSaturn = 0.001;
const geometryXFactorUranus = 0.001;
const geometryXFactorNeptune = 0.001;
const geometryXFactorPluto = 10;
const geometryXFactorExoplanet = 0.01;
const zoomAmount = 2;
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
// Adjust these values for the rotation speed
const rotationSpeedX = 0.001;
const rotationSpeedY = 0.01;

// Parameters and settings
const skySettings = {
    starDensity: {
        front: 50,
        foreground: 300,
        middle: 500,
        beforeMiddle: 1200,
        background: 2000,
        far: 4000,
    },
    starDepth: {
        front: 2,
        foreground: 1.5,
        middle: 1.2,
        beforeMiddle: 0.8,
        background: 0.5,
        far: 0.2,
    },
    twinkleFactorRange: [0.8, 1.2],
    shootingStarInterval: {
        min: 1000,
        max: 5000
    },
};

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const colors = ['#FFD2A1', '#FFDFC4', '#FFF4E8', '#D4E5FF', '#A4C8FF'];
const planetInfoMap = {
    sun: { title: "Sun", template: sunTemplate },
    mercury: { title: "Mercury", template: mercuryTemplate },
    venus: { title: "Venus", template: venusTemplate },
    earth: { title: "Earth", template: earthTemplate },
    mars: { title: "Mars", template: marsTemplate },
    jupiter: { title: "Jupiter", template: jupiterTemplate },
    saturn: { title: "Saturn", template: saturnTemplate },
    uranus: { title: "Uranus", template: uranusTemplate },
    neptune: { title: "Neptune", template: neptuneTemplate },
    pluto: { title: "Pluto", template: plutoTemplate },
    saturnrings: { title: "SaturnRings", template: saturnRingsTemplate },
    exoplanet: { title: "Exoplanet", template: exoplanetTemplate }
};

function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
}

const modalContent = document.querySelector('.info-modal');

modalContent.addEventListener('wheel', function(event) {
    // Determine the scroll direction (positive for down, negative for up)
    const delta = Math.sign(event.deltaY);

    // Scroll the content
    this.scrollTop += delta * 100; // Adjust the multiplier (30) for faster or slower scrolling

    // Prevent the whole page from scrolling
    event.preventDefault();
}, { passive: false });

function createStars(count, depth, twinkleFactorRange) {
    const stars = [];
    for (let i = 0; i < count; i++) {
        const x = randomInRange(0, canvas.width);
        const y = randomInRange(0, canvas.height);
        const size = randomInRange(0, depth);
        const twinkleFactor = randomInRange(...twinkleFactorRange);
        const color = colors[Math.floor(Math.random() * colors.length)];
        stars.push({
            x,
            y,
            size,
            depth,
            twinkleFactor,
            originalSize: size,
            color
        });
    }
    return stars;
}

const frontStars = createStars(skySettings.starDensity.front, skySettings.starDepth.front, skySettings.twinkleFactorRange);
const foregroundStars = createStars(skySettings.starDensity.foreground, skySettings.starDepth.foreground, skySettings.twinkleFactorRange);
const middleStars = createStars(skySettings.starDensity.middle, skySettings.starDepth.middle, skySettings.twinkleFactorRange);
const beforeMiddleStars = createStars(skySettings.starDensity.beforeMiddle, skySettings.starDepth.beforeMiddle, skySettings.twinkleFactorRange);
const backgroundStars = createStars(skySettings.starDensity.background, skySettings.starDepth.background, skySettings.twinkleFactorRange);
const farStars = createStars(skySettings.starDensity.far, skySettings.starDepth.far, skySettings.twinkleFactorRange);
const shootingStars = [];

function createShootingStar() {
    const x = randomInRange(0, canvas.width);
    const y = 0;
    const length = randomInRange(50, 550);
    const speed = randomInRange(30, 530);
    const angle = randomInRange(0, Math.PI * 2);
    shootingStars.push({
        x,
        y,
        length,
        speed,
        angle
    });
}

function drawStar(star) {
    ctx.fillStyle = star.color;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fill();

    star.size = star.originalSize * star.twinkleFactor;
    star.twinkleFactor += randomInRange(-0.05, 0.05);
    if (star.twinkleFactor < 0.8 || star.twinkleFactor > 1.2) {
        star.twinkleFactor = 1;
    }
}

function drawSky() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    [farStars, backgroundStars, middleStars, beforeMiddleStars, foregroundStars, frontStars].forEach(stars => {
        stars.forEach(drawStar);
    });

    for (let i = 0; i < shootingStars.length; i++) {
        const star = shootingStars[i];
        const tailX = star.x + Math.cos(star.angle + Math.PI) * star.length;
        const tailY = star.y + Math.sin(star.angle + Math.PI) * star.length;

        const gradient = ctx.createLinearGradient(star.x, star.y, tailX, tailY);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 0.1;
        ctx.shadowBlur = 1;
        ctx.shadowColor = '#FFF';

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(star.x, star.y);
        ctx.stroke();

        star.x += Math.cos(star.angle) * star.speed;
        star.y += Math.sin(star.angle) * star.speed;

        if (star.x > canvas.width || star.y > canvas.height) {
            shootingStars.splice(i, 1);
            i--;
        }
    }
}

//setInterval(createShootingStar, randomInRange(skySettings.shootingStarInterval.min, skySettings.shootingStarInterval.max));

function animate() {
    drawSky();
    requestAnimationFrame(animate);
}

animate();


window.addEventListener('resize', () => {
    canvas.width = window.innerWidth * scale;
    canvas.height = window.innerHeight * scale;

    [farStars, backgroundStars, middleStars, beforeMiddleStars, foregroundStars, frontStars].forEach(stars => {
        stars.forEach(star => {
            star.x = randomInRange(0, canvas.width);
            star.y = randomInRange(0, canvas.height);
        });
    });

    canvas.style.top = `-${(canvas.height - window.innerHeight) / 2}px`;
    canvas.style.left = `-${(canvas.width - window.innerWidth) / 2}px`;

    const stars = document.querySelectorAll('.star');
    stars.forEach(star => {
        const x = randomInRange(0, window.innerWidth);
        const y = randomInRange(0, window.innerHeight);

        star.style.left = `${x}px`;
        star.style.top = `${y}px`;
    });
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

const stars = document.querySelectorAll('.star');
const modal = document.querySelector('.info-modal');
const closeModal = document.querySelector('.close-btn');


let isModalOpen = false;
let intersectionEnabled = true;
closeModal.addEventListener('click', () => {
    closeTheModal();
});

// listen for the 'keydown' event
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeTheModal();

    }
  });

// Refactored close modal logic into a function
function closeTheModal() {
    modal.style.animation = 'modalFadeOut 0.5s ease-in-out';
    planets.forEach(planet => {
        planet.isPaused = false;
    });
    setTimeout(() => {
        modal.style.display = 'none';
        // Set the intersection flag to true when closing the modal
        intersectionEnabled = true;
    }, 500);
}

const universeContainer = document.getElementById('universeContainer');
let scale = 1;



document.addEventListener('DOMContentLoaded', () => {
    const stars = document.querySelectorAll('.star');
    stars.forEach(star => {
        const x = randomInRange(0, window.innerWidth);
        const y = randomInRange(0, window.innerHeight);

        star.style.left = `${x}px`;
        star.style.top = `${y}px`;
    });
});

let scene, camera, renderer, sun, mercury, venus, earth, mars, jupiter, saturn, uranus, neptune, pluto, exoplanet, saturnRings;
const planets = [];


function initThreeJS() {
    // Create a scene
    scene = new THREE.Scene();

    // Create a camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 10;
    camera.position.y = 1;
    camera.position.x = 1;
    // Create a WebGLRenderer and append it to the body
    renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Create a sphere geometry
    let geometry = null;



    const materialSun = new THREE.MeshBasicMaterial({
        map: textureSun
    });
    const materialMercury = new THREE.MeshBasicMaterial({
        map: textureMercury
    });
    const materialVenus = new THREE.MeshBasicMaterial({
        map: textureVenus
    });
    const materialEarth = new THREE.MeshBasicMaterial({
        map: textureEarth
    });
    const materialMars = new THREE.MeshBasicMaterial({
        map: textureMars
    });
    const materialJupiter = new THREE.MeshBasicMaterial({
        map: textureJupiter
    });
    const materialSaturn = new THREE.MeshBasicMaterial({
        map: textureSaturn
    });

    const materialSaturnRings = new THREE.MeshBasicMaterial({
        map: textureSaturnRings,
        side: THREE.DoubleSide, // Make the rings visible from both sides
        transparent: true, // Make the rings transparent
        opacity: 0.5, // Adjust the opacity as needed
    });
    const materialUranus = new THREE.MeshBasicMaterial({
        map: textureUranus
    });
    const materialNeptune = new THREE.MeshBasicMaterial({
        map: textureNeptune
    });
    const materialPluto = new THREE.MeshBasicMaterial({
        map: texturePluto
    });
    const materialExoplanet = new THREE.MeshBasicMaterial({
        map: textureExoplanet
    });


    // Function to create a planet
    function createPlanet(geometry, material, orbitRadius, orbitRadiusFactor, rotationSpeed, rotationSpeedFactor, position, isPaused, name) {
        const planet = new THREE.Mesh(geometry, material);
        planet.orbitRadius = orbitRadius * orbitRadiusFactor;
        planet.name = name.toLowerCase() || "";
        planet.rotationSpeed = rotationSpeed * rotationSpeedFactor;
        planet.position.copy(position || new THREE.Vector3(1, 1, 1));
        planet.isPaused = isPaused || false;
        return planet;
    }


    const planetConfigs = [
        { geometry: new THREE.SphereGeometry(333000 * geometryXFactorSun, 32, 32), material: materialSun, orbitRadius: 1, orbitRadiusFactor: orbitRadiusFactor, rotationSpeed: 1, rotationSpeedFactor: rotationSpeedFactor, position: new THREE.Vector3(1, 1, 1), isPaused: false, name: "Sun" },
        { geometry: new THREE.SphereGeometry(0.0553 * geometryXFactorMercury, 32, 32), material: materialMercury, orbitRadius: 2, orbitRadiusFactor: 1, rotationSpeed: 2, rotationSpeedFactor: rotationSpeedFactor, position: new THREE.Vector3(1, 1.1, 1), isPaused: false, name: "Mercury" },
        { geometry: new THREE.SphereGeometry(0.815 * geometryXFactorVenus, 32, 32), material: materialVenus, orbitRadius: 3, orbitRadiusFactor: 1, rotationSpeed: 1, rotationSpeedFactor: rotationSpeedFactor, position: new THREE.Vector3(1, 0.94, 1), isPaused: false, name: "Venus" },
        { geometry: new THREE.SphereGeometry(1 * geometryXFactorEarth, 32, 32), material: materialEarth, orbitRadius: 4, orbitRadiusFactor: 1, rotationSpeed: 0.9, rotationSpeedFactor: rotationSpeedFactor, position: new THREE.Vector3(1, 1.1, 1), isPaused: false,  name:"Earth" },
        { geometry: new THREE.SphereGeometry(0.107 * geometryXFactorMars, 32, 32), material: materialMars, orbitRadius: 5, orbitRadiusFactor: 1, rotationSpeed: 0.7, rotationSpeedFactor: rotationSpeedFactor, position: new THREE.Vector3(1, 0.8, 1), isPaused: false,  name:"Mars" },
        { geometry: new THREE.SphereGeometry(317.83 * geometryXFactorJupiter, 32, 32), material: materialJupiter, orbitRadius: 6, orbitRadiusFactor: 1, rotationSpeed: 0.5, rotationSpeedFactor: rotationSpeedFactor, position: new THREE.Vector3(1, 1.17, 1), isPaused: false ,  name:"Jupiter"},
        { geometry: new THREE.SphereGeometry(95.16 * geometryXFactorSaturn, 32, 32), material: materialSaturn, orbitRadius: 7, orbitRadiusFactor: 1, rotationSpeed: 0.3, rotationSpeedFactor: rotationSpeedFactor, position: new THREE.Vector3(1, 1.11, 1), isPaused: false,  name:"Saturn" },
        { geometry: new THREE.SphereGeometry(14.54 * geometryXFactorUranus, 32, 32), material: materialUranus, orbitRadius: 8, orbitRadiusFactor: 1, rotationSpeed: 0.1, rotationSpeedFactor: rotationSpeedFactor, position: new THREE.Vector3(1, 0.7, 1), isPaused: false ,  name:"Uranus"},
        { geometry: new THREE.SphereGeometry(17.15 * geometryXFactorNeptune, 32, 32), material: materialNeptune, orbitRadius: 8.2, orbitRadiusFactor: 1, rotationSpeed: 0.09, rotationSpeedFactor: rotationSpeedFactor, position: new THREE.Vector3(1, 1.23, 1), isPaused: false,  name:"Neptune" },
        { geometry: new THREE.SphereGeometry(0.0024 * geometryXFactorPluto, 32, 32), material: materialPluto, orbitRadius: 10, orbitRadiusFactor: 1, rotationSpeed: 0.07, rotationSpeedFactor: rotationSpeedFactor, position: new THREE.Vector3(1, 1.21, 1), isPaused: false ,  name:"Pluto"},
        { geometry: new THREE.SphereGeometry(0.50 * geometryXFactorExoplanet, 32, 32), material: materialExoplanet, orbitRadius: 8.5, orbitRadiusFactor: 1, rotationSpeed: 0.05, rotationSpeedFactor: rotationSpeedFactor, position: new THREE.Vector3(1, 1.13, 1), isPaused: false ,  name:"Exoplanet"},
        { geometry: new THREE.RingGeometry(130 * geometryXFactorSaturn, 0.2, 64), material: materialSaturnRings, orbitRadius: 7, orbitRadiusFactor: 1, rotationSpeed: 0.3, rotationSpeedFactor: rotationSpeedFactor, position: new THREE.Vector3(1, 1.11, 1), isPaused: false,  name:"SaturnRings" },
    ];



    planetConfigs.forEach((config, index) => {
        const planet = createPlanet(config.geometry, config.material, config.orbitRadius, config.orbitRadiusFactor, config.rotationSpeed, config.rotationSpeedFactor, config.position, config.isPaused, config.name);
        planets.push(planet);
        scene.add(planet);
        if (index === 0) {
            sun = planet;
        }
        if (index === 1) {
            mercury = planet;
        }
        if (index === 2) {
            venus = planet;
        }
        if (index === 3) {
            earth = planet;
        }
        if (index === 4) {
            mars = planet;
        }
        if (index === 5) {
            jupiter = planet;
        }
        if (index === 6) {
            saturn = planet;
        }
        if (index === 7) {
            uranus = planet;
        }
        if (index === 8) {
            neptune = planet;
        }
        if (index === 9) {
            pluto = planet;
        }
        if (index === 10) {
            exoplanet = planet;
        }
        if (index === 11) {
            saturnRings = planet;
            saturnRings.rotation.y = Math.PI / 2; // Rotate along the Y-axis
        }
    });



    const raycaster = new THREE.Raycaster();
    raycaster.linePrecision = 0.2; // Adjust as needed
    raycaster.pointPrecision = 0.2; // Adjust as needed
    const mouse = new THREE.Vector3(0, 0, 0)

    window.addEventListener('mousemove', (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        if (isDragging) {
            const deltaX = event.clientX - previousMousePosition.x;
            const deltaY = event.clientY - previousMousePosition.y;

            // Rotate the camera based on mouse movement
            rotateCamera(deltaX, deltaY);

            previousMousePosition.x = event.clientX;
            previousMousePosition.y = event.clientY;
        }
    });

    window.addEventListener('mouseup', () => {
        isDragging = false;
    });


    function displayPlanetInfo(planet, name, descriptionHTML) {

        planet.isPaused = !planet.isPaused;
        if (planet === saturn) {
            planet = saturnRings;
            planet.isPaused = true;
            planet = saturn;
        }
        if (planet === saturnRings) {
            planet = saturn;
            planet.isPaused = true;
            planet = saturnRings;
        }
        if(planet === mercury){
            previewUrls(urls);
        }
        const starInfo = {
            name: name,
            description: descriptionHTML
        };
        modal.querySelector('#description').innerHTML = starInfo.description; // Use innerHTML to insert HTML
        modal.style.animation = 'modalFadeIn 0.5s ease-in-out';
        setTimeout(() => {
            modal.style.display = 'block';
            intersectionEnabled = false;
        }, 50);
    }

    window.addEventListener('click', () => {
        if (intersectionEnabled) {
            raycaster.setFromCamera(mouse, camera);

            // Check if any planet is intersected
            const intersects = raycaster.intersectObjects(planets);

            if (intersects.length > 0) {
                // Get the first intersected planet
                const intersectedPlanet = intersects[0].object;
                console.log(intersectedPlanet);
                if (planetInfoMap[intersectedPlanet.name]) {
                    const planetInfo = planetInfoMap[intersectedPlanet.name];
                    console.log(planetInfo)
                    console.log("This is the planet info")
                    displayPlanetInfo(intersectedPlanet, planetInfo.title, planetInfo.template);
                }
            }
        }
    });
}

initThreeJS();

function animate3D() {
    requestAnimationFrame(animate3D);

    for (const earth of planets) {
        // Rotate the earth on its axis
        if (earth.isPaused) continue;
        earth.rotation.y += earth.rotationSpeed + 0.1;

        // Translate the earth in its orbit
        earth.angle = (earth.angle || 0) + earth.rotationSpeed; // If no angle is set, start from 0
        earth.position.x = earth.orbitRadius * Math.sin(earth.angle);
        earth.position.z = earth.orbitRadius * Math.cos(earth.angle);
    }

    renderer.render(scene, camera);
}
animate3D();



// Define a fixed distance from the center
const fixedDistance = 5;

// Add an event listener for the 'wheel' event
window.addEventListener('wheel', handleZoomAndRotation);

// Function to handle zoom and rotation
function handleZoomAndRotation(event) {
    // Check if the Ctrl key is pressed
    if (event.ctrlKey) {

        if (event.deltaY < 0) {
            camera.fov -= zoomAmount;
        }
        // Zoom out
        else {
            camera.fov += zoomAmount;
        }



    } else {
        if (event.deltaY < 0) {
            camera.fov -= zoomAmount;
        }
        // Zoom out
        else {
            camera.fov += zoomAmount;
        }
        camera.updateProjectionMatrix();
    }
}

// Enable mouse rotation when clicking and dragging
window.addEventListener('mousedown', (event) => {
    if (event.button === 0) { // Left mouse button
        isDragging = true;
        previousMousePosition.x = event.clientX;
        previousMousePosition.y = event.clientY;
    }
});




// Function to rotate the camera
function rotateCamera(deltaX, deltaY) {

    camera.rotation.x -= deltaY * rotationSpeedX;
    camera.rotation.y -= deltaX * rotationSpeedY;
}


// script.js
export function applyColor() {
    var color = document.getElementById('colorPicker').value;
    var links = document.querySelectorAll('a');
    links.forEach(function(link) {
        link.style.color = color;
        link.style.animation = 'modalFadeIn 1s infinite';
    });
    var h1s = document.querySelectorAll('h1');
    h1s.forEach(function(h1) {
        h1.style.color = color;
    });

    var h2s = document.querySelectorAll('h2');
    h2s.forEach(function(h1) {
        h1.style.color = color;
    });
    // Convert hex to rgba with opacity
    var rgbaColor = hexToRgba(color, 0.2); // 0.5 is the opacity level, you can adjust it
    
    // Change .info-modal background color
    var modal = document.querySelector('.info-modal');
    modal.style.backgroundColor = rgbaColor;
}

// Function to convert hex to rgba
function hexToRgba(hex, opacity) {
    var bigint = parseInt(hex.slice(1), 16);
    var r = (bigint >> 16) & 255;
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;
    return "rgba(" + r + ", " + g + ", " + b + ", " + opacity + ")";
}

document.getElementById('applyColorBtn').addEventListener('click', applyColor);

function previewUrls(urlList) {
    var previewDiv = document.getElementById('url-preview');
    
    urlList.forEach(function(url) {
        // Create a link element
        var link = document.createElement('a');
        link.href = url;
        link.target = '_blank'; // Open in a new tab
        
        // Create an iframe element
        var iframe = document.createElement('iframe');
        iframe.src = url;
        iframe.width = '600';
        iframe.height = '400';
        
        // Append the iframe to the link
        link.appendChild(iframe);
        
        // Append the link to the preview div
        previewDiv.appendChild(link);
    });
}

var urls = [
    'https://dataconomy.com/2023/04/18/basics-of-artificial-intelligence/',
    'https://blog.invgate.com/artificial-intelligence'
];

