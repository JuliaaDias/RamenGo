async function requestAPI(url, metodo, dados) {
    const cabecalho = {
        "x-api-key": "ZtVdh8XQ2U8pWI2gmZ7f796Vh8GllXoN7mr0djNf"
    };

    if (dados) {
        cabecalho["Content-Type"] = "application/json";
    }

    try {
        const resposta = await fetch(url, {
            method: metodo,
            headers: cabecalho,
            body: dados ? JSON.stringify(dados) : null
        });

        if (!resposta.ok) {
            throw new Error(`Erro na requisição: ${resposta.status}`);
        }

        const dadosResposta = await resposta.json();
        return dadosResposta;
    } catch (erro) {
        console.error(erro);
    }
}

async function brothList() {
    return await requestAPI("https://api.tech.redventures.com.br/broths", "GET");
}

async function proteinList() {
    return await requestAPI("https://api.tech.redventures.com.br/proteins", "GET");
}

brothList()
    .then(caldos => {
        console.log("Caldos disponíveis:");
        console.table(caldos);
    })
    .catch(erro => {
        console.error("Erro ao listar caldos:", erro);
    });

proteinList()
    .then(proteinas => {
        console.log("\nProteínas disponíveis:");
        console.table(proteinas);
    })
    .catch(erro => {
        console.error("Erro ao listar proteínas:", erro);
    });


window.onload = async () => {
const brothOptions = document.getElementById('brothOptions');
const proteinOptions = document.getElementById('proteinOptions');

await populateOptions(brothOptions, proteinOptions);
};

async function populateOptions(brothOptions, proteinOptions) {
    const broths = await brothList();
    const proteins = await proteinList();
  
    const brothOptionsHtml = broths.map(broth => `
      <div class="box">
        <input type="hidden" name="broth" id="broth-${broth.id}" value="${broth.id}">
        <label for="broth-${broth.id}">
          <img class="image" src="${broth.imageInactive}" alt="${broth.name}">
          <h3>${broth.name}</h3>
          <p class="description">${broth.description}</p>
          <span class="price">US$ ${broth.price}</span>
        </label>
      </div>
    `).join('');
  
    const proteinOptionsHtml = proteins.map(protein => `
      <div class="box">
        <input type="hidden" name="protein" id="protein-${protein.id}" value="${protein.id}">
        <label for="protein-${protein.id}">
          <img class="image" src="${protein.imageInactive}" alt="${protein.name}">
          <h3>${protein.name}</h3>
          <p class="description">${protein.description}</p>
          <span class="price">US$ ${protein.price}</span>
        </label>
      </div>
    `).join('');
  
    brothOptions.innerHTML = brothOptionsHtml;
    proteinOptions.innerHTML = proteinOptionsHtml;
  }

