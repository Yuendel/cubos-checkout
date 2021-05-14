const express = require('express');
const rotas = express();
const pedidos = require('./controladores/pedidos');

rotas.get('/produtos', pedidos.lerProdutos);
rotas.get('/carrinho', pedidos.lerCarrinho);
rotas.post('/carrinho/produtos', pedidos.adicionarProdutoCarrinho);
rotas.patch('/carrinho/produtos/:idProduto', pedidos.alterarProdutoCarrinho);
rotas.delete('/carrinho/produtos/:idProduto', pedidos.removerProdutoCarrinho);
rotas.delete('/carrinho', pedidos.deletarCarrinho);
rotas.post('/finalizar-compra', pedidos.finalizarCompra);

module.exports = rotas;