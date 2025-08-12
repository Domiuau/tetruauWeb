export function placeBackground() {

  const backgrounds = ["landscape1", "landscape2", "landscape3", "landscape4", "landscape5", "landscape6", "landscape7", "landscape8", "landscape9",]

  const randomBg = backgrounds[Math.floor(Math.random() * backgrounds.length)];
  document.getElementById('background-overlay').style.backgroundImage = `url("../assets/${randomBg}.jpg")`;


}