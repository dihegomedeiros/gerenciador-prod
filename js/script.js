const STORAGE_KEY = 'product_manager_data';
let products = [];
let scrollToTopBtn; // Variável para o botão de rolar para o topo

// Carrega os produtos do localStorage ou usa dados iniciais se não houver nada salvo
async function loadProducts() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
        products = JSON.parse(data);
    } else {
        // Se não houver dados no localStorage, tenta carregar os dados de demonstração.
        await loadDemoData();
    }
    displayProducts(products); // Exibe os produtos carregados
}

// Carrega os dados de demonstração de um arquivo JSON externo
async function loadDemoData() {
    try {
        const response = await fetch('/data/demo_products.json');
        if (response.ok) {
            const demoData = await response.json();
            // Processa os dados de demonstração para garantir que cada produto tenha um ID
            products = demoData.map(p => ({
                id: p.id || generateId(), // Usa o ID existente ou gera um novo
                name: p.name || '',
                category: p.category || null,
                brand: p.brand || null,
                details: p.details || null,
                measure: p.measure || null,
                price: p.price !== null && p.price !== undefined ? p.price : 0
            }));
            saveProducts(); // Salva os dados de demonstração no localStorage
            showMessage('Dados iniciais carregados de demo_products.json!');
        } else {
            // Se o arquivo não for encontrado ou houver outro erro HTTP
            products = []; // Inicia com uma lista vazia
            showMessage('Não foi possível carregar dados iniciais de demo_products.json. Iniciando com lista vazia.', 'error');
            console.error('Erro ao carregar demo_products.json:', response.statusText);
        }
    } catch (e) {
        // Captura erros de rede ou de parsing JSON
        products = []; // Inicia com uma lista vazia
        showMessage('Erro de rede ou JSON inválido ao carregar demo_products.json. Iniciando com lista vazia.', 'error');
        console.error('Erro ao carregar demo_products.json:', e);
    }
}

// Sobrescreve os produtos existentes com os dados de demonstração (via modal de confirmação)
// Esta função é chamada quando o usuário opta por sobrescrever dados existentes ao carregar demos.
// É importante que 'initialData' seja carregado assincronamente aqui também.
async function overwriteProducts() {
    const confirmationModal = document.createElement('div');
    confirmationModal.className = 'fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50';
    confirmationModal.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
            <h4 class="mb-4 text-xl font-bold">Você já possui produtos armazenados localmente em seu dispositivo</h4>
            <p class="mb-4 text-lg font-semibold">Tem certeza que deseja sobrescrever os dados armazenados pelos dados de demonstração?</p>
            <div class="flex justify-around gap-4">
                <button class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" id="confirmOverwriteBtn">Sim, Sobrescrever</button>
                <button class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded" id="cancelOverwriteBtn">Cancelar</button>
            </div>
        </div>
    `;
    document.body.appendChild(confirmationModal);

    // Carrega os dados de demonstração de forma assíncrona para a sobrescrita
    document.getElementById('confirmOverwriteBtn').onclick = async () => {
        try {
            const response = await fetch('/data/demo_products.json');
            if (response.ok) {
                const demoData = await response.json();
                products = demoData.map(p => ({
                    id: p.id || generateId(),
                    name: p.name || '',
                    category: p.category || null,
                    brand: p.brand || null,
                    details: p.details || null,
                    measure: p.measure || null,
                    price: p.price !== null && p.price !== undefined ? p.price : 0
                }));
                saveProducts();
                searchProducts(); // Atualiza a lista após a sobrescrita
                showMessage('Dados sobrescritos com sucesso!');
            } else {
                showMessage('Erro ao carregar dados de demonstração para sobrescrever.', 'error');
                console.error('Erro ao carregar demo_products.json para sobrescrever:', response.statusText);
            }
        } catch (e) {
            showMessage('Erro de rede ou JSON inválido ao sobrescrever dados.', 'error');
            console.error('Erro ao sobrescrever dados:', e);
        } finally {
            confirmationModal.remove(); // Fecha o modal
        }
    };

    // Mescla os dados existentes com os dados de demonstração se o usuário cancelar a sobrescrita
    document.getElementById('cancelOverwriteBtn').onclick = async () => {
        try {
            const response = await fetch('/data/demo_products.json');
            if (response.ok) {
                const demoData = await response.json();
                let productsAdded = 0;
                demoData.forEach(importedProduct => {
                    const importedProductNameLower = (importedProduct.name || '').toLowerCase();
                    const existingProductIndex = products.findIndex(p => (p.name || '').toLowerCase() === importedProductNameLower);

                    if (existingProductIndex === -1) {
                        products.push({
                            id: importedProduct.id || generateId(),
                            name: importedProduct.name || '',
                            category: importedProduct.category || null,
                            brand: importedProduct.brand || null,
                            details: importedProduct.details || null,
                            measure: importedProduct.measure || null,
                            price: importedProduct.price !== null && importedProduct.price !== undefined ? importedProduct.price : 0
                        });
                        productsAdded++;
                    }
                });
                saveProducts();
                searchProducts();
                showMessage(`Dados de demonstração mesclados: ${productsAdded} novos produtos adicionados.`);
            } else {
                showMessage('Erro ao carregar dados de demonstração para mesclagem.', 'error');
                console.error('Erro ao carregar demo_products.json para mesclagem:', response.statusText);
            }
        } catch (e) {
            showMessage('Erro de rede ou JSON inválido ao mesclar dados.', 'error');
            console.error('Erro ao mesclar dados:', e);
        } finally {
            confirmationModal.remove(); // Fecha o modal
        }
    };
}


// Salva os produtos no localStorage
function saveProducts() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    showMessage('Dados salvos com sucesso!');
}

// Gera um ID único para o produto
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// Exibe uma mensagem flutuante
function showMessage(message, type = 'success') {
    const messageBox = document.getElementById('messageBox');
    messageBox.textContent = message;
    messageBox.className = `message-box show ${type}`; // Adiciona classes de estilo dinamicamente
    setTimeout(() => {
        messageBox.className = `message-box ${type}`; // Remove a classe 'show' para esconder
    }, 3000);
}

// Exibe os produtos na lista, ordenados por nome
function displayProducts(productsToDisplay) {
    const productList = document.getElementById('productList');
    productList.innerHTML = ''; // Limpa a lista existente

    if (productsToDisplay.length === 0) {
        productList.innerHTML = '<p class="text-gray-500 text-center">Nenhum produto encontrado.</p>';
        return;
    }

    // Ordena os produtos por nome em ordem alfabética antes de exibir
    productsToDisplay.sort((a, b) => {
        const nameA = (a.name || '').toLowerCase();
        const nameB = (b.name || '').toLowerCase();
        if (nameA < nameB) {
            return -1;
        }
        if (nameA > nameB) {
            return 1;
        }
        return 0;
    });

    productsToDisplay.forEach(product => {
        const productDiv = document.createElement('div');
        productDiv.className = 'product-item';
        productDiv.innerHTML = `
                    <div class="details flex-grow">
                        <strong>Nome:</strong> <span>${product.name || 'N/A'}</span><br>
                        <strong>Categoria:</strong> <span>${product.category || 'N/A'}</span><br>
                        <strong>Marca:</strong> <span>${product.brand || 'N/A'}</span><br>
                        <strong>Detalhes:</strong> <span>${product.details || 'N/A'}</span><br>
                        <strong>Medida:</strong> <span>${product.measure || 'N/A'}</span><br>
                        <strong>Preço:</strong> <span>${product.price !== null && product.price !== undefined ? `R$ ${product.price.toFixed(2)}` : 'N/A'}</span>
                    </div>
                    <div class="actions flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0">
                        <button onclick="editProduct('${product.id}')" class="secondary">Editar</button>
                        <button onclick="deleteProduct('${product.id}')" class="danger">Excluir</button>
                    </div>
                `;
        productList.appendChild(productDiv);
    });
}

// Salva um novo produto ou atualiza um existente
function saveProduct() {
    const id = document.getElementById('productId').value;
    const name = document.getElementById('productName').value.trim();
    const category = document.getElementById('productCategory').value.trim();
    const brand = document.getElementById('productBrand').value.trim();
    const details = document.getElementById('productDetails').value.trim();
    const measure = document.getElementById('productMeasure').value.trim();
    const price = parseFloat(document.getElementById('productPrice').value);

    if (!name) {
        showMessage('O nome do produto é obrigatório!', 'error');
        return;
    }
    if (isNaN(price)) {
        showMessage('O preço deve ser um número válido!', 'error');
        return;
    }

    let productIndex = -1;
    if (id) {
        // Tenta encontrar o produto pelo ID existente
        productIndex = products.findIndex(p => p.id === id);
    } else {
        // Se não houver ID, tenta encontrar pelo nome (para evitar duplicatas no cadastro)
        productIndex = products.findIndex(p => p.name.toLowerCase() === name.toLowerCase());
    }

    if (productIndex > -1) {
        // Atualiza o produto existente
        products[productIndex] = {
            id: products[productIndex].id, // Mantém o ID existente
            name: name,
            category: category || null,
            brand: brand || null,
            details: details || null,
            measure: measure || null,
            price: price
        };
        showMessage('Produto atualizado com sucesso!');
    } else {
        // Adiciona um novo produto
        const newProduct = {
            id: generateId(), // Gera um novo ID para o novo produto
            name: name,
            category: category || null,
            brand: brand || null,
            details: details || null,
            measure: measure || null,
            price: price
        };
        products.push(newProduct);
        showMessage('Produto adicionado com sucesso!');
    }

    saveProducts();
    clearForm(); // Limpa o formulário após salvar
    searchProducts(); // Atualiza a lista de produtos exibida
    showSection('consultation'); // Volta para a seção de consulta
}


// Preenche o formulário para edição de um produto
function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (product) {
        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productCategory').value = product.category || '';
        document.getElementById('productBrand').value = product.brand || '';
        document.getElementById('productDetails').value = product.details || '';
        document.getElementById('productMeasure').value = product.measure || '';
        document.getElementById('productPrice').value = product.price;
        showSection('registration'); // Muda para a seção de cadastro para edição
    }
}

// Exclui um produto
function deleteProduct(id) {
    // Usa um modal customizado para confirmação
    const confirmationModal = document.createElement('div');
    confirmationModal.className = 'fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50';
    confirmationModal.innerHTML = `
                <div class="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
                    <p class="mb-4 text-lg font-semibold">Tem certeza que deseja excluir este produto?</p>
                    <div class="flex justify-around gap-4">
                        <button class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" id="confirmDeleteBtn">Sim, Excluir</button>
                        <button class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded" id="cancelDeleteBtn">Cancelar</button>
                    </div>
                </div>
            `;
    document.body.appendChild(confirmationModal);

    document.getElementById('confirmDeleteBtn').onclick = () => {
        products = products.filter(p => p.id !== id);
        saveProducts();
        searchProducts(); // Atualiza a lista após a exclusão
        showMessage('Produto excluído com sucesso!');
        confirmationModal.remove(); // Fecha o modal
    };

    document.getElementById('cancelDeleteBtn').onclick = () => {
        confirmationModal.remove(); // Fecha o modal
    };
}


// Limpa o formulário de cadastro
function clearForm() {
    document.getElementById('productId').value = '';
    document.getElementById('productName').value = '';
    document.getElementById('productCategory').value = '';
    document.getElementById('productBrand').value = '';
    document.getElementById('productDetails').value = '';
    document.getElementById('productMeasure').value = '';
    document.getElementById('productPrice').value = '';
}

// Filtra e exibe os produtos com base nos critérios de busca
function searchProducts() {
    const searchTermName = document.getElementById('searchName').value.toLowerCase();
    const searchTermCategory = document.getElementById('searchCategory').value.toLowerCase();
    const searchTermDetails = document.getElementById('searchDetails').value.toLowerCase();

    const filteredProducts = products.filter(product => {
        const nameMatch = product.name && product.name.toLowerCase().includes(searchTermName);
        const categoryMatch = product.category && product.category.toLowerCase().includes(searchTermCategory);
        const detailsMatch = product.details && product.details.toLowerCase().includes(searchTermDetails);

        return nameMatch && categoryMatch && detailsMatch;
    });
    displayProducts(filteredProducts);
}

// Exporta os dados para um arquivo JSON
function exportData() {
    const dataStr = JSON.stringify(products, null, 4); // Formata com 4 espaços
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'produtos.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showMessage('Dados exportados com sucesso!');
}

// Importa dados de um arquivo JSON
function importData() {
    const fileInput = document.getElementById('importFile');
    const file = fileInput.files[0];

    if (!file) {
        showMessage('Por favor, selecione um arquivo JSON para importar.', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = function (event) {
        try {
            const importedProducts = JSON.parse(event.target.result);
            let productsMerged = 0; // Contador para produtos mesclados/atualizados
            let productsAdded = 0; // Contador para produtos adicionados

            importedProducts.forEach(importedProduct => {
                // Converte o nome para minúsculas para comparação sem distinção de maiúsculas e minúsculas
                const importedProductNameLower = (importedProduct.name || '').toLowerCase();
                const existingProductIndex = products.findIndex(p => (p.name || '').toLowerCase() === importedProductNameLower);

                if (existingProductIndex > -1) {
                    // Atualiza o produto existente se o nome for o mesmo
                    products[existingProductIndex] = {
                        // Mantém o ID existente se o produto já tinha um
                        id: products[existingProductIndex].id,
                        name: importedProduct.name || '',
                        category: importedProduct.category || null,
                        brand: importedProduct.brand || null,
                        details: importedProduct.details || null,
                        measure: importedProduct.measure || null,
                        price: importedProduct.price !== null && importedProduct.price !== undefined ? importedProduct.price : 0
                    };
                    productsMerged++;
                } else {
                    // Adiciona o novo produto
                    products.push({
                        id: importedProduct.id || generateId(), // Usa o ID importado ou gera um novo
                        name: importedProduct.name || '',
                        category: importedProduct.category || null,
                        brand: importedProduct.brand || null,
                        details: importedProduct.details || null,
                        measure: importedProduct.measure || null,
                        price: importedProduct.price !== null && importedProduct.price !== undefined ? importedProduct.price : 0
                    });
                    productsAdded++;
                }
            });

            saveProducts();
            searchProducts();
            showMessage(`Dados importados com sucesso! ${productsAdded} novos produtos adicionados, ${productsMerged} produtos atualizados.`);
        } catch (e) {
            showMessage('Erro ao importar dados. Verifique se o arquivo é um JSON válido.', 'error');
            console.error("Erro ao importar dados:", e); // Para depuração
        }
    };
    reader.readAsText(file);
}

// Exibe um modal de confirmação para limpar todos os dados
function confirmClearData() {
    const confirmationModal = document.createElement('div');
    confirmationModal.className = 'fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50';
    confirmationModal.innerHTML = `
                <div class="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
                    <p class="mb-4 text-lg font-semibold">Esta ação irá apagar TODOS os produtos. Tem certeza?</p>
                    <div class="flex justify-around gap-4">
                        <button class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" id="confirmClearBtn">Sim, Limpar</button>
                        <button class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded" id="cancelClearBtn">Cancelar</button>
                    </div>
                </div>
            `;
    document.body.appendChild(confirmationModal);

    document.getElementById('confirmClearBtn').onclick = () => {
        products = [];
        saveProducts();
        searchProducts(); // Atualiza a lista após a limpeza
        showMessage('Todos os dados foram limpos!', 'success');
        confirmationModal.remove(); // Fecha o modal
    };

    document.getElementById('cancelClearBtn').onclick = () => {
        confirmationModal.remove(); // Fecha o modal
    };
}


// Função para alternar entre as seções da aplicação (Consulta, Cadastro, Dados)
function showSection(sectionId) {
    // Esconde todas as seções
    document.querySelectorAll('.form-section').forEach(section => {
        section.classList.remove('active');
    });
    // Ativa a seção clicada
    document.getElementById(sectionId + 'Section').classList.add('active');

    // Atualiza o estado dos botões de aba
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    document.querySelector(`.tab-button[onclick="showSection('${sectionId}')"]`).classList.add('active');

    // Se for a seção de consulta, garanta que a busca seja atualizada
    if (sectionId === 'consultation') {
        searchProducts();
    }
}

// Função para rolar a página para o topo
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth' // Rolagem suave
    });
}

// Mostra ou esconde o botão de rolar para o topo
function toggleScrollToTopButton() {
    if (window.pageYOffset > 200) { // Mostra o botão se a página rolou mais de 200px
        scrollToTopBtn.classList.remove('hidden');
        scrollToTopBtn.classList.add('block');
    } else {
        scrollToTopBtn.classList.remove('block');
        scrollToTopBtn.classList.add('hidden');
    }
}

// Inicializa a aplicação ao carregar a página
window.onload = async () => {
    scrollToTopBtn = document.createElement('div');
    scrollToTopBtn.id = 'scrollToTopBtn';
    scrollToTopBtn.className = 'fixed w-fit bottom-4 right-4 bg-blue-500 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 hidden';
    scrollToTopBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
    `;
    scrollToTopBtn.onclick = scrollToTop;
    document.body.appendChild(scrollToTopBtn);

    window.addEventListener('scroll', toggleScrollToTopButton);

    await loadProducts();
    searchProducts(); // Exibe todos os produtos ao carregar
    showSection('consultation'); // Garante que a seção de consulta seja a primeira a ser mostrada
};