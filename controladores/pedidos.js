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
const lerCarrinho = async (req, res) => {
    const carrinho = (await fs.readFile('carrinho.json')).toString();
    if (carrinho.dataDeEntrega === "") {
        res.json({
            "produtos": [],
            "subtotal": 0,
            "dataDeEntrega": null,
            "valorDoFrete": 0,
            "totalAPagar": 0
        })

    } else {
        const novo = (await fs.readFile('carrinho.json')).toString();
        const novoCarrinho = JSON.parse(novo);

        res.json(novoCarrinho)
    }

}

const adicionarProdutoCarrinho = async (req, res) => {
    const body = req.body;
    const carrinho = (await fs.readFile('carrinho.json')).toString();
    const novoCarrinho = JSON.parse(carrinho);
    const dataAtual = new Date();

    const produtos = (await fs.readFile("data.json")).toString();
    const dadosProdutos = JSON.parse(produtos);
    const dadosFiltrados = dadosProdutos.produtos.filter(x => x.estoque > 0);
    const produto = dadosFiltrados.find(x => x.id === body.id);
    if (produto.estoque < body.quantidade) {
        res.json('Quantidade insuficiente para adição no carrinho')

    } else {
        const verificarIdProduto = novoCarrinho.produtos.findIndex(x => x.id === body.id);

        if (verificarIdProduto !== -1) {
            if (novoCarrinho.produtos[verificarIdProduto].quantidade + body.quantidade > produto.estoque) {
                res.json(`Estoque insuficiente de ${novoCarrinho.produtos[verificarIdProduto].nome} para adicionar ao carrinho`)
            } else {
                novoCarrinho.produtos[verificarIdProduto].quantidade += body.quantidade;
                novoCarrinho.subTotal += produto.preco;
                novoCarrinho.dataDeEntrega = new Date(dataAtual.setDate(dataAtual.getDate() + 15));
                if (novoCarrinho.subTotal <= 20000) {
                    novoCarrinho.valorDoFrete = 5000;
                }
                novoCarrinho.totalAPagar = novoCarrinho.subTotal + novoCarrinho.valorDoFrete;
                await fs.writeFile('carrinho.json', JSON.stringify(novoCarrinho))
                res.json(novoCarrinho);
            }

        } else {
            novoCarrinho.produtos.push({
                "id": produto.id,
                "quantidade": body.quantidade,
                "nome": produto.nome,
                "preco": produto.preco,
                "categoria": produto.categoria
            })
            novoCarrinho.subTotal += produto.preco;
            novoCarrinho.dataDeEntrega = new Date(dataAtual.setDate(dataAtual.getDate() + 15));
            if (novoCarrinho.subTotal <= 20000) {
                novoCarrinho.valorDoFrete = 5000;

            }
            novoCarrinho.totalAPagar = novoCarrinho.subTotal + novoCarrinho.valorDoFrete;
            await fs.writeFile('carrinho.json', JSON.stringify(novoCarrinho))
            res.json(novoCarrinho);
        }





    }
}





module.exports = {
    lerProdutos,
    lerCarrinho,
    adicionarProdutoCarrinho
}