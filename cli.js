#! /usr/bin/env node
const rbr = require('./index.js');
const chalk = require('chalk');
const ora = require('ora');
const escape = require('entities');
const dns = require('dns');
const url = require('url');
var domain = process.argv[2] || '';

const regras = [
  'Tamanho mínimo de 2 e máximo de 26 caracteres, não incluindo a categoria. Por exemplo: no domínio xxxx.com.br, esta limitação se refere ao xxxx;',
  'Caracteres válidos são letras de "a" a "z", números de "0" a "9", o hífen, e os seguintes caracteres acentuados: à, á, â, ã, é, ê, í, ó, ô, õ, ú, ü, ç',
  'Não conter somente números;',
  'Não iniciar ou terminar por hífen.'
];

function parse(data) {
  if (data.available) {
    console.log(chalk.green(`Domínio ${chalk.bold(data.fqdn)} está disponível`));
  } else {
    console.log(chalk.red(`Domínio ${chalk.bold(data.fqdn)} não está disponível`));
    if (data.reason) {
      console.log(chalk.red.bold(escape.decodeHTML(data.reason)));
    }

    if (data.suggestions && data.suggestions.length > 0) {
      console.log(chalk.yellow('Sugestões: '));
      data.suggestions.forEach(function (item) {
        console.log('\t' + chalk.yellow.bold('- ' + data.domain + '.' + item));
      });
    }
  }
}

dns.lookup('www.google.com', err => {
  if (err && err.code === 'ENOTFOUND') {
    spinner.stop();
    console.log(chalk.bold.red('É preciso estar conectado com a internet para validar o domínio.'));
    process.exit(1);
  }
});

if (!domain) {
  console.log(chalk.red('Por favor, digite uma url válida.'));
  process.exit(1);
}

domain = domain.toLowerCase();

if (domain.indexOf('.br') === -1) {
  console.log(chalk.red('A url informada deve possuir a extensão .br'));
  process.exit(1);
}

hostname = domain.substr(0, domain.indexOf('.'));

if (hostname.length < 2 || hostname.length > 26) {
  console.log(chalk.red('O Hostname deve ter no mínimo de 2 e máximo de 26 caracteres.'));
  process.exit(1);
}

if (hostname.charAt(0) === '-' || hostname.charAt(hostname.length - 1) === '-') {
  console.log(chalk.red('O Hostname não deve conter hífen no ínicio ou final.'));
  process.exit(1);
}

if (parseInt(hostname) == hostname) {
  console.log(chalk.red('O Hostname não deve conter apenas números.'));
  process.exit(1);
}

var match = hostname.match(/([a-z0-9àáâãéêíóôõúüç])/);
if (!match || match.length > 1) {
  console.log(chalk.red('O Hostname deve ser a-z, 0-9, hífen e os seguintes caracteres acentuados: à, á, â, ã, é, ê, í, ó, ô, õ, ú, ü, ç.'));
  process.exit(1);
}

const spinner = ora({ color: 'yellow', text: (chalk.yellow('Carregando ') + chalk.yellow.bold(domain))}).start();
rbr(domain).then(function (response) {
  spinner.stop();
  parse(response);
  process.exit(0);
}).catch(function(ex) {
  spinner.stop();
  console.log(chalk.red('Alguma coisa de errado não está certo.'));
  console.log(ex);
  process.exit(1);
});