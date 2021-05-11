const express = require('express');
const rotas = express();
const pedidos = require('./controladores/pedidos');

rotas.get('/produtos', pedidos.lerProdutos)

module.exports = rotas;