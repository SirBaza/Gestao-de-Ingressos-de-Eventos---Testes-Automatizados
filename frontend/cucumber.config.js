module.exports = {
  default: [
    'features/*-simples.feature',
    '--require features/step_definitions/steps-simplificados.js',
    '--format progress',
    '--format json:cucumber-report.json',
    '--language pt'
  ].join(' ')
};
