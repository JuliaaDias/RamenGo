
function resetSelections() {
    const boxes = document.querySelectorAll('.box');
    boxes.forEach(box => {
        const img = box.querySelector('img');
        const inactiveSrc = box.getAttribute('data-inactive-src');
        img.src = inactiveSrc;
        box.classList.remove('selected');
    });
    selectedBrothId = null;
    selectedProteinId = null;
    const submitButton = document.getElementById('submitButton');
    submitButton.classList.add('inactive');
    submitButton.disabled = true;

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function populateOptions(brothOptions, proteinOptions) {
    const broths = await brothList();
    const proteins = await proteinList();
    const brothOptionsHtml = broths.map(broth => `
      <div class="box" data-id="${broth.id}" data-type="broth" data-active-src="${broth.imageActive}" data-inactive-src="${broth.imageInactive}">
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
      <div class="box" data-id="${protein.id}" data-type="protein" data-active-src="${protein.imageActive}" data-inactive-src="${protein.imageInactive}">
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

function addEventListenersToBoxes() {
    let selectedBrothId = null;
    let selectedProteinId = null;
    const boxes = document.querySelectorAll('.box');
    const submitButton = document.getElementById('submitButton');
    const orderModal = document.getElementById('orderModal');
    const orderDescription = document.getElementById('orderDescription');
    const orderImage = document.getElementById('orderImage');
    const newOrderButton = document.getElementById('newOrderButton');
    const closeModal = document.querySelector('.close');
    const loadingIndicator = document.getElementById('loading');

    submitButton.classList.add('inactive'); 

    boxes.forEach(box => {
        box.addEventListener('click', () => {
            const type = box.getAttribute('data-type');
            const id = box.getAttribute('data-id');
            const img = box.querySelector('img');
            const activeSrc = box.getAttribute('data-active-src');
            const inactiveSrc = box.getAttribute('data-inactive-src');

            if (type === 'broth') {
                if (selectedBrothId && selectedBrothId !== id) {
                    const previousSelectedBox = document.querySelector(`.box[data-id="${selectedBrothId}"][data-type="broth"]`);
                    const previousImg = previousSelectedBox.querySelector('img');
                    previousImg.src = previousSelectedBox.getAttribute('data-inactive-src');
                    previousSelectedBox.classList.remove('selected');
                }
                selectedBrothId = id;
                document.getElementById('proteinOptions').scrollIntoView({ behavior: 'smooth' });
            } else if (type === 'protein') {
                if (selectedProteinId && selectedProteinId !== id) {
                    const previousSelectedBox = document.querySelector(`.box[data-id="${selectedProteinId}"][data-type="protein"]`);
                    const previousImg = previousSelectedBox.querySelector('img');
                    previousImg.src = previousSelectedBox.getAttribute('data-inactive-src');
                    previousSelectedBox.classList.remove('selected');
                }
                selectedProteinId = id;
            }

            if (box.classList.contains('selected')) {
                img.src = inactiveSrc;
                box.classList.remove('selected');
                if (type === 'broth') {
                    selectedBrothId = null;
                } else if (type === 'protein') {
                    selectedProteinId = null;
                }
            } else {
                img.src = activeSrc;
                box.classList.add('selected');
            }

            if (selectedBrothId && selectedProteinId) {
                submitButton.classList.remove('inactive');
                submitButton.disabled = false;
                console.log(`Both items selected: Broth ID = ${selectedBrothId}, Protein ID = ${selectedProteinId}`);
            } else {
                submitButton.classList.add('inactive');
                submitButton.disabled = true;
            }
        });
    });

    submitButton.addEventListener('click', async () => {
        if (selectedBrothId && selectedProteinId) {
            const orderData = {
                brothId: selectedBrothId,
                proteinId: selectedProteinId
            };
            loadingIndicator.style.display = 'block'; 
            document.body.classList.add('no-scroll');
            const response = await requestAPI("https://api.tech.redventures.com.br/orders", "POST", orderData);
            loadingIndicator.style.display = 'none'; 
            console.log("Order response:", response);

            orderDescription.textContent = response.description;
            orderImage.src = response.image;

            orderModal.style.display = "block";
        }
    });

    newOrderButton.addEventListener('click', () => {
        orderModal.style.display = "none";
        document.body.classList.remove('no-scroll');
        resetSelections();
    });

    closeModal.addEventListener('click', () => {
        orderModal.style.display = "none";
        document.body.classList.remove('no-scroll');
    });

    window.onclick = (event) => {
        if (event.target === orderModal) {
            orderModal.style.display = "none";
            document.body.classList.remove('no-scroll');
        }
    };
}

async function requestAPI(url, metodo, dados) {
    const cabecalho = {
        "x-api-key": "ZtVdh8XQ2U8pWI2gmZ7f796Vh8GllXoN7mr0djNf"
    };

    if (dados) {
        cabecalho["Content-Type"] = "application/json";
    }

    try {
        const loadingIndicator = document.getElementById('loading');
        loadingIndicator.style.display = 'block';

        const resposta = await fetch(url, {
            method: metodo,
            headers: cabecalho,
            body: dados ? JSON.stringify(dados) : null
        });

        if (!resposta.ok) {
            throw new Error(`Erro na requisição: ${resposta.status}`);
        }

        const dadosResposta = await resposta.json();


        loadingIndicator.style.display = 'none';

        return dadosResposta;
    } catch (erro) {
        console.error(erro);

        const loadingIndicator = document.getElementById('loading');
        loadingIndicator.style.display = 'none';
    }
}

async function brothList() {
    return await requestAPI("https://api.tech.redventures.com.br/broths", "GET");
}

async function proteinList() {
    return await requestAPI("https://api.tech.redventures.com.br/proteins", "GET");
}


window.onload = async () => {

    window.scrollTo({ top: 0, behavior: 'smooth' });

    const brothOptions = document.getElementById('brothOptions');
    const proteinOptions = document.getElementById('proteinOptions');


    const loadingIndicator = document.getElementById('loading');
    loadingIndicator.style.display = 'block';

    try {
        await populateOptions(brothOptions, proteinOptions);
        addEventListenersToBoxes();
    } catch (error) {
        console.error('Erro ao carregar opções:', error);
    } finally {

        loadingIndicator.style.display = 'none';
    }
};

