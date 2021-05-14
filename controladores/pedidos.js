const fs = require('fs/promises');

async function adicionarCarrinho(idProduto, quantidade, res) {
    const carrinho = (await fs.readFile('carrinho.json')).toString();
    const novoCarrinho = JSON.parse(carrinho);
    const dataAtual = new Date();

    const produtos = (await fs.readFile("data.json")).toString();
    const dadosProdutos = JSON.parse(produtos);
    const verificar = dadosProdutos.produtos.filter(x => x.id === Number(idProduto));
    const dadosFiltrados = dadosProdutos.produtos.filter(x => x.estoque > 0);
    const produto = dadosFiltrados.find(x => x.id === Number(idProduto));
    if (verificar[0].estoque < quantidade) {
        return res.json('Quantidade insuficiente para adição no carrinho')
    } else {
        if (produto.estoque < quantidade) {
            return res.json('Quantidade insuficiente para adição no carrinho')

        } else {
            const verificarIdProduto = novoCarrinho.produtos.findIndex(x => x.id === idProduto);

            if (verificarIdProduto !== -1) {
                if (novoCarrinho.produtos[verificarIdProduto].quantidade + quantidade > produto.estoque) {
                    res.json(`Estoque insuficiente de ${novoCarrinho.produtos[verificarIdProduto].nome} para adicionar ao carrinho`)
                } else {
                    novoCarrinho.produtos[verificarIdProduto].quantidade += quantidade;
                    novoCarrinho.subTotal += (produto.preco * quantidade);
                    novoCarrinho.dataDeEntrega = new Date(dataAtual.setDate(dataAtual.getDate() + 15));
                    if (novoCarrinho.subTotal <= 20000) {
                        novoCarrinho.valorDoFrete = 5000;
                    } else {
                        novoCarrinho.valorDoFrete = 0;
                    }
                    novoCarrinho.totalAPagar = novoCarrinho.subTotal + novoCarrinho.valorDoFrete;
                    await fs.writeFile('carrinho.json', JSON.stringify(novoCarrinho))
                    return res.json(novoCarrinho);
                }

            } else {
                novoCarrinho.produtos.push({
                    "id": produto.id,
                    "quantidade": quantidade,
                    "nome": produto.nome,
                    "preco": produto.preco,
                    "categoria": produto.categoria
                })
                novoCarrinho.subTotal += (produto.preco * quantidade);;
                novoCarrinho.dataDeEntrega = new Date(dataAtual.setDate(dataAtual.getDate() + 15));
                if (novoCarrinho.subTotal <= 20000) {
                    novoCarrinho.valorDoFrete = 5000;

                }
                novoCarrinho.totalAPagar = novoCarrinho.subTotal + novoCarrinho.valorDoFrete;
                await fs.writeFile('carrinho.json', JSON.stringify(novoCarrinho))
                return res.json(novoCarrinho);
            }
        }
    }
}

async function removerCarrinho(idProduto, quantidade, res) {
    const carrinho = (await fs.readFile('carrinho.json')).toString();
    let novoCarrinho = JSON.parse(carrinho);
    const dataAtual = new Date();
    const produtos = (await fs.readFile("data.json")).toString();
    const dadosProdutos = JSON.parse(produtos);
    const dadosFiltrados = dadosProdutos.produtos.filter(x => x.estoque > 0);
    const produto = dadosFiltrados.find(x => x.id === Number(idProduto));
    const verificarProduto = novoCarrinho.produtos.filter(x => x.id === idProduto);
    if (verificarProduto.length === 0) {
        return res.json(`Não existe este produto no carrinho.`)
    } else {
        if (-quantidade > verificarProduto[0].quantidade) {
            return res.json('Quantidade informada maior que conteudo do produto no carrinho.')
        } else {
            const verificarIdProduto = novoCarrinho.produtos.findIndex(x => x.id === idProduto);


            novoCarrinho.produtos[verificarIdProduto].quantidade += quantidade;
            novoCarrinho.subTotal -= (produto.preco * (-quantidade));
            novoCarrinho.dataDeEntrega = new Date(dataAtual.setDate(dataAtual.getDate() + 15));
            if (novoCarrinho.subTotal <= 20000) {
                novoCarrinho.valorDoFrete = 5000;
            } else {
                novoCarrinho.valorDoFrete = 0;
            }
            novoCarrinho.totalAPagar = novoCarrinho.subTotal + novoCarrinho.valorDoFrete;
            if (novoCarrinho.produtos[verificarIdProduto].quantidade === 0) {
                novoCarrinho.produtos.splice(verificarIdProduto, 1);

            }
            if (novoCarrinho.subTotal <= 0) {
                novoCarrinho = {
                    "subTotal": 0,
                    "dataDeEntrega": "",
                    "valorDoFrete": 0,
                    "totalAPagar": 0,
                    "produtos": []
                }
            }
            await fs.writeFile('carrinho.json', JSON.stringify(novoCarrinho))
            return res.json(novoCarrinho);
        }
    }
}

function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

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
    const leitura = (await fs.readFile('carrinho.json')).toString();
    const carrinho = JSON.parse(leitura);
    if (carrinho.dataDeEntrega === "") {
        res.json({
            "produtos": [],
            "subtotal": 0,
            "dataDeEntrega": null,
            "valorDoFrete": 0,
            "totalAPagar": 0
        })
    } else {
        res.json(carrinho)
    }

}

const adicionarProdutoCarrinho = async (req, res) => {
    const body = req.body;
    adicionarCarrinho(body.id, body.quantidade, res)
}

const alterarProdutoCarrinho = async (req, res) => {
    const idProduto = req.params.idProduto;
    const body = req.body;

    const leitura = (await fs.readFile('carrinho.json')).toString();
    const carrinho = JSON.parse(leitura);
    const verificarCarrinho = carrinho.produtos.filter(x => x.id === Number(idProduto));
    if (verificarCarrinho.length === 0) {
        res.status(404).json(`Não existe produto com Id ${idProduto} no carrinho.`)
    } else {
        if (Math.sign(body.quantidade) === 1) {
            adicionarCarrinho(Number(idProduto), body.quantidade, res);
        } else if (Math.sign(body.quantidade) === -1) {
            removerCarrinho(Number(idProduto), body.quantidade, res);
        }
    }
}

const removerProdutoCarrinho = async (req, res) => {
    const idProduto = req.params.idProduto;

    const leitura = (await fs.readFile('carrinho.json')).toString();
    let novoCarrinho = JSON.parse(leitura);
    const verificarCarrinho = novoCarrinho.produtos.filter(x => x.id === Number(idProduto));
    if (verificarCarrinho.length === 0) {
        res.status(404).json(`Não existe produto com Id ${idProduto} no carrinho.`)
    } else {
        const verificarIdProduto = novoCarrinho.produtos.findIndex(x => x.id === Number(idProduto));

        novoCarrinho.produtos.splice(verificarIdProduto, 1);

        novoCarrinho.subTotal -= (verificarCarrinho[0].preco * (verificarCarrinho[0].quantidade));
        if (novoCarrinho.subTotal <= 20000) {
            novoCarrinho.valorDoFrete = 5000;
        } else {
            novoCarrinho.valorDoFrete = 0;
        }

        novoCarrinho.totalAPagar = novoCarrinho.subTotal + novoCarrinho.valorDoFrete;
        novoCarrinho.produtos.splice(verificarIdProduto, 1);

        if (novoCarrinho.subTotal <= 0) {
            novoCarrinho = {
                "subTotal": 0,
                "dataDeEntrega": "",
                "valorDoFrete": 0,
                "totalAPagar": 0,
                "produtos": []
            }
        }
        await fs.writeFile('carrinho.json', JSON.stringify(novoCarrinho))
        return res.json(novoCarrinho);

    }


}

const deletarCarrinho = async (req, res) => {
    const leitura = (await fs.readFile('carrinho.json')).toString();
    let novoCarrinho = JSON.parse(leitura);
    novoCarrinho = {
        "subTotal": 0,
        "dataDeEntrega": "",
        "valorDoFrete": 0,
        "totalAPagar": 0,
        "produtos": []
    }

    await fs.writeFile('carrinho.json', JSON.stringify(novoCarrinho))
    return res.json({ mensagem: "O carrinho foi limpo com sucesso!" });


}

const finalizarCompra = async (req, res) => {
    const body = req.body;
    const produtos = (await fs.readFile("data.json")).toString();
    const dadosProdutos = JSON.parse(produtos);
    const leitura = (await fs.readFile('carrinho.json')).toString();
    let novoCarrinho = JSON.parse(leitura);
    if (novoCarrinho.subTotal === 0) {
        res.json({ erro: 'Carrinho Vazio!' })

    } else {
        const produtos = (await fs.readFile("data.json")).toString();
        const dadosProdutos = JSON.parse(produtos);
        for (let i = 0; i < novoCarrinho.produtos.length; i++) {
            if (novoCarrinho.produtos[i].id === dadosProdutos.produtos[i].id) {
                if (novoCarrinho.produtos[i].quantidade > dadosProdutos.produtos[i].quantidade) {
                    res.json({ erro: `Produto ${novoCarrinho.produtos[i].nome} com quantidade a mais no carrinho do que disponivel em estoque. Apenas ${dadosProdutos.produtos[i].quantidade} estão disponiveis` });
                }
            }
        }

    }
    const cpf = body.customer.documents.find(x => x.type === 'cpf')

    const verificaEspaco = (string) => string.indexOf(' ') >= 0;

    body.customer.type !== "individual" ? res.json('Nossa Loja apenas atende pessoas físicas. Perdão pelo incomodo') : body.customer.country.length > 2 ? res.json('Digite seu país pelas siglas. ex: br ou pt.') : verificaEspaco === false ? res.json('Obrigatorio Nome e sobrenome!') : isNumber(Number(cpf.number)) === false ? res.json('cpf deve conter apenas numeros') : cpf.number.length !== 11 ? res.json('CPF deve conter 11 digitos')
        : res.json(`${leitura} COMPRA REALIZADA COM SUCESSO! VOLTE SEMPRE`);
    for (let i = 0; i < novoCarrinho.produtos.length; i++) {
        if (novoCarrinho.produtos[i].id === dadosProdutos.produtos[i].id)
            dadosProdutos.produtos[i].estoque -= novoCarrinho.produtos[i].quantidade;
    }
    await fs.writeFile('data.json', JSON.stringify(dadosProdutos));
    novoCarrinho = {
        "subTotal": 0,
        "dataDeEntrega": "",
        "valorDoFrete": 0,
        "totalAPagar": 0,
        "produtos": []
    }
    await fs.writeFile('carrinho.json', JSON.stringify(novoCarrinho))

}

module.exports = {
    lerProdutos,
    lerCarrinho,
    adicionarProdutoCarrinho,
    alterarProdutoCarrinho,
    removerProdutoCarrinho,
    deletarCarrinho,
    finalizarCompra
}