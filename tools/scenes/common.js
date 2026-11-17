/* Shared helpers for the baked scenes (castle.html, realm.html).
   These pages are only opened by tools/bake_scenes.py; the site uses the
   images they produce. */
var NS = 'http://www.w3.org/2000/svg';
/* A clay / plasticine surface: lumpy edges, rounded puffy edges, thumb dents,
   fine grain, soft key light from the upper left and a little sheen. */
function clay(id, o) {
  o = Object.assign({ wobble: 7, wf: 0.012, blur: 6, surface: 5, dents: 0.09, grain: 0.05, df: 0.03, spec: 0.28, exp: 14,
    az: 225, el: 52, gain: 1.16, seed: 3, pad: 8 }, o || {});
  return '<filter id="' + id + '" x="-' + o.pad + '%" y="-' + o.pad + '%" width="' + (100 + 2 * o.pad) + '%" height="' + (100 + 2 * o.pad) + '%" color-interpolation-filters="sRGB">' +
    '<feTurbulence type="fractalNoise" baseFrequency="' + o.wf + '" numOctaves="2" seed="' + o.seed + '" result="w"/>' +
    '<feDisplacementMap in="SourceGraphic" in2="w" scale="' + o.wobble + '" xChannelSelector="R" yChannelSelector="G" result="shape"/>' +
    '<feGaussianBlur in="shape" stdDeviation="' + o.blur + '" result="soft"/>' +
    '<feTurbulence type="fractalNoise" baseFrequency="' + o.df + '" numOctaves="2" seed="' + (o.seed + 4) + '" result="dents"/>' +
    '<feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="2" seed="' + (o.seed + 9) + '" result="grain"/>' +
    '<feComposite in="soft" in2="dents" operator="arithmetic" k2="1" k3="' + o.dents + '" result="h1"/>' +
    '<feComposite in="h1" in2="grain" operator="arithmetic" k2="1" k3="' + o.grain + '" result="height"/>' +
    '<feDiffuseLighting in="height" surfaceScale="' + o.surface + '" diffuseConstant="1" lighting-color="#fff" result="light"><feDistantLight azimuth="' + o.az + '" elevation="' + o.el + '"/></feDiffuseLighting>' +
    '<feSpecularLighting in="height" surfaceScale="' + o.surface + '" specularConstant="' + o.spec + '" specularExponent="' + o.exp + '" lighting-color="#fff4e2" result="spec"><feDistantLight azimuth="' + o.az + '" elevation="' + o.el + '"/></feSpecularLighting>' +
    '<feComposite in="shape" in2="light" operator="arithmetic" k1="' + o.gain + '" result="lit"/>' +
    '<feComposite in="spec" in2="shape" operator="in" result="sp"/>' +
    '<feComposite in="lit" in2="sp" operator="arithmetic" k2="1" k3="1" result="sum"/>' +
    '<feComposite in="sum" in2="shape" operator="in"/>' +
    '</filter>';
}
/* a soft contact shadow under a group */
function shadowF(id, dx, dy, b, a) {
  return '<filter id="' + id + '" x="-60%" y="-60%" width="220%" height="220%"><feDropShadow dx="' + dx + '" dy="' + dy + '" stdDeviation="' + b + '" flood-color="#2a1608" flood-opacity="' + a + '"/></filter>';
}
function rnd(seed) { return function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
