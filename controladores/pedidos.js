const fs = require('fs/promises');


const lerProdutos = async (req, res) => {
    const { categoria, precoInicial, precoFinal } = req.query;

    const produtos = (await fs.readFile("data.json")).toString();
    const dados = JSON.parse(produtos);
    //Filtrando produtos com estoque;
    const dadosFiltrados = dados.produtos.filter(x => x.estoque > 0);

    if (categoria && !precoFinal && !precoInicial) {
        const dadosCategoria = dadosFiltrados.filter(x => x.categoria.toUpperCase() === categoria.toUpperCase());
        if (dadosCategoria) {
            res.json(dadosCategoria);
        } else {
            res.json('Categoria informada está invalida!')
        }

    } else if (!categoria && precoFinal && precoInicial) {
        const dadosPrecos = dadosFiltrados.filter(x => (x.preco >= precoInicial && x.preco <= precoFinal));
        if (dadosPrecos) {
            res.json(dadosPrecos);
        } else {
            res.json('Nenhum produto dentro desta faixa de preço encontrado!')
        }
    } else if (categoria && precoFinal && precoInicial) {
        const dadosCatPrec = dadosFiltrados.filter(x => (x.categoria === categoria && x.preco >= precoInicial && x.preco <= precoFinal));
        res.json(dadosCatPrec);
    } else {
        return res.json(dadosFiltrados);
    }

}





module.exports = {
    lerProdutos
}