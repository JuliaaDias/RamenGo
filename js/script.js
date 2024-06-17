async function populateOptions(brothOptions, proteinOptions) {
    const broths = await brothList();
    const proteins = await proteinList();

    const createCarouselItems = (items, type) => items.map(item => `
        <div class="carousel-item">
            <div class="box" data-id="${item.id}" data-type="${type}" data-active-src="${item.imageActive}" data-inactive-src="${item.imageInactive}">
                <input type="hidden" name="${type}" id="${type}-${item.id}" value="${item.id}">
                <label for="${type}-${item.id}">
                    <img class="image" src="${item.imageInactive}" alt="${item.name}">
                    <h3>${item.name}</h3>
                    <p class="description">${item.description}</p>
                    <span class="price">US$ ${item.price}</span>
                </label>
            </div>
        </div>
    `).join('');

    brothOptions.innerHTML = createCarouselItems(broths, 'broth');
    proteinOptions.innerHTML = createCarouselItems(proteins, 'protein');
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

function addEventListenersToBoxes() {
    let selectedBrothId = null;
    let selectedProteinId = null;

    const boxes = document.querySelectorAll('.carousel-item .box');
    const submitButton = document.getElementById('submitButton');

    submitButton.classList.add('inactive');

    boxes.forEach(box => {
        box.addEventListener('click', () => {
            const type = box.getAttribute('data-type');
            const id = box.getAttribute('data-id');
            const img = box.querySelector('img');
            const activeSrc = box.getAttribute('data-active-src');
            const inactiveSrc = box.getAttribute('data-inactive-src');

            if (type === 'broth') {
                if (selectedBrothId === id) {
                    // Se o mesmo caldo já está selecionado, desselecione-o
                    selectedBrothId = null;
                    img.src = inactiveSrc;
                    box.classList.remove('selected');
                } else {
                    // Se outro caldo estava selecionado, desselecione-o primeiro
                    const alreadySelectedBroth = document.querySelector('.carousel-item .box.selected[data-type="broth"]');
                    if (alreadySelectedBroth) {
                        const previousImg = alreadySelectedBroth.querySelector('img');
                        previousImg.src = alreadySelectedBroth.getAttribute('data-inactive-src');
                        alreadySelectedBroth.classList.remove('selected');
                    }
                    selectedBrothId = id;
                    img.src = activeSrc;
                    box.classList.add('selected');

                    // Scroll suave para as opções de proteína após selecionar um caldo
                    const proteinOptions = document.getElementById('proteinOptions');
                    if (proteinOptions) {
                        proteinOptions.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }
            } else if (type === 'protein') {
                if (selectedProteinId === id) {
                    // Se a mesma proteína já está selecionada, desselecione-a
                    selectedProteinId = null;
                    img.src = inactiveSrc;
                    box.classList.remove('selected');
                } else {
                    // Se outra proteína estava selecionada, desselecione-a primeiro
                    const alreadySelectedProtein = document.querySelector('.carousel-item .box.selected[data-type="protein"]');
                    if (alreadySelectedProtein) {
                        const previousImg = alreadySelectedProtein.querySelector('img');
                        previousImg.src = alreadySelectedProtein.getAttribute('data-inactive-src');
                        alreadySelectedProtein.classList.remove('selected');
                    }
                    selectedProteinId = id;
                    img.src = activeSrc;
                    box.classList.add('selected');
                }
            }

            // Verifica se ambos os itens estão selecionados para ativar o botão de envio
            if (selectedBrothId && selectedProteinId) {
                submitButton.classList.remove('inactive');
                submitButton.disabled = false;
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
            const loadingIndicator = document.getElementById('loading');
            loadingIndicator.style.display = 'block';
            try {
                const response = await requestAPI("https://api.tech.redventures.com.br/orders", "POST", orderData);
                loadingIndicator.style.display = 'none';
                document.getElementById('orderDescription').textContent = response.description;
                document.getElementById('orderImage').src = response.image;
                document.getElementById('orderModal').style.display = "block";
            } catch (error) {
                console.error('Erro ao enviar o pedido:', error);
                loadingIndicator.style.display = 'none';
            }
        }
    });

    document.getElementById('newOrderButton').addEventListener('click', () => {
        resetSelections();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    document.querySelector('.close').addEventListener('click', () => {
        document.getElementById('orderModal').style.display = "none";
    });
    window.onclick = (event) => {
        if (event.target === document.getElementById('orderModal')) {
            document.getElementById('orderModal').style.display = "none";
        }
    };
}

function resetSelections() {
    const boxes = document.querySelectorAll('.carousel-item .box');
    boxes.forEach(box => {
        const img = box.querySelector('img');
        const inactiveSrc = box.getAttribute('data-inactive-src');
        img.src = inactiveSrc;
        box.classList.remove('selected');
    });
    const submitButton = document.getElementById('submitButton');
    submitButton.classList.add('inactive');
    submitButton.disabled = true;
}

document.addEventListener('DOMContentLoaded', async function() {
    const brothOptions = document.getElementById('brothCarouselInner');
    const proteinOptions = document.getElementById('proteinCarouselInner');

    await populateOptions(brothOptions, proteinOptions);
    addEventListenersToBoxes();

    const carousels = document.querySelectorAll('.carousel');

    carousels.forEach(carousel => {
        const inner = carousel.querySelector('.carousel-inner');
        const dotsContainer = carousel.querySelector('.carousel-dots');
        const items = inner.children;
        const dots = [];

        let currentIndex = 0;

        function updateCarousel() {
            Array.from(items).forEach((item, index) => {
                item.style.display = index === currentIndex ? 'block' : 'none';
            });
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentIndex);
            });
        }

        Array.from(items).forEach((item, index) => {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => {
                currentIndex = index;
                updateCarousel();
            });
            dotsContainer.appendChild(dot);
            dots.push(dot);
        });

        updateCarousel();
    });
});


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


function updateImageSrc() {
    const introImage = document.getElementById('introImage');
    if (window.innerWidth < 768) {
      introImage.src = './img/ilustration-mobile.png';
    } else {
      introImage.src = './img/ilustration.png';
    }
  }

  window.addEventListener('resize', updateImageSrc);
  window.addEventListener('DOMContentLoaded', updateImageSrc);


  